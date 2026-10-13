import {Link} from 'react-router-dom';
import {Store,Globe,ArrowUpRight,UserRound,Wallet} from 'lucide-react';
import {ShimoMark} from '@/components/shimo/ShimoSymbols';
import './payments.css';
export function ProductHeader({language='pt-BR',onLanguage,role}:{language?:string;onLanguage?:(value:string)=>void;role?:'consumer'|'merchant'}){
 const pt=language==='pt-BR';
 return <header className="product-header"><Link to="/" className="product-brand" aria-label="ShimoPay · início"><ShimoMark className="h-9 w-9"/><span>Shimo<span className="brand-pay">Pay</span></span></Link><nav aria-label={pt?'Navegação principal':'Main navigation'}>{role?<Link aria-label={role==='consumer'?(pt?'Meu negócio':'Business'):(pt?'Minha carteira':'Wallet')} to={role==='consumer'?'/merchant/dashboard':'/customer/home'}>{role==='consumer'?<Store size={18}/>:<Wallet size={18}/>}<span>{role==='consumer'?(pt?'Meu negócio':'Business'):(pt?'Minha carteira':'Wallet')}</span></Link>:<Link aria-label="Para negócios" to="/merchant/dashboard"><Store size={17}/><span>Para negócios</span></Link>}{role?<Link to="/auth" aria-label={pt?'Minha conta':'Account'}><UserRound size={19}/></Link>:null}</nav>{onLanguage?<label className="product-language"><Globe size={16}/><select aria-label={pt?'Idioma':'Language'} value={language} onChange={e=>onLanguage(e.target.value)}><option value="pt-BR">PT</option><option value="en-US">EN</option></select></label>:role?null:<Link className="product-open" to="/customer/home">Abrir app <ArrowUpRight size={16}/></Link>}</header>;
}
