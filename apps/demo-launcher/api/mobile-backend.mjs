import {getRunningDemo,invalidateDemoEndpoint} from './start-demo.mjs';
export default async function handler(request,response){
 response.setHeader('Cache-Control','no-store');
 const resources={deployment:'/deployment.json',solana:'/api/solana-demo',pix:'/api/pix'};
 const resource=request.query.resource;
 if(!resources[resource]||!['GET','POST'].includes(request.method))return response.status(400).json({error:'Unsupported request'});
 if((resource==='deployment')!==(request.method==='GET'))return response.status(405).end();
 const origin=request.headers.origin;
 if(origin&&new URL(origin).host!==request.headers.host)return response.status(403).json({error:'Cross-origin request rejected'});
 try{
  const body=request.method==='POST'?JSON.stringify(request.body):undefined;
  if(body&&body.length>16384)return response.status(413).json({error:'Payload too large'});
  const demo=await getRunningDemo();const url=new URL(resources[resource],demo.url);
  const upstream=await fetch(url,{method:request.method,headers:{'Content-Type':'application/json'},body,signal:AbortSignal.timeout(120000)});
  if([410,502,503,504].includes(upstream.status))invalidateDemoEndpoint();
  const data=await upstream.json();return response.status(upstream.status).json(data);
 }catch{invalidateDemoEndpoint();return response.status(503).json({error:'Development backend unavailable. Pending payments remain on your device; retry status when connected.'});}
}
