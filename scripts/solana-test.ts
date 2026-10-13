import {spawn,spawnSync,type ChildProcess} from 'node:child_process';
import {connection} from '../packages/solana/src/server';
const c=connection('http://127.0.0.1:8899');let validator:ChildProcess|undefined;
function command(args:string[]){const result=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});if(result.status!==0)throw new Error(`Command failed: ${args.join(' ')}`);}
try{
 try{await c.getVersion();}catch{validator=spawn(process.env.SOLANA_VALIDATOR??'solana-test-validator',['--ledger','.solana-ledger','--rpc-port','8899','--quiet'],{stdio:'inherit'});for(let n=0;n<120;n++){try{await c.getVersion();break;}catch{await new Promise(r=>setTimeout(r,500));}}}
 command(['--import','tsx','scripts/solana-deploy.ts','--local']);
 command(['--import','tsx','--test','--test-concurrency=1','packages/solana/test/protocol.test.ts','packages/solana/test/rails.test.ts','packages/solana/test/program.test.ts']);
 command(['--import','tsx','--test','--test-concurrency=1','packages/solana/test/online.test.ts']);
}finally{validator?.kill('SIGTERM');}
