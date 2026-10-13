/** Only provider codes and explicitly recognized messages leave the server. */
export async function pixProviderError(response:Response){
 const body=await response.json().catch(()=>({}));
 const codes=[body.error,...(Array.isArray(body.cause)?body.cause.map((c:{code?:unknown})=>c.code):[])].filter(c=>typeof c==='number'||(typeof c==='string'&&/^[a-z_0-9]{1,80}$/i.test(c)));
 const message=typeof body.message==='string'?body.message.toLowerCase():'';
 const reason=message.includes('unauthorized use of live credentials')?'unauthorized_live_credentials':message.includes('unauthorized use of test credentials')?'unauthorized_test_credentials':message.includes('invalid access token')||message.includes('invalid access_token')?'invalid_access_token':message.includes('unauthorized')?'unauthorized':message.includes('pix')?'pix_provider_restriction':'unspecified';
 return {http:response.status,codes,reason};
}
/** Server-side Orders API adapter. Credentials never leave the backend. */
export interface RailPayment {
 id:string;status:'pending'|'approved'|'rejected'|'cancelled';amountMinor:number;
 currency:'BRL';rail:'mercadopago-pix-test';providerApi?:'orders';statusDetail?:string;
 qrCode?:string;qrCodeBase64?:string;
}
export interface PaymentRail {quote(amountMinor:number):Promise<{amountMinor:number;currency:'BRL'}>;initiate(amountMinor:number,idempotencyKey:string):Promise<RailPayment>;getStatus(id:string):Promise<RailPayment>;reconcile(id:string):Promise<RailPayment>;}
export const TestOrderId=/^ORDTST[A-Z0-9]{20,40}$/;
function minorUnits(value:unknown){
 if(typeof value!=='string'||!/^\d+\.\d{2}$/.test(value))throw new Error('Provider returned an invalid Pix amount.');
 const [whole,cents]=value.split('.');const amount=Number(whole)*100+Number(cents);
 if(!Number.isSafeInteger(amount))throw new Error('Provider returned an invalid Pix amount.');return amount;
}
export class MercadoPagoPixAdapter implements PaymentRail {
 constructor(private token:string,private payerEmail:string,private transport:typeof fetch=fetch){
  if(!/^(TEST-|APP_USR-)[A-Za-z0-9-]+$/.test(token))throw new Error('Pix sandbox requires a raw Access Token, without Bearer, quotes or whitespace.');
  if(!/^[^\s@]+@testuser\.com$/.test(payerEmail))throw new Error('Configure a Mercado Pago test payer email.');
 }
 private async verifyTestAccount(){
  const response=await this.transport('https://api.mercadopago.com/users/me',{headers:{Authorization:`Bearer ${this.token}`},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`Mercado Pago test API returned HTTP ${response.status} during test-account verification. No payment created.`);
  const account=await response.json();
  if(!Array.isArray(account.tags)||!account.tags.includes('test_user')||account.site_id!=='MLB'||!/^\d+$/.test(String(account.id)))throw new Error('Pix sandbox requires a verified Brazilian Mercado Pago test account. No payment created.');
  return String(account.id);
 }
 async quote(amountMinor:number){if(!Number.isSafeInteger(amountMinor)||amountMinor<100||amountMinor>10000)throw new Error('Demo Pix amount must be R$1–R$100.');return {amountMinor,currency:'BRL' as const};}
 private async request(path:string,init:RequestInit,expectedAmount?:number):Promise<RailPayment>{
  const sellerId=await this.verifyTestAccount();
  const response=await this.transport(`https://api.mercadopago.com/v1/orders${path}`,{...init,headers:{Authorization:`Bearer ${this.token}`,'Content-Type':'application/json','X-Test-Scope':'sandbox',...init.headers},signal:AbortSignal.timeout(25000)});
  if(!response.ok){const diagnostic=await pixProviderError(response);throw new Error(`Mercado Pago test API returned HTTP ${response.status}; reason=${diagnostic.reason}; codes=${diagnostic.codes.join(',')||'none'}.`);}
  const order=await response.json();const payment=order.transactions?.payments?.[0];
  // Orders omit live_mode. Require an ORDTST identifier and an authenticated test seller instead.
  if(!TestOrderId.test(order.id??'')||order.live_mode===true||(order.user_id!==undefined&&String(order.user_id)!==sellerId)||(order.currency!==undefined&&order.currency!=='BRL')||(order.country_code!==undefined&&order.country_code!=='BRA')||order.transactions?.payments?.length!==1||payment?.payment_method?.id!=='pix')throw new Error('Provider returned a non-test Pix order; refusing sandbox success.');
  if(path&&order.id!==path.slice(1))throw new Error('Provider returned a mismatched Pix order.');
  const amountMinor=minorUnits(order.total_amount);
  if(amountMinor<100||amountMinor>10000||minorUnits(payment.amount)!==amountMinor||(expectedAmount!==undefined&&amountMinor!==expectedAmount))throw new Error('Provider returned a mismatched Pix amount.');
  // An issued QR is pending. Only provider-confirmed, fully paid/accredited orders are approved.
  const accredited=order.status==='processed'&&order.status_detail==='accredited'&&['processed','approved'].includes(payment.status)&&minorUnits(order.total_paid_amount??'0.00')===amountMinor&&minorUnits(payment.paid_amount??'0.00')===amountMinor;
  const status:RailPayment['status']=accredited?'approved':['failed','rejected'].includes(order.status)?'rejected':['canceled','cancelled','expired'].includes(order.status)?'cancelled':'pending';
  const method=payment.payment_method;
  return {id:order.id,status,amountMinor,currency:'BRL',rail:'mercadopago-pix-test',providerApi:'orders',statusDetail:typeof order.status_detail==='string'?order.status_detail:undefined,qrCode:typeof method.qr_code==='string'?method.qr_code:undefined,qrCodeBase64:typeof method.qr_code_base64==='string'?method.qr_code_base64:undefined};
 }
 async initiate(amountMinor:number,idempotencyKey:string){
  await this.quote(amountMinor);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idempotencyKey))throw new Error('A stable UUID idempotency key is required.');
  const amount=(amountMinor/100).toFixed(2);
  return this.request('',{method:'POST',headers:{'X-Idempotency-Key':idempotencyKey},body:JSON.stringify({type:'online',processing_mode:'automatic',total_amount:amount,external_reference:`shimopay-${idempotencyKey}`,payer:{email:this.payerEmail,first_name:'APRO',last_name:'Test',entity_type:'individual',identification:{type:'CPF',number:'19119119100'}},transactions:{payments:[{amount,payment_method:{id:'pix',type:'bank_transfer'}}]}})},amountMinor);
 }
 async getStatus(id:string){if(!TestOrderId.test(id))throw new Error('Invalid test Pix order ID');return this.request(`/${id}`,{method:'GET'});}
 async reconcile(id:string){return this.getStatus(id);}
}

export interface CardCheckout {id:string;requestId:string;amountMinor:number;currency:'BRL';rail:'mercadopago-card-test';url:string;status:'pending';}
/** Hosted checkout only. Card data is entered on Mercado Pago, never on ShimoPay. */
export class MercadoPagoCardAdapter {
 constructor(private token:string,private payerEmail:string,private transport:typeof fetch=fetch){if(!/^(TEST-|APP_USR-)[A-Za-z0-9-]+$/.test(token)||!/^[^\s@]+@testuser\.com$/.test(payerEmail))throw new Error('Card sandbox requires test credentials.');}
 private validate(amount:number,key:string){if(!Number.isSafeInteger(amount)||amount<100||amount>10000||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key))throw new Error('Card sandbox requires R$1–R$100 and a stable request UUID.');}
 private async request(path:string,init:RequestInit={}){const r=await this.transport('https://api.mercadopago.com'+path,{...init,headers:{Authorization:`Bearer ${this.token}`,'Content-Type':'application/json',...init.headers},signal:AbortSignal.timeout(25000)});if(!r.ok){const d=await pixProviderError(r);throw new Error(`Mercado Pago test API returned HTTP ${d.http}; reason=${d.reason}; codes=${d.codes.join(',')||'none'}.`);}return r.json();}
 private async seller(){const seller=await this.request('/users/me');if(!Array.isArray(seller.tags)||!seller.tags.includes('test_user')||seller.site_id!=='MLB'||!/^\d+$/.test(String(seller.id)))throw new Error('Card sandbox requires a verified Brazilian test seller.');return String(seller.id);}
 private checkPreference(pref:Record<string,unknown>,seller:string,amount:number,key:string){const items=pref.items as {quantity?:number;currency_id?:string;unit_price?:number}[];if(String(pref.collector_id)!==seller||pref.external_reference!==`shimopay-card-${key}`||!Array.isArray(items)||items.length!==1||items[0].quantity!==1||items[0].currency_id!=='BRL'||Math.round(Number(items[0].unit_price)*100)!==amount||typeof pref.id!=='string'||!/^[A-Za-z0-9-]{1,100}$/.test(pref.id))throw new Error('Provider returned a mismatched card preference.');}
 async initiate(amountMinor:number,requestId:string):Promise<CardCheckout>{this.validate(amountMinor,requestId);const seller=await this.seller();const pref=await this.request('/checkout/preferences',{method:'POST',headers:{'X-Idempotency-Key':requestId},body:JSON.stringify({items:[{id:'shimopay-test',title:'ShimoPay test checkout',quantity:1,currency_id:'BRL',unit_price:amountMinor/100}],payer:{email:this.payerEmail},external_reference:`shimopay-card-${requestId}`,payment_methods:{excluded_payment_types:[{id:'bank_transfer'},{id:'ticket'},{id:'debit_card'}],installments:1},back_urls:{success:'https://shimopay-mobile.vercel.app/customer/home',failure:'https://shimopay-mobile.vercel.app/customer/home',pending:'https://shimopay-mobile.vercel.app/customer/home'}})});this.checkPreference(pref,seller,amountMinor,requestId);const url=new URL(String(pref.sandbox_init_point));if(url.protocol!=='https:'||url.hostname!=='sandbox.mercadopago.com.br'||url.pathname!=='/checkout/v1/redirect'||url.searchParams.get('pref_id')!==pref.id)throw new Error('Provider did not return a verified card sandbox checkout URL.');return {id:pref.id,requestId,amountMinor,currency:'BRL',rail:'mercadopago-card-test',url:url.toString(),status:'pending'};}
 async status(id:string,amountMinor:number,requestId:string){this.validate(amountMinor,requestId);if(!/^[A-Za-z0-9-]{1,100}$/.test(id))throw new Error('Invalid card preference.');const seller=await this.seller();const pref=await this.request(`/checkout/preferences/${id}`);this.checkPreference(pref,seller,amountMinor,requestId);if(pref.id!==id)throw new Error('Provider returned a mismatched card preference.');const result=await this.request(`/v1/payments/search?external_reference=${encodeURIComponent('shimopay-card-'+requestId)}&sort=date_created&criteria=desc&limit=100`);if(!Array.isArray(result.results)||Number(result.paging?.total??result.results.length)>100)throw new Error('Card reconciliation unavailable or ambiguous.');const payments=result.results.filter((p:Record<string,unknown>)=>p.external_reference===`shimopay-card-${requestId}`);for(const payment of payments){if(payment.live_mode!==false||String(payment.collector_id)!==seller||payment.currency_id!=='BRL'||Math.round(Number(payment.transaction_amount)*100)!==amountMinor||payment.payment_type_id!=='credit_card')throw new Error('Provider returned a non-test or mismatched card payment.');}const approved=payments.filter((p:Record<string,unknown>)=>p.status==='approved'&&p.status_detail==='accredited');if(approved.length>1)throw new Error('Multiple card payments need manual reconciliation.');const latest=approved[0]??payments[0];return {id,requestId,amountMinor,currency:'BRL',rail:'mercadopago-card-test',status:approved.length?'approved':latest?.status==='rejected'?'rejected':latest?.status==='cancelled'?'cancelled':'pending',paymentId:latest?.id?String(latest.id):undefined};}
}
