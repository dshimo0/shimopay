import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MercadoPagoPixAdapter,pixProviderError} from '../src/fiat';
const id='ORDTST01M4QATH7DMCM10M71PCVTY2SJ';
const account={id:3758554144,site_id:'MLB',tags:['test_user']};
const baseOrder={id,user_id:'3758554144',country_code:'BRA',currency:'BRL',status:'action_required',status_detail:'waiting_transfer',total_amount:'100.00',total_paid_amount:'0.00',transactions:{payments:[{id:'PAYTEST',amount:'100.00',paid_amount:'0.00',status:'action_required',payment_method:{id:'pix',type:'bank_transfer',qr_code:'test-provider-qr',qr_code_base64:'test-image'}}]}};
function fixture(order=baseOrder,owner=account){return (async(input)=>Response.json(String(input).endsWith('/users/me')?owner:order)) as typeof fetch;}
const rail=(fetcher:typeof fetch)=>new MercadoPagoPixAdapter('APP_USR-fixture','test_user_123@testuser.com',fetcher);
test('Pix rejects malformed credentials, non-test buyer email and unbounded amounts',async()=>{
 assert.throws(()=>new MercadoPagoPixAdapter('Bearer APP_USR-secret','test_user_123@testuser.com'),/raw Access Token/);
 assert.throws(()=>new MercadoPagoPixAdapter('APP_USR-secret','real@example.com'),/test payer email/);
 await assert.rejects(rail(fixture()).quote(10001),/R\$1/);
});
test('Orders sends the exact BRL amount, Pix method and stable idempotency key after test-seller verification',async()=>{
 const calls:{url:string;init:RequestInit}[]=[];
 const transport:typeof fetch=async(input,init)=>{calls.push({url:String(input),init:init!});return fixture()(input,init);};
 const key=crypto.randomUUID();const result=await rail(transport).initiate(10000,key);
 assert.equal(result.status,'pending');assert.equal(result.qrCode,'test-provider-qr');assert.equal(result.id,id);
 assert.equal(calls[0].url,'https://api.mercadopago.com/users/me');assert.equal(calls[1].url,'https://api.mercadopago.com/v1/orders');
 assert.equal((calls[1].init.headers as Record<string,string>)['X-Idempotency-Key'],key);
 assert.equal((calls[1].init.headers as Record<string,string>)['X-Test-Scope'],'sandbox');
 const body=JSON.parse(calls[1].init.body as string);assert.equal(body.total_amount,'100.00');assert.equal(body.transactions.payments[0].payment_method.id,'pix');assert.equal(body.payer.email,'test_user_123@testuser.com');
});
test('Real seller accounts are refused before any order mutation',async()=>{
 let calls=0;const transport:typeof fetch=async(input)=>{calls++;assert.ok(String(input).endsWith('/users/me'));return Response.json({...account,tags:['normal']});};
 await assert.rejects(rail(transport).initiate(10000,crypto.randomUUID()),/verified Brazilian/);assert.equal(calls,1);
});
test('Non-test order IDs, wrong owner and live responses cannot be presented as sandbox success',async()=>{
 for(const order of [{...baseOrder,id:'ORD01M4QATH7DMCM10M71PCVTY2SJ'},{...baseOrder,user_id:'999'},{...baseOrder,live_mode:true}])await assert.rejects(rail(fixture(order)).getStatus(id),/non-test/);
});
test('Amount mismatch cannot become a successful charge',async()=>{
 await assert.rejects(rail(fixture()).initiate(2500,crypto.randomUUID()),/mismatched Pix amount/);
});
test('A processed label without fully paid amounts remains pending',async()=>{
 const order={...baseOrder,status:'processed',status_detail:'accredited',transactions:{payments:[{...baseOrder.transactions.payments[0],status:'processed'}]}};
 assert.equal((await rail(fixture(order)).getStatus(id)).status,'pending');
});
test('Only a fully paid provider-accredited order becomes approved on reconciliation',async()=>{
 const order={...baseOrder,status:'processed',status_detail:'accredited',total_paid_amount:'100.00',transactions:{payments:[{...baseOrder.transactions.payments[0],status:'processed',paid_amount:'100.00'}]}};
 assert.equal((await rail(fixture(order)).reconcile(id)).status,'approved');
});
test('Status lookups refuse paths and payment IDs from the previous API',async()=>{
 for(const invalid of ['123','../users/me','ORDREAL'])await assert.rejects(rail(fixture()).getStatus(invalid),/Invalid test Pix order ID/);
});
test('Provider authorization diagnostics expose recognized reasons and codes, not arbitrary response text',async()=>{
 assert.deepEqual(await pixProviderError(Response.json({error:'unauthorized',message:'Unauthorized use of live credentials',cause:[{code:7,description:'private detail'}]},{status:401})),{http:401,codes:['unauthorized',7],reason:'unauthorized_live_credentials'});
 assert.deepEqual(await pixProviderError(Response.json({error:'APP_USR-sensitive-secret-data',message:'private@example.com secret',cause:[{code:'private@example.com'}]},{status:401})),{http:401,codes:[],reason:'unspecified'});
});
