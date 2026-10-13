import {z} from 'zod';
import {SignedFxQuoteSchema} from './fx';
export const OnlinePaymentSchema=z.object({requestId:z.uuid(),displayAmountMinor:z.string().regex(/^[1-9][0-9]*$/).refine(v=>BigInt(v)<=10000n),amount:z.string().regex(/^[1-9][0-9]*$/).refine(v=>BigInt(v)<=100_000_000n),quote:SignedFxQuoteSchema}).strict();
export type OnlinePaymentRequest=z.infer<typeof OnlinePaymentSchema>;
export interface OnlinePaymentResult {signature:string;amount:string;displayAmountMinor:string;requestId:string;}
