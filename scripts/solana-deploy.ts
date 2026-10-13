import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync,fork,type ChildProcess} from 'node:child_process';
import {existsSync} from 'node:fs';
import {Keypair,Transaction,LAMPORTS_PER_SOL,SystemProgram} from '@solana/web3.js';
import {MINT_SIZE,TOKEN_PROGRAM_ID,getMint,createInitializeMint2Instruction,getAssociatedTokenAddressSync} from '@solana/spl-token';
import {connection,PROGRAM_ID,reservePda,initializeIx,sendConfirmed} from '../packages/solana/src/server';
import {CIRCLE_DEVNET_USDC_MINT,assertTestCluster} from '../packages/solana/src/network';
import {PublicKey} from '@solana/web3.js';
import type {SolanaDeployment} from '../packages/solana/src';
const local=process.argv.includes('--local')||process.env.SOLANA_CLUSTER==='localnet';const rpc=local?(process.env.SOLANA_LOCAL_RPC_URL??'http://127.0.0.1:8899'):(process.env.SOLANA_RPC_URL??'https://api.devnet.solana.com');
const keyDir=resolve(process.env.SHIMOPAY_SOLANA_KEY_DIR??'.solana');await mkdir(keyDir,{recursive:true});
async function key(name:string){const path=resolve(keyDir,`${name}.json`);try{return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(await readFile(path,'utf8'))));}catch{const k=Keypair.generate();await writeFile(path,JSON.stringify([...k.secretKey]),{mode:0o600});return k;}}
const [deployer,consumer,merchant,program]=await Promise.all(['deployer','consumer','merchant','program'].map(key));
if(!program.publicKey.equals(PROGRAM_ID))throw new Error('Program key does not match declare_id. Preserve .solana/program.json or generate a new ID and update both source and Anchor.toml before building.');
const c=connection(rpc);const network=await c.getGenesisHash();assertTestCluster(network,local?'localnet':'devnet');
if(!local&&process.env.USDC_MINT&&process.env.USDC_MINT!==CIRCLE_DEVNET_USDC_MINT)throw new Error('USDC_MINT must be the official Circle Devnet USDC mint');
const executable=await c.getAccountInfo(PROGRAM_ID);const deployNeeded=(local&&!process.argv.includes('--reuse-program'))||!executable?.executable||process.argv.includes('--upgrade');
const byteLength=(await stat('target/deploy/shimopay_solana.so')).size;const required=deployNeeded?(await c.getMinimumBalanceForRentExemption(byteLength+45))+(await c.getMinimumBalanceForRentExemption(byteLength+37))+0.5*LAMPORTS_PER_SOL:0.5*LAMPORTS_PER_SOL;let funds=await c.getBalance(deployer.publicKey);
if(funds<required){let sig:string;try{sig=await c.requestAirdrop(deployer.publicKey,local?20*LAMPORTS_PER_SOL:2*LAMPORTS_PER_SOL);}catch{throw new Error(`Test SOL unavailable from RPC faucet. Fund Devnet deployer ${deployer.publicKey.toBase58()} at https://faucet.solana.com (test SOL only).`);}for(let n=0;n<30;n++){await new Promise(r=>setTimeout(r,500));funds=await c.getBalance(deployer.publicKey);if(funds>=required)break;}console.log('Test SOL airdrop signature:',sig);}
if(funds<required)throw new Error(`Not enough test SOL for program rent and demo fees. Fund Devnet deployer ${deployer.publicKey.toBase58()} at https://faucet.solana.com (test SOL only), then rerun.`);
async function cliTransport(){
 if(process.env.SOLANA_DEPLOY_RPC_URL)return {url:process.env.SOLANA_DEPLOY_RPC_URL,child:undefined as ChildProcess|undefined};
 if(local||(!process.env.HTTPS_PROXY&&process.env.SOLANA_RATE_LIMIT_DEPLOY!=='1'))return {url:rpc,child:undefined as ChildProcess|undefined};
 const child=fork(resolve('scripts/solana-rpc-bridge.mjs'),[],{env:{...process.env,SHIMOPAY_BRIDGE_UPSTREAM:rpc,NODE_USE_ENV_PROXY:'1'},stdio:['ignore','ignore','ignore','ipc']});
 const port=await new Promise<number>((resolvePort,reject)=>{const timeout=setTimeout(()=>{child.kill();reject(new Error('RPC bridge startup failed'));},10000);child.once('message',(m)=>{clearTimeout(timeout);const port=(m as {port:number}).port;if(!Number.isInteger(port)||port<1)reject(new Error('Invalid RPC bridge port'));else resolvePort(port);});child.once('error',reject);});return {url:`http://127.0.0.1:${port}`,child};
}
let deploymentSignature:string|undefined;
if(deployNeeded){await key('buffer');const bundledCli=resolve('.tooling/agave-2.3/solana-release/bin/solana');const bin=process.env.SOLANA_CLI??(existsSync(bundledCli)?bundledCli:'solana');const transport=await cliTransport();let output:string;try{output=execFileSync(bin,['program','deploy','target/deploy/shimopay_solana.so','--program-id',resolve(keyDir,'program.json'),'--buffer',resolve(keyDir,'buffer.json'),'--max-len',String(byteLength),'--keypair',resolve(keyDir,'deployer.json'),'--url',transport.url,'--use-rpc','--max-sign-attempts','20','--output','json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']});}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')throw new Error('Solana CLI not found. Set SOLANA_CLI to the installed executable; Codex Cloud can use .tooling/agave-2.3/solana-release/bin/solana.');throw new Error('Solana program deployment failed. Check development SOL and RPC. Raw CLI recovery output is withheld to protect buffer key information. The buffer key is retained in ignored .solana/buffer.json.');}finally{transport.child?.kill();}const result=JSON.parse(output);deploymentSignature=result.signature;console.log('Program deployed:',result.programId);}
if(!(await c.getAccountInfo(PROGRAM_ID))?.executable)throw new Error('Program is not executable on the configured cluster after deploy; refusing deployment metadata');
const tx=new Transaction();for(const k of [consumer,merchant])if(await c.getBalance(k.publicKey)<0.1*LAMPORTS_PER_SOL)tx.add(SystemProgram.transfer({fromPubkey:deployer.publicKey,toPubkey:k.publicKey,lamports:0.2*LAMPORTS_PER_SOL}));if(tx.instructions.length)await sendConfirmed(c,tx,[deployer]);
// Local tests can mint their own asset. Devnet never creates/mints a private token.
let mint:PublicKey;
if(local){const mintKey=Keypair.generate();mint=mintKey.publicKey;
 await sendConfirmed(c,new Transaction().add(SystemProgram.createAccount({fromPubkey:deployer.publicKey,newAccountPubkey:mint,lamports:await c.getMinimumBalanceForRentExemption(MINT_SIZE),space:MINT_SIZE,programId:TOKEN_PROGRAM_ID}),createInitializeMint2Instruction(mint,6,deployer.publicKey,null)),[deployer,mintKey]);
}else{mint=new PublicKey(CIRCLE_DEVNET_USDC_MINT);const info=await getMint(c,mint,'confirmed',TOKEN_PROGRAM_ID);if(info.decimals!==6||!info.isInitialized)throw new Error('Official USDC mint validation failed');}
const reserveUsdc=process.env.SHIMOPAY_RESERVE_USDC??'50';if(!/^[1-9][0-9]*$/.test(reserveUsdc)||BigInt(reserveUsdc)>50n)throw new Error('SHIMOPAY_RESERVE_USDC must be an integer from 1 to 50');const offlineReserveAmount=(BigInt(reserveUsdc)*1_000_000n).toString();
const fxSigner=await key('fx-signer');
const reserve=reservePda(consumer.publicKey,mint);
const reserveInitialization=await c.getAccountInfo(reserve)?undefined:await sendConfirmed(c,new Transaction().add(initializeIx(consumer.publicKey,mint,network)),[consumer]);
const config:SolanaDeployment={cluster:local?'localnet':'devnet',program:PROGRAM_ID.toBase58(),mint:mint.toBase58(),consumer:consumer.publicKey.toBase58(),merchant:merchant.publicKey.toBase58(),reserve:reserve.toBase58(),vault:getAssociatedTokenAddressSync(mint,reserve,true).toBase58(),network,generation:new Date().toISOString(),rpcUrl:rpc,deploymentSignature,assetKind:local?'local-test-token':'circle-devnet-usdc',fxSigner:fxSigner.publicKey.toBase58(),offlineReserveAmount,offlineAllowanceAmount:local?'30000000':offlineReserveAmount};
await writeFile('apps/web/public/deployment.json',JSON.stringify({...config,rpcUrl:local?'http://127.0.0.1:8899':'https://api.devnet.solana.com'},null,2));await writeFile(resolve(keyDir,local?'local-deployment.json':'devnet-deployment.json'),JSON.stringify(config,null,2));
await mkdir('docs/evidence',{recursive:true});await writeFile(`docs/evidence/solana-${local?'localnet':'devnet'}-deployment.json`,JSON.stringify({...config,rpcUrl:local?'http://127.0.0.1:8899':'https://api.devnet.solana.com',reserveInitialization},null,2));console.log(JSON.stringify({...config,rpcUrl:local?'http://127.0.0.1:8899':'https://api.devnet.solana.com',reserveInitialization},null,2));
