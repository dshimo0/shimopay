// Native CLI HTTP transport adapter for managed clouds. HTTPS retains inherited proxy/CA trust.
import http from 'node:http';
const upstream=process.env.SHIMOPAY_BRIDGE_UPSTREAM;
if(!upstream||new URL(upstream).protocol!=='https:')throw new Error('HTTPS bridge upstream required');
let queue=Promise.resolve();let lastRequest=0;
async function rpcRequest(body){let unlock;const previous=queue;queue=new Promise(resolve=>{unlock=resolve;});await previous;try{const wait=Math.max(0,500-(Date.now()-lastRequest));if(wait)await new Promise(resolve=>setTimeout(resolve,wait));for(let n=0;n<3;n++){lastRequest=Date.now();const response=await fetch(upstream,{method:'POST',headers:{'Content-Type':'application/json'},body,signal:AbortSignal.timeout(60000)});if(response.status!==429||n===2)return response;const seconds=Number(response.headers.get('Retry-After')??'10');await response.arrayBuffer();await new Promise(resolve=>setTimeout(resolve,Math.min(60000,Math.max(10000,seconds*1000))));}}finally{unlock();}}
const server=http.createServer(async(req,res)=>{if(req.method!=='POST'){res.writeHead(405);res.end();return;}let body='';try{for await(const chunk of req){body+=chunk;if(body.length>1048576)throw new Error('RPC body too large');}const response=await rpcRequest(body);res.writeHead(response.status,{'Content-Type':'application/json'});res.end(await response.text());}catch{res.writeHead(502);res.end(JSON.stringify({error:'RPC transport unavailable'}));}});
server.listen(0,'127.0.0.1',()=>process.send?.({port:server.address().port}));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close());
process.on('disconnect',()=>server.close());
