import {readFileSync,existsSync} from 'node:fs';
import {createHash,X509Certificate} from 'node:crypto';
import {defineConfig} from '@playwright/test';
const pins=['/usr/local/share/ca-certificates/environment-proxy-ca.crt','/usr/local/share/ca-certificates/mitmproxy-ca-cert.crt'].filter(existsSync).map(path=>createHash('sha256').update(new X509Certificate(readFileSync(path)).publicKey.export({format:'der',type:'spki'})).digest('base64'));
export default defineConfig({testDir:'tests/e2e',timeout:120000,workers:1,use:{baseURL:process.env.SHIMOPAY_MOBILE_URL??'http://127.0.0.1:8082',viewport:{width:390,height:844},serviceWorkers:'allow',launchOptions:{executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox',...(pins.length?[`--ignore-certificate-errors-spki-list=${pins.join(',')}`]:[])],...(process.env.SHIMOPAY_MOBILE_URL?.startsWith('https:')&&process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY}}:{})}},reporter:'list'});
