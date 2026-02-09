/**
 * Multichain Network Configuration
 *
 * Centralized configuration for all supported testnets
 */

import { Chain, avalancheFuji, sepolia, baseSepolia, polygonAmoy } from 'wagmi/chains';

export interface NetworkConfig {
  chain: Chain;
  name: string;
  displayName: string;
  rpcUrl: string;
  blockExplorer: string;
  usdcAddress: `0x${string}`;
  usdcDecimals: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  // EIP-712 domain for ERC-3009
  erc3009Domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: `0x${string}`;
  };
}

// Network configurations for all supported testnets
export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  'avalanche-fuji': {
    chain: avalancheFuji,
    name: 'avalanche-fuji',
    displayName: 'Avalanche Fuji',
    rpcUrl: process.env.RPC_URL_AVALANCHE_FUJI || 'https://api.avax-test.network/ext/bc/C/rpc',
    blockExplorer: 'https://testnet.snowtrace.io',
    usdcAddress: '0x5425890298aed601595a70AB815c96711a31Bc65',
    usdcDecimals: 6,
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    erc3009Domain: {
      name: 'USD Coin',
      version: '2',
      chainId: 43113,
      verifyingContract: '0x5425890298aed601595a70AB815c96711a31Bc65',
    },
  },
  'ethereum-sepolia': {
    chain: sepolia,
    name: 'ethereum-sepolia',
    displayName: 'Ethereum Sepolia',
    rpcUrl: process.env.RPC_URL_ETHEREUM_SEPOLIA || 'https://ethereum-sepolia-rpc.publicnode.com', // More reliable public RPC
    blockExplorer: 'https://sepolia.etherscan.io',
    usdcAddress: (process.env.NEXT_PUBLIC_USDC_ADDRESS_SEPOLIA || '0x') as `0x${string}`,
    usdcDecimals: 6,
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    erc3009Domain: {
      name: 'USDC', // ✅ Ethereum Sepolia uses "USDC" not "USD Coin"
      version: '2',
      chainId: 11155111,
      verifyingContract: (process.env.NEXT_PUBLIC_USDC_ADDRESS_SEPOLIA || '0x') as `0x${string}`,
    },
  },
  'base-sepolia': {
    chain: baseSepolia,
    name: 'base-sepolia',
    displayName: 'Base Sepolia',
    rpcUrl: process.env.RPC_URL_BASE_SEPOLIA || 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    usdcAddress: (process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE_SEPOLIA || '0x') as `0x${string}`,
    usdcDecimals: 6,
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    erc3009Domain: {
      name: 'USDC', // ✅ Base Sepolia uses "USDC" not "USD Coin"
      version: '2',
      chainId: 84532,
      verifyingContract: (process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE_SEPOLIA || '0x') as `0x${string}`,
    },
  },
  'polygon-amoy': {
    chain: polygonAmoy,
    name: 'polygon-amoy',
    displayName: 'Polygon Amoy',
    rpcUrl: process.env.RPC_URL_POLYGON_AMOY || 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://amoy.polygonscan.com',
    usdcAddress: (process.env.NEXT_PUBLIC_USDC_ADDRESS_POLYGON_AMOY || '0x') as `0x${string}`,
    usdcDecimals: 6,
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
    erc3009Domain: {
      name: 'USDC', // ✅ Polygon Amoy uses "USDC" not "USD Coin"
      version: '2',
      chainId: 80002,
      verifyingContract: (process.env.NEXT_PUBLIC_USDC_ADDRESS_POLYGON_AMOY || '0x') as `0x${string}`,
    },
  },
};

// Export supported networks list
export const SUPPORTED_NETWORKS = Object.keys(NETWORK_CONFIGS) as Array<keyof typeof NETWORK_CONFIGS>;

// Helper functions

/**
 * Get network configuration by network name
 * @throws Error if network is not supported
 */
export function getNetworkConfig(networkName: string): NetworkConfig {
  const config = NETWORK_CONFIGS[networkName];
  if (!config) {
    throw new Error(`Unsupported network: ${networkName}`);
  }
  return config;
}

/**
 * Get network configuration by chain ID
 * @returns NetworkConfig or null if not found
 */
export function getNetworkByChainId(chainId: number): NetworkConfig | null {
  return Object.values(NETWORK_CONFIGS).find(config => config.chain.id === chainId) || null;
}

/**
 * Check if network is supported
 */
export function isNetworkSupported(networkName: string): boolean {
  return networkName in NETWORK_CONFIGS;
}

/**
 * Get all supported chains for wagmi configuration
 */
export function getSupportedChains(): Chain[] {
  return Object.values(NETWORK_CONFIGS).map(config => config.chain);
}
