'use client';
import {useEffect,useRef,useState} from 'react';
import {formatUnits,getBytes,sha256} from 'ethers';
import QRCode from 'qrcode';
import {z} from 'zod';
import {translate,type Language} from './i18n';
import type {RailPayment} from '../../../../packages/sdk/src/fiat';
import {SignedFxQuoteService as FxQuoteService,type SignedFxQuote as FxQuote,type OnlinePaymentRequest,type OnlinePaymentResult} from '@shimopay/solana';
import {createSolanaDid as createDid,deserializeSolanaIntent as deserializeIntent,serializeSolanaIntent as serializeIntent,signSolanaIntent as signIntent,verifySolanaIntent as verifyIntent,randomSolanaId,SolanaSettlementAdapter,SolanaOfflineWallet as OfflineWallet,solanaExplorer,type SolanaHistoryPage,type SolanaDeployment as Deployment,type SolanaOfflineSession as OfflineSession,type SolanaSignedIntent as SignedIntent} from '@shimopay/solana';
import {ConnectivityGate,readRecord as readLegacyRecord,writeRecord as writeLegacyRecord} from '@shimopay/sdk';
const readRecord=<T,>(key:string)=>readLegacyRecord<T>(`solana:${key}`);
const writeRecord=(key:string,value:unknown)=>writeLegacyRecord(`solana:${key}`,value);

interface OnlineRow {request:OnlinePaymentRequest;status:'pending'|'settled'|'rejected';result?:OnlinePaymentResult;error?:string;createdAt:number;}
interface PaymentRow {payment:SignedIntent;status:'signed'|'accepted'|'settled'|'rejected';hash?:string;error?:string;authorizationMode?:'offline'|'online';acceptedAt?:number;confirmedAt?:number;submittedSignature?:string;}
const now=()=>Math.floor(Date.now()/1000);
const randomId=randomSolanaId;
const usd=(value:string|bigint)=>Number(formatUnits(value,6)).toFixed(2);
const brl=(value:string)=>`R$ ${(Number(value)/100).toFixed(2)}`;
function message(error:unknown):string{if(error&&typeof error==='object'&&'revert' in error){const r=(error as {revert?:{name:string}}).revert;if(r?.name)return r.name;}return error instanceof Error?error.message:String(error);}
const InvoiceRequest=z.object({protocol:z.literal('shimopay-invoice'),version:z.literal(1),merchant:z.string().min(32).max(44),currency:z.literal('BRL'),amountMinor:z.string().regex(/^[1-9][0-9]{0,6}$/),expiresAt:z.number().int().positive()}).strict();
export default function Demo({view='demo'}:{view?:'demo'|'consumer'|'merchant'}={}){
 const isApp=view!=='demo';
 const [appTab,setAppTab]=useState('home');
 const [invoiceInput,setInvoiceInput]=useState(''),[requestQr,setRequestQr]=useState(''),[requestPayload,setRequestPayload]=useState('');
 const openHistory=()=>isApp?setAppTab('history'):setShowHistory(v=>!v);
 const [language,setLanguage]=useState<Language>('en-US');
 const t=(text:string)=>translate(text,language);
 const [onlineRows,setOnlineRows]=useState<OnlineRow[]>([]),[walletBalance,setWalletBalance]=useState('0'),[walletHistory,setWalletHistory]=useState<SolanaHistoryPage|null>(null);
 const [pix,setPix]=useState<RailPayment|null>(null);
 const pixId=useRef<string|null>(null);
 const merchantGate=useRef(new ConnectivityGate());
 const [merchantOnline,setMerchantOnline]=useState(true);
 const gate=useRef(new ConnectivityGate()),wallet=useRef(new OfflineWallet());
 const payerAdapter=useRef<SolanaSettlementAdapter|null>(null),merchantAdapter=useRef<SolanaSettlementAdapter|null>(null);
 const [config,setConfig]=useState<Deployment|null>(null),[session,setSession]=useState<OfflineSession|null>(null),[quote,setQuote]=useState<FxQuote|null>(null);
 const [rows,setRows]=useState<PaymentRow[]>([]),[incoming,setIncoming]=useState<PaymentRow[]>([]),[seen,setSeen]=useState<string[]>([]);
 const [online,setOnline]=useState(true),[simulated,setSimulated]=useState(false),[locked,setLocked]=useState(true),[busy,setBusy]=useState(false),[ready,setReady]=useState(false);
 const [notice,setNotice]=useState('Connecting to Solana…'),[error,setError]=useState(false),[password,setPassword]=useState(''),[amount,setAmount]=useState('25.00'),[invoice,setInvoice]=useState<string|null>(null);
 const [payload,setPayload]=useState(''),[qr,setQr]=useState(''),[balance,setBalance]=useState('0'),[merchantBalance,setMerchantBalance]=useState('0'),[revokePending,setRevokePending]=useState(false);
 const [reserveBalance,setReserveBalance]=useState('0'),[reserveSignature,setReserveSignature]=useState(''),[allowanceSignature,setAllowanceSignature]=useState('');
 const [offlineCalls,setOfflineCalls]=useState(0),[verified,setVerified]=useState(false);
 const [settlingNonce,setSettlingNonce]=useState<string|null>(null);
 const [history,setHistory]=useState<SolanaHistoryPage|null>(null),[historyError,setHistoryError]=useState('');
 const [funded,setFunded]=useState(false),[showHistory,setShowHistory]=useState(false);
 useEffect(()=>{
  let alive=true;
  const saved=localStorage.getItem('shimopay-language');setLanguage(saved==='pt-BR'||saved==='en-US'?saved:navigator.language.startsWith('pt')?'pt-BR':'en-US');
  const update=()=>{const connected=gate.current.isOnline();setOnline(connected);setMerchantOnline(merchantGate.current.isOnline());if(!connected)setOfflineCalls(payerAdapter.current?.rpcCalls??0);};
  window.addEventListener('online',update);window.addEventListener('offline',update);update();
  const lock=()=>{wallet.current.lockOfflineWallet();if(alive)setLocked(true);};
  const visibility=()=>{if(document.hidden)lock();};
  document.addEventListener('visibilitychange',visibility);
  async function initialize(){
   try{
    const keys=['config','session','quote','outgoing','incoming','seen','revoke-pending','balance','merchant-balance','reserve-signature','allowance-signature','history','online-payments','wallet-history','wallet-balance'] as const;
    const values=await Promise.all(keys.map(key=>readRecord(key)));
    let c=values[0] as Deployment|undefined;
    if(navigator.onLine){gate.current.assertOnline();const res=await fetch('/deployment.json',{cache:'no-store'});if(res.ok)c=await res.json() as Deployment;}
    if(!c)throw new Error('Solana deployment unavailable. Deploy the program and refresh.');
    if(c.cluster!=='devnet'&&c.cluster!=='localnet')throw new Error('Unsupported Solana cluster');
    if(!alive)return;
    setConfig(c);await writeRecord('config',c);
    let cached=values[1] as OfflineSession|undefined;
    const old=values[0] as Deployment|undefined;
    if(old&&old.generation!==c.generation){await wallet.current.deleteKey();for(const key of keys.slice(1))await writeRecord(key,undefined);values.fill(undefined,1);cached=undefined;}
    const cachedHistory=values[11] as SolanaHistoryPage|undefined;setHistory(cachedHistory?.cluster===c.cluster&&cachedHistory.reserve===c.reserve?cachedHistory:null);
    setOnlineRows(values[12] as OnlineRow[]??[]);setWalletHistory(values[13] as SolanaHistoryPage??null);setWalletBalance(values[14] as string??'0');
    setReserveSignature(values[9] as string??'');setAllowanceSignature(values[10] as string??'');
    setSession(cached??null);setQuote(values[2] as FxQuote??null);setRows(values[3] as PaymentRow[]??[]);setIncoming(values[4] as PaymentRow[]??[]);setSeen(values[5] as string[]??[]);setRevokePending(Boolean(values[6]));setBalance(values[7] as string??'0');setFunded(Boolean(values[7]&&values[7]!=='0'));setMerchantBalance(values[8] as string??'0');
    if(navigator.onLine){const a=new SolanaSettlementAdapter(gate.current);payerAdapter.current=a;merchantAdapter.current=new SolanaSettlementAdapter(merchantGate.current);const state=await a.state();setBalance(state.balance);setWalletBalance(state.walletBalance);setMerchantBalance(state.merchantBalance);setReserveBalance(state.reserveBalance);setFunded(BigInt(state.reserveBalance)>0n);await writeRecord('wallet-balance',state.walletBalance);const wh=await a.history(undefined,'wallet');setWalletHistory(wh);await writeRecord('wallet-history',wh);try{const h=await a.history();if(h.cluster!==c.cluster||h.reserve!==c.reserve)throw new Error('History deployment mismatch');if(alive)setHistory(h);await writeRecord('history',h);}catch{if(alive)setHistoryError('History could not refresh. Cached transactions remain available.');}}
    setNotice(isApp?'Test wallet connected. Choose a task in the navigation.':cached?'Offline session restored. Unlock with your password to pay.':'Solana demo tokens only. Start by funding your wallet.');setReady(true);
   }catch(e){if(alive){setNotice(message(e));setError(true);}}
  }
  void initialize();
  if('serviceWorker'in navigator)void navigator.serviceWorker.register('/sw.js').then(async()=>{
   await navigator.serviceWorker.ready;
   const cache=()=>navigator.serviceWorker.controller?.postMessage({type:'CACHE_ASSETS',urls:performance.getEntriesByType('resource').map(x=>x.name)});
   cache();navigator.serviceWorker.addEventListener('controllerchange',cache,{once:true});
  }).catch(()=>{});
  return()=>{alive=false;window.removeEventListener('online',update);window.removeEventListener('offline',update);document.removeEventListener('visibilitychange',visibility);wallet.current.lockOfflineWallet();};
 },[]);
 async function payOnline(){
  const {payer}=adapters();gate.current.assertOnline();
  let current=onlineRows.find(r=>r.status==='pending');
  if(!current){
   if(!/^\d+(\.\d{1,2})?$/.test(amount)||Number(amount)<=0)throw new Error('Enter a valid BRL amount');
   const [whole,fraction='']=amount.split('.');const minor=(BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'))).toString();
   if(BigInt(minor)>10000n)throw new Error('Online demo limit: R$100');
   const q=await payer.fxQuote();FxQuoteService.validate(q,now(),config!.fxSigner!);setQuote(q);await writeRecord('quote',q);
   current={request:{requestId:crypto.randomUUID(),displayAmountMinor:minor,amount:FxQuoteService.convert(BigInt(minor),q,now(),config!.fxSigner!).toString(),quote:q},status:'pending',createdAt:now()};
   const next=[...onlineRows,current];setOnlineRows(next);await writeRecord('online-payments',next);
  }
  const request=current.request;let next=[...onlineRows.filter(r=>r.request.requestId!==request.requestId),current];
  setNotice('Online transaction submitted. Awaiting on-chain confirmation.');
  try{const result=await payer.payOnline(request);next=next.map(r=>r.request.requestId===request.requestId?{...r,status:'settled' as const,result}:r);setNotice('ONLINE PAYMENT SETTLED — Direct wallet-to-merchant transfer confirmed on Solana.');}
  catch(error){const text=message(error);if(!/Confirmation pending|fetch|network|Another demo transaction/i.test(text))next=next.map(r=>r.request.requestId===request.requestId?{...r,status:'rejected' as const,error:text}:r);setError(true);setNotice(text);}
  await writeRecord('online-payments',next);setOnlineRows(next);await refreshBalances();
 }
 async function pixRequest(action:'initiate'|'status'){
  gate.current.assertOnline();pixId.current??=await readRecord<string>('pix-idempotency')??crypto.randomUUID();await writeRecord('pix-idempotency',pixId.current);
  const res=await fetch('/api/pix',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(action==='initiate'?{action,amountMinor:10000,idempotencyKey:pixId.current}:{action,id:pix?.id})});
  let result:RailPayment=await res.json();if(!res.ok)throw new Error((result as unknown as {error:string}).error);setPix(result);
  // Orders processes Pix asynchronously. Poll status, never create another order to obtain its QR.
  for(let attempt=0;action==='initiate'&&attempt<4&&result.status==='pending'&&!result.qrCode;attempt++){
   await new Promise(resolve=>setTimeout(resolve,1000));gate.current.assertOnline();
   const check=await fetch('/api/pix',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'status',id:result.id})});
   const next=await check.json();if(!check.ok)throw new Error(next.error);result=next;setPix(result);
  }
  await writeRecord('pix-last-payment',result);
  setNotice(`${t('Provider status')}: ${result.status} · Mercado Pago sandbox. ${t('Fiat conversion is simulated. No USDC is minted or credited by this Pix flow.')}`);
 }
 async function run(action:()=>Promise<void>){if(busy)return;setBusy(true);setError(false);try{await action();}catch(e){setError(true);setNotice(message(e));}finally{setBusy(false);}}
 function adapters(){
  if(!config)throw new Error('Deployment unavailable');
  payerAdapter.current??=new SolanaSettlementAdapter(gate.current);
  merchantAdapter.current??=new SolanaSettlementAdapter(merchantGate.current);
  return {payer:payerAdapter.current,merchant:merchantAdapter.current};
 }
 async function refreshHistory(more=false,merchantSide=false){const a=adapters()[merchantSide?'merchant':'payer'];if(!more){const wh=await a.history(undefined,'wallet');setWalletHistory(wh);await writeRecord('wallet-history',wh);}const page=await a.history(more?history?.nextCursor??undefined:undefined);if(page.cluster!==config?.cluster||page.reserve!==config?.reserve)throw new Error('History deployment mismatch');const previous=more?history?.entries??[]:[];const merged={...page,entries:[...new Map([...previous,...page.entries].map(entry=>[entry.signature,entry])).values()]};await writeRecord('history',merged);setHistory(merged);setHistoryError('');}
 async function refreshBalances(merchantSide=false){if(!config)return;const a=adapters()[merchantSide?'merchant':'payer'];const state=await a.state();setBalance(state.balance);setWalletBalance(state.walletBalance);setMerchantBalance(state.merchantBalance);setReserveBalance(state.reserveBalance);await Promise.all([writeRecord('balance',state.balance),writeRecord('merchant-balance',state.merchantBalance),writeRecord('wallet-balance',state.walletBalance)]);try{await refreshHistory(false,merchantSide);}catch{setHistoryError('History could not refresh. Use Refresh history when connected.');}}
 async function refreshQuote(){const {payer}=adapters();const q=await payer.fxQuote();FxQuoteService.validate(q,now(),config!.fxSigner!);await writeRecord('quote',q);setQuote(q);setNotice('Signed FX quote cached. Fresh for 15 minutes; 3% buffer until 30 minutes.');}
 function reconnectMerchant(){merchantGate.current.setOffline(false);setMerchantOnline(merchantGate.current.isOnline());setNotice('Merchant connected. Consumer remains offline. Only one side needs connectivity to settle.');}
 function toggle(){const next=!simulated;gate.current.setOffline(next);merchantGate.current.setOffline(next);setMerchantOnline(merchantGate.current.isOnline());if(next){setOfflineCalls(payerAdapter.current?.rpcCalls??0);setVerified(false);}setSimulated(next);setOnline(gate.current.isOnline());setNotice(next?'Offline authorization mode. Network actions are blocked.':'Connectivity restored. Pending payments can now settle.');setError(false);}
 async function fund(){const {payer}=await adapters();const signature=await payer.fundDemo();setReserveSignature(signature);await writeRecord('reserve-signature',signature);setFunded(true);await refreshBalances();setNotice(config?.cluster==='devnet'?`${usd(config.offlineReserveAmount??'50000000')} Circle Devnet USDC reserved on Solana. Transaction confirmed.`:'100 demo USDC minted; 50 USDC reserved on Solana. Transaction confirmed.');}
 async function enable(){
  if(password.length<10)throw new Error('Choose an offline password with at least 10 characters.');
  if(session?.active)throw new Error('Disable your current session before creating another.');
  const {payer}=await adapters();
  const q=await payer.fxQuote();FxQuoteService.validate(q,now(),config!.fxSigner!);
  const signer=await wallet.current.create(password);setLocked(false);
  const s=await payer.createEscrowSession({id:randomId(),signer,amount:BigInt(config?.offlineAllowanceAmount??(config?.cluster==='devnet'?'50000000':'30000000'))<BigInt(reserveBalance)?BigInt(config?.offlineAllowanceAmount??(config?.cluster==='devnet'?'50000000':'30000000')):BigInt(reserveBalance),expiresAt:now()+86400});
  setAllowanceSignature(payer.lastAllowanceSignature);await writeRecord('allowance-signature',payer.lastAllowanceSignature);
  await Promise.all([writeRecord('session',s),writeRecord('quote',q),writeRecord('outgoing',[]),writeRecord('incoming',[]),writeRecord('seen',[])]);
  setSession(s);setQuote(q);setRows([]);setIncoming([]);setSeen([]);setInvoice(null);setPayload('');await refreshBalances();setPassword('');setNotice(`Offline allowance ready: ${usd(s.maxAmount)} USDC, valid for 24 hours. Signed FX quote cached.`);
 }
 async function startDemo(){
  if(password.length<10&&!session?.active)throw new Error('Choose an offline password with at least 10 characters, then start the demo.');
  if(!funded)await fund();if(!session?.active)await enable();
  setAmount('25.00');setInvoice('2500');setNotice('Demo ready: R$25 charge. Go offline, pay and accept, then reconnect only the merchant to settle.');
 }
 async function unlock(){const address=await wallet.current.unlockOfflineWallet(password);if(session&&address!==session.sessionSigner){wallet.current.lockOfflineWallet();throw new Error('Session key mismatch');}setLocked(false);setPassword('');setNotice('Offline wallet unlocked in memory.');}
 async function disable(){
  if(!session)throw new Error('No session');
  await wallet.current.deleteKey();setLocked(true);
  await writeRecord('revoke-pending',true);setRevokePending(true);
  if(!gate.current.isOnline()){setNotice('Session key deleted. On-chain cancellation pending; reconnect to revoke the allowance.');return;}
  const {payer}=await adapters();await payer.cancelSession(session.id);const s=await payer.getSession(session.id);setSession(s);await writeRecord('session',s);await writeRecord('revoke-pending',false);setRevokePending(false);await refreshBalances();setNotice('Offline payments disabled. Unspent funds released to your available balance.');
 }
 async function createCharge(){if(!quote)throw new Error('Cache a quote before charging');FxQuoteService.validate(quote,now(),config!.fxSigner!);if(!/^\d+(\.\d{1,2})?$/.test(amount)||Number(amount)<=0)throw new Error('Enter a valid BRL amount');const [whole,fraction='']=amount.split('.');const minor=(BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'))).toString();setInvoice(minor);
  if(isApp){const request=JSON.stringify({protocol:'shimopay-invoice',version:1,merchant:config!.merchant,currency:'BRL',amountMinor:minor,expiresAt:Math.min(now()+900,quote.expiresAt)});setRequestPayload(request);setRequestQr(await QRCode.toDataURL(request,{width:220,margin:1}));}
  setNotice(`Coffee Shop requested ${brl(minor)}.`);}
 function loadInvoice(){
  if(!config||invoiceInput.length>2048)throw new Error('Invalid invoice');
  const request=InvoiceRequest.parse(JSON.parse(invoiceInput));
  if(request.merchant!==config.merchant||request.expiresAt<=now()||request.expiresAt>now()+1800)throw new Error('Invoice merchant or expiry is invalid');
  setAmount((Number(request.amountMinor)/100).toFixed(2));setInvoice(request.amountMinor);setNotice(`Coffee Shop requested ${brl(request.amountMinor)}.`);
 }
 async function pay(){
  if(!session||!invoice||!quote)throw new Error('Create a charge and enable offline payments first');
  if(revokePending)throw new Error('Session cancellation pending');
  if(!session.active||now()>=session.expiresAt)throw new Error('Session expired');
  const authorizedAt=now();
  const settlement=FxQuoteService.convert(BigInt(invoice),quote,authorizedAt,config!.fxSigner!);
  const reserved=rows.filter(r=>r.status!=='settled').reduce((v,r)=>v+BigInt(r.payment.intent.amount),0n);
  if(settlement>BigInt(session.maxAmount)-BigInt(session.spentAmount)-reserved)throw new Error('Insufficient local offline allowance');
  const sequence=rows.reduce((n,r)=>BigInt(r.payment.intent.sequence)>n?BigInt(r.payment.intent.sequence):n,0n)+1n;
  const payment=signIntent({protocolVersion:2,network:session.network,program:session.program,reserve:session.reserve,allowance:session.id,consumer:session.owner,sessionPublicKey:session.sessionSigner,merchant:config!.merchant,currencyMint:session.token,amount:settlement.toString(),displayCurrency:'BRL',displayAmountMinor:invoice,fxQuoteId:quote.quoteId,sequence:sequence.toString(),nonce:randomId(),issuedAt:authorizedAt,expiresAt:Math.min(authorizedAt+3600,session.expiresAt),deviceIdHash:sha256(getBytes(sha256(new TextEncoder().encode(session.deviceDid))))},wallet.current.getSigner());
  const next=[...rows,{payment,status:'signed' as const,authorizationMode:gate.current.isOnline()?'online' as const:'offline' as const}];await writeRecord('outgoing',next);setRows(next);const text=serializeIntent(payment);setPayload(text);setQr(await QRCode.toDataURL(text,{width:240,margin:1,errorCorrectionLevel:'L'}));setInvoice(null);setNotice('Authorized locally with your limited session key. Share the QR or payload.');
 }
 async function accept(){
  if(!session||!config||!quote)throw new Error('Merchant has no cached session / quote');
  const payment=deserializeIntent(payload);verifyIntent(payment,session,config.merchant,now(),seen);FxQuoteService.verifyPayment(payment.intent,quote,now(),config.fxSigner!);setVerified(true);
  const pending=incoming.filter(r=>r.status==='accepted').reduce((v,r)=>v+BigInt(r.payment.intent.amount),0n);
  if(pending+BigInt(payment.intent.amount)>BigInt(session.maxAmount)-BigInt(session.spentAmount))throw new Error('OFFLINE RISK DETECTED: known intents exceed cached reserve');
  const newSeen=[...seen,payment.intent.nonce,`sequence:${payment.intent.sequence}`];const local=rows.find(r=>r.payment.intent.nonce===payment.intent.nonce);const next=[...incoming,{payment,status:'accepted' as const,authorizationMode:local?.authorizationMode,acceptedAt:now()}];
  await Promise.all([writeRecord('seen',newSeen),writeRecord('incoming',next)]);setSeen(newSeen);setIncoming(next);setNotice('PAYMENT ACCEPTED — Offline authorization. Pending settlement.');
 }
 async function settle(){
  const {merchant}=await adapters();const pending=incoming.filter(r=>r.status==='accepted');if(!pending.length)throw new Error('No pending payments');
  let next=[...incoming],outgoing=[...rows];
  for(const row of pending){
   setSettlingNonce(row.payment.intent.nonce);
   try{let hash:string;if(row.submittedSignature){const status=await merchant.getTransactionStatus(row.submittedSignature);if(status==='pending')throw new Error(`Confirmation pending: ${row.submittedSignature}`);if(status==='failed')throw new Error('Submitted transaction failed on-chain');hash=row.submittedSignature;}else{hash=await merchant.settlePayment(row.payment);}next=next.map(r=>r.payment.intent.nonce===row.payment.intent.nonce?{...r,status:'settled',hash,confirmedAt:now()}:r);outgoing=outgoing.map(r=>r.payment.intent.nonce===row.payment.intent.nonce?{...r,status:'settled',hash,confirmedAt:now()}:r);setNotice('SETTLED ON SOLANA — Merchant received test USDC. Confirmation: confirmed.');}
   catch(e){const submitted=message(e).match(/Confirmation pending: ([1-9A-HJ-NP-Za-km-z]{80,90})/);if(submitted){next=next.map(r=>r.payment.intent.nonce===row.payment.intent.nonce?{...r,submittedSignature:submitted[1]}:r);setNotice('Transaction submitted. Confirmation is pending; check again before retrying.');continue;}next=next.map(r=>r.payment.intent.nonce===row.payment.intent.nonce?{...r,status:'rejected',error:message(e)}:r);setError(true);setNotice(`Settlement rejected: ${message(e)}`);}
   finally{setSettlingNonce(null);}
  }
  await Promise.all([writeRecord('incoming',next),writeRecord('outgoing',outgoing)]);setIncoming(next);setRows(outgoing);
  const s=await merchant.getSession(session!.id);setSession(s);await writeRecord('session',s);await refreshBalances(true);
 }
 async function replay(){const row=incoming.find(r=>r.status==='settled');if(!row)throw new Error('Settle a payment first');const {merchant}=await adapters();try{await merchant.settlePayment(row.payment);throw new Error('Unexpected replay success');}catch(e){if(!message(e).includes('NonceAlreadyUsed'))throw e;setNotice('REPLAY REJECTED — NonceAlreadyUsed. No second transfer.');}}
 async function tamper(){if(!session||!quote)throw new Error('No session');const row=rows.at(-1);if(!row)throw new Error('Authorize a payment first');const tampered={...row.payment,intent:{...row.payment.intent,displayAmountMinor:(BigInt(row.payment.intent.displayAmountMinor)*10n).toString()}};try{verifyIntent(tampered,session,config!.merchant,now());throw new Error('Unexpected tamper success');}catch(e){if(message(e)!=='Invalid signature')throw e;setNotice('TAMPER REJECTED — INVALID SIGNATURE. Signed BRL amount is bound to the intent.');}}
 const pending=incoming.filter(r=>r.status==='accepted');const settled=incoming.filter(r=>r.status==='settled');const latest=incoming.at(-1);
 // Connectivity records describe observations on this device; they are not signed network attestations.
 const devicePayments=[...new Map([...(view==='merchant'?[]:rows),...(view==='consumer'?[]:incoming).map(r=>({...rows.find(p=>p.payment.intent.nonce===r.payment.intent.nonce),...r}))].map(r=>[r.payment.intent.nonce,r])).values()];
 const paymentStatus=(r:PaymentRow)=>settlingNonce===r.payment.intent.nonce?'Awaiting on-chain confirmation':r.submittedSignature&&r.status!=='settled'?'Awaiting on-chain confirmation':r.status==='settled'?'Confirmed on-chain':r.status==='rejected'?'Settlement rejected':r.status==='accepted'?'Accepted · Pending settlement':'Authorized · Pending merchant acceptance';
 const authorizationLabel=(r:PaymentRow)=>r.authorizationMode==='offline'?'Authorized OFFLINE':r.authorizationMode==='online'?'Authorized locally while ONLINE':'Local authorization · connectivity not recorded';
 const localReserved=rows.filter(r=>r.status!=='settled').reduce((n,r)=>n+BigInt(r.payment.intent.amount),0n);
 const offlineAvailable=session?.active?BigInt(session.maxAmount)-BigInt(session.spentAmount)-localReserved:0n;
 return <div className={isApp?`product-app product-${view}`:undefined} data-tab={isApp?appTab:undefined}>
  <header><div className="brand"><img src="/icon.svg" alt=""/>ShimoPay</div><div className="topline"><select aria-label="Language / Idioma" value={language} onChange={e=>{const l=e.target.value as Language;setLanguage(l);localStorage.setItem('shimopay-language',l);}}><option value="pt-BR">Português</option><option value="en-US">English</option></select><a href={isApp?view==='consumer'?'/app/merchant':'/app':'/app'}>{t(isApp?view==='consumer'?'Merchant mode':'My wallet':'Open app')}</a>{!isApp?<a href="/pitch">Pitch deck ↗</a>:null}<span className="demo-badge">{config?.cluster==='devnet'?'SOLANA DEVNET':'SOLANA LOCALNET'} · {config?.cluster==='devnet'?'CIRCLE USDC · TEST TOKENS':'LOCAL TEST TOKENS'}</span><span className={`badge ${online?'':'offline'}`}><span className="dot"/>{online?'ONLINE':'OFFLINE'}</span></div></header>
  <main>{isApp?<section className="app-intro"><span className="eyebrow">{t('Test environment · Development accounts')}</span><h1>{t(view==='consumer'?'My wallet':'My business')}</h1><p className="muted">{t('Your payments, wherever you are.')}</p></section>:null}<section className="hero" hidden={isApp}><div><div className="eyebrow">{t('Money, beyond connectivity')}</div><h1>{t('Payments that don’t stop')}<br/>{t('when the network does.')}</h1><p className="muted">{t('Reserve online. Authorize offline. Settle when you reconnect.')}</p></div><div className="toolbar"><button onClick={()=>void run(startDemo)} disabled={busy||!online||!ready}>{t('Start 90-second demo')}</button><button className="secondary" onClick={toggle} disabled={busy||!ready}>{t(simulated?'Restore connectivity':'Simulate offline')}</button><span className="badge">{t('Split demo')}</span></div></section>
   <div role="status" aria-live="polite" className={`toast ${error?'error':''}`}>{busy?t('Working… '):''}{t(notice)}</div>
   {isApp?<nav className="app-nav" aria-label={t('App navigation')}>{(view==='consumer'?['home','pay','offline','history']:['home','charge','receive','history']).map(tab=><button key={tab} className={appTab===tab?'':'secondary'} aria-current={appTab===tab?'page':undefined} onClick={()=>setAppTab(tab)}>{t(({home:'Home',pay:'Pay',offline:'Offline settings',history:'Transactions',charge:'Charge',receive:'Receive payment'} as Record<string,string>)[tab])}</button>)}</nav>:null}
   <div className="split">
    <section className="panel" aria-label="Consumer" hidden={view==='merchant'||isApp&&appTab==='history'}><div className="panel-head"><div className="person"><div className="avatar">D</div><div><h2>Diego</h2><span className="muted">{t('Consumer wallet')}</span></div></div><span className="eyebrow">{t('01 · Consumer')}</span></div>
     <div className="wallet-card" data-area="home"><span className="muted">{t("Total balance ·")}{' '}{config?.cluster==='devnet'?'Circle Devnet':'demo'} USDC</span><div className="big-value">${usd(balance)}</div><div className="wallet-foot"><div><span className="muted">{t('Offline available')}</span><strong>${usd(offlineAvailable<0n?0n:offlineAvailable)}</strong></div><span className="ready">{session?.active&&!revokePending?(locked?'LOCKED':'READY'):'NOT ENABLED'}</span></div></div>
     <div className="actions"><button onClick={()=>void run(fund)} disabled={busy||!online||funded||!ready}>{config?.cluster==='devnet'?`${language==='pt-BR'?'Reservar':'Reserve'} ${usd(config.offlineReserveAmount??'50000000')} USDC`:t('Fund wallet')}</button><button className="secondary" onClick={()=>{if(isApp)setAppTab('offline');else document.getElementById('offline-settings')?.scrollIntoView({behavior:'smooth'});}}>{t('Offline settings')}</button><button className="secondary" onClick={openHistory}>{t('Transactions')}</button></div>
     {isApp?<div className="card" data-area="pay"><h3>{t('Pay Coffee Shop')}</h3><label htmlFor="app-amount">{t('Amount in BRL')}</label><input id="app-amount" inputMode="decimal" value={amount} onChange={e=>{setAmount(e.target.value);setInvoice(null);}}/><details><summary>{t('Import merchant request')}</summary><label htmlFor="invoice-request">{t('Payment request payload')}</label><textarea id="invoice-request" value={invoiceInput} onChange={e=>setInvoiceInput(e.target.value)}/><button className="secondary" onClick={()=>void run(async()=>loadInvoice())}>{t('Review request')}</button></details><p className="muted">{t('Use an online transfer or authorize with your offline allowance.')}</p><button className="secondary" disabled={busy||!quote||!session?.active} onClick={()=>void run(createCharge)}>{t('Review offline payment')}</button></div>:null}
     <div className="card" data-area="pay" data-testid="online-payment"><h3>{t('Online on-chain payment')}</h3><p className="muted">{t('Direct wallet → merchant. Uses unreserved USDC; offline escrow remains unchanged.')}</p><p>{t('Unreserved wallet balance')}: {formatUnits(walletBalance,6)} USDC</p><p>{t('Charge amount')}: {brl((Math.round(Number(amount)*100)||0).toString())}</p><button onClick={()=>void run(payOnline)} disabled={busy||!online||!ready||(BigInt(walletBalance)===0n&&!onlineRows.some(r=>r.status==='pending'))}>{t(onlineRows.some(r=>r.status==='pending')?'Check online payment':'Pay online on-chain')}</button>{onlineRows.at(-1)?<p>{t(onlineRows.at(-1)!.status==='settled'?'ONLINE PAYMENT CONFIRMED':onlineRows.at(-1)!.status==='pending'?'Awaiting on-chain confirmation':'Online payment rejected')}</p>:null}{onlineRows.at(-1)?.result?<><code className="did" data-testid="online-transaction-hash">{onlineRows.at(-1)!.result!.signature}</code><p>{formatUnits(onlineRows.at(-1)!.result!.amount,6)} USDC · {brl(onlineRows.at(-1)!.result!.displayAmountMinor)}</p>{config?.cluster==='devnet'?<a href={solanaExplorer(onlineRows.at(-1)!.result!.signature,'devnet')} target="_blank" rel="noreferrer">{t('View transaction in Devnet Explorer ↗')}</a>:<p>{t('Confirmed on Localnet · no public Devnet Explorer')}</p>}</>:null}</div>
     <div className="card" id="offline-settings" data-area="offline"><h3>{t('Offline payments')}</h3><p className="muted">{session?usd(session.maxAmount):usd(config?.offlineAllowanceAmount??'0')} USDC · {t("USDC allowance for 24 hours. Your limited device key stays encrypted on this device.")}</p>{isApp?<button className="secondary" onClick={()=>void run(fund)} disabled={busy||!online||funded||!ready}>{t('Reserve offline funds')}</button>:null}<label htmlFor="password">{t('Offline wallet password (10+ characters)')}</label><input id="password" type="password" autoComplete="off" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Choose a password"/><div className="actions">
      {!session?.active?<button onClick={()=>void run(enable)} disabled={busy||!online||!funded}>{t('Enable offline payments')}</button>:<><button onClick={()=>void run(unlock)} disabled={busy||!locked||revokePending}>{t('Unlock wallet')}</button><button className="secondary" onClick={()=>{wallet.current.lockOfflineWallet();setLocked(true);setNotice('Offline wallet locked.');}} disabled={locked||busy}>{t('Lock')}</button><button className="danger" onClick={()=>void run(disable)} disabled={busy}>{t('Disable offline payments')}</button></>}
     </div>{revokePending?<p className="muted">{t("Key deleted. Cancellation must be confirmed online.")}</p>:null}</div>
     {invoice?<div className="card charge" data-area={isApp?'pay':'charge'}><div className="eyebrow">{t(online?'Local authorization':'Offline payment')}</div><h3 style={{marginTop:12}}>Coffee Shop</h3><div className="amount">{brl(invoice)}</div><p className="muted">{t("Settlement:")}{' '}{quote&&now()<quote.expiresAt?formatUnits(FxQuoteService.convert(BigInt(invoice),quote,Math.max(quote.issuedAt,now()),config!.fxSigner!),6):'Quote expired — refresh online'} demo USDC</p><button onClick={()=>void run(pay)} disabled={busy||locked||!session?.active||revokePending}>{t('Pay offline')}</button></div>:null}
     {qr?<details open data-area="pay"><summary>{t('Share authorized payment')}</summary><div className="qr"><img src={qr} alt="Signed payment QR code"/><p className="muted">{t("Nothing touched the blockchain.")}<br/>{t("Scan this code or use the payload on the right.")}</p></div><button className="secondary" onClick={()=>void run(async()=>{await navigator.clipboard.writeText(payload);setNotice('Signed payload copied.');})}>{t('Copy payload')}</button><button className="secondary" onClick={()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([payload],{type:'application/json'}));a.download='shimopay-intent.json';a.click();URL.revokeObjectURL(a.href);}}>{t('Export payload')}</button></details>:null}

     <details><summary>{t('Add money · Pix sandbox')}</summary><p className="muted">{t('Pix test order. QR issuance and payment confirmation are separate steps.')}</p><button disabled={busy||!online} onClick={()=>void run(()=>pixRequest('initiate'))}>{t('Generate R$100 test Pix')}</button>{pix?<><p>{t('Provider status')}: {t(pix.status)} · R$100</p><code className="did">{pix.id}</code>{!pix.qrCode&&pix.status==='pending'?<p>{t('Provider is processing the QR. Check status shortly.')}</p>:null}{pix.qrCodeBase64?<img width="180" src={`data:image/png;base64,${pix.qrCodeBase64}`} alt="Mercado Pago test Pix QR"/>:null}<code className="did">{pix.qrCode}</code><button disabled={busy||!online} onClick={()=>void run(()=>pixRequest('status'))}>{t('Check provider status')}</button></>:null}<p className="muted">{t('Fiat conversion is simulated. No USDC is minted or credited by this Pix flow.')}</p></details>
     <div className="identity" data-area="home"><span className="eyebrow">{t("Identity · Verified locally")}</span><code className="did">{config?createDid(config.network,config.consumer):'Loading identity…'}</code>{session?<code className="did">Device: {session.deviceDid}</code>:null}</div>
    </section>
    <section className="panel" aria-label="Merchant" hidden={view==='consumer'||isApp&&appTab==='history'}><div className="panel-head"><div className="person"><div className="avatar">☕</div><div><h2>Coffee Shop</h2><span className="muted">{t('Merchant terminal')}</span></div></div><span className="eyebrow">02 · Merchant · {merchantOnline?'ONLINE':'OFFLINE'}</span></div>
     {isApp?<div className="actions" data-area="home"><button onClick={()=>setAppTab('charge')}>{t('Charge')}</button><button className="secondary" onClick={()=>setAppTab('receive')}>{t('Receive payment')}</button></div>:null}<div className="stats" data-area="home"><div className="stat"><span className="muted">{t('Today · settled')}</span><strong>{brl(settled.reduce((n,r)=>n+BigInt(r.payment.intent.displayAmountMinor),0n).toString())}</strong></div><div className="stat"><span className="muted">{t('Pending settlement')}</span><strong>{brl(pending.reduce((n,r)=>n+BigInt(r.payment.intent.displayAmountMinor),0n).toString())}</strong></div></div>
     <div className="card charge" data-area="charge"><h3>{t('Create a charge')}</h3><label htmlFor="charge">{t('Amount in BRL')}</label><input id="charge" inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)}/><div className="actions"><button onClick={()=>void run(createCharge)} disabled={busy||!quote}>{t('Charge')}</button></div>{isApp&&requestQr?<div className="qr"><img src={requestQr} alt="Merchant invoice QR"/><div><p>{brl(invoice??'0')}</p><button className="secondary" onClick={()=>void run(async()=>{await navigator.clipboard.writeText(requestPayload);setNotice('Payment request copied.');})}>{t('Copy payment request')}</button><details><summary>{t('Payment request payload')}</summary><code className="did">{requestPayload}</code></details></div></div>:null}<p className="muted">Cached FX: 5.50 BRL = 1 USDC · DEMO rate<br/>{quote?`Quote issued ${new Date(quote.issuedAt*1000).toLocaleTimeString()}; expires ${new Date(quote.expiresAt*1000).toLocaleString()}.`:'Enable an allowance to cache the demo quote.'}</p><p className="muted">{t('Signed quote · ≤15 min: fresh · 15–30 min: +3% risk buffer · ≥30 min: reconnect. The signed USDC amount never changes during settlement.')}</p><button className="secondary" onClick={()=>void run(refreshQuote)} disabled={busy||!online}>{t('Refresh FX quote')}</button></div>
     <div className="card" data-area="receive"><h3>{t('Receive payment')}</h3><label htmlFor="payload">{t('Paste a signed payload (or use the split demo)')}</label><textarea id="payload" value={payload} onChange={e=>setPayload(e.target.value)} placeholder="Signed payment payload"/><div className="actions"><button onClick={()=>void run(accept)} disabled={busy||!payload||!session}>{t('Validate & accept offline')}</button></div><p className="muted">{t("Signature and policy checks run on this device. No blockchain or backend request.")}</p></div>
     {latest?<div className="status"><strong>{t(latest.status==='settled'?'SETTLED ON SOLANA':latest.status==='rejected'?'PAYMENT REJECTED':settlingNonce===latest.payment.intent.nonce?'AWAITING ON-CHAIN CONFIRMATION':'PAYMENT ACCEPTED')}</strong><div className="amount">{brl(latest.payment.intent.displayAmountMinor)}</div><p>{t(authorizationLabel(latest))} · {new Date(latest.payment.intent.issuedAt*1000).toLocaleString()}</p><p>{latest.status==='settled'?`${formatUnits(latest.payment.intent.amount,6)} ${config?.cluster==='devnet'?'Circle':'demo'} USDC · Solana ${config?.cluster}`:latest.status==='rejected'?latest.error:t('Offline authorization · Pending settlement')}</p>{latest.hash?<div><p className="hash" data-testid="transaction-hash">Tx: {latest.hash}</p><p>Confirmation: confirmed · Merchant: {config?.merchant}</p><a href={solanaExplorer(latest.hash,config!.cluster)} target="_blank" rel="noreferrer">{t('View in Solana Explorer ↗')}</a></div>:null}</div>:null}
     <div className="actions" data-area="receive">{simulated&&!merchantOnline?<button className="secondary" onClick={reconnectMerchant} disabled={busy}>{t('Connect merchant only')}</button>:null}<button onClick={()=>void run(settle)} disabled={busy||!merchantOnline||!pending.length}>{t('Settle now')}{pending.length?` (${pending.length})`:''}</button><button className="secondary" onClick={openHistory}>{t('Transaction history')}</button></div>
     <p className="muted">{t("Merchant received:")}{' '}{formatUnits(merchantBalance,6)} demo USDC</p>
     {!online?<div className="card"><strong>{t("Network blocked: TRUE")}</strong><p>{t("Solana RPC calls during authorization:")}{' '}{(payerAdapter.current?.rpcCalls??0)-offlineCalls}</p>{verified?<div><strong>{t("OFFLINE VERIFIED")}</strong><p>{t("Signature valid · Merchant binding valid")}<br/>{t("Allowance valid according to cached snapshot")}<br/>{t("Intent not expired")}</p></div>:null}</div>:null}
     <div className="risk">{t("Offline acceptance contains bounded counterparty risk until settlement. Other isolated merchants may accept competing intents. Cached metadata cannot reveal new revocations or spends.")}</div>
     <div className="identity" data-area="home"><span className="eyebrow">{t("Merchant identity · Verified locally")}</span><code className="did">{config?createDid(config.network,config.merchant):'Loading identity…'}</code></div>
     <details><summary>{t('Solana Proof')}</summary><dl className="proof">{Object.entries({Cluster:config?.cluster,'Program ID':config?.program,'Consumer wallet':config?.consumer,'Merchant wallet':config?.merchant,'Demo USDC mint':config?.mint,'Reserve PDA':config?.reserve,'Vault token account':config?.vault,'OfflineAllowance PDA':session?.id,'Reserve balance':`${usd(reserveBalance)} USDC`,'Allowance remaining':session?`${usd(BigInt(session.maxAmount)-BigInt(session.spentAmount))} USDC`:'—'}).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value??'—'}</dd></div>)}</dl>{reserveSignature?<p><a href={solanaExplorer(reserveSignature,config!.cluster)} target="_blank" rel="noreferrer">{t("Reserve transaction ↗")}</a><code className="did">{reserveSignature}</code></p>:null}{allowanceSignature?<p><a href={solanaExplorer(allowanceSignature,config!.cluster)} target="_blank" rel="noreferrer">{t("Allowance transaction ↗")}</a><code className="did">{allowanceSignature}</code></p>:null}{latest?.hash?<p><a href={solanaExplorer(latest.hash,config!.cluster)} target="_blank" rel="noreferrer">{t("Last settlement transaction ↗")}</a><code className="did">{latest.hash}</code></p>:null}<div className="actions"><button className="secondary" onClick={()=>void run(replay)} disabled={busy||!merchantOnline||!settled.length}>{t('Test replay')}</button><button className="secondary" onClick={()=>void run(tamper)} disabled={busy||!rows.length}>{t('Test tamper')}</button></div></details>
    </section>
   </div>{(isApp?appTab==='history':showHistory)?<section className="card" aria-label="Transaction history"><h2>Transaction history · Solana {config?.cluster}</h2><p className="muted">{t("On-chain escrow transactions, newest first.")}{' '}{online?'Retrieved from the connected Solana network.':'Cached history · reconnect to refresh.'} {config?.cluster==='localnet'?'Localnet records are not publicly accessible on Devnet.':'Each signature opens the public Devnet Explorer.'}</p><div className="actions"><button className="secondary" onClick={()=>void run(()=>refreshHistory())} disabled={busy||!online}>{t('Refresh history')}</button>{config?.cluster==='devnet'?<a href={solanaExplorer(config.reserve,'devnet','address')} target="_blank" rel="noreferrer">Reserve history in Devnet Explorer ↗</a>:null}</div>{historyError?<p role="alert">{historyError}</p>:null}<div data-testid="chain-history">{history?.entries.length?history.entries.map(entry=><div className="history-item" key={entry.signature}><strong>{entry.status.toUpperCase()}</strong> · {entry.blockTime?new Date(entry.blockTime*1000).toLocaleString():'Time unavailable'} · Slot {entry.slot}<code className="did">{entry.signature}</code>{config?.cluster==='devnet'?<a href={solanaExplorer(entry.signature,'devnet')} target="_blank" rel="noreferrer">{t("View transaction in Devnet Explorer ↗")}</a>:null}</div>):<p className="muted">{t("No on-chain transactions loaded.")}</p>}</div>{history?.nextCursor?<button className="secondary" onClick={()=>void run(()=>refreshHistory(true))} disabled={busy||!online}>{t('Load older transactions')}</button>:null}<h3>{t('Online payment history')}</h3><div data-testid="online-history">{onlineRows.map(r=><div className="history-item" key={r.request.requestId}><strong>{brl(r.request.displayAmountMinor)} · ONLINE · {r.status}</strong><p>{new Date(r.createdAt*1000).toLocaleString()} · {formatUnits(r.request.amount,6)} USDC</p>{r.result?<code className="did">{r.result.signature}</code>:null}</div>)}</div><h3>{t('Wallet token-account history')}</h3><div data-testid="wallet-history">{walletHistory?.entries.map(entry=><div className="history-item" key={entry.signature}><strong>{entry.status.toUpperCase()}</strong><code className="did">{entry.signature}</code>{config?.cluster==='devnet'?<a href={solanaExplorer(entry.signature,'devnet')} target="_blank" rel="noreferrer">{t('View transaction in Devnet Explorer ↗')}</a>:null}</div>)}</div><h3>{t('Payments on this device')}</h3>{devicePayments.length?devicePayments.map(r=><div className="history-item" data-testid="device-payment" key={r.payment.intent.nonce}><strong>{brl(r.payment.intent.displayAmountMinor)} · {t(paymentStatus(r))}</strong><p>{t(authorizationLabel(r))}<br/>{t("Authorization time (device clock):")}{' '}{new Date(r.payment.intent.issuedAt*1000).toLocaleString()}{r.acceptedAt?<><br/>{t("Merchant acceptance:")}{' '}{new Date(r.acceptedAt*1000).toLocaleString()}</>:null}{r.confirmedAt?<><br/>{t("Confirmation observed:")}{' '}{new Date(r.confirmedAt*1000).toLocaleString()}</>:null}</p><span className="muted">{formatUnits(r.payment.intent.amount,6)} demo USDC</span>{r.hash?<code className="did">{r.hash}</code>:<p className="muted">{t("No confirmed on-chain settlement yet.")}</p>}{r.error?<p>{r.error}</p>:null}</div>):<p className="muted">{t("No device payments. On-chain history above remains available.")}</p>}</section>:null}<div className="timeline" hidden={isApp}><div><strong>{t("1. Reserve")}</strong><span>{t("Fund & enable online")}</span></div><div><strong>{t("2. Authorize")}</strong><span>{t("Charge & sign offline")}</span></div><div><strong>{t("3. Accept")}</strong><span>{t("Verify locally")}</span></div><div><strong>{t("4. Settle")}</strong><span>{t("Reconnect & receive on-chain")}</span></div></div><div className="footer"><span>ShimoPay · Offline authorization + online settlement</span><span>{isApp?t('Test environment · Development accounts'):'Demo tokens only. Offline authorization + Solana settlement.'}</span></div>
  </main>
 </div>;
}
