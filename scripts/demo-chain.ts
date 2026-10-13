// Historical EVM tooling; the current web demo uses Solana exclusively.
import {spawn} from 'node:child_process';
const child=spawn('pnpm',['chain:evm'],{stdio:['ignore','pipe','pipe']});
child.stderr.pipe(process.stderr);
let buffer='',deployed=false;
child.stdout.on('data',async chunk=>{
 const text=chunk.toString();
 // Do not forward public Hardhat account private keys into logs.
 if(!deployed){buffer+=text;if(buffer.includes('Started HTTP and WebSocket JSON-RPC server')){deployed=true;const deploy=spawn('pnpm',['deploy:local:evm'],{stdio:'inherit'});deploy.on('exit',code=>{if(code!==0){child.kill();process.exit(code??1);}console.log('ShimoPay chain and deployment ready');});}}
});
child.on('exit',code=>process.exit(code??0));
for(const sig of ['SIGTERM','SIGINT'] as const)process.on(sig,()=>{child.kill(sig);});
