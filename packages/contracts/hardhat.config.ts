import { defineConfig } from 'hardhat/config';
import hardhatEthers from '@nomicfoundation/hardhat-ethers';
import nodeTest from '@nomicfoundation/hardhat-node-test-runner';
export default defineConfig({ plugins: [hardhatEthers, nodeTest], solidity: { version: '0.8.28', settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'paris' } } });
