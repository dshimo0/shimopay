import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Store,UserRound,ArrowUpRight} from 'lucide-react';
import {authConfigured,verifyIdentity} from '@/integrations/auth/client';
import {shortAddress} from '@/integrations/shimopay/chainReceipt';
export function AccountIdentity({role,address,online}:{role:'consumer'|'merchant';address?:string;online:boolean}){
 const [identity,setIdentity]=useState<{email:string;id:string}|null>(null);
 useEffect(()=>{let active=true;if(authConfigured&&online)void verifyIdentity().then(user=>{if(active)setIdentity(user);}).catch(()=>{if(active)setIdentity(null);});return()=>{active=false;};},[online]);
 const merchant=role==='merchant',Icon=merchant?Store:UserRound;
 return <section className="account-identity" aria-label="Conta ativa"><Icon size={23}/><div><strong>{merchant?'Perfil lojista':'Perfil cliente'}</strong><small>{identity?`${identity.email} · ${online?'Sessão validada':'Última sessão validada'}`:'Visitante · sem conta pessoal conectada'}</small>{address?<a href={`https://explorer.solana.com/address/${address}?cluster=devnet`} target="_blank" rel="noreferrer">Carteira {shortAddress(address)} <ArrowUpRight size={12}/></a>:null}<small>Carteira de desenvolvimento compartilhada</small></div><Link to={merchant?'/customer/home':'/merchant/dashboard'}>Trocar perfil</Link></section>;
}
