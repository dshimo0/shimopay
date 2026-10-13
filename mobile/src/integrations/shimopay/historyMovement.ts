import {type ChainReceipt,decimalAmount} from './chainReceipt';
export function historyMovements(receipt:ChainReceipt,wallet:string,reserve?:string){
 if(receipt.executionFailed||receipt.status==='failed')return [];
 const groups=new Map<string,{amount:bigint;decimals:number;asset:string;internal:boolean}>();
 for(const t of receipt.transfers){
  const from=t.sourceOwner??t.source,to=t.destinationOwner??t.destination;
  const owns=(address:string)=>address===wallet||Boolean(reserve&&address===reserve);
  if(!owns(from)&&!owns(to))continue;
  const internal=owns(from)&&owns(to),key=`${t.mint??'SOL'}:${internal}`;
  const group=groups.get(key)??{amount:0n,decimals:t.decimals,asset:t.asset,internal};
  group.amount+=BigInt(t.amount)*(internal||owns(to)?1n:-1n);groups.set(key,group);
 }
 return [...groups.values()].filter(g=>g.amount!==0n).map(g=>({
  direction:g.internal?'internal':g.amount>0n?'in':'out',
  label:g.internal?'Entre carteira e reserva':g.amount>0n?'Recebido':'Enviado',
  value:(g.internal?'':g.amount>0n?'+':'−')+decimalAmount((g.amount<0n?-g.amount:g.amount).toString(),g.decimals)+' '+g.asset,
 }));
}
