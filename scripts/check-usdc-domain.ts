/**
 * Check USDC ERC-3009 Support and EIP-712 Domain
 *
 * This script checks if USDC contracts support ERC-3009 transferWithAuthorization
 * and retrieves the correct EIP-712 domain parameters.
 */

import { JsonRpcProvider, Contract } from 'ethers';

// USDC ABI with ERC-3009 and domain functions
const USDC_ABI = [
  // ERC-3009 function
  'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external',

  // EIP-712 domain functions
  'function DOMAIN_SEPARATOR() view returns (bytes32)',
  'function name() view returns (string)',
  'function version() view returns (string)',
  'function EIP712_VERSION() view returns (string)', // Some contracts use this instead
];

interface NetworkUSDC {
  network: string;
  rpcUrl: string;
  usdcAddress: string;
  chainId: number;
}

const NETWORKS: NetworkUSDC[] = [
  {
    network: 'Avalanche Fuji',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    usdcAddress: '0x5425890298aed601595a70AB815c96711a31Bc65',
    chainId: 43113,
  },
  {
    network: 'Ethereum Sepolia',
    rpcUrl: 'https://rpc.sepolia.org',
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    chainId: 11155111,
  },
  {
    network: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    chainId: 84532,
  },
  {
    network: 'Polygon Amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    usdcAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
    chainId: 80002,
  },
];

async function checkUSDCContract(networkInfo: NetworkUSDC) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 Checking: ${networkInfo.network}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`USDC Address: ${networkInfo.usdcAddress}`);
  console.log(`Chain ID: ${networkInfo.chainId}`);

  try {
    const provider = new JsonRpcProvider(networkInfo.rpcUrl);
    const contract = new Contract(networkInfo.usdcAddress, USDC_ABI, provider);

    // Check if contract has transferWithAuthorization (ERC-3009)
    let supportsERC3009 = false;
    try {
      // Try to get the function selector
      const code = await provider.getCode(networkInfo.usdcAddress);
      // transferWithAuthorization selector: 0xe3ee160e
      supportsERC3009 = code.includes('e3ee160e');
      console.log(`\n✅ ERC-3009 Support: ${supportsERC3009 ? 'YES' : 'NO'}`);
    } catch (error) {
      console.log(`\n❌ ERC-3009 Support: Could not determine`);
    }

    if (!supportsERC3009) {
      console.log(`\n⚠️  This USDC contract does NOT support ERC-3009`);
      console.log(`   You cannot use transferWithAuthorization on this network.`);
      return;
    }

    // Get EIP-712 domain parameters
    console.log(`\n📋 EIP-712 Domain Parameters:`);

    try {
      const name = await contract.name();
      console.log(`   name: "${name}"`);
    } catch (error) {
      console.log(`   name: Could not read`);
    }

    try {
      const version = await contract.version();
      console.log(`   version: "${version}"`);
    } catch (error) {
      // Try alternative version function
      try {
        const eip712Version = await contract.EIP712_VERSION();
        console.log(`   version (EIP712_VERSION): "${eip712Version}"`);
      } catch (error2) {
        console.log(`   version: Could not read`);
      }
    }

    console.log(`   chainId: ${networkInfo.chainId}`);
    console.log(`   verifyingContract: "${networkInfo.usdcAddress}"`);

    try {
      const domainSeparator = await contract.DOMAIN_SEPARATOR();
      console.log(`\n🔐 DOMAIN_SEPARATOR: ${domainSeparator}`);
    } catch (error) {
      console.log(`\n🔐 DOMAIN_SEPARATOR: Could not read`);
    }

    console.log(`\n✅ ${networkInfo.network} configuration:`);
    console.log(`{`);
    console.log(`  name: "USD Coin", // ⚠️ VERIFY THIS - might be different`);
    console.log(`  version: "2",     // ⚠️ VERIFY THIS - might be "1" or other`);
    console.log(`  chainId: ${networkInfo.chainId},`);
    console.log(`  verifyingContract: "${networkInfo.usdcAddress}"`);
    console.log(`}`);

  } catch (error: any) {
    console.error(`\n❌ Error checking ${networkInfo.network}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Checking USDC ERC-3009 Support and Domain Parameters...\n');

  for (const network of NETWORKS) {
    await checkUSDCContract(network);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Check complete!');
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);
