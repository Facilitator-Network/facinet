import { NETWORK_CONFIGS } from './networks';

// Network-specific USDC Contracts
export const USDC_CONTRACTS = {
  'avalanche-fuji': {
    address: '0x5425890298aed601595a70AB815c96711a31Bc65' as `0x${string}`,
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
  },
  'ethereum-sepolia': {
    address: (process.env.NEXT_PUBLIC_USDC_ADDRESS_SEPOLIA || '0x') as `0x${string}`,
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
  },
  'base-sepolia': {
    address: (process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE_SEPOLIA || '0x') as `0x${string}`,
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
  },
  'polygon-amoy': {
    address: (process.env.NEXT_PUBLIC_USDC_ADDRESS_POLYGON_AMOY || '0x') as `0x${string}`,
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
  },
};

/**
 * Get USDC contract configuration for a specific network
 * @throws Error if network is not supported or USDC address not configured
 */
export function getUSDCContract(network: string) {
  const contract = USDC_CONTRACTS[network as keyof typeof USDC_CONTRACTS];
  if (!contract) {
    throw new Error(`USDC contract not configured for network: ${network}`);
  }
  if (!contract.address || contract.address === '0x') {
    throw new Error(
      `USDC contract address not set for ${network}. ` +
      `Please set NEXT_PUBLIC_USDC_ADDRESS_${network.toUpperCase().replace(/-/g, '_')} in .env.local`
    );
  }
  return contract;
}

// Legacy export for backward compatibility
export const USDC_FUJI = USDC_CONTRACTS['avalanche-fuji'];

// ERC20 ABI for USDC operations
export const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// DEX Router for swaps (Trader Joe on Fuji)
export const TRADER_JOE_ROUTER = {
  address: '0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901' as `0x${string}`,
};

// WAVAX (Wrapped AVAX) on Fuji
export const WAVAX_FUJI = {
  address: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c' as `0x${string}`,
  decimals: 18,
  symbol: 'WAVAX',
  name: 'Wrapped AVAX',
};
