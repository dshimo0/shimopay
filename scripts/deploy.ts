import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { ContractFactory, JsonRpcProvider, Wallet } from 'ethers';
const sepolia=process.argv.includes('--sepolia');
const rpc=sepolia?process.env.SEPOLIA_RPC_URL:process.env.EVM_RPC_URL??'http://127.0.0.1:8545';
if(!rpc)throw new Error('SEPOLIA_RPC_URL required');
const provider=new JsonRpcProvider(rpc,undefined,{batchMaxCount:1,cacheTimeout:-1});
const chainId=Number((await provider.getNetwork()).chainId);
if(sepolia&&chainId!==11155111)throw new Error('Sepolia only');
if(!sepolia&&chainId===1)throw new Error('Mainnet prohibited');
if(sepolia&&!process.env.DEPLOYER_PRIVATE_KEY)throw new Error('DEPLOYER_PRIVATE_KEY required for Sepolia');
const signer=process.env.DEPLOYER_PRIVATE_KEY?new Wallet(process.env.DEPLOYER_PRIVATE_KEY,provider):await provider.getSigner(0);
async function deploy(name:string){const a=JSON.parse(await readFile(`packages/contracts/artifacts/contracts/${name}.sol/${name}.json`,'utf8'));const c=await new ContractFactory(a.abi,a.bytecode,signer).deploy();await c.waitForDeployment();return await c.getAddress();}
const token=await deploy('MockUSDC'),vault=await deploy('OfflineEscrowVault');
const config={chainId,token,vault,rpcUrl:rpc,consumer:await signer.getAddress(),merchant:!sepolia?(await provider.getSigner(1)).address:'',deployedAt:new Date().toISOString()};
await mkdir('apps/web/public',{recursive:true});
// Public deployment metadata, never private keys. Local rpc URL must not contain credentials.
const publicConfig={...config,rpcUrl:sepolia?'':process.env.DEMO_HOSTED_MODE==='1'?'/api/demo-rpc':rpc};
await writeFile(`apps/web/public/deployment${sepolia?'-sepolia':''}.json`,JSON.stringify(publicConfig,null,2));
console.log(JSON.stringify(publicConfig,null,2));
