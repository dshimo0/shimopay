export const CIRCLE_DEVNET_USDC_MINT='4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
export const SOLANA_DEVNET_GENESIS='EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG';
export const SOLANA_MAINNET_GENESIS='5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';
export function assertTestCluster(network:string,cluster:'devnet'|'localnet'){
 if(cluster==='devnet'&&network!==SOLANA_DEVNET_GENESIS)throw new Error('Expected Solana Devnet genesis; refusing another network');
 if(cluster==='localnet'&&(network===SOLANA_DEVNET_GENESIS||network.startsWith(SOLANA_MAINNET_GENESIS)||network.startsWith('4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z')))throw new Error('Local test mode refuses public Solana networks');
}
export function assertSettlementAsset(config:{cluster:'devnet'|'localnet';mint:string;assetKind?:string}){
 if(config.cluster==='devnet'&&(config.mint!==CIRCLE_DEVNET_USDC_MINT||config.assetKind!=='circle-devnet-usdc'))throw new Error('Devnet settlement requires the official Circle USDC mint; private mock mints are refused');
 if(config.cluster==='localnet'&&config.assetKind==='circle-devnet-usdc')throw new Error('Circle Devnet USDC cannot be claimed on localnet');
}
