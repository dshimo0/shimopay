import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
test('real Solana reserve → offline sign/accept → SPL settlement → replay/tamper reject',async({page})=>{
 const apiRequests:string[]=[];let offline=false;
 page.on('request',r=>{if(offline&&r.url().includes('/api/'))apiRequests.push(r.url());});
 await page.goto('/demo');await expect(page.getByRole('button',{name:'Fund wallet',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'Fund wallet',exact:true}).click();await expect(page.getByRole('status')).toContainText('50 USDC reserved on Solana');
 await page.getByLabel('Offline wallet password').fill('solana-demo-password');await page.getByRole('button',{name:'Enable offline payments',exact:true}).click();await expect(page.getByRole('status')).toContainText('Offline allowance ready: 30');
 await page.getByRole('button',{name:'Simulate offline',exact:true}).click();offline=true;
 await page.getByRole('button',{name:'Charge',exact:true}).click();await page.getByRole('button',{name:'Pay offline',exact:true}).click();await expect(page.getByRole('status')).toContainText('Authorized locally');
 await page.getByRole('button',{name:'Validate & accept offline',exact:true}).click();await expect(page.getByRole('status')).toContainText('PAYMENT ACCEPTED');await expect(page.getByText('OFFLINE VERIFIED', {exact:true})).toBeVisible();await expect(page.getByText('Solana RPC calls during authorization: 0')).toBeVisible();expect(apiRequests).toEqual([]);
 await page.getByRole('button',{name:'Transactions',exact:true}).click();await expect(page.getByTestId('device-payment')).toContainText('Authorized OFFLINE');await expect(page.getByTestId('device-payment')).toContainText('Accepted · Pending settlement');await expect(page.getByTestId('device-payment')).toContainText('Authorization time (device clock)');await expect(page.getByTestId('device-payment')).toContainText('Merchant acceptance');
 await expect(page.getByRole('button',{name:/Settle now/})).toBeDisabled();
 let releaseConfirmation!:()=>void;const confirmationReleased=new Promise<void>(resolve=>{releaseConfirmation=resolve;});await page.route('**/api/solana-demo',async route=>{if(route.request().postDataJSON()?.action!=='settle'){await route.continue();return;}const response=await route.fetch();await confirmationReleased;await route.fulfill({response});});
 offline=false;await page.getByRole('button',{name:'Connect merchant only',exact:true}).click();await expect(page.getByRole('status')).toContainText('Consumer remains offline');await page.getByRole('button',{name:/Settle now/}).click();await expect(page.getByTestId('device-payment')).toContainText('Awaiting on-chain confirmation');await expect(page.getByTestId('device-payment').locator('code')).toHaveCount(0);releaseConfirmation();await expect(page.getByRole('status')).toContainText('SETTLED ON SOLANA');await expect(page.getByTestId('device-payment')).toContainText('Confirmed on-chain');await expect(page.getByTestId('device-payment')).toContainText('Confirmation observed');await page.unroute('**/api/solana-demo');
 const signature=(await page.getByTestId('transaction-hash').innerText()).replace('Tx: ','');expect(signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{80,90}$/);
 await expect(page.getByText('Merchant received: 4.545455 demo USDC')).toBeVisible();await page.getByText('Solana Proof',{exact:true}).click();await expect(page.getByRole('link',{name:'Last settlement transaction'})).toHaveAttribute('href',/explorer.solana.com\/tx/);
 await page.getByRole('button',{name:'Test replay',exact:true}).click();await expect(page.getByRole('status')).toContainText('REPLAY REJECTED');await page.getByRole('button',{name:'Test tamper',exact:true}).click();await expect(page.getByRole('status')).toContainText('INVALID SIGNATURE');
 await page.screenshot({path:'docs/evidence/solana-demo.png',fullPage:true});await writeFile('docs/evidence/solana-browser.json',JSON.stringify({executedAt:new Date().toISOString(),signature,offlineApiRequests:apiRequests.length,merchantTokens:'4545455',replay:'rejected',tamper:'invalid signature'},null,2));
 await page.getByRole('button',{name:'Restore connectivity',exact:true}).click();await page.getByRole('button',{name:'Disable offline payments',exact:true}).click();await expect(page.getByRole('status')).toContainText('Offline payments disabled');
});
test('PWA reloads without network, encrypted session unlocks and local validation makes no API calls',async({page,context})=>{
 await page.goto('/demo');await expect(page.getByRole('button',{name:'Enable offline payments',exact:true})).toBeEnabled();
 await page.getByLabel('Offline wallet password').fill('solana-real-offline');await page.getByRole('button',{name:'Enable offline payments',exact:true}).click();await expect(page.getByRole('status')).toContainText('Offline allowance ready');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;await new Promise<void>(r=>{if(navigator.serviceWorker.controller)r();else navigator.serviceWorker.addEventListener('controllerchange',()=>r(),{once:true});});navigator.serviceWorker.controller!.postMessage({type:'CACHE_ASSETS',urls:performance.getEntriesByType('resource').map(r=>r.name)});});
 await page.waitForTimeout(1000);await context.setOffline(true);await page.reload();await expect(page.getByRole('status')).toContainText('Offline session restored');
 const calls:string[]=[];page.on('request',r=>{if(r.url().includes('/api/'))calls.push(r.url());});
 await page.getByLabel('Offline wallet password').fill('solana-real-offline');await page.getByRole('button',{name:'Unlock wallet',exact:true}).click();await expect(page.getByRole('status')).toContainText('unlocked');
 await page.getByRole('button',{name:'Charge',exact:true}).click();await page.getByRole('button',{name:'Pay offline',exact:true}).click();await page.getByRole('button',{name:'Validate & accept offline',exact:true}).click();await expect(page.getByRole('status')).toContainText('PAYMENT ACCEPTED');expect(calls).toEqual([]);
 await page.reload();await expect(page.getByRole('status')).toContainText('Offline session restored');await page.getByRole('button',{name:'Transactions',exact:true}).click();await expect(page.getByTestId('device-payment')).toContainText('Authorized OFFLINE');await expect(page.getByTestId('device-payment')).toContainText('Accepted · Pending settlement');
 await page.getByRole('button',{name:'Disable offline payments',exact:true}).click();await expect(page.getByRole('status')).toContainText('On-chain cancellation pending');
 await context.setOffline(false);await page.getByRole('button',{name:'Disable offline payments',exact:true}).click();await expect(page.getByRole('status')).toContainText('Offline payments disabled');
});
test('Solana demo API refuses cross-origin requests and arbitrary signing actions',async({request})=>{const cross=await request.post('/api/solana-demo',{headers:{Origin:'https://unrelated.example'},data:{action:'fund'}});expect(cross.status()).toBe(403);const arbitrary=await request.post('/api/solana-demo',{data:{action:'sign',privateKey:'not-a-key'}});expect(arbitrary.status()).toBe(400);});
test('new deployment generation clears cached device policy and old transaction proofs',async({page})=>{
 await page.goto('/demo');await expect(page.getByRole('button',{name:'Enable offline payments',exact:true})).toBeEnabled();await page.getByLabel('Offline wallet password').fill('generation-change-123');await page.getByRole('button',{name:'Enable offline payments',exact:true}).click();await expect(page.getByRole('status')).toContainText('Offline allowance ready');
 await page.getByRole('button',{name:'Disable offline payments',exact:true}).click();await expect(page.getByRole('status')).toContainText('Offline payments disabled');
 await page.route('**/deployment.json',async route=>{const response=await route.fetch();const config=await response.json();await route.fulfill({response,json:{...config,generation:`${config.generation}-new-generation`}});});
 await page.reload();await expect(page.getByRole('button',{name:'Enable offline payments',exact:true})).toBeVisible();await page.getByText('Solana Proof',{exact:true}).click();await expect(page.getByRole('link',{name:'Allowance transaction',exact:true})).toHaveCount(0);await expect(page.getByText('Device:',{exact:false})).toHaveCount(0);
});

test('on-chain history is recoverable without device payments and cached for real offline reload',async({page,context})=>{
 await page.goto('/demo');await expect(page.getByRole('button',{name:'Fund wallet',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Transaction history',exact:true}).click();
 const history=page.getByRole('region',{name:'Transaction history'});
 await expect(history.getByText('No device payments.',{exact:false})).toBeVisible();
 const chain=page.getByTestId('chain-history');await expect(chain.locator('code').first()).toBeVisible();
 const signature=await chain.locator('code').first().innerText();expect(signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{80,90}$/);
 await expect(history.getByText('Localnet records are not publicly accessible on Devnet.',{exact:false})).toBeVisible();
 await expect(history.getByRole('link',{name:'View transaction in Devnet Explorer'})).toHaveCount(0);
 await page.getByRole('button',{name:'Refresh history',exact:true}).click();await expect(chain).toContainText(signature);
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;await new Promise<void>(r=>{if(navigator.serviceWorker.controller)r();else navigator.serviceWorker.addEventListener('controllerchange',()=>r(),{once:true});});navigator.serviceWorker.controller!.postMessage({type:'CACHE_ASSETS',urls:performance.getEntriesByType('resource').map(r=>r.name)});});
 await page.waitForTimeout(1000);await context.setOffline(true);await page.reload();await expect(page.getByRole('status')).toContainText('Start by funding');
 await page.getByRole('button',{name:'Transaction history',exact:true}).click();await expect(page.getByTestId('chain-history')).toContainText(signature);await expect(page.getByRole('button',{name:'Refresh history',exact:true})).toBeDisabled();await expect(page.getByText('Cached history · reconnect to refresh.',{exact:false})).toBeVisible();await context.setOffline(false);
});

test('pt-BR/en-US switches payment actions and persists the selected language',async({page})=>{await page.goto('/demo');await expect(page.getByRole('button',{name:'Fund wallet',exact:true})).toBeVisible();await page.getByLabel('Language / Idioma').selectOption('pt-BR');await expect(page.getByRole('button',{name:'Cobrar',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Habilitar pagamentos offline',exact:true})).toBeVisible();await page.reload();await expect(page.getByRole('button',{name:'Cobrar',exact:true})).toBeVisible();await page.getByLabel('Language / Idioma').selectOption('en-US');await expect(page.getByRole('button',{name:'Charge',exact:true})).toBeVisible();});
test('Pix API refuses cross-origin access and never fakes approval without configuration',async({request})=>{const data={action:'initiate',amountMinor:10000,idempotencyKey:crypto.randomUUID()};expect((await request.post('/api/pix',{headers:{Origin:'https://untrusted.invalid'},data})).status()).toBe(403);if(!process.env.MERCADOPAGO_ACCESS_TOKEN){const response=await request.post('/api/pix',{data});expect(response.status()).toBe(503);expect(await response.json()).toEqual({error:'Pix sandbox not configured. No payment created or confirmed.'});}});

test('online on-chain payment confirms a direct SPL transfer, persists history and is blocked offline',async({page,request})=>{
 await page.goto('/demo');const before=await (await request.post('/api/solana-demo',{data:{action:'state'}})).json();
 await page.getByRole('button',{name:'Pay online on-chain',exact:true}).click();await expect(page.getByRole('status')).toContainText('ONLINE PAYMENT SETTLED');
 const signature=await page.getByTestId('online-transaction-hash').innerText();expect(signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{80,90}$/);
 const after=await (await request.post('/api/solana-demo',{data:{action:'state'}})).json();expect(BigInt(after.merchantBalance)-BigInt(before.merchantBalance)).toBe(4545455n);expect(BigInt(before.walletBalance)-BigInt(after.walletBalance)).toBe(4545455n);expect(after.reserveBalance).toBe(before.reserveBalance);expect(after.availableReserve).toBe(before.availableReserve);
 await page.getByRole('button',{name:'Transactions',exact:true}).click();await expect(page.getByTestId('wallet-history')).toContainText(signature);await expect(page.getByTestId('online-history')).toContainText(signature);
 await page.reload();await expect(page.getByTestId('online-transaction-hash')).toContainText(signature);
 await page.getByRole('button',{name:'Simulate offline',exact:true}).click();await expect(page.getByRole('button',{name:'Pay online on-chain',exact:true})).toBeDisabled();
 const rejected=await request.post('/api/solana-demo',{data:{action:'payOnline',payment:{amount:'1',merchant:'arbitrary'}}});expect(rejected.status()).toBe(400);
});
