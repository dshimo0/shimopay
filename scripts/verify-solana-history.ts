import {chromium,expect as baseExpect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {X509Certificate,createHash} from 'node:crypto';
const url=process.env.SHIMOPAY_DEMO_URL;if(!url?.startsWith('https://'))throw new Error('Set SHIMOPAY_DEMO_URL to the hosted HTTPS /demo URL');
const pins=process.env.SHIMOPAY_BROWSER_CA_FILES?await Promise.all(process.env.SHIMOPAY_BROWSER_CA_FILES.split(',').map(async path=>createHash('sha256').update(new X509Certificate(await readFile(path)).publicKey.export({format:'der',type:'spki'})).digest('base64'))):[];
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE??'/usr/bin/chromium',args:['--no-sandbox',...(pins.length?[`--ignore-certificate-errors-spki-list=${pins.join(',')}`]:[])],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const expect=baseExpect.configure({timeout:60_000});const page=await browser.newPage();
try{
 await page.goto(url);await expect(page.getByRole('button',{name:'Simulate offline',exact:true})).toBeEnabled();
 const config=await page.evaluate(async()=>{const r=await fetch('/deployment.json');return r.json();});
 await page.getByRole('button',{name:'Transaction history',exact:true}).click();
 const chain=page.getByTestId('chain-history');await expect(chain.locator('code').first()).toBeVisible();const firstSignature=await chain.locator('code').first().innerText();
 const api=await page.evaluate(async()=>{const r=await fetch('/api/solana-demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'history'})});if(!r.ok)throw new Error('History API failed');return r.json();});
 expect(api.cluster).toBe(config.cluster);expect(api.reserve).toBe(config.reserve);expect(api.entries.some((i:{signature:string})=>i.signature===firstSignature)).toBe(true);
 await page.getByRole('button',{name:'Refresh history',exact:true}).click();await expect(chain).toContainText(firstSignature);
 await page.reload();await expect(page.getByRole('button',{name:'Simulate offline',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Transaction history',exact:true}).click();await expect(page.getByTestId('chain-history')).toContainText(firstSignature);
 await page.getByRole('button',{name:'Simulate offline',exact:true}).click();await expect(page.getByRole('button',{name:'Refresh history',exact:true})).toBeDisabled();
 await page.screenshot({path:'docs/evidence/solana-cloud-history.png',fullPage:true});
 await writeFile('docs/evidence/solana-cloud-history.json',JSON.stringify({checkedAt:new Date().toISOString(),url,cluster:config.cluster,reserve:config.reserve,firstSignature,entries:api.entries,recoveryFromRpc:true,reloadRetainsHistory:true,offlineRefreshBlocked:true,publicDevnetProof:config.cluster==='devnet'},null,2));
 console.log(JSON.stringify({result:'passed',cluster:config.cluster,historyEntries:api.entries.length,firstSignature}));
}finally{await browser.close();}
