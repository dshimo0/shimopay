import type {NextConfig} from 'next';
const config:NextConfig={transpilePackages:['@shimopay/protocol','@shimopay/sdk','@shimopay/solana'],devIndicators:false,experimental:{useTypeScriptCli:false}};
export default config;
