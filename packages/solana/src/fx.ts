import {z} from 'zod';
import {sha256} from 'ethers';
import {ed25519} from '@noble/curves/ed25519.js';
import bs58 from 'bs58';
const FxBodySchema=z.object({version:z.literal(1),pair:z.literal('BRL/USDC'),rateMinorPerUsdc:z.string().regex(/^[1-9][0-9]*$/),issuedAt:z.number().int().nonnegative(),expiresAt:z.number().int().positive(),freshSeconds:z.literal(900),maxAgeSeconds:z.literal(1800),riskBufferBps:z.literal(300)}).strict();
export const SignedFxQuoteSchema=FxBodySchema.extend({quoteId:z.string().regex(/^0x[0-9a-f]{64}$/),signature:z.string().min(80).max(90)}).strict();
export type SignedFxQuote=z.infer<typeof SignedFxQuoteSchema>;
const body=(q:z.infer<typeof FxBodySchema>)=>({version:q.version,pair:q.pair,rateMinorPerUsdc:q.rateMinorPerUsdc,issuedAt:q.issuedAt,expiresAt:q.expiresAt,freshSeconds:q.freshSeconds,maxAgeSeconds:q.maxAgeSeconds,riskBufferBps:q.riskBufferBps});
export function canonicalFx(q:z.infer<typeof FxBodySchema>){return new TextEncoder().encode(`ShimoPay/FX/v1\n${JSON.stringify(body(q))}`);}
export class SignedFxQuoteService {
 static issue(now:number,seed:Uint8Array):SignedFxQuote{const q=FxBodySchema.parse({version:1,pair:'BRL/USDC',rateMinorPerUsdc:'550',issuedAt:now,expiresAt:now+1800,freshSeconds:900,maxAgeSeconds:1800,riskBufferBps:300});const bytes=canonicalFx(q);return {...q,quoteId:sha256(bytes),signature:bs58.encode(ed25519.sign(bytes,seed))};}
 static validate(q:SignedFxQuote,now:number,issuer:string){SignedFxQuoteSchema.parse(q);const bytes=canonicalFx(q);if(sha256(bytes)!==q.quoteId)throw new Error('Tampered FX quote');let valid=false;try{valid=ed25519.verify(bs58.decode(q.signature),bytes,bs58.decode(issuer),{zip215:false});}catch{}if(!valid)throw new Error('Invalid FX quote signature');if(now<q.issuedAt||now>=q.expiresAt||q.expiresAt!==q.issuedAt+1800)throw new Error('Expired FX quote: reconnect to refresh');}
 static risk(q:SignedFxQuote,now:number,issuer:string){this.validate(q,now,issuer);const age=now-q.issuedAt;return {ageSeconds:age,bufferBps:age<=q.freshSeconds?0:q.riskBufferBps,level:age<=q.freshSeconds?'fresh' as const:'buffered' as const};}
 static convert(minor:bigint,q:SignedFxQuote,now:number,issuer:string){const {bufferBps}=this.risk(q,now,issuer);if(minor<=0n)throw new Error('Invalid BRL amount');const rate=BigInt(q.rateMinorPerUsdc);const base=(minor*1_000_000n+rate-1n)/rate;return (base*BigInt(10_000+bufferBps)+9_999n)/10_000n;}
 static verifyPayment(i:{fxQuoteId:string;amount:string;displayAmountMinor:string;issuedAt:number},q:SignedFxQuote,now:number,issuer:string){const current=this.risk(q,now,issuer);const atSigning=this.risk(q,i.issuedAt,issuer);if(i.fxQuoteId!==q.quoteId||BigInt(i.amount)!==this.convert(BigInt(i.displayAmountMinor),q,i.issuedAt,issuer))throw new Error('Quote / signed amount mismatch');if(current.bufferBps>atSigning.bufferBps)throw new Error('FX quote aged: authorize again with the displayed 3% risk buffer');return current;}
}
