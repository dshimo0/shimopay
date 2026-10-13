import { Contract, Interface, JsonRpcProvider, type Signer, ZeroAddress } from 'ethers';
import { createDid, type OfflineSession, type SignedIntent } from '@shimopay/protocol';
export * from './storage';
export class ConnectivityGate {
 private simulatedOffline=false;
 setOffline(value:boolean){this.simulatedOffline=value;}
 isOnline(){return !this.simulatedOffline && (typeof navigator==='undefined'||typeof navigator.onLine!=='boolean'||navigator.onLine);}
 assertOnline(){if(!this.isOnline())throw new Error('Offline: this action requires connectivity');}
}
export const vaultAbi=[
 'function balances(address,address) view returns(uint256)',
 'function deposit(address,uint256)', 'function withdraw(address,uint256)',
 'function createSession(bytes32,address,address,uint256,uint64,address)',
 'function getSession(bytes32) view returns(tuple(address owner,address sessionSigner,address token,uint256 maxAmount,uint256 spentAmount,uint64 expiresAt,bool active,address merchantRestriction))',
 'function remainingAmount(bytes32) view returns(uint256)', 'function cancelSession(bytes32)', 'function closeExpiredSession(bytes32)',
 'function settlePayment(tuple(bytes32 sessionId,address payer,address merchant,address settlementToken,uint256 settlementAmount,string displayCurrency,uint256 displayAmountMinor,bytes32 fxQuoteId,uint256 sequence,bytes32 nonce,uint64 createdAt,uint64 expiresAt),bytes)',
 'error SessionInactive()','error SessionExpiredError()','error IntentExpired()','error InvalidIntent()','error InvalidSignature()','error WrongMerchant()','error NonceAlreadyUsed()','error SequenceAlreadyUsed()','error InsufficientSessionBalance()'
];
export const tokenAbi=['function mint(address,uint256)','function approve(address,uint256) returns(bool)','function balanceOf(address) view returns(uint256)'];
export interface CreateSessionInput {id:string; signer:string; token:string; amount:bigint; expiresAt:number; restriction?:string;}
export interface SettlementAdapter {
 createEscrowSession(input:CreateSessionInput):Promise<OfflineSession>;
 getSession(id:string):Promise<OfflineSession>;
 settlePayment(payment:SignedIntent):Promise<string>;
 cancelSession(id:string):Promise<string>;
 getTransactionStatus(hash:string):Promise<'pending'|'settled'|'failed'>;
}
export class EvmSettlementAdapter implements SettlementAdapter {
 private vault:Contract;
 constructor(private signer:Signer,private chainId:number,private vaultAddress:string,private gate:ConnectivityGate){this.vault=new Contract(vaultAddress,vaultAbi,signer);}
 private async check(){this.gate.assertOnline(); const network=await this.signer.provider!.getNetwork();if(Number(network.chainId)!==this.chainId)throw new Error('Wrong network');}
 async createEscrowSession(input:CreateSessionInput){await this.check(); await(await this.vault.createSession(input.id,input.signer,input.token,input.amount,input.expiresAt,input.restriction??ZeroAddress)).wait(); return this.getSession(input.id);}
 async getSession(id:string):Promise<OfflineSession>{await this.check();const s=await this.vault.getSession(id);return{id,owner:s.owner,sessionSigner:s.sessionSigner,token:s.token,maxAmount:s.maxAmount.toString(),spentAmount:s.spentAmount.toString(),expiresAt:Number(s.expiresAt),active:s.active,merchantRestriction:s.merchantRestriction,payerDid:createDid(this.chainId,s.owner),deviceDid:createDid(this.chainId,s.sessionSigner),chainId:this.chainId,vault:this.vaultAddress,cachedAt:Math.floor(Date.now()/1000)};}
 async settlePayment(payment:SignedIntent){
  await this.check();
  try {const receipt=await(await this.vault.settlePayment(payment.intent,payment.signature)).wait();if(!receipt||receipt.status!==1)throw new Error('Settlement failed');return receipt.hash as string;}
  catch(error){
   const e=error as {data?:string;info?:{error?:{data?:string}}};
   const data=e.data??e.info?.error?.data;
   if(typeof data==='string'){try{const parsed=new Interface(vaultAbi).parseError(data);if(parsed)throw new Error(parsed.name);}catch(decoded){if(decoded instanceof Error && vaultAbi.some(a=>a===`error ${decoded.message}()`))throw decoded;}}
   throw new Error('Settlement could not be confirmed. Check connectivity and the cached session policy.');
  }
 }
 async cancelSession(id:string){await this.check();return (await(await this.vault.cancelSession(id)).wait()).hash as string;}
 async getTransactionStatus(hash:string){await this.check();const receipt=await this.signer.provider!.getTransactionReceipt(hash);return !receipt?'pending':receipt.status===1?'settled':'failed';}
 async fundDemo(tokenAddress:string,amount:bigint){await this.check();if(this.chainId!==31337)throw new Error('Demo faucet is local only');const token=new Contract(tokenAddress,tokenAbi,this.signer);await(await token.mint(await this.signer.getAddress(),amount)).wait();}
 async deposit(tokenAddress:string,amount:bigint){await this.check();const token=new Contract(tokenAddress,tokenAbi,this.signer);await(await token.approve(this.vaultAddress,amount)).wait();await(await this.vault.deposit(tokenAddress,amount)).wait();}
 async tokenBalance(tokenAddress:string,address:string){await this.check();return await new Contract(tokenAddress,tokenAbi,this.signer).balanceOf(address) as bigint;}
 async availableBalance(tokenAddress:string){await this.check();return await this.vault.balances(await this.signer.getAddress(),tokenAddress) as bigint;}
}
export interface PaymentRail { name:string; settle(payment:SignedIntent):Promise<string>; }
export class CryptoSettlementRail implements PaymentRail {name='Crypto';constructor(private adapter:SettlementAdapter){} settle(p:SignedIntent){return this.adapter.settlePayment(p);} }
export class MockFiatRail implements PaymentRail {name='Mock fiat — simulation only';status:'idle'|'payout requested'|'payout processing'|'payout completed'='idle';async settle(_p:SignedIntent){this.status='payout requested';return 'DEMO-MOCK-PAYOUT';}process(){this.status='payout processing';}complete(){if(this.status!=='payout processing')throw new Error('Payout must be processing');this.status='payout completed';}}
export function localProvider(rpc:string){return new JsonRpcProvider(rpc,undefined,{staticNetwork:false,batchMaxCount:1,pollingInterval:200,cacheTimeout:-1});}
