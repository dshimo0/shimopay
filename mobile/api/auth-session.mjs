function publicKey(key){if(key.startsWith('sb_publishable_'))return true;try{return JSON.parse(atob(key.split('.')[1])).role==='anon';}catch{return false;}}
export async function verifyUser(request,transport=fetch){
 const url=process.env.VITE_SUPABASE_URL;const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key||!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!publicKey(key))return {status:503,data:{error:'Autenticação ainda não configurada.'}};
 const auth=request.headers.authorization;
 if(typeof auth!=='string'||!/^Bearer [A-Za-z0-9_.-]{20,8192}$/.test(auth))return {status:401,data:{error:'Sessão inválida. Entre novamente.'}};
 try{const r=await transport(url+'/auth/v1/user',{headers:{apikey:key,Authorization:auth},signal:AbortSignal.timeout(15000)});if(!r.ok)return {status:401,data:{error:'Sessão inválida. Entre novamente.'}};const user=await r.json();if(typeof user.id!=='string'||!user.email_confirmed_at)return {status:401,data:{error:'Confirme seu email antes de entrar.'}};return {status:200,data:{id:user.id,email:user.email}};}catch{return {status:503,data:{error:'Serviço de autenticação indisponível.'}};}
}
export default async function handler(req,res){res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).end();try{if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({error:'Origem inválida.'});}catch{return res.status(403).end();}const result=await verifyUser(req);return res.status(result.status).json(result.data);}
