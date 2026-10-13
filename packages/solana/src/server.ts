import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {OnlinePaymentSchema,type OnlinePaymentRequest,type OnlinePaymentResult} from './online';
import {SignedFxQuoteService} from './fx';
import {Connection,Keypair,PublicKey,Transaction,TransactionInstruction,SystemProgram,Ed25519Program,SYSVAR_INSTRUCTIONS_PUBKEY,SYSVAR_CLOCK_PUBKEY} from '@solana/web3.js';
import {TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID,getAssociatedTokenAddressSync,createTransferCheckedInstruction,createMintToInstruction,createAssociatedTokenAccountIdempotentInstruction} from '@solana/spl-token';
import {getBytes,sha256} from 'ethers';
import bs58 from 'bs58';
import {canonicalIntent,createSolanaDid,SolanaEnvelopeSchema,type SolanaSignedIntent,type SolanaOfflineSession} from './protocol';
import {assertTestCluster,assertSettlementAsset} from './network';
import {type SolanaDeployment,type SolanaHistoryPage} from './index';
export const PROGRAM_ID=new PublicKey('9iWAPSp9p9mbQ7LouMZEdt3qhtpnZGiaSyoCBSXDPYKg');
export function connection(rpc:string){return new Connection(rpc,{commitment:'confirmed',fetch:(url,options)=>fetch(url,options as RequestInit)});}
export const discriminator=(namespace:string,name:string)=>Buffer.from(getBytes(sha256(new TextEncoder().encode(`${namespace}:${name}`))).slice(0,8));
export function reservePda(owner:PublicKey,mint:PublicKey,program=PROGRAM_ID){return PublicKey.findProgramAddressSync([Buffer.from('reserve'),owner.toBuffer(),mint.toBuffer()],program)[0];}
export function allowancePda(reserve:PublicKey,sessionId:string,program=PROGRAM_ID){return PublicKey.findProgramAddressSync([Buffer.from('allowance'),reserve.toBuffer(),Buffer.from(getBytes(sessionId))],program)[0];}
export function receiptPda(allowance:PublicKey,nonce:string,program=PROGRAM_ID){return PublicKey.findProgramAddressSync([Buffer.from('receipt'),allowance.toBuffer(),Buffer.from(getBytes(nonce))],program)[0];}
const meta=(key:PublicKey,isWritable=false,isSigner=false)=>({pubkey:key,isWritable,isSigner});
const u64=(n:bigint|number)=>{const b=Buffer.alloc(8);b.writeBigUInt64LE(BigInt(n));return b;};
export function instruction(name:string,keys:ReturnType<typeof meta>[],data:Uint8Array=Buffer.alloc(0),program=PROGRAM_ID){return new TransactionInstruction({programId:program,keys,data:Buffer.concat([discriminator('global',name),Buffer.from(data)])});}
export function initializeIx(owner:PublicKey,mint:PublicKey,network:string,program=PROGRAM_ID){const reserve=reservePda(owner,mint,program);const vault=getAssociatedTokenAddressSync(mint,reserve,true);return instruction('initialize_reserve',[meta(owner,true,true),meta(mint),meta(reserve,true),meta(vault,true),meta(TOKEN_PROGRAM_ID),meta(ASSOCIATED_TOKEN_PROGRAM_ID),meta(SystemProgram.programId)],bs58.decode(network),program);}
export async function sendConfirmed(c:Connection,tx:Transaction,signers:Keypair[],beforeBroadcast?:(signature:string,bytes:Buffer)=>Promise<void>){
 const recent=await c.getLatestBlockhash('confirmed');tx.recentBlockhash=recent.blockhash;tx.feePayer=signers[0].publicKey;tx.sign(...signers);
 const bytes=tx.serialize();const signedSignature=bs58.encode(tx.signature!);await beforeBroadcast?.(signedSignature,bytes);let signature:string;try{signature=await c.sendRawTransaction(bytes,{skipPreflight:false,maxRetries:3});}catch(error){if(error instanceof Error&&/Simulation failed|Transaction simulation failed/i.test(error.message))throw error;throw new Error(`Confirmation pending: ${signedSignature}`);}
 for(let n=0;n<90;n++){let status;try{status=(await c.getSignatureStatuses([signature],{searchTransactionHistory:true})).value[0];}catch{throw new Error(`Confirmation pending: ${signature}`);}if(status?.err){const err=status.err as {InstructionError?:[number,{Custom?:number}]};const code=err.InstructionError?.[1]?.Custom;const ix=err.InstructionError?.[0];const names=['InvalidAmount','Arithmetic','InsufficientReserve','WrongSessionKey','Expired','InactiveAllowance','WrongOwner','WrongMerchant','WrongMint','WrongReserve','WrongAllowance','WrongDomain','AllowanceExceeded','InvalidSignature'];const name=ix!==undefined&&tx.instructions[ix]?.programId.equals(PROGRAM_ID)&&code!==undefined?names[code-6000]:undefined;throw new Error(name??`Solana transaction failed: ${JSON.stringify(status.err)}`);}if(status?.confirmationStatus==='confirmed'||status?.confirmationStatus==='finalized')return signature;if(await c.getBlockHeight('confirmed')>recent.lastValidBlockHeight)throw new Error('Solana transaction expired before confirmation');await new Promise(r=>setTimeout(r,500));}throw new Error(`Confirmation pending: ${signature}`);
}
async function accountData(c:Connection,key:PublicKey,name:string,program:PublicKey){const a=await c.getAccountInfo(key);if(!a||!a.owner.equals(program)||!a.data.subarray(0,8).equals(discriminator('account',name)))throw new Error(`${name} unavailable or wrong owner`);return a.data;}
export class SolanaDemoEngine {
 readonly c:Connection;readonly program:PublicKey;readonly mint:PublicKey;readonly reserve:PublicKey;readonly vault:PublicKey;
 constructor(readonly config:SolanaDeployment,readonly consumer:Keypair,readonly merchant:Keypair,readonly faucet:Keypair){this.c=connection(config.rpcUrl);this.program=new PublicKey(config.program);this.mint=new PublicKey(config.mint);this.reserve=new PublicKey(config.reserve);this.vault=new PublicKey(config.vault);if(consumer.publicKey.toBase58()!==config.consumer||merchant.publicKey.toBase58()!==config.merchant)throw new Error('Demo account mismatch');}
 private async domain(){assertTestCluster(this.config.network,this.config.cluster);assertSettlementAsset(this.config);if(await this.c.getGenesisHash()!==this.config.network)throw new Error('Wrong Solana cluster genesis hash');const program=await this.c.getAccountInfo(this.program);if(!program?.executable)throw new Error('ShimoPay program is not deployed');}
 private ownerAta(){return getAssociatedTokenAddressSync(this.mint,this.consumer.publicKey);}
 private merchantAta(){return getAssociatedTokenAddressSync(this.mint,this.merchant.publicKey);}
 fundingInstructions(amount=BigInt(this.config.offlineReserveAmount??'50000000')){assertSettlementAsset(this.config);const tx=new Transaction();const signers=[this.consumer];
  if(this.config.cluster==='localnet'){tx.add(createAssociatedTokenAccountIdempotentInstruction(this.consumer.publicKey,this.ownerAta(),this.consumer.publicKey,this.mint),createMintToInstruction(this.mint,this.ownerAta(),this.faucet.publicKey,100_000_000n));signers.push(this.faucet);}
  tx.add(instruction('deposit',[meta(this.consumer.publicKey,true,true),meta(this.reserve,true),meta(this.vault,true),meta(this.ownerAta(),true),meta(TOKEN_PROGRAM_ID)],u64(amount),this.program));return {tx,signers};
 }
 async fund(amount=BigInt(this.config.offlineReserveAmount??'50000000')){await this.domain();if(amount<=0n||amount>50_000_000n)throw new Error('Invalid reserve amount');if(this.config.cluster==='devnet'){const a=await this.c.getAccountInfo(this.ownerAta());const balance=a?BigInt((await this.c.getTokenAccountBalance(this.ownerAta())).value.amount):0n;if(balance<amount)throw new Error('Insufficient Circle Devnet USDC in consumer ATA');}const {tx,signers}=this.fundingInstructions(amount);return sendConfirmed(this.c,tx,signers);}

 // Fixed consumer/merchant test accounts only. Retrying a request never signs a second transfer.
 async payOnline(input:OnlinePaymentRequest):Promise<OnlinePaymentResult>{
  const payment=OnlinePaymentSchema.parse(input);await this.domain();
  const fingerprint=sha256(new TextEncoder().encode(JSON.stringify({network:this.config.network,generation:this.config.generation,merchant:this.config.merchant,mint:this.config.mint,amount:payment.amount,minor:payment.displayAmountMinor,quote:payment.quote.quoteId})));
  const dir=resolve(process.env.SHIMOPAY_SOLANA_KEY_DIR??'.solana','online-payments');await mkdir(dir,{recursive:true,mode:0o700});
  const path=resolve(dir,`${this.config.generation.replace(/[^a-zA-Z0-9]/g,'')}-${payment.requestId}.json`);
  type Record={fingerprint:string;signature:string;bytes:string;amount:string;displayAmountMinor:string;requestId:string;};
  let saved:Record|undefined;try{saved=JSON.parse(await readFile(path,'utf8'));}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
  if(saved){if(saved.fingerprint!==fingerprint)throw new Error('Idempotency conflict: request already binds another payment');const status=await this.status(saved.signature);if(status==='settled')return {signature:saved.signature,amount:saved.amount,displayAmountMinor:saved.displayAmountMinor,requestId:saved.requestId};if(status==='failed')throw new Error('Submitted online transaction failed; create a new payment');throw new Error(`Confirmation pending: ${saved.signature}`);}
  // A resumed sandbox can lose its local journal. Check the on-chain memo before signing again.
  const reference=`ShimoPay/online/v1:${payment.requestId}:`;let cursor:string|undefined;
  for(let page=0;page<5;page++){
   const signatures=await this.c.getSignaturesForAddress(this.ownerAta(),{limit:100,...(cursor?{before:cursor}:{})},'confirmed');
   const prior=signatures.find(item=>item.memo?.includes(reference));
   if(prior){
    if(prior.err)throw new Error('Submitted online transaction failed; create a new payment');
    if(!prior.memo?.trim().endsWith(`${reference}BRL:${payment.displayAmountMinor}`))throw new Error('Idempotency conflict: on-chain reference binds another BRL amount');
    const tx=await this.c.getParsedTransaction(prior.signature,{maxSupportedTransactionVersion:0});
    if(!tx?.meta||tx.meta.err)throw new Error('Confirmation pending: '+prior.signature);
    const keys=tx.transaction.message.accountKeys.map(k=>k.pubkey.toBase58());
    const delta=(owner:string)=>{const index=keys.indexOf(owner);const pre=tx.meta!.preTokenBalances?.find(t=>t.accountIndex===index&&t.mint===this.config.mint);const post=tx.meta!.postTokenBalances?.find(t=>t.accountIndex===index&&t.mint===this.config.mint);return BigInt(post?.uiTokenAmount.amount??'0')-BigInt(pre?.uiTokenAmount.amount??'0');};
    if(delta(this.ownerAta().toBase58())!==-BigInt(payment.amount)||delta(this.merchantAta().toBase58())!==BigInt(payment.amount))throw new Error('Idempotency conflict: on-chain transfer amount mismatch');
    return {signature:prior.signature,amount:payment.amount,displayAmountMinor:payment.displayAmountMinor,requestId:payment.requestId};
   }
   if(signatures.length<100||(signatures.at(-1)?.blockTime??0)<payment.quote.issuedAt-120)break;
   if(page===4)throw new Error('Cannot establish safe idempotency beyond recovery window; review history before a new payment');
   cursor=signatures.at(-1)!.signature;
  }
  SignedFxQuoteService.validate(payment.quote,Math.floor(Date.now()/1000),this.config.fxSigner!);
  const expected=SignedFxQuoteService.convert(BigInt(payment.displayAmountMinor),payment.quote,Math.floor(Date.now()/1000),this.config.fxSigner!);
  if(expected!==BigInt(payment.amount))throw new Error('Online FX amount mismatch: refresh quote before paying');
  const available=(await this.state()).walletBalance;if(BigInt(available)<expected)throw new Error('Insufficient unreserved wallet balance. Escrow funds are not spent by online payments.');
  const tx=new Transaction().add(createAssociatedTokenAccountIdempotentInstruction(this.consumer.publicKey,this.merchantAta(),this.merchant.publicKey,this.mint),createTransferCheckedInstruction(this.ownerAta(),this.mint,this.merchantAta(),this.consumer.publicKey,expected,6));
  // The reference is searchable on-chain. It is not a session authorization or an offline intent.
  tx.add(new TransactionInstruction({programId:new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),keys:[],data:Buffer.from(`ShimoPay/online/v1:${payment.requestId}:BRL:${payment.displayAmountMinor}`)}));
  const signature=await sendConfirmed(this.c,tx,[this.consumer],async(signature,bytes)=>{
   const record:Record={fingerprint,signature,bytes:bytes.toString('base64'),amount:payment.amount,displayAmountMinor:payment.displayAmountMinor,requestId:payment.requestId};
   const temp=`${path}.tmp`;await writeFile(temp,JSON.stringify(record),{mode:0o600});await rename(temp,path);
  });
  return {signature,amount:payment.amount,displayAmountMinor:payment.displayAmountMinor,requestId:payment.requestId};
 }
 async createAllowance(id:string,signer:string,amount:bigint,expiresAt:number){await this.domain();const clock=await this.c.getAccountInfo(SYSVAR_CLOCK_PUBKEY);if(!clock)throw new Error('Solana clock unavailable');expiresAt=Math.min(expiresAt,Number(clock.data.readBigInt64LE(32))+86400-2);const allowance=allowancePda(this.reserve,id,this.program);const tx=new Transaction().add(instruction('create_allowance',[meta(this.consumer.publicKey,true,true),meta(this.reserve,true),meta(allowance,true),meta(SystemProgram.programId)],Buffer.concat([new PublicKey(signer).toBuffer(),Buffer.from(getBytes(id)),u64(amount),u64(expiresAt)]),this.program));const signature=await sendConfirmed(this.c,tx,[this.consumer]);return {signature,session:await this.session(allowance.toBase58())};}
 async session(id:string):Promise<SolanaOfflineSession>{const key=new PublicKey(id);const d=await accountData(this.c,key,'OfflineAllowance',this.program);const pk=(o:number)=>new PublicKey(d.subarray(o,o+32)).toBase58();const owner=pk(8),signer=pk(40),reserve=pk(72);if(reserve!==this.config.reserve||owner!==this.config.consumer)throw new Error('Wrong cached reserve');return {id,owner,sessionSigner:signer,reserve,token:this.config.mint,sessionId:'0x'+d.subarray(104,136).toString('hex'),maxAmount:d.readBigUInt64LE(136).toString(),spentAmount:d.readBigUInt64LE(144).toString(),expiresAt:Number(d.readBigInt64LE(152)),active:d[160]===1,network:this.config.network,program:this.config.program,cachedAt:Math.floor(Date.now()/1000),payerDid:createSolanaDid(this.config.network,owner),deviceDid:createSolanaDid(this.config.network,signer)};}
 settlementInstructions(payment:SolanaSignedIntent,merchant=this.merchant.publicKey){const p=SolanaEnvelopeSchema.parse(payment),i=p.intent;const allowance=new PublicKey(i.allowance);const receipt=receiptPda(allowance,i.nonce,this.program);const merchantToken=getAssociatedTokenAddressSync(this.mint,merchant);const canonical=canonicalIntent(i);const verify=Ed25519Program.createInstructionWithPublicKey({publicKey:bs58.decode(i.sessionPublicKey),message:canonical,signature:bs58.decode(p.signature)});verify.data=verify.data.subarray(0,112);verify.data.writeUInt16LE(8,10);verify.data.writeUInt16LE(2,14);return [createAssociatedTokenAccountIdempotentInstruction(merchant,merchantToken,merchant,this.mint),verify,instruction('settle',[meta(merchant,true,true),meta(this.reserve),meta(allowance,true),meta(this.vault,true),meta(merchantToken,true),meta(receipt,true),meta(SYSVAR_INSTRUCTIONS_PUBKEY),meta(TOKEN_PROGRAM_ID),meta(SystemProgram.programId)],canonical,this.program)];}
 async recycleTestFunds(amount:bigint){
  await this.domain();if(this.config.cluster!=='devnet'||amount<=0n||amount>10_000_000n)throw new Error('Only bounded Devnet test-token recycling is allowed');
  const balance=BigInt((await this.c.getTokenAccountBalance(this.merchantAta())).value.amount);if(balance<amount)throw new Error('Demo merchant has insufficient test USDC');
  return sendConfirmed(this.c,new Transaction().add(createTransferCheckedInstruction(this.merchantAta(),this.mint,this.ownerAta(),this.merchant.publicKey,amount,6)),[this.merchant]);
 }
 async paymentStatus(payment:SolanaSignedIntent){
  await this.domain();const i=SolanaEnvelopeSchema.parse(payment).intent;
  if(i.network!==this.config.network||i.program!==this.config.program||i.reserve!==this.config.reserve||i.currencyMint!==this.config.mint||i.consumer!==this.config.consumer||i.merchant!==this.config.merchant)throw new Error('Receipt domain mismatch');
  const receipt=receiptPda(new PublicKey(i.allowance),i.nonce,this.program);const account=await this.c.getAccountInfo(receipt);
  if(!account)return {status:'pending' as const};
  if(!account.owner.equals(this.program)||!account.data.subarray(0,8).equals(discriminator('account','SettlementReceipt'))||!account.data.subarray(8,40).equals(Buffer.from(getBytes(sha256(canonicalIntent(i))))))throw new Error('Receipt intent mismatch');
  const signatures=await this.c.getSignaturesForAddress(receipt,{limit:5});const confirmed=signatures.find(s=>!s.err);
  return {status:'settled' as const,signature:confirmed?.signature,confirmedAt:Number(account.data.readBigInt64LE(144))};
 }
 async settle(payment:SolanaSignedIntent){await this.domain();const i=SolanaEnvelopeSchema.parse(payment).intent;const receipt=receiptPda(new PublicKey(i.allowance),i.nonce,this.program);if(await this.c.getAccountInfo(receipt))throw new Error('NonceAlreadyUsed: settlement receipt already exists');return sendConfirmed(this.c,new Transaction().add(...this.settlementInstructions(payment)),[this.merchant]);}
 async cancel(id:string){await this.domain();return sendConfirmed(this.c,new Transaction().add(instruction('cancel_allowance',[meta(this.consumer.publicKey,false,true),meta(this.reserve,true),meta(new PublicKey(id),true)],Buffer.alloc(0),this.program)),[this.consumer]);}
 async state(){await this.domain();const d=await accountData(this.c,this.reserve,'UserReserve',this.program);const balance=async(k:PublicKey)=>{if(!await this.c.getAccountInfo(k))return 0n;return BigInt((await this.c.getTokenAccountBalance(k)).value.amount);};const [owner,merchant,vault]=await Promise.all([balance(this.ownerAta()),balance(this.merchantAta()),balance(this.vault)]);return {balance:(owner+vault).toString(),merchantBalance:merchant.toString(),reserveBalance:vault.toString(),availableReserve:d.readBigUInt64LE(144).toString(),walletBalance:owner.toString()};}
 async history(before?:string,scope:'reserve'|'wallet'='reserve'):Promise<SolanaHistoryPage>{await this.domain();const items=await this.c.getSignaturesForAddress(scope==='wallet'?this.ownerAta():this.reserve,{limit:20,...(before?{before}:{})},'confirmed');return {cluster:this.config.cluster,reserve:this.config.reserve,entries:items.map(i=>({signature:i.signature,slot:i.slot,blockTime:i.blockTime??null,status:i.err?'failed':i.confirmationStatus==='finalized'?'finalized':'confirmed'})),nextCursor:items.length===20?items.at(-1)!.signature:null};}
 async status(signature:string){const s=(await this.c.getSignatureStatuses([signature],{searchTransactionHistory:true})).value[0];return !s?'pending':s.err?'failed':s.confirmationStatus==='confirmed'||s.confirmationStatus==='finalized'?'settled':'pending';}
}
