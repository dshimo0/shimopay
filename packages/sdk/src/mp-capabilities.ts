import {pixProviderError} from './fiat';
/** Internal diagnostic only. Uses the runtime credential; emits no credentials or profiles. */
export async function mpCapabilities(token:string,payerEmail:string){
 const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
 const get=async(path:string)=>fetch(`https://api.mercadopago.com${path}`,{headers,signal:AbortSignal.timeout(20000)});
 const sellerResponse=await get('/users/me');
 if(!sellerResponse.ok)return {stage:'seller',...await pixProviderError(sellerResponse)};
 const seller=await sellerResponse.json();
 if(String(seller.id)!=='3758554144'||!seller.tags?.includes('test_user'))return {error:'Expected test seller required'};
 const buyerResponse=await get('/users/3758554146');
 const buyer=buyerResponse.ok?await buyerResponse.json():null;
 if(String(buyer?.id)!=='3758554146'||buyer?.nickname!=='TESTUSER6926644495296245660'||!/^test_user_[0-9]+@testuser\.com$/.test(payerEmail))return {error:'Expected test buyer required',buyerHttp:buyerResponse.status,buyerMatchesProvidedTestLogin:buyer?.nickname==='TESTUSER6926644495296245660'};
 const result:Record<string,unknown>={sellerVerified:true,buyerVerified:true};
 for(const path of ['/applications/2913921394346338','/v1/payment_methods','/v1/orders/ORDTST01M4QATH7DMCM10M71PCVTY2SJ']){
  const response=await get(path);if(!response.ok){result[path]=await pixProviderError(response);continue;}
  const data=await response.json();result[path]=path.includes('/orders/')?{http:response.status,orderFields:Object.keys(data),status:data.status,statusDetail:data.status_detail,processingMode:data.processing_mode,payments:data.transactions?.payments?.map((p:{status?:string;status_detail?:string;payment_method?:object})=>({status:p.status,statusDetail:p.status_detail,methodFields:Object.keys(p.payment_method??{})}))}:path.includes('payment_methods')?{http:response.status,pixAvailable:Array.isArray(data)&&data.some(x=>x.id==='pix'&&x.status==='active')}:{http:response.status,scopes:Array.isArray(data.scopes)?data.scopes.filter((s:unknown)=>typeof s==='string'&&/^[a-z_]{1,50}$/.test(s)):null};
 }
 return result;
}
