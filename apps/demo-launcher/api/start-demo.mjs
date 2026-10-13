import {createHash} from 'node:crypto';
import {Sandbox} from '@vercel/sandbox';
import {runtimeRelease} from '../runtime-release.mjs';
let pending;let cachedEndpoint;let cachedUntil=0;
const name='shimopay-solana-demo';
// Runtime OIDC belongs to this Vercel project. No PAT or wallet key is embedded.
const canonicalFetch=(input,options)=>{
 const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);
 if(url.hostname==='vercel.com'&&url.pathname.startsWith('/api/')){url.hostname='api.vercel.com';url.pathname=url.pathname.slice(4);}
 return fetch(url,options);
};
async function start(){
 const sandbox=await Sandbox.get({name,resume:true,fetch:canonicalFetch});
 // Update source from this deployment after resuming an older snapshot. No wallet/credential files are replaced.
 const installed=await sandbox.runCommand({cmd:'node',args:['--input-type=module','-e',"import {readFile} from 'node:fs/promises';try{process.exit((await readFile('.shimopay-runtime-release','utf8')).trim()===process.env.EXPECTED_RELEASE?0:1)}catch{process.exit(1)}"],cwd:'/vercel/sandbox',env:{EXPECTED_RELEASE:runtimeRelease.version}});
 if(installed.exitCode!==0){
  await sandbox.writeFiles(runtimeRelease.files.map(file=>({path:`/vercel/sandbox/${file.path}`,content:file.content})));
  const build=await sandbox.runCommand({cmd:'bash',args:['-c','NEXT_TELEMETRY_DISABLED=1 pnpm build'],cwd:'/vercel/sandbox',timeoutMs:180000});
  if(build.exitCode!==0)throw new Error('Runtime release build failed');
  await sandbox.writeFiles([{path:'/vercel/sandbox/.shimopay-runtime-release',content:runtimeRelease.version}]);
 }
 const runtimeKeys=['MERCADOPAGO_ACCESS_TOKEN','MERCADOPAGO_TEST_PAYER_EMAIL','SOLANA_RPC_URL','SHIMOPAY_RELEASE_VERSION'];
 const runtimeEnv=Object.fromEntries(runtimeKeys.filter(k=>process.env[k]).map(k=>[k,process.env[k]]));
 runtimeEnv.SHIMOPAY_RELEASE_VERSION=runtimeRelease.version;
 const fingerprint=createHash('sha256').update(JSON.stringify(runtimeKeys.map(k=>[k,runtimeEnv[k]??'']))).digest('hex');
 const probe=async()=>{
  const result=await sandbox.runCommand({cmd:'node',args:['--input-type=module','-e',"try{const r=await fetch('http://127.0.0.1:3000/deployment.json',{signal:AbortSignal.timeout(1500)});const c=await r.json();if(!['localnet','devnet'].includes(c.cluster))process.exit(1);const runtime=await fetch('http://127.0.0.1:3000/api/runtime',{signal:AbortSignal.timeout(3000)});const info=await runtime.json();process.exit(info.fingerprint===process.env.SHIMOPAY_EXPECTED_FINGERPRINT?0:1)}catch{process.exit(1)}"],cwd:'/vercel/sandbox',env:{SHIMOPAY_EXPECTED_FINGERPRINT:fingerprint}});
  return result.exitCode===0;
 };
 if(!await probe()){
  await sandbox.runCommand({cmd:'node',args:['scripts/sandbox-runtime.mjs'],cwd:'/vercel/sandbox',env:{PATH:'/vercel/tools/node_modules/.bin:/usr/local/bin:/usr/bin:/bin',SOLANA_CLI:'/vercel/tools/bin/solana',SOLANA_VALIDATOR:'/vercel/tools/bin/solana-test-validator',NEXT_TELEMETRY_DISABLED:'1',...runtimeEnv},detached:true});
  for(let attempt=0;attempt<60;attempt++){
   if(await probe())return {url:`${sandbox.domain(3000)}/demo`,sessionMinutes:45};
   await new Promise(resolve=>setTimeout(resolve,1000));
  }
  throw new Error('Demo startup timed out');
 }
 return {url:`${sandbox.domain(3000)}/demo`,sessionMinutes:45};
}
export function invalidateDemoEndpoint(){cachedUntil=0;}
export function getRunningDemo(){if(cachedEndpoint&&Date.now()<cachedUntil)return Promise.resolve(cachedEndpoint);pending??=start().then(result=>{cachedEndpoint=result;cachedUntil=Date.now()+30000;return result;}).finally(()=>{pending=undefined;});return pending;}
export default async function handler(request,response){
 response.setHeader('Cache-Control','no-store');
 if(request.method!=='POST')return response.status(405).json({error:'Use POST'});
 const origin=request.headers.origin;
 if(origin){try{if(new URL(origin).host!==request.headers.host)return response.status(403).json({error:'Origin rejected'});}catch{return response.status(403).json({error:'Origin rejected'});}}
 try{
  return response.status(200).json(await getRunningDemo());
 }catch(error){
  console.error('ShimoPay demo startup failed:',error instanceof Error?error.message:'unknown error');
  return response.status(503).json({error:'Could not start the demo. Please try again shortly.'});
 }
}
