import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {Keypair} from '@solana/web3.js';
await mkdir('.solana',{recursive:true});
let key:Keypair;try{key=Keypair.fromSecretKey(Uint8Array.from(JSON.parse(await readFile('.solana/program.json','utf8'))));}catch{key=Keypair.generate();await writeFile('.solana/program.json',JSON.stringify([...key.secretKey]),{mode:0o600});}
const id=key.publicKey.toBase58();
for(const path of ['programs/shimopay/src/lib.rs','Anchor.toml','packages/solana/src/server.ts']){let text=await readFile(path,'utf8');if(path.endsWith('lib.rs'))text=text.replace(/declare_id!\("[^"]+"\)/,`declare_id!("${id}")`);else if(path.endsWith('toml'))text=text.replace(/shimopay_solana = "[^"]+"/g,`shimopay_solana = "${id}"`);else text=text.replace(/export const PROGRAM_ID=new PublicKey\('[^']+'\)/,`export const PROGRAM_ID=new PublicKey('${id}')`);await writeFile(path,text);}
console.log('Program ID:',id,'— build before deploying. Private key remains in ignored .solana/.');
