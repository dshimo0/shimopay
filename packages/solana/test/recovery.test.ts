import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Keypair} from '@solana/web3.js';
import {getAssociatedTokenAddressSync} from '@solana/spl-token';
import {SolanaDemoEngine} from '../src/server';
import {SignedFxQuoteService,SOLANA_DEVNET_GENESIS,CIRCLE_DEVNET_USDC_MINT,type SolanaDeployment} from '../src';
test('lost online journal recovers the exact confirmed transfer from its memo without signing again',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'shimopay-recovery-'));const previous=process.env.SHIMOPAY_SOLANA_KEY_DIR;process.env.SHIMOPAY_SOLANA_KEY_DIR=directory;
 try{
 const consumer=Keypair.generate(),merchant=Keypair.generate(),issuer=Keypair.generate();const config={cluster:'devnet',network:SOLANA_DEVNET_GENESIS,mint:CIRCLE_DEVNET_USDC_MINT,assetKind:'circle-devnet-usdc',program:'9iWAPSp9p9mbQ7LouMZEdt3qhtpnZGiaSyoCBSXDPYKg',consumer:consumer.publicKey.toBase58(),merchant:merchant.publicKey.toBase58(),reserve:Keypair.generate().publicKey.toBase58(),vault:Keypair.generate().publicKey.toBase58(),generation:'recovery-fixture',fxSigner:issuer.publicKey.toBase58(),rpcUrl:'http://unused.invalid'} as SolanaDeployment;
 const engine=new SolanaDemoEngine(config,consumer,merchant,issuer);const requestId=crypto.randomUUID();const q=SignedFxQuoteService.issue(Math.floor(Date.now()/1000)-2000,issuer.secretKey.slice(0,32));
 const request={requestId,displayAmountMinor:'2500',amount:'4545455',quote:q};
 engine.c.getGenesisHash=async()=>SOLANA_DEVNET_GENESIS;
 engine.c.getAccountInfo=async()=>({executable:true,data:Buffer.alloc(0),owner:consumer.publicKey,lamports:1,rentEpoch:0});
 engine.c.getSignaturesForAddress=async()=>[{signature:'confirmed-fixture-signature',memo:`[0] ShimoPay/online/v1:${requestId}:BRL:2500`,err:null,slot:1,blockTime:q.issuedAt+1,confirmationStatus:'confirmed'}];
 const ownerAta=getAssociatedTokenAddressSync(engine.mint,consumer.publicKey),merchantAta=getAssociatedTokenAddressSync(engine.mint,merchant.publicKey);
 const token=(index:number,amount:string)=>({accountIndex:index,mint:CIRCLE_DEVNET_USDC_MINT,uiTokenAmount:{amount,decimals:6,uiAmount:null}});
 engine.c.getParsedTransaction=async()=>({slot:1,transaction:{signatures:[],message:{recentBlockhash:consumer.publicKey.toBase58(),instructions:[],accountKeys:[{pubkey:ownerAta,signer:false,writable:true},{pubkey:merchantAta,signer:false,writable:true}]}},meta:{err:null,fee:0,preBalances:[],postBalances:[],preTokenBalances:[token(0,'5000000'),token(1,'0')],postTokenBalances:[token(0,'454545'),token(1,'4545455')]}});
 engine.c.sendRawTransaction=async()=>{throw new Error('Recovery must not sign or send another transaction');};
 assert.equal((await engine.payOnline(request)).signature,'confirmed-fixture-signature');
 await assert.rejects(engine.payOnline({...request,amount:'4545456'}),/Idempotency conflict/);
 await assert.rejects(engine.payOnline({...request,displayAmountMinor:'250'}),/Idempotency conflict/);
 console.log('Verified missing-journal recovery and amount/BRL conflicts without sending a transaction');
 }finally{if(previous===undefined)delete process.env.SHIMOPAY_SOLANA_KEY_DIR;else process.env.SHIMOPAY_SOLANA_KEY_DIR=previous;await rm(directory,{recursive:true,force:true});}
});
