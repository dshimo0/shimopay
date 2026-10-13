import {useEffect,useState} from 'react';
import {Receipt,ChevronRight,ArrowDownLeft,ArrowUpRight} from 'lucide-react';
import {readRecord,writeRecord,type SolanaHistoryEntry} from '@shimopay/solana-browser';
import {chainStatus,decimalAmount,shortAddress,type ChainReceipt} from '@/integrations/shimopay/chainReceipt';
import {historyMovements} from '@/integrations/shimopay/historyMovement';
export function ChainActivity({entries,onSelect,wallet,reserve,online}:{entries:SolanaHistoryEntry[];onSelect:(entry:SolanaHistoryEntry)=>void;wallet?:string;reserve?:string;online:boolean}){
 const [receipts,setReceipts]=useState<Record<string,ChainReceipt>>({});
 const [unavailable,setUnavailable]=useState<Record<string,boolean>>({});
 const signatures=entries.map(e=>e.signature).join(',');
 useEffect(()=>{const controller=new AbortController();let index=0;const list=signatures.split(',').filter(Boolean);
  const worker=async()=>{while(index<list.length&&!controller.signal.aborted){const signature=list[index++],key='chain-receipt:devnet:'+signature;try{
   let data=await readRecord<ChainReceipt>(key);
   if(data?.signature===signature&&!controller.signal.aborted)setReceipts(prev=>({...prev,[signature]:data!}));
   if(online&&!(data?.status==='finalized'&&data.detailsAvailable)){
    const response=await fetch('/api/transaction?signature='+encodeURIComponent(signature),{signal:controller.signal,cache:'no-store'});
    if(!response.ok)throw new Error('Unavailable');data=await response.json();
    if(data?.signature!==signature||data.network!=='devnet')throw new Error('Invalid receipt');
    if(controller.signal.aborted)return;await writeRecord(key,data);setReceipts(prev=>({...prev,[signature]:data!}));
   }
  }catch{if(!controller.signal.aborted)setUnavailable(prev=>({...prev,[signature]:true}));}}};
  void Promise.all([worker(),worker()]);return()=>controller.abort();
 },[signatures,online]);
 return <div className="chain-activity friendly-chain">{entries.map(entry=>{const receipt=receipts[entry.signature],movements=receipt&&wallet?historyMovements(receipt,wallet,reserve):[],status=receipt?.status??entry.status;
 const transfer=receipt?.transfers.find(t=>[t.sourceOwner,t.destinationOwner,t.source,t.destination].some(a=>a===wallet||Boolean(reserve&&a===reserve)));const from=transfer?.sourceOwner??transfer?.source,to=transfer?.destinationOwner??transfer?.destination;
 const Icon=movements[0]?.direction==='in'?ArrowDownLeft:movements[0]?.direction==='out'?ArrowUpRight:Receipt;
 return <button key={entry.signature} onClick={()=>onSelect(entry)} aria-label={`Abrir comprovante da transação ${entry.signature.slice(0,6)}`}>
 <span className="chain-row-icon"><Icon size={20}/></span><span className="chain-row-copy"><strong>{status==='failed'?'Movimentação não concluída':movements[0]?.label??'Operação na rede'}</strong>{transfer?<small>{transfer.asset} · Solana · {from===wallet||from===reserve?'Para '+shortAddress(to!):'De '+shortAddress(from!)}</small>:null}<small>{entry.blockTime?new Date(entry.blockTime*1000).toLocaleString('pt-BR'):'Data não disponível'}</small>{receipt?.feePayer===wallet&&receipt.feeLamports?<small>Taxa: {decimalAmount(receipt.feeLamports,9)} SOL</small>:null}</span>
 <span className="chain-row-values">{movements.map((m,i)=><strong key={i} className={m.direction}>{m.value}</strong>)}{!receipt?<small>{!online?'Valor não salvo':unavailable[entry.signature]?'Valor indisponível':'Consultando valor…'}</small>:null}<span className={'chain-row-status '+status}>{chainStatus[status]}</span></span><ChevronRight size={16}/></button>;
 })}</div>;
}
