import {test,expect} from '@playwright/test';
import {Contract,JsonRpcProvider} from 'ethers';
import {readFile} from 'node:fs/promises';
import {tokenAbi} from '../packages/sdk/src/index';
test('Hosted demo RPC rejects admin methods and arbitrary transactions',async({request})=>{
 const probe=await request.post('/api/demo-rpc',{data:{jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]}});
 if(probe.status()===404){test.skip(true,'Hosted mode is disabled');return;}
 expect(probe.ok()).toBe(true);expect((await probe.json()).result).toBe('0x7a69');
 const forbidden=await request.post('/api/demo-rpc',{data:{jsonrpc:'2.0',id:2,method:'hardhat_reset',params:[]}});expect(forbidden.status()).toBe(403);
 const config=JSON.parse(await readFile('apps/web/public/deployment.json','utf8'));
 const arbitrary=await request.post('/api/demo-rpc',{data:{jsonrpc:'2.0',id:3,method:'eth_sendTransaction',params:[{from:config.consumer,to:config.merchant,value:'0x1'}]}});expect(arbitrary.status()).toBe(403);
 const crossOrigin=await request.post('/api/demo-rpc',{headers:{Origin:'https://untrusted.invalid'},data:{jsonrpc:'2.0',id:4,method:'eth_chainId',params:[]}});expect(crossOrigin.status()).toBe(403);
});
async function setup(page:import('@playwright/test').Page){
 await page.goto('/demo');await expect(page.getByRole('button',{name:'Fund wallet',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'Fund wallet',exact:true}).click();await expect(page.getByRole('status')).toContainText('received 100 demo USDC');
 await page.getByLabel('Offline wallet password').fill('offline-demo-pass');await page.getByRole('button',{name:'Enable offline payments',exact:true}).click();await expect(page.getByRole('status')).toContainText('Offline allowance ready');
}
test('PWA refreshes stale HTML online and preserves the refreshed shell offline',async({page,context})=>{
 await page.goto('/demo');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
 await page.evaluate(async()=>{
  const name=(await caches.keys()).find(k=>k.startsWith('shimopay-shell-'));
  if(!name)throw new Error('Missing shell cache');
  const cache=await caches.open(name);
  await cache.put('/demo',new Response('<html><body>Obsolete demo build</body></html>',{headers:{'Content-Type':'text/html'}}));
 });
 await page.reload();
 await expect(page.getByRole('button',{name:'Fund wallet',exact:true})).toBeEnabled();
 await expect(page.getByText('Obsolete demo build')).toHaveCount(0);
 await context.setOffline(true);await page.reload();
 await expect(page.getByText('OFFLINE',{exact:true})).toBeVisible();
 await expect(page.getByText('Obsolete demo build')).toHaveCount(0);
});
test('BUS-02–06: offline authorization, acceptance, online settlement, replay and tamper',async({page})=>{
 const config=JSON.parse(await readFile('apps/web/public/deployment.json','utf8'));const provider=new JsonRpcProvider('http://127.0.0.1:8545');const token=new Contract(config.token,tokenAbi,provider);const before=await token.balanceOf(config.merchant) as bigint;
 await setup(page);
 await page.getByRole('button',{name:'Simulate offline',exact:true}).click();
 const requests:string[]=[];page.on('request',r=>{if(r.url().includes(':8545')||r.url().includes('/api/'))requests.push(r.url());});
 await page.getByRole('button',{name:'Charge',exact:true}).click();await page.getByRole('button',{name:'Pay offline',exact:true}).click();await expect(page.getByRole('status')).toContainText('Authorized locally');
 await page.getByRole('button',{name:'Validate & accept offline',exact:true}).click();await expect(page.getByRole('status')).toContainText('PAYMENT ACCEPTED');
 expect(requests).toEqual([]);await expect(page.getByRole('button',{name:/^Settle now/})).toBeDisabled();
 const persisted=await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('shimopay-v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});return await new Promise<unknown>((resolve,reject)=>{const r=db.transaction('records').objectStore('records').get('encrypted-session-key');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});});
 expect(persisted).toHaveProperty('ciphertext');expect(persisted).not.toHaveProperty('privateKey');
 await page.getByRole('button',{name:'Restore connectivity',exact:true}).click();await page.getByRole('button',{name:/^Settle now/}).click();await expect(page.getByRole('status')).toContainText('PAYMENT SETTLED');await expect(page.getByTestId('transaction-hash')).toContainText('0x');expect(await token.balanceOf(config.merchant)).toBe(before+4_545_455n);
 await page.getByText('Developer details & security checks').click();await page.getByRole('button',{name:'Test replay',exact:true}).click();await expect(page.getByRole('status')).toContainText('REPLAY REJECTED');await page.getByRole('button',{name:'Test tamper',exact:true}).click();await expect(page.getByRole('status')).toContainText('INVALID SIGNATURE');
 await page.getByRole('button',{name:'Disable offline payments',exact:true}).click();await expect(page.getByRole('status')).toContainText('Unspent funds released');await provider.destroy();
});
test('BUS-07 / TECH-08–09: cached PWA reload works with browser really offline',async({page,context})=>{
 await setup(page);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
 // Ensure resources are present before network is severed, not just an offline label.
 await expect.poll(()=>page.evaluate(async()=>{const name=(await caches.keys()).find(k=>k.startsWith('shimopay-shell-'));if(!name)return 0;const cache=await caches.open(name);return (await cache.keys()).filter(r=>r.url.includes('/_next/static/')&&r.url.includes('.js')).length;})).toBeGreaterThan(0);
 await context.setOffline(true);await page.reload();await expect(page.getByText('OFFLINE',{exact:true})).toBeVisible();await expect(page.getByRole('status')).toContainText('Offline session restored');
 await page.getByLabel('Offline wallet password').fill('offline-demo-pass');await page.getByRole('button',{name:'Unlock wallet',exact:true}).click();await expect(page.getByRole('status')).toContainText('unlocked');
 await page.getByRole('button',{name:'Charge',exact:true}).click();await page.getByRole('button',{name:'Pay offline',exact:true}).click();await expect(page.getByRole('status')).toContainText('Authorized locally');await page.getByRole('button',{name:'Validate & accept offline',exact:true}).click();await expect(page.getByRole('status')).toContainText('PAYMENT ACCEPTED');
 await page.getByRole('button',{name:'Disable offline payments',exact:true}).click();await expect(page.getByRole('status')).toContainText('cancellation pending');
 await context.setOffline(false);await page.getByRole('button',{name:'Disable offline payments',exact:true}).click();await expect(page.getByRole('status')).toContainText('Unspent funds released');
});
