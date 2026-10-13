import {readFile} from 'node:fs/promises';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const rpc='http://127.0.0.1:8545';
const readMethods=new Set(['eth_chainId','eth_blockNumber','eth_gasPrice','eth_maxPriorityFeePerGas','eth_feeHistory','eth_getBlockByNumber','eth_getTransactionReceipt','eth_getTransactionByHash','eth_getTransactionCount','eth_getBalance','eth_getCode','eth_call','eth_estimateGas','eth_accounts']);
type Call={jsonrpc:string;id:string|number|null;method:string;params:unknown[]};
export async function POST(request:Request){
 if(process.env.DEMO_HOSTED_MODE!=='1')return new Response('Hosted demo disabled',{status:404});
 // Same-origin, fixed local development node only. Never expose Hardhat admin,
 // signing, private keys, arbitrary upstreams, or a public/testnet node here.
 const origin=request.headers.get('origin');
 if(origin){try{if(new URL(origin).host!==request.headers.get('host'))return new Response('Origin rejected',{status:403});}catch{return new Response('Origin rejected',{status:403});}}
 try{
  const raw=await request.text();
  if(raw.length>32_768)return new Response('Request too large',{status:413});
  const parsed:unknown=JSON.parse(raw),batch=Array.isArray(parsed)?parsed:[parsed];
  if(!batch.length||batch.length>20)return new Response('Invalid batch',{status:400});
  const config=JSON.parse(await readFile('public/deployment.json','utf8')) as {chainId:number;consumer:string;merchant:string;token:string;vault:string};
  if(config.chainId!==31337)return new Response('Local development chain required',{status:503});
  for(const item of batch){
   const call=item as Call;
   if(!call||call.jsonrpc!=='2.0'||!Array.isArray(call.params)||(!readMethods.has(call.method)&&call.method!=='eth_sendTransaction'))return new Response('Method rejected',{status:403});
   if(call.method==='eth_sendTransaction'){
    const tx=call.params[0] as {from?:string;to?:string;value?:string}|undefined;
    if(!tx||![config.consumer,config.merchant].map(a=>a.toLowerCase()).includes(tx.from?.toLowerCase()??'')||![config.token,config.vault].map(a=>a.toLowerCase()).includes(tx.to?.toLowerCase()??'')||(tx.value!==undefined&&BigInt(tx.value)!==0n))return new Response('Transaction rejected',{status:403});
   }
  }
  const chain=await fetch(rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:0,method:'eth_chainId',params:[]}),signal:AbortSignal.timeout(3000)});
  if((await chain.json() as {result?:string}).result!=='0x7a69')return new Response('Local development chain required',{status:503});
  const response=await fetch(rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:raw,signal:AbortSignal.timeout(15_000)});
  return new Response(await response.text(),{status:response.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 }catch{return new Response('Demo chain unavailable or invalid request',{status:503});}
}
