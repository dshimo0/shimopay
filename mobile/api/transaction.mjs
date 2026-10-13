const GENESIS='EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG';
const USDC='4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const TOKEN_PROGRAMS=new Set(['spl-token','spl-token-2022']);
export function parseTransaction(signature,tx,status,checkedAt){
 const failed=Boolean(tx?.meta?.err||status?.err);
 const state=failed?'failed':status?.confirmationStatus==='finalized'?'finalized':tx?'confirmed':status?.confirmationStatus==='confirmed'?'confirmed':status?.confirmationStatus==='processed'?'submitted':'unavailable';
 const keys=(tx?.transaction?.message?.accountKeys??[]).map(k=>typeof k==='string'?k:k.pubkey);
 const tokenAccounts=new Map();for(const b of [...(tx?.meta?.preTokenBalances??[]),...(tx?.meta?.postTokenBalances??[])])tokenAccounts.set(keys[b.accountIndex],b);
 const transfers=[];const outer=tx?.transaction?.message?.instructions??[];
 for(let i=0;i<outer.length;i++)for(const instruction of [outer[i],...(tx?.meta?.innerInstructions??[]).filter(x=>x.index===i).flatMap(x=>x.instructions)]){
  const {type,info}=instruction.parsed??{};if(!info)continue;
  if(instruction.program==='system'&&type==='transfer'&&Number.isSafeInteger(info.lamports)&&info.lamports>=0){transfers.push({source:info.source,destination:info.destination,sourceOwner:info.source,destinationOwner:info.destination,amount:String(info.lamports),decimals:9,asset:'SOL',mint:null});continue;}
  if(!TOKEN_PROGRAMS.has(instruction.program)||!['transfer','transferChecked'].includes(type))continue;
  const from=tokenAccounts.get(info.source),to=tokenAccounts.get(info.destination);const mint=info.mint??from?.mint??to?.mint;
  const decimals=info.tokenAmount?.decimals??from?.uiTokenAmount?.decimals??to?.uiTokenAmount?.decimals;
  const amount=info.tokenAmount?.amount??info.amount;
  if(typeof amount!=='string'||!/^\d+$/.test(amount)||!Number.isInteger(decimals)||decimals<0||decimals>255||!mint)continue;
  transfers.push({source:info.source,destination:info.destination,sourceOwner:from?.owner??null,destinationOwner:to?.owner??null,amount,decimals,asset:mint===USDC?'USDC':'Token',mint});
 }
 return {signature,network:'devnet',status:state,slot:tx?.slot??status?.slot??null,blockTime:tx?.blockTime??null,feeLamports:Number.isSafeInteger(tx?.meta?.fee)?String(tx.meta.fee):null,feePayer:keys[0]??null,transfers,checkedAt,detailsAvailable:Boolean(tx?.meta),executionFailed:failed};
}
export async function readTransaction(signature,transport=fetch){
 if(typeof signature!=='string'||! /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(signature))throw new Error('Invalid signature');
 const rpc=process.env.SOLANA_RPC_URL||'https://api.devnet.solana.com';
 const call=async(method,params=[])=>{const r=await transport(rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('RPC unavailable');const j=await r.json();if(j.error)throw new Error('RPC unavailable');return j.result;};
 if(await call('getGenesisHash')!==GENESIS)throw new Error('Expected Devnet');
 const [tx,status]=await Promise.all([call('getTransaction',[signature,{encoding:'jsonParsed',commitment:'confirmed',maxSupportedTransactionVersion:0}]),call('getSignatureStatuses',[[signature],{searchTransactionHistory:true}])]);
 if(tx&&tx.transaction?.signatures?.[0]!==signature)throw new Error('Signature mismatch');
 return parseTransaction(signature,tx,status?.value?.[0],Math.floor(Date.now()/1000));
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Método não permitido.'});
 const signature=req.query?.signature;
 if(typeof signature!=='string'||! /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(signature))return res.status(400).json({error:'Transação inválida.'});
 try{return res.status(200).json(await readTransaction(signature));}catch{return res.status(503).json({error:'Não foi possível consultar a Solana agora. Tente novamente; seu pagamento não foi alterado.'});}
}
