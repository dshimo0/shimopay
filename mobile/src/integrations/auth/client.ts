import {createClient,type SupabaseClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
function publicKey(value:unknown){if(typeof value!=='string')return false;if(value.startsWith('sb_publishable_'))return true;try{return JSON.parse(atob(value.split('.')[1])).role==='anon';}catch{return false;}}
export const authConfigured=Boolean(url&&/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)&&publicKey(key));
let client:SupabaseClient|undefined;
export function authClient(){
 if(!authConfigured)throw new Error('Login indisponível: configure o projeto Supabase.');
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||typeof key!=='string'||!publicKey(key))throw new Error('Configuração pública de autenticação inválida.');
 if(!client)client=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce',storageKey:'shimopay-auth-v1'}});
 return client;
}
export async function verifyIdentity(){const {data,error}=await authClient().auth.getSession();if(error||!data.session)throw new Error('Entre para acessar sua conta.');const r=await fetch('/api/auth-session',{method:'POST',headers:{Authorization:`Bearer ${data.session.access_token}`}});const user=await r.json();if(!r.ok)throw new Error(user.error??'Não foi possível validar sua sessão.');return user as {id:string;email:string};}
export async function authHeaders():Promise<Record<string,string>>{if(!authConfigured)return {};const {data,error}=await authClient().auth.getSession();if(error||!data.session)return {};return {Authorization:`Bearer ${data.session.access_token}`};}
