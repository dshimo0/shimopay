import {verifyUser} from './auth-session.mjs';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const allowed=new Set(['deployment','solana','pix']);
 const resource=req.query.resource;
 if(!allowed.has(resource)||!['GET','POST'].includes(req.method)||(resource==='deployment')!==(req.method==='GET'))return res.status(400).json({error:'Unsupported request'});
 if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({error:'Cross-origin request rejected'});
 const readOnly=resource==='solana'&&['state','history','session','status','fxQuote','receipt'].includes(req.body?.action);
 if(req.method==='POST'&&!readOnly&&process.env.VITE_SUPABASE_URL&&process.env.VITE_SUPABASE_PUBLISHABLE_KEY){const auth=await verifyUser(req);if(auth.status!==200)return res.status(auth.status).json(auth.data);const allowed=new Set((process.env.SHIMOPAY_ALLOWED_USER_IDS??'').split(',').map(v=>v.trim()).filter(Boolean));if(!allowed.has(auth.data.id))return res.status(403).json({error:'Sua conta não está habilitada para operar as carteiras de desenvolvimento.'});}
 const body=req.method==='POST'?JSON.stringify(req.body):undefined;
 if(body&&body.length>16384)return res.status(413).json({error:'Payload too large'});
 try{
  const url=new URL('/api/mobile-backend','https://shimopay-demo.vercel.app');url.searchParams.set('resource',resource);
  const upstream=await fetch(url,{method:req.method,headers:{'Content-Type':'application/json'},body,signal:AbortSignal.timeout(240000)});
  return res.status(upstream.status).json(await upstream.json());
 }catch{return res.status(503).json({error:'Development backend unavailable. Your pending payment has not been discarded.'});}
}
