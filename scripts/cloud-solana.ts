import {spawn,spawnSync,type ChildProcess} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {connection} from '../packages/solana/src/server';
import {PublicKey} from '@solana/web3.js';
import type {SolanaDeployment} from '../packages/solana/src';
let config:SolanaDeployment|undefined;
try{config=JSON.parse(await readFile('apps/web/public/deployment.json','utf8'));}catch{}
const children:ChildProcess[]=[];function stop(){for(const c of children)c.kill('SIGTERM');process.exit(0);}
for(const sig of ['SIGINT','SIGTERM'] as const)process.on(sig,stop);
const env={...process.env,NEXT_TELEMETRY_DISABLED:'1',SOLANA_CLI:process.env.SOLANA_CLI??'/vercel/tools/bin/solana'};
if(config?.cluster!=='devnet'){
 const c=connection('http://127.0.0.1:8899');let ready=false;try{await c.getVersion();ready=true;}catch{}
 if(!ready){children.push(spawn(process.env.SOLANA_VALIDATOR??'/vercel/tools/bin/solana-test-validator',['--ledger','.solana-ledger','--rpc-port','8899','--quiet'],{stdio:'inherit',env}));for(let n=0;n<120;n++){try{await c.getVersion();ready=true;break;}catch{await new Promise(r=>setTimeout(r,500));}}}
 if(!ready)throw new Error('Solana local validator failed to start');
 const valid=config&&config.network===await c.getGenesisHash()&&await c.getAccountInfo(new PublicKey(config.mint));
 if(!valid){const result=spawnSync(process.execPath,['--import','tsx','scripts/solana-deploy.ts','--local'],{stdio:'inherit',env:{...env,SOLANA_RPC_URL:'http://127.0.0.1:8899'}});if(result.status!==0)throw new Error('Solana demo deployment failed');}
}
children.push(spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','::'],{cwd:'apps/web',stdio:'inherit',env}));
console.log('ShimoPay Solana cloud process started. Only web port 3000 is public.');
