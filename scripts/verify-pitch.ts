import {chromium,expect as baseExpect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {X509Certificate,createHash} from 'node:crypto';
const url=process.env.SHIMOPAY_PITCH_URL??'http://127.0.0.1:3000/pitch';
const pins=process.env.SHIMOPAY_BROWSER_CA_FILES?await Promise.all(process.env.SHIMOPAY_BROWSER_CA_FILES.split(',').map(async path=>createHash('sha256').update(new X509Certificate(await readFile(path)).publicKey.export({format:'der',type:'spki'})).digest('base64'))):[];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox',...(pins.length?[`--ignore-certificate-errors-spki-list=${pins.join(',')}`]:[])],...(url.startsWith('https:')&&process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
const expect=baseExpect.configure({timeout:30_000});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const response=await page.goto(url);expect(response?.status()).toBe(200);await expect(page.getByRole('heading',{level:1})).toContainText('A conexão cai.');
 await expect(page.getByRole('banner')).toBeVisible();await expect(page.getByRole('contentinfo')).toBeVisible();expect(await page.locator('.pitch-eyebrow').count()).toBeGreaterThanOrEqual(10);
 await expect(page.getByText('45',{exact:true})).toBeVisible();await expect(page.getByText('Não há clientes, receita, pilotos ou LOIs confirmados neste MVP.',{exact:false})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:'docs/evidence/pitch-desktop.png',fullPage:true});
 await page.pdf({path:url.includes('vercel.app')?'/tmp/shimopay-hosted-pitch.pdf':'apps/demo-launcher/public/shimopay-pitch.pdf',format:'A4',landscape:true,printBackground:true,preferCSSPageSize:true});
 await page.emulateMedia({media:'screen'});await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await expect(page.getByRole('banner').getByRole('link',{name:'Iniciar ou retomar demo'})).toBeVisible();await page.screenshot({path:'docs/evidence/pitch-mobile.png',fullPage:true});
 let printCalled=false;await page.exposeFunction('recordPrint',()=>{printCalled=true;});await page.evaluate(()=>{window.print=()=>{void (window as unknown as {recordPrint:()=>Promise<void>}).recordPrint();};});await page.getByRole('button',{name:'Salvar pitch em PDF'}).click();await expect.poll(()=>printCalled).toBe(true);
 if(url.includes('vercel.app')){await page.route('**/api/start-demo',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Teste controlado de retomada indisponível'})}));await page.getByRole('banner').getByRole('link',{name:'Iniciar ou retomar demo'}).click();await expect(page.getByRole('status')).toContainText('Teste controlado');await expect(page.getByRole('banner').getByRole('link',{name:'Iniciar ou retomar demo'})).not.toHaveAttribute('aria-disabled','true');}
 await writeFile('docs/evidence/pitch-page.json',JSON.stringify({checkedAt:new Date().toISOString(),url,http:200,header:true,footer:true,desktopNoOverflow:true,mobileNoOverflow:true,pdfExport:true,claimQualifiersVisible:true,staticLauncherFailureRecoveryTested:url.includes('vercel.app')},null,2));console.log(JSON.stringify({result:'passed',url,desktop:true,mobile:true,pdf:true}));
}finally{await browser.close();}
