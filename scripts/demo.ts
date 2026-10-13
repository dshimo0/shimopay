// Historical EVM tooling; the current web demo uses Solana exclusively.
import {spawn,type ChildProcess} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {JsonRpcProvider} from 'ethers';

// Keep both services attached to one terminal. Reuse a running development chain.
const children:ChildProcess[]=[];
let stopping=false;
function stop(code=0){
 if(stopping)return;stopping=true;
 for(const child of children){if(child.pid)try{process.kill(-child.pid,'SIGTERM');}catch{child.kill('SIGTERM');}}
 process.exit(code);
}
function launch(args:string[]){
 const child=spawn('pnpm',args,{stdio:'inherit',detached:true});children.push(child);
 child.on('error',error=>{console.error(error.message);stop(1);});
 child.on('exit',code=>{if(!stopping)stop(code??1);});
 return child;
}
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>stop());
const rpc='http://127.0.0.1:8545';
async function chainReady(){
 try{
  const response=await fetch(rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]}),signal:AbortSignal.timeout(1000)});
  return (await response.json() as {result?:string}).result==='0x7a69';
 }catch{return false;}
}
async function deploymentReady(){
 if(!await chainReady())return false;
 const provider=new JsonRpcProvider(rpc);
 try{
  const config=JSON.parse(await readFile('apps/web/public/deployment.json','utf8')) as {vault:string;token:string};
  return await provider.getCode(config.vault)!=='0x'&&await provider.getCode(config.token)!=='0x';
 }catch{return false;}finally{provider.destroy();}
}
async function waitFor(check:()=>Promise<boolean>,label:string){
 for(let attempts=0;attempts<120;attempts++){
  if(await check())return;
  await new Promise(resolve=>setTimeout(resolve,500));
 }
 throw new Error(`${label} did not become ready. Check the server logs.`);
}
try{
 if(!await chainReady()){
  const child=spawn(process.execPath,['--import','tsx','scripts/demo-chain.ts'],{stdio:'inherit',detached:true});children.push(child);
  child.on('error',error=>{console.error(error.message);stop(1);});child.on('exit',code=>{if(!stopping)stop(code??1);});
 }else if(!await deploymentReady()){
  await new Promise<void>((resolve,reject)=>{
   const child=spawn('pnpm',['deploy:local:evm'],{stdio:'inherit'});
   child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error('Local deployment failed')));
  });
 }
 await waitFor(deploymentReady,'Local deployment');
 async function webReady(){try{return (await fetch('http://127.0.0.1:3000/demo',{signal:AbortSignal.timeout(1000)})).ok;}catch{return false;}}
 if(!await webReady())launch(['--filter','@shimopay/web','start']);
 await waitFor(webReady,'Web demo');
 console.log('\nShimoPay ready: http://localhost:3000/demo (IPv4: http://127.0.0.1:3000/demo)\nKeep this terminal open. Ctrl+C stops services started by this command.');
 // Keep the launcher alive even when both services were already running.
 setInterval(()=>{},60_000);
}catch(error){console.error(error instanceof Error?error.message:error);stop(1);}
