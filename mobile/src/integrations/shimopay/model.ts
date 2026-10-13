import bs58 from 'bs58';
import {type SolanaSignedIntent,type SignedFxQuote,SolanaEnvelopeSchema,SignedFxQuoteSchema} from '@shimopay/solana-browser';
export interface PaymentRow {id:string;mode:'online'|'offline';status:'authorized_offline'|'pending_settlement'|'submitted'|'confirmed'|'rejected'|'expired';createdAt:number;connectivityAtAuthorization?:'online'|'offline';confirmedAt?:number;signature?:string;error?:string;payment?:SolanaSignedIntent;quote?:SignedFxQuote;amount:string;minor:string;requestId?:string;}
export function brlMinor(input:string){if(!/^\d+(\.\d{1,2})?$/.test(input)||input.length>12)throw new Error('Invalid BRL amount');const [w,f='']=input.split('.');const value=BigInt(w)*100n+BigInt(f.padEnd(2,'0'));if(value<=0n||value>10000n)throw new Error('Demo limit R$100');return value.toString();}
export function parsePaymentPayload(payload:string){if(payload.length>10000)throw new Error('Payload too large');const p=JSON.parse(payload);return {payment:SolanaEnvelopeSchema.parse(p.payment),quote:SignedFxQuoteSchema.parse(p.quote)};}
export function parseInvoice(payload:string,merchant:string,now:number){if(payload.length>2048)throw new Error('Invoice too large');const i=JSON.parse(payload);if(i.protocol!=='shimopay-invoice'||i.version!==1||i.currency!=='BRL'||i.merchant!==merchant||typeof i.amountMinor!=='string'||!/^\d+$/.test(i.amountMinor)||BigInt(i.amountMinor)<=0n||BigInt(i.amountMinor)>10000n||!Number.isSafeInteger(i.expiresAt)||i.expiresAt<=now||i.expiresAt>now+1800)throw new Error('Invalid or expired merchant invoice');return i.amountMinor as string;}
export function remaining(session:{maxAmount:string;spentAmount:string},rows:PaymentRow[]){const committed=rows.filter(r=>r.mode==='offline'&&!['confirmed','rejected','expired'].includes(r.status)).reduce((n,r)=>n+BigInt(r.amount),0n);const left=BigInt(session.maxAmount)-BigInt(session.spentAmount)-committed;return left>0n?left:0n;}
export function merchantSessionAddress(input:string){
 const id=input.trim();
 try{if(!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(id)||bs58.decode(id).length!==32)throw new Error();return id;}catch{throw new Error('Cole um endereço de sessão válido, compartilhado pelo cliente. Você também pode ler o QR do pagamento.');}
}
export function publicPaymentError(message:string){
 if(message.trim().startsWith('[')||/Unexpected token|JSON at position|Unexpected end of JSON/.test(message))return 'Não foi possível ler os dados. Confira o QR ou cole a autorização completa do cliente.';
 if(/AllowanceExceeded|0x177c/i.test(message))return 'Offline allowance exceeded';
 if(/Expired FX quote/i.test(message))return 'Cached FX quote expired: reconnect to refresh';
 if(/Expired|0x1774/i.test(message))return 'Payment or session expired';
 if(/WrongMerchant|0x1777/i.test(message))return 'Wrong merchant';
 if(/WrongSessionKey|0x1773/i.test(message))return 'Wrong session signer';
 if(/InvalidSignature|signature verification|Invalid signature|0x177d/i.test(message))return 'Invalid signature';
 if(/NonceAlreadyUsed/i.test(message))return 'Payment already settled';
 if(/Simulation failed/i.test(message))return 'Payment rejected by settlement policy';
 return message;
}
