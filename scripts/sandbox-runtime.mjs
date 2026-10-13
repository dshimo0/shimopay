// Trusted launcher-owned entry point. Receives provider credentials as process env, not files.
import {execFileSync,spawn} from 'node:child_process';
import {openSync} from 'node:fs';
import {createHash} from 'node:crypto';
const keys=['MERCADOPAGO_ACCESS_TOKEN','MERCADOPAGO_TEST_PAYER_EMAIL','SOLANA_RPC_URL','SHIMOPAY_RELEASE_VERSION'];
const fingerprint=createHash('sha256').update(JSON.stringify(keys.map(k=>[k,process.env[k]??'']))).digest('hex');
for(const line of execFileSync('ps',['-eo','pid,args'],{encoding:'utf8'}).split('\n')){const match=line.trim().match(/^(\d+) next-server\b/);if(match)try{process.kill(Number(match[1]),'SIGTERM');}catch{}}
await new Promise(resolve=>setTimeout(resolve,1000));const log=openSync('/tmp/shimopay-runtime.log','a',0o600);
const child=spawn(process.execPath,['--import','tsx','scripts/cloud-solana.ts'],{cwd:'/vercel/sandbox',detached:true,stdio:['ignore',log,log],env:{...process.env,SHIMOPAY_RUNTIME_FINGERPRINT:fingerprint,SHIMOPAY_SOLANA_KEY_DIR:'/vercel/sandbox/.solana',SOLANA_CLI:'/vercel/tools/bin/solana',SOLANA_VALIDATOR:'/vercel/tools/bin/solana-test-validator',NEXT_TELEMETRY_DISABLED:'1',NODE_USE_ENV_PROXY:'1'}});child.unref();console.log('Backend runtime started; credentials were not written to files.');
