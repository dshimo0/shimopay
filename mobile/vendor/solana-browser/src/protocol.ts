import {z} from 'zod';
import {address} from '@solana/kit';
import bs58 from 'bs58';
import {ed25519} from '@noble/curves/ed25519.js';
import {getBytes,hexlify,sha256} from 'ethers';
import {encryptSessionKey,decryptSessionKey,readRecord,writeRecord,removeRecord,type EncryptedKey} from './core';
const pubkey=z.string().refine(v=>{try{address(v);return bs58.decode(v).length===32;}catch{return false;}},'Invalid Solana address');
const hash=z.string().regex(/^0x[0-9a-f]{64}$/);
const u64=z.string().regex(/^(0|[1-9][0-9]*)$/).refine(v=>BigInt(v)<2n**64n);
const timestamp=z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const SolanaIntentSchema=z.object({protocolVersion:z.literal(2),network:pubkey,program:pubkey,reserve:pubkey,allowance:pubkey,consumer:pubkey,sessionPublicKey:pubkey,merchant:pubkey,currencyMint:pubkey,amount:u64.refine(v=>BigInt(v)>0n),nonce:hash,issuedAt:timestamp,expiresAt:timestamp,sequence:u64.refine(v=>BigInt(v)>0n),displayCurrency:z.literal('BRL'),displayAmountMinor:u64.refine(v=>BigInt(v)>0n),fxQuoteId:hash,deviceIdHash:hash}).strict();
export type SolanaPaymentIntent=z.infer<typeof SolanaIntentSchema>;
export const SolanaEnvelopeSchema=z.object({version:z.literal(2),intent:SolanaIntentSchema,signature:z.string().refine(v=>{try{return bs58.decode(v).length===64;}catch{return false;}})}).strict();
export type SolanaSignedIntent=z.infer<typeof SolanaEnvelopeSchema>;
export interface SolanaOfflineSession {id:string;owner:string;sessionSigner:string;reserve:string;token:string;maxAmount:string;spentAmount:string;expiresAt:number;active:boolean;network:string;program:string;sessionId:string;cachedAt:number;payerDid:string;deviceDid:string;}
export function createSolanaDid(network:string,key:string){pubkey.parse(network);pubkey.parse(key);return `did:pkh:solana:${network.slice(0,32)}:${key}`;}
export function parseSolanaDid(did:string){const p=did.split(':');if(p.length!==5||p.slice(0,3).join(':')!=='did:pkh:solana')throw new Error('Invalid Solana DID');if(!/^[1-9A-HJ-NP-Za-km-z]{32}$/.test(p[3]))throw new Error('Invalid Solana CAIP-2 reference');pubkey.parse(p[4]);return {namespace:'solana',network:p[3],address:p[4]};}
export const randomSolanaId=()=>hexlify(crypto.getRandomValues(new Uint8Array(32)));
function little(value:string|number){const b=new Uint8Array(8);new DataView(b.buffer).setBigUint64(0,BigInt(value),true);return b;}
export function canonicalIntent(input:SolanaPaymentIntent):Uint8Array {
 const i=SolanaIntentSchema.parse(input);
 const chunks=[new TextEncoder().encode('ShimoPay/Solana/v2'),...[i.network,i.program,i.reserve,i.allowance,i.consumer,i.sessionPublicKey,i.merchant,i.currencyMint].map(v=>bs58.decode(v)),little(i.amount),getBytes(i.nonce),little(i.issuedAt),little(i.expiresAt),little(i.sequence),little(i.displayAmountMinor),getBytes(i.fxQuoteId),getBytes(i.deviceIdHash)];
 const out=new Uint8Array(chunks.reduce((n,b)=>n+b.length,0));let offset=0;for(const c of chunks){out.set(c,offset);offset+=c.length;}return out;
}
export function signSolanaIntent(intent:SolanaPaymentIntent,seed:Uint8Array):SolanaSignedIntent{return {version:2,intent:SolanaIntentSchema.parse(intent),signature:bs58.encode(ed25519.sign(canonicalIntent(intent),seed))};}
export function serializeSolanaIntent(p:SolanaSignedIntent){return JSON.stringify(SolanaEnvelopeSchema.parse(p));}
export function deserializeSolanaIntent(payload:string){if(payload.length>8192)throw new Error('Payload too large');return SolanaEnvelopeSchema.parse(JSON.parse(payload));}
export function intentHash(i:SolanaPaymentIntent){return sha256(canonicalIntent(i));}
export function verifySolanaIntent(p:SolanaSignedIntent,s:SolanaOfflineSession,merchant:string,now:number,seen:string[]=[]){
 SolanaEnvelopeSchema.parse(p);const i=p.intent;
 // Verify before amount/policy checks so mutation is reported as a signature failure.
 if(!ed25519.verify(bs58.decode(p.signature),canonicalIntent(i),bs58.decode(s.sessionSigner),{zip215:false}))throw new Error('Invalid signature');
 if(!s.active||now>=s.expiresAt)throw new Error('Allowance expired or revoked in cached snapshot');
 if(now>=i.expiresAt||i.expiresAt>s.expiresAt||i.issuedAt>now+30||i.issuedAt>=i.expiresAt)throw new Error('Intent expired or invalid time');
 if(i.allowance!==s.id||i.reserve!==s.reserve||i.consumer!==s.owner||i.currencyMint!==s.token||i.sessionPublicKey!==s.sessionSigner||i.program!==s.program||i.network!==s.network)throw new Error('Allowance / domain mismatch');
 if(i.merchant!==merchant)throw new Error('Wrong merchant');
 if(seen.includes(i.nonce)||seen.includes(`sequence:${i.sequence}`))throw new Error('Local replay detected');
 if(BigInt(i.amount)>BigInt(s.maxAmount)-BigInt(s.spentAmount))throw new Error('Insufficient cached allowance');
 return {valid:true,risk:'Fully isolated merchants can accept conflicting intents before settlement. Escrow bounds on-chain spend, not aggregate merchant losses.',snapshotAgeSeconds:Math.max(0,now-s.cachedAt)};
}
export class SolanaOfflineWallet {
 private seed:Uint8Array|null=null;
 async create(password:string){const seed=crypto.getRandomValues(new Uint8Array(32));await writeRecord('solana:encrypted-session-key',await encryptSessionKey(hexlify(seed),password));this.seed=seed;return bs58.encode(ed25519.getPublicKey(seed));}
 lockOfflineWallet(){this.seed?.fill(0);this.seed=null;}
 async unlockOfflineWallet(password:string){const r=await readRecord<EncryptedKey>('solana:encrypted-session-key');if(!r)throw new Error('No offline wallet');this.seed=getBytes(await decryptSessionKey(r,password));return bs58.encode(ed25519.getPublicKey(this.seed));}
 getSigner(){if(!this.seed)throw new Error('Offline wallet is locked');return this.seed;}
 async deleteKey(){this.lockOfflineWallet();await removeRecord('solana:encrypted-session-key');}
}
// JS memory erasure is best effort; production requires OS keystore / secure hardware.
