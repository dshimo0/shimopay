import { openDB } from 'idb';
import { Wallet } from 'ethers';
export interface EncryptedKey { salt:number[]; iv:number[]; ciphertext:number[]; iterations:number; version:1; }
const iterations=310_000;
async function derive(password:string,salt:Uint8Array,usage:KeyUsage[]) {
 if(password.length<10) throw new Error('Use a password with at least 10 characters');
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt:Uint8Array.from(salt),iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,usage);
}
export async function encryptSessionKey(privateKey:string,password:string):Promise<EncryptedKey> {
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const key=await derive(password,salt,['encrypt']);
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('ShimoPay/session/v1')},key,new TextEncoder().encode(privateKey));
 return {version:1,salt:[...salt],iv:[...iv],ciphertext:[...new Uint8Array(ciphertext)],iterations};
}
export async function decryptSessionKey(record:EncryptedKey,password:string) {
 if(record.version!==1 || record.iterations!==iterations) throw new Error('Unsupported encrypted wallet');
 const key=await derive(password,Uint8Array.from(record.salt),['decrypt']);
 try { const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:Uint8Array.from(record.iv),additionalData:new TextEncoder().encode('ShimoPay/session/v1')},key,Uint8Array.from(record.ciphertext)); return new TextDecoder().decode(bytes); } catch { throw new Error('Incorrect password or damaged wallet'); }
}
const db=()=>openDB('shimopay-v1',1,{upgrade(db){db.createObjectStore('records');}});
export async function readRecord<T>(key:string):Promise<T|undefined> {return (await db()).get('records',key);}
export async function writeRecord(key:string,value:unknown) {return (await db()).put('records',value,key);}
export async function removeRecord(key:string) {return (await db()).delete('records',key);}
export class OfflineWallet {
 private signer:Wallet|null=null;
 async create(password:string) { const wallet=Wallet.createRandom(); const record=await encryptSessionKey(wallet.privateKey,password); await writeRecord('encrypted-session-key',record); this.signer=new Wallet(wallet.privateKey); return wallet.address; }
 lockOfflineWallet(){this.signer=null;}
 async unlockOfflineWallet(password:string) {const record=await readRecord<EncryptedKey>('encrypted-session-key'); if(!record) throw new Error('No offline wallet'); this.signer=new Wallet(await decryptSessionKey(record,password)); return this.signer.address;}
 getSigner(){if(!this.signer) throw new Error('Offline wallet is locked');return this.signer;}
 async deleteKey(){this.lockOfflineWallet();await removeRecord('encrypted-session-key');}
}
// JS cannot guarantee memory zeroization. MVP only; use OS keystore/TEE in production.
