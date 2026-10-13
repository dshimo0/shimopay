import {spawn,type ChildProcess} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import type {SolanaDeployment} from '../packages/solana/src';
import {connection} from '../packages/solana/src/server';
const children:ChildProcess[]=[];
function stop(code=0){for(const c of children)c.kill('SIGTERM');process.exit(code);}
for(const sig of ['SIGINT','SIGTERM'] as const)process.on(sig,()=>stop());
function launch(cmd:string,args:string[],cwd?:string){const c=spawn(cmd,args,{cwd,stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1',NODE_USE_ENV_PROXY:'1'}});children.push(c);c.on('error',e=>{console.error(e.message);stop(1);});return c;}
let config:SolanaDeployment|undefined;
try{config=JSON.parse(await readFile('apps/web/public/deployment.json','utf8'));}catch{}
if(!config)throw new Error('Deploy Solana first: pnpm deploy:solana:local or pnpm deploy:solana:devnet.');
if(config.cluster==='localnet'){
 const c=connection(config.rpcUrl);try{await c.getVersion();}catch{launch(process.env.SOLANA_VALIDATOR??'solana-test-validator',['--ledger','.solana-ledger','--rpc-port','8899','--quiet']);for(let n=0;n<120;n++){try{await c.getVersion();break;}catch{await new Promise(r=>setTimeout(r,500));}}}
 if(await c.getGenesisHash()!==config.network)throw new Error('Local ledger changed. Rerun pnpm deploy:solana:local before opening the demo.');
}
launch('node',['node_modules/next/dist/bin/next','start','--hostname','::'],'apps/web');
console.log(`ShimoPay · Solana ${config.cluster} · http://localhost:3000/demo\nKeep this terminal open. Cloud users must use the published HTTPS demo.`);
