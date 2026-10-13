import {useEffect,useState} from 'react';
import {CreditCard,ScanLine} from 'lucide-react';
import {railHistory} from '@/integrations/shimopay/railHistory';
export function RailHistory(){const [rows,setRows]=useState(railHistory);useEffect(()=>{const update=()=>setRows(railHistory());window.addEventListener('shimopay-rail-history',update);return()=>window.removeEventListener('shimopay-rail-history',update);},[]);
 if(!rows.length)return null;
 return <section className="fiat-history"><h3>Pix e cartão</h3>{rows.slice().reverse().map(r=><article key={r.rail+r.id}><div>{r.rail==='pix'?<ScanLine size={20}/>:<CreditCard size={20}/>}<strong>{r.rail==='pix'?'Pix · BRL':'Cartão de crédito · BRL'}</strong><strong>{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(r.amountMinor/100)}</strong></div><p>Mercado Pago · Sandbox · {r.status==='approved'?'Aprovado':r.status==='rejected'?'Recusado':r.status==='cancelled'?'Cancelado':'Pendente'}</p><small>{new Date(r.createdAt).toLocaleString('pt-BR')} · Conta vendedora Mercado Pago</small><details><summary>Identificador do pagamento</summary><code>{r.id}</code></details></article>)}</section>;
}
