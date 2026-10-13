import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { network } from 'hardhat';
import { Wallet, ZeroAddress, hexlify, randomBytes } from 'ethers';
import { intentTypes, protocolDomain } from '../../protocol/src/index.js';
const randomId=()=>hexlify(randomBytes(32));
async function fixture(amount=50_000_000n) {
 const {ethers}=await network.create();
 const [owner,merchant,other]=await ethers.getSigners();
 const token=await ethers.deployContract('MockUSDC'); const vault=await ethers.deployContract('OfflineEscrowVault');
 await token.mint(owner.address,100_000_000n); await token.approve(vault.target,100_000_000n); await vault.deposit(token.target,100_000_000n);
 const signer=Wallet.createRandom(); const id=randomId(); const now=(await ethers.provider.getBlock('latest'))!.timestamp;
 await vault.createSession(id,signer.address,token.target,amount,now+86400,ZeroAddress);
 const intent={sessionId:id,payer:owner.address,merchant:merchant.address,settlementToken:String(token.target),settlementAmount:4_545_455n,displayCurrency:'BRL',displayAmountMinor:2500n,fxQuoteId:randomId(),sequence:1n,nonce:randomId(),createdAt:now,expiresAt:now+3600};
 const domain=protocolDomain(31337,String(vault.target));
 const sign=(p= intent,w=signer)=>w.signTypedData(domain,intentTypes,p);
 const settle=async(p=intent,sig?:string)=>vault.connect(merchant).settlePayment(p,sig??await sign(p));
 return {ethers,owner,merchant,other,token,vault,signer,id,now,intent,sign,settle};
}
async function rejects(p:Promise<unknown>,name:string) { await assert.rejects(p, new RegExp(name)); }
describe('OfflineEscrowVault',()=>{
 it('deposit and reservation conserve funds',async()=>{const f=await fixture(); assert.equal(await f.vault.balances(f.owner.address,f.token.target),50_000_000n); assert.equal((await f.vault.getSession(f.id)).maxAmount,50_000_000n);});
 it('cannot reserve over available balance',async()=>{const f=await fixture(); await rejects(f.vault.createSession(randomId(),f.signer.address,f.token.target,51_000_000n,f.now+5000,ZeroAddress),'InsufficientBalance');});
 it('rejects owner as offline signer',async()=>{const f=await fixture(); await rejects(f.vault.createSession(randomId(),f.owner.address,f.token.target,1n,f.now+5000,ZeroAddress),'InvalidSession');});
 it('valid payment transfers tokens and updates spent',async()=>{const f=await fixture(); await f.settle(); assert.equal(await f.token.balanceOf(f.merchant.address),4_545_455n); assert.equal((await f.vault.getSession(f.id)).spentAmount,4_545_455n); assert.equal(await f.vault.remainingAmount(f.id),45_454_545n);});
 it('rejects replayed nonce',async()=>{const f=await fixture(); const sig=await f.sign(); await f.settle(f.intent,sig); await rejects(f.settle(f.intent,sig),'NonceAlreadyUsed');});
 it('rejects reused sequence with different nonce',async()=>{const f=await fixture(); await f.settle(); const p={...f.intent,nonce:randomId()}; await rejects(f.settle(p),'SequenceAlreadyUsed');});
 it('rejects tampered signed amount',async()=>{const f=await fixture(); await rejects(f.settle({...f.intent,displayAmountMinor:25000n},await f.sign()),'InvalidSignature');});
 it('rejects wrong session signer',async()=>{const f=await fixture(); await rejects(f.settle(f.intent,await f.sign(f.intent,Wallet.createRandom())),'InvalidSignature');});
 it('rejects malformed signature',async()=>{const f=await fixture(); await assert.rejects(f.settle(f.intent,'0x1234'));});
 it('rejects expired intent',async()=>{const f=await fixture(); const p={...f.intent,createdAt:f.now-20,expiresAt:f.now-1}; await rejects(f.settle(p),'IntentExpired');});
 it('rejects expired session',async()=>{const f=await fixture(); await f.ethers.provider.send('evm_increaseTime',[86401]); await f.ethers.provider.send('evm_mine',[]); await rejects(f.settle(),'SessionExpiredError');});
 it('rejects wrong merchant caller',async()=>{const f=await fixture(); await rejects(f.vault.connect(f.other).settlePayment(f.intent,await f.sign()),'WrongMerchant');});
 it('bounds double spending: first 8 succeeds, second 8 rejected for 10 escrow',async()=>{const f=await fixture(10_000_000n); const a={...f.intent,settlementAmount:8_000_000n}; const b={...a,sequence:2n,nonce:randomId()}; const sa=await f.sign(a),sb=await f.sign(b); await f.settle(a,sa); await rejects(f.settle(b,sb),'InsufficientSessionBalance'); assert.equal(await f.token.balanceOf(f.merchant.address),8_000_000n);});
 it('cancel releases unspent balance, rejects pending intents and permits withdrawal',async()=>{const f=await fixture(); await f.settle(); await f.vault.cancelSession(f.id); assert.equal(await f.vault.balances(f.owner.address,f.token.target),95_454_545n); assert.equal(await f.vault.remainingAmount(f.id),0n); await rejects(f.settle(),'SessionInactive'); await f.vault.withdraw(f.token.target,95_454_545n); assert.equal(await f.token.balanceOf(f.owner.address),95_454_545n);});
 it('non-owner cannot cancel',async()=>{const f=await fixture(); await rejects(f.vault.connect(f.other).cancelSession(f.id),'NotOwner');});
 it('expiry release is permissionless and cannot happen early',async()=>{const f=await fixture(); await rejects(f.vault.closeExpiredSession(f.id),'NotExpired'); await f.ethers.provider.send('evm_increaseTime',[86401]); await f.ethers.provider.send('evm_mine',[]); await f.vault.connect(f.other).closeExpiredSession(f.id); assert.equal(await f.vault.balances(f.owner.address,f.token.target),100_000_000n);});
 it('rejects wrong token / owner bindings',async()=>{const f=await fixture(); await rejects(f.settle({...f.intent,payer:f.other.address}),'InvalidIntent'); await rejects(f.settle({...f.intent,settlementToken:ZeroAddress}),'InvalidIntent');});
 it('binds domain to chain and vault',async()=>{const f=await fixture(); const sig=await f.signer.signTypedData(protocolDomain(11155111,String(f.vault.target)),intentTypes,f.intent); await rejects(f.settle(f.intent,sig),'InvalidSignature');});
 it('enforces merchant restriction',async()=>{const f=await fixture(); const id=randomId(); await f.vault.createSession(id,f.signer.address,f.token.target,10_000_000n,f.now+5000,f.other.address); await rejects(f.settle({...f.intent,sessionId:id}),'WrongMerchant');});
});
it('token callback cannot reenter vault withdrawal',async()=>{
 const {ethers}=await network.create(); const [owner]=await ethers.getSigners();
 const token=await ethers.deployContract('ReentrantToken'); const vault=await ethers.deployContract('OfflineEscrowVault');
 await token.setVault(vault.target); await token.mint(token.target,1n); await token.prime(); await token.mint(owner.address,100n); await token.approve(vault.target,100n); await vault.deposit(token.target,100n); await vault.withdraw(token.target,100n);
 assert.equal(await token.blocked(),true); assert.equal(await token.balanceOf(owner.address),100n); assert.equal(await vault.balances(token.target,token.target),1n);
});
