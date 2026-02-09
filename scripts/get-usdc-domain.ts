import { JsonRpcProvider, Contract } from 'ethers';

const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const RPC_URL = 'https://sepolia.base.org';

const ABI = [
  'function name() view returns (string)',
  'function version() view returns (string)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)',
];

async function main() {
  const provider = new JsonRpcProvider(RPC_URL);
  const contract = new Contract(USDC_ADDRESS, ABI, provider);

  console.log('Base Sepolia USDC Domain Parameters:');
  console.log('====================================');
  
  const name = await contract.name();
  console.log('name:', name);
  
  try {
    const version = await contract.version();
    console.log('version:', version);
  } catch (e) {
    console.log('version: (function not available)');
  }
  
  const domainSeparator = await contract.DOMAIN_SEPARATOR();
  console.log('DOMAIN_SEPARATOR:', domainSeparator);
  console.log('chainId: 84532');
  console.log('verifyingContract:', USDC_ADDRESS);
}

main().catch(console.error);
