import { JsonRpcProvider, Contract } from 'ethers';

const NETWORKS = [
  { name: 'Avalanche Fuji', rpc: 'https://api.avax-test.network/ext/bc/C/rpc', usdc: '0x5425890298aed601595a70AB815c96711a31Bc65', chainId: 43113 },
  { name: 'Ethereum Sepolia', rpc: 'https://eth-sepolia.public.blastapi.io', usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', chainId: 11155111 },
  { name: 'Base Sepolia', rpc: 'https://sepolia.base.org', usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', chainId: 84532 },
  { name: 'Polygon Amoy', rpc: 'https://rpc-amoy.polygon.technology', usdc: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', chainId: 80002 },
];

const ABI = ['function name() view returns (string)', 'function version() view returns (string)'];

async function check(net: typeof NETWORKS[0]) {
  try {
    const provider = new JsonRpcProvider(net.rpc);
    const contract = new Contract(net.usdc, ABI, provider);
    const name = await contract.name();
    const version = await contract.version();
    console.log(`\n${net.name}:`);
    console.log(`  name: "${name}"`);
    console.log(`  version: "${version}"`);
    console.log(`  chainId: ${net.chainId}`);
    console.log(`  verifyingContract: "${net.usdc}"`);
  } catch (e: any) {
    console.log(`\n${net.name}: Error - ${e.message}`);
  }
}

async function main() {
  console.log('USDC EIP-712 Domain Parameters:');
  console.log('================================');
  for (const net of NETWORKS) {
    await check(net);
  }
}

main();
