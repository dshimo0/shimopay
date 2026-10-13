import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {Keypair} from '@solana/web3.js';
import {NextResponse,type NextRequest} from 'next/server';
import {z} from 'zod';
import {SolanaDemoEngine} from '@shimopay/solana/server';
import {OnlinePaymentSchema,SignedFxQuoteService,SolanaEnvelopeSchema,type SolanaDeployment} from '@shimopay/solana';
export const runtime='nodejs';
export const dynamic='force-dynamic';
let enginePromise:Promise<SolanaDemoEngine>|null=null;
const address=z.string().min(32).max(44);
const Action=z.discriminatedUnion('action',[
 z.object({action:z.literal('recycle'),amount:z.string().regex(/^[1-9][0-9]*$/).refine(v=>BigInt(v)<=10_000_000n)}).strict(),
 z.object({action:z.literal('receipt'),payment:SolanaEnvelopeSchema}).strict(),
 z.object({action:z.literal('fxQuote')}).strict(),
 z.object({action:z.literal('payOnline'),payment:OnlinePaymentSchema}).strict(),
 z.object({action:z.literal('history'),scope:z.enum(['reserve','wallet']).default('reserve'),before:z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{80,90}$/).optional()}).strict(),
 z.object({action:z.literal('fund'),amount:z.string().regex(/^[1-9][0-9]*$/).refine(v=>BigInt(v)<=50_000_000n).optional()}).strict(),z.object({action:z.literal('state')}).strict(),
 z.object({action:z.literal('allowance'),id:z.string().regex(/^0x[0-9a-f]{64}$/),signer:address,amount:z.string().regex(/^[1-9][0-9]*$/).refine(v=>BigInt(v)<=50_000_000n),expiresAt:z.number().int().positive()}).strict(),
 z.object({action:z.literal('session'),id:address}).strict(),z.object({action:z.literal('cancel'),id:address}).strict(),
 z.object({action:z.literal('settle'),payment:SolanaEnvelopeSchema}).strict(),z.object({action:z.literal('status'),signature:z.string().min(80).max(90)}).strict()
]);
async function engine(){if(!enginePromise)enginePromise=(async()=>{const config=JSON.parse(await readFile(resolve(process.cwd(),'public/deployment.json'),'utf8')) as SolanaDeployment;const dir=process.env.SHIMOPAY_SOLANA_KEY_DIR??resolve(process.cwd(),'../../.solana');let rpcUrl=config.rpcUrl;try{const serverConfig=JSON.parse(await readFile(resolve(dir,`${config.cluster==='devnet'?'devnet':'local'}-deployment.json`),'utf8')) as SolanaDeployment;if(serverConfig.generation===config.generation)rpcUrl=serverConfig.rpcUrl;}catch{}const keys=await Promise.all(['consumer','merchant','deployer'].map(async name=>Keypair.fromSecretKey(Uint8Array.from(JSON.parse(await readFile(resolve(dir,`${name}.json`),'utf8'))))));return new SolanaDemoEngine({...config,rpcUrl:(config.cluster==='devnet'?process.env.SOLANA_RPC_URL:process.env.SOLANA_LOCAL_RPC_URL)??rpcUrl},...keys as [Keypair,Keypair,Keypair]);})();return enginePromise;}
let pending=false;
export async function POST(req:NextRequest){
 const origin=req.headers.get('origin');if(origin&&new URL(origin).host!==req.headers.get('host'))return NextResponse.json({error:'Cross-origin requests rejected'},{status:403});
 if(Number(req.headers.get('content-length')??0)>16384)return NextResponse.json({error:'Payload too large'},{status:413});
 try{const raw=await req.text();if(raw.length>16384)throw new Error('Payload too large');const a=Action.parse(JSON.parse(raw));const e=await engine();
 if(['recycle','fund','allowance','settle','cancel','payOnline'].includes(a.action)&&pending)throw new Error('Another demo transaction is pending. Try again shortly.');
 const mutate=['recycle','fund','allowance','settle','cancel','payOnline'].includes(a.action);if(mutate)pending=true;
 try{switch(a.action){case 'recycle':return NextResponse.json({signature:await e.recycleTestFunds(BigInt(a.amount))});case 'receipt':return NextResponse.json(await e.paymentStatus(a.payment));case 'payOnline':return NextResponse.json(await e.payOnline(a.payment));case 'fxQuote':{const dir=process.env.SHIMOPAY_SOLANA_KEY_DIR??resolve(process.cwd(),'../../.solana');const signer=Keypair.fromSecretKey(Uint8Array.from(JSON.parse(await readFile(resolve(dir,'fx-signer.json'),'utf8'))));if(signer.publicKey.toBase58()!==e.config.fxSigner)throw new Error('FX issuer mismatch');return NextResponse.json(SignedFxQuoteService.issue(Math.floor(Date.now()/1000),signer.secretKey.slice(0,32)));}case 'fund':return NextResponse.json({signature:await e.fund(a.amount?BigInt(a.amount):undefined)});case 'history':return NextResponse.json(await e.history(a.before,a.scope));case 'state':return NextResponse.json(await e.state());case 'allowance':return NextResponse.json(await e.createAllowance(a.id,a.signer,BigInt(a.amount),a.expiresAt));case 'session':return NextResponse.json(await e.session(a.id));case 'settle':return NextResponse.json({signature:await e.settle(a.payment)});case 'cancel':return NextResponse.json({signature:await e.cancel(a.id)});case 'status':return NextResponse.json({status:await e.status(a.signature)});}}finally{if(mutate)pending=false;}
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Solana demo request failed'},{status:400});}
}
