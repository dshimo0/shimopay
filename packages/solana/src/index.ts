export * from './protocol';
export * from './network';
export * from './fx';
export * from './online';
import {type OnlinePaymentRequest,type OnlinePaymentResult} from './online';
import {type SignedFxQuote} from './fx';
import {ConnectivityGate} from '@shimopay/sdk';
import {type SolanaOfflineSession,type SolanaSignedIntent} from './protocol';
export interface SolanaDeployment {cluster:'devnet'|'localnet';program:string;mint:string;consumer:string;merchant:string;reserve:string;vault:string;network:string;generation:string;rpcUrl:string;deploymentSignature?:string;assetKind?:'circle-devnet-usdc'|'local-test-token';fxSigner?:string;offlineReserveAmount?:string;offlineAllowanceAmount?:string;}
export interface SolanaHistoryEntry {signature:string;slot:number;blockTime:number|null;status:'confirmed'|'finalized'|'failed';}
export interface SolanaHistoryPage {cluster:'devnet'|'localnet';reserve:string;entries:SolanaHistoryEntry[];nextCursor:string|null;}
export interface SolanaState {balance:string;merchantBalance:string;reserveBalance:string;availableReserve:string;walletBalance:string;}
export interface SolanaSettlementAdapterContract {
 createEscrowSession(input:{id:string;signer:string;amount:bigint;expiresAt:number}):Promise<SolanaOfflineSession>;
 getSession(id:string):Promise<SolanaOfflineSession>;
 settlePayment(payment:SolanaSignedIntent):Promise<string>;
 cancelSession(id:string):Promise<string>;
 getTransactionStatus(signature:string):Promise<'pending'|'settled'|'failed'>;
}
export class SolanaSettlementAdapter implements SolanaSettlementAdapterContract {
 rpcCalls=0;lastReserveSignature='';lastAllowanceSignature='';
 constructor(private gate:ConnectivityGate){}
 private async call<T>(action:string,args:Record<string,unknown>={}):Promise<T>{this.gate.assertOnline();this.rpcCalls++;const response=await fetch('/api/solana-demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...args})});const result=await response.json();if(!response.ok)throw new Error(result.error??'Solana request failed');return result as T;}
 async payOnline(payment:OnlinePaymentRequest){return this.call<OnlinePaymentResult>('payOnline',{payment});}
 async fundDemo(){const r=await this.call<{signature:string}>('fund');this.lastReserveSignature=r.signature;return r.signature;}
 async createEscrowSession(input:{id:string;signer:string;amount:bigint;expiresAt:number}){const r=await this.call<{session:SolanaOfflineSession;signature:string}>('allowance',{...input,amount:input.amount.toString()});this.lastAllowanceSignature=r.signature;return r.session;}
 async getSession(id:string){return this.call<SolanaOfflineSession>('session',{id});}
 async settlePayment(payment:SolanaSignedIntent){return (await this.call<{signature:string}>('settle',{payment})).signature;}
 async cancelSession(id:string){return (await this.call<{signature:string}>('cancel',{id})).signature;}
 async getTransactionStatus(signature:string){return (await this.call<{status:'pending'|'settled'|'failed'}>('status',{signature})).status;}
 async fxQuote(){return this.call<SignedFxQuote>('fxQuote');}
 async history(before?:string,scope:'reserve'|'wallet'='reserve'){return this.call<SolanaHistoryPage>('history',{scope,...(before?{before}:{})});}
 async state(){return this.call<SolanaState>('state');}
}
export function solanaExplorer(value:string,cluster:'devnet'|'localnet',kind:'tx'|'address'='tx'){return `https://explorer.solana.com/${kind}/${encodeURIComponent(value)}?cluster=${cluster==='devnet'?'devnet':'custom&customUrl=http%3A%2F%2F127.0.0.1%3A8899'}`;}
