import {chromium,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {X509Certificate,createHash} from 'node:crypto';
const url=process.env.SHIMOPAY_DEMO_URL;if(!url?.startsWith('https://'))throw new Error('Set hosted HTTPS /demo URL');
const pins=process.env.SHIMOPAY_BROWSER_CA_FILES?await Promise.all(process.env.SHIMOPAY_BROWSER_CA_FILES.split(',').map(async p=>createHash('sha256').update(new X509Certificate(await readFile(p)).publicKey.export({format:'der',type:'spki'})).digest('base64'))):[];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox',...(pins.length?[`--ignore-certificate-errors-spki-list=${pins.join(',')}`]:[])],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const page=await browser.newPage();
try{
 const initialState=page.waitForResponse(r=>r.url().endsWith('/api/solana-demo')&&r.request().postDataJSON()?.action==='state');
 await page.goto(url);await initialState;
 const button=page.getByRole('button',{name:/Generate R\$100 test Pix|Gerar Pix de teste de R\$100/});
 await page.getByText(/Add money · Pix sandbox|Adicionar saldo · Pix sandbox/,{exact:true}).click();
 await expect(button).toBeEnabled({timeout:60000});
 await page.evaluate(async()=>{await new Promise<void>((resolve,reject)=>{const request=indexedDB.open('shimopay-v1');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result;const tx=db.transaction('records','readwrite');tx.objectStore('records').put('b1c7a2ca-0c26-414e-b7aa-2bc7bd1569c0','solana:pix-idempotency');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};});});
 const request=page.waitForResponse(r=>r.url().endsWith('/api/pix')&&r.request().postDataJSON().action==='initiate');
 await button.click();const created=await request;const payment=await created.json();
 if(!created.ok())throw new Error(payment.error??'Pix creation failed');
 expect(payment.id).toMatch(/^ORDTST/);expect(payment.amountMinor).toBe(10000);
 const statusResponse=page.waitForResponse(r=>r.url().endsWith('/api/pix')&&r.request().postDataJSON().action==='status');
 await page.getByRole('button',{name:/Check provider status|Consultar status no provedor/}).click();const checked=await statusResponse;expect(checked.ok()).toBe(true);const status=await checked.json();expect(status.id).toBe(payment.id);
 const retry=await page.evaluate(async()=>{const response=await fetch('/api/pix',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'initiate',amountMinor:10000,idempotencyKey:'b1c7a2ca-0c26-414e-b7aa-2bc7bd1569c0'})});return {http:response.status,body:await response.json()};});
 expect(retry.http).toBe(200);expect(retry.body.id).toBe(payment.id);
 await page.screenshot({path:'docs/evidence/pix-orders-cloud.png',fullPage:true});
 const evidence={url,checkedAt:new Date().toISOString(),providerApi:'orders',id:payment.id,status:status.status,statusDetail:status.statusDetail,amountMinor:status.amountMinor,qrReturned:Boolean(status.qrCode),qrImageVisible:await page.getByAltText('Mercado Pago test Pix QR').isVisible(),idempotentRetry:true,realMoney:false,usdcConversion:'not performed'};
 await writeFile('docs/evidence/pix-orders-cloud.json',JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));
 await expect.poll(async()=>{await page.getByRole('button',{name:/Check provider status|Consultar status no provedor/}).click();await expect(page.getByRole('button',{name:/Check provider status|Consultar status no provedor/})).toBeEnabled();return page.getByAltText('Mercado Pago test Pix QR').isVisible();},{timeout:60000,intervals:[5000,10000]}).toBe(true);
 evidence.qrReturned=true;evidence.qrImageVisible=true;await writeFile('docs/evidence/pix-orders-cloud.json',JSON.stringify(evidence,null,2)+'\n');
}catch(error){await page.screenshot({path:'docs/evidence/pix-orders-cloud-pending.png',fullPage:true});await writeFile('docs/evidence/pix-orders-cloud-failure.json',JSON.stringify({url,checkedAt:new Date().toISOString(),qrVisible:await page.getByAltText('Mercado Pago test Pix QR').isVisible(),reason:error instanceof Error?error.message.split('Call log:')[0].slice(0,500):'Unknown failure'},null,2)+'\n');throw error;}finally{await browser.close();}
