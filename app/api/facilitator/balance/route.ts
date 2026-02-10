/**
 * GET /api/facilitator/balance?address=0x...&network=ethereum-sepolia
 *
 * Check native token balance of a facilitator wallet (network-aware)
 * Used to determine if facilitator is funded and ready
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, formatEther } from 'viem';
import { getNetworkConfig } from '@/lib/networks';

const RECOMMENDED_BALANCES: Record<string, number> = {
  'avalanche-fuji': 0.1,
  'ethereum-sepolia': 0.05,
  'base-sepolia': 0.05,
  'polygon-amoy': 0.1,
  'arbitrum-sepolia': 0.05,
  'monad-testnet': 0.1,
};

const DEACTIVATION_THRESHOLD = 0.0001;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const network = searchParams.get('network') || 'avalanche-fuji'; // Default to Avalanche Fuji

    if (!address) {
      return NextResponse.json(
        { error: 'Missing address parameter' },
        { status: 400 }
      );
    }

    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Get network configuration
    const networkConfig = getNetworkConfig(network);
    const recommendedBalance = RECOMMENDED_BALANCES[network] || 0.1;

    // Create network-specific public client
    const publicClient = createPublicClient({
      chain: networkConfig.chain,
      transport: http(networkConfig.rpcUrl),
    });

    // Get native token balance
    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    });

    const balanceInToken = formatEther(balance);
    const isFunded = parseFloat(balanceInToken) > DEACTIVATION_THRESHOLD;

    return NextResponse.json({
      success: true,
      address,
      network,
      balance: balanceInToken,
      balanceWei: balance.toString(),
      isFunded,
      // Back-compat field name: now indicates deactivation threshold
      minimumRequired: DEACTIVATION_THRESHOLD.toString(),
      recommendedMinimum: recommendedBalance.toString(),
      currency: networkConfig.nativeCurrency.symbol,
    });
  } catch (error) {
    console.error('❌ Error checking balance:', error);
    return NextResponse.json(
      { error: 'Failed to check balance' },
      { status: 500 }
    );
  }
}
