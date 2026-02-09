import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { getSupportedChains } from './networks';

// WalletConnect Project ID - Required for wallet connection
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '1215cdb3a1c747715f4b6cfc181e2d6f';

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn('⚠️  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in .env.local');
}

// Get all supported chains from network configuration
const supportedChains = getSupportedChains();

export const config = getDefaultConfig({
  appName: 'x402 - Distributed Facilitator Network',
  projectId,
  chains: supportedChains as any,
  ssr: true,
});
