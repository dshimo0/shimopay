import { z } from 'zod';
import { getAddress, keccak256, toUtf8Bytes, verifyTypedData, type TypedDataDomain, type Signer } from 'ethers';
export * from './identity/index';
const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/).refine(v => { try { getAddress(v); return true; } catch { return false; } });
const hash = z.string().regex(/^0x[0-9a-fA-F]{64}$/);
const integer = z.string().regex(/^(0|[1-9][0-9]*)$/).refine(v => BigInt(v) < 2n ** 256n);
export const IntentSchema = z.object({ sessionId: hash, payer: address, merchant: address, settlementToken: address, settlementAmount: integer.refine(v => BigInt(v) > 0n), displayCurrency: z.literal('BRL'), displayAmountMinor: integer.refine(v => BigInt(v) > 0n), fxQuoteId: hash, sequence: integer.refine(v => BigInt(v) > 0n), nonce: hash, createdAt: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), expiresAt: z.number().int().positive().max(Number.MAX_SAFE_INTEGER) }).strict();
export type PaymentIntent = z.infer<typeof IntentSchema>;
export const intentTypes = { PaymentIntent: [
  {name:'sessionId',type:'bytes32'}, {name:'payer',type:'address'}, {name:'merchant',type:'address'}, {name:'settlementToken',type:'address'}, {name:'settlementAmount',type:'uint256'}, {name:'displayCurrency',type:'string'}, {name:'displayAmountMinor',type:'uint256'}, {name:'fxQuoteId',type:'bytes32'}, {name:'sequence',type:'uint256'}, {name:'nonce',type:'bytes32'}, {name:'createdAt',type:'uint64'}, {name:'expiresAt',type:'uint64'}
] };
export function protocolDomain(chainId: number, vault: string): TypedDataDomain { return {name:'ShimoPay',version:'1',chainId,verifyingContract:getAddress(vault)}; }
export interface OfflineSession {
  id: string; payerDid: string; deviceDid: string; owner: string; sessionSigner: string; token: string; maxAmount: string; spentAmount: string; expiresAt: number; active: boolean; merchantRestriction: string; chainId: number; vault: string; cachedAt: number;
}
export const EnvelopeSchema = z.object({ version: z.literal(1), intent: IntentSchema, signature: z.string().regex(/^0x[0-9a-fA-F]{130}$/) }).strict();
export type SignedIntent = z.infer<typeof EnvelopeSchema>;
export async function signIntent(intent: PaymentIntent, signer: Signer, domain: TypedDataDomain): Promise<SignedIntent> {
  IntentSchema.parse(intent);
  return {version:1,intent,signature:await signer.signTypedData(domain,intentTypes,intent)};
}
export function serializeIntent(p: SignedIntent): string { return JSON.stringify(EnvelopeSchema.parse(p)); }
export function deserializeIntent(payload: string): SignedIntent { if (payload.length > 8192) throw new Error('Payload too large'); return EnvelopeSchema.parse(JSON.parse(payload)); }
export function verifyIntent(p: SignedIntent, session: OfflineSession, merchant: string, now: number, seen: string[] = []) {
  EnvelopeSchema.parse(p);
  const i = p.intent;
  if (!session.active || now >= session.expiresAt) throw new Error('Session expired or revoked in cached snapshot');
  if (now >= i.expiresAt || i.expiresAt > session.expiresAt || i.createdAt > now || i.createdAt >= i.expiresAt) throw new Error('Intent expired or invalid time');
  if (i.sessionId !== session.id || getAddress(i.payer) !== getAddress(session.owner) || getAddress(i.settlementToken) !== getAddress(session.token)) throw new Error('Session mismatch');
  if (getAddress(i.merchant) !== getAddress(merchant) || (session.merchantRestriction !== '0x0000000000000000000000000000000000000000' && getAddress(i.merchant) !== getAddress(session.merchantRestriction))) throw new Error('Wrong merchant');
  if (seen.includes(i.nonce) || seen.includes(`sequence:${i.sequence}`)) throw new Error('Local replay detected');
  if (BigInt(i.settlementAmount) > BigInt(session.maxAmount) - BigInt(session.spentAmount)) throw new Error('Insufficient cached allowance');
  let recovered: string;
  try { recovered = verifyTypedData(protocolDomain(session.chainId,session.vault),intentTypes,i,p.signature); } catch { throw new Error('Invalid signature'); }
  if (getAddress(recovered) !== getAddress(session.sessionSigner)) throw new Error('Invalid signature');
  return {valid:true, risk:'Offline acceptance contains bounded counterparty risk until settlement.', snapshotAgeSeconds:Math.max(0,now-session.cachedAt)};
}
export interface FxQuote { pair:'BRL/USDC'; rateMinorPerUsdc: string; issuedAt: number; expiresAt: number; quoteId: string; }
export class FxQuoteService {
  // Demo deterministic hash proves integrity only, NOT authenticity or market pricing.
  static issue(now: number): FxQuote {
    const q = {pair:'BRL/USDC' as const,rateMinorPerUsdc:'550',issuedAt:now,expiresAt:now+86400};
    return {...q,quoteId:keccak256(toUtf8Bytes(JSON.stringify(q)))};
  }
  static validate(q: FxQuote, now: number) {
    if (q.pair !== 'BRL/USDC' || !/^[1-9][0-9]*$/.test(q.rateMinorPerUsdc) || !Number.isSafeInteger(q.issuedAt) || !Number.isSafeInteger(q.expiresAt) || now < q.issuedAt || now >= q.expiresAt || q.expiresAt <= q.issuedAt) throw new Error('Expired or invalid FX quote');
    const {quoteId,...body} = q;
    if (quoteId !== keccak256(toUtf8Bytes(JSON.stringify(body)))) throw new Error('Tampered FX quote');
  }
  static convert(minor: bigint, q: FxQuote, now: number): bigint { this.validate(q,now); if (minor <= 0n) throw new Error('Invalid amount'); const rate=BigInt(q.rateMinorPerUsdc); return (minor*1_000_000n+rate-1n)/rate; }
}
export function verifyQuotedIntent(p: SignedIntent, q: FxQuote, now: number) {
  FxQuoteService.validate(q,now);
  if (p.intent.fxQuoteId !== q.quoteId || BigInt(p.intent.settlementAmount) !== FxQuoteService.convert(BigInt(p.intent.displayAmountMinor),q,now) || p.intent.expiresAt > q.expiresAt) throw new Error('Quote / amount mismatch');
}
