import {Link} from 'react-router-dom';
import {ArrowLeft,Wallet} from 'lucide-react';
import {ProductHeader} from './payments/ProductHeader';
import './payments/design310.css';
export default function NotFound(){return <main className="payment-screen experience310 empty-page"><ProductHeader/><section><span className="eyebrow">Página não encontrada</span><h1>Vamos voltar para o caminho certo.</h1><p>Este endereço não está disponível. Você pode continuar pela carteira ou voltar ao início.</p><Link className="brand-button" to="/customer/home"><Wallet size={18}/> Abrir carteira</Link><Link className="quiet-link" to="/"><ArrowLeft size={16}/> Voltar ao início</Link></section></main>;}
