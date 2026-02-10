/**
 * POST /api/facilitator/check-and-activate
 *
 * Check facilitator's native token balance and automatically update status
 * Network-aware minimum requirements:
 * - Avalanche Fuji: 0.1 AVAX
 * - Ethereum Sepolia: 0.05 ETH
 * - Base Sepolia: 0.05 ETH
 * - Polygon Amoy: 0.1 MATIC
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacilitator, updateFacilitatorStatus } from '@/lib/facilitator-storage';
import { createPublicClient, http, formatEther } from 'viem';
import { getNetworkConfig } from '@/lib/networks';
import { logEvent } from '@/lib/explorer-logging';

/**
 * Two-threshold model:
 * - recommended funding: shown in UI (helps pay gas reliably)
 * - deactivation threshold: only mark needs_funding when balance is extremely low
 */
const RECOMMENDED_BALANCES: Record<string, number> = {
  'avalanche-fuji': 0.1,    // 0.1 AVAX
  'ethereum-sepolia': 0.05, // 0.05 ETH
  'base-sepolia': 0.05,     // 0.05 ETH
  'polygon-amoy': 0.1,      // 0.1 MATIC
  'arbitrum-sepolia': 0.05, // 0.05 ETH
  'monad-testnet': 0.1,     // 0.1 MON
  'optimism-sepolia': 0.05, // 0.05 ETH
};

// Only consider facilitator unfunded when <= this amount (native token)
const DEACTIVATION_THRESHOLD = 0.0001;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilitatorId } = body;

    if (!facilitatorId) {
      return NextResponse.json(
        { error: 'Missing facilitator ID' },
        { status: 400 }
      );
    }

    // Get facilitator
    const facilitator = await getFacilitator(facilitatorId);
    if (!facilitator) {
      return NextResponse.json(
        { error: 'Facilitator not found' },
        { status: 404 }
      );
    }

    // Get network configuration
    const network = facilitator.network || 'avalanche-fuji'; // Default to Avalanche Fuji for old facilitators
    const networkConfig = getNetworkConfig(network);
    const recommendedBalance = RECOMMENDED_BALANCES[network] || 0.1;
    const currencySymbol = networkConfig.nativeCurrency.symbol;

    console.log(`🔍 Checking balance for facilitator ${facilitatorId} on ${networkConfig.displayName}`);
    console.log(`   Wallet: ${facilitator.facilitatorWallet}`);
    console.log(`   Recommended: ${recommendedBalance} ${currencySymbol}`);
    console.log(`   Deactivation threshold: ${DEACTIVATION_THRESHOLD} ${currencySymbol}`);

    // Create network-specific public client
    const publicClient = createPublicClient({
      chain: networkConfig.chain,
      transport: http(networkConfig.rpcUrl),
    });

    // Check native token balance
    const balance = await publicClient.getBalance({
      address: facilitator.facilitatorWallet as `0x${string}`,
    });

    const balanceInToken = parseFloat(formatEther(balance));
    console.log(`💰 Balance: ${balanceInToken.toFixed(4)} ${currencySymbol}`);

    // Determine new status based on balance (deactivation threshold)
    let newStatus: 'active' | 'needs_funding';
    if (balanceInToken > DEACTIVATION_THRESHOLD) {
      newStatus = 'active';
      console.log(`✅ Balance above threshold (> ${DEACTIVATION_THRESHOLD} ${currencySymbol}), setting to active`);
    } else {
      newStatus = 'needs_funding';
      console.log(`⚠️  Balance too low (<= ${DEACTIVATION_THRESHOLD} ${currencySymbol}), setting needs_funding`);
    }

    // Update status if changed
    if (facilitator.status !== newStatus) {
      await updateFacilitatorStatus(facilitatorId, newStatus);
      console.log(`✅ Status updated: ${facilitator.status} → ${newStatus}`);

      // Log activation event
      if (newStatus === 'active') {
        await logEvent({
          eventType: 'facilitator_activated',
          facilitatorId: facilitator.id,
          facilitatorName: facilitator.name,
          chainName: networkConfig.displayName,
          chainId: networkConfig.chain.id,
          gasFundingAmount: `${balanceInToken.toFixed(4)} ${currencySymbol}`,
          status: 'success',
        });
      }
    } else {
      console.log(`ℹ️  Status unchanged: ${newStatus}`);
    }

    return NextResponse.json({
      success: true,
      facilitator: {
        id: facilitator.id,
        name: facilitator.name,
        wallet: facilitator.facilitatorWallet,
        balance: balanceInToken.toFixed(4),
        currency: currencySymbol,
        network: networkConfig.displayName,
        status: newStatus,
        // Back-compat field name: now indicates deactivation threshold
        minimumRequired: DEACTIVATION_THRESHOLD,
        isFunded: balanceInToken > DEACTIVATION_THRESHOLD,
        recommendedMinimum: recommendedBalance,
      },
    });
  } catch (error) {
    console.error('❌ Error checking and activating facilitator:', error);
    return NextResponse.json(
      { error: 'Failed to check and activate facilitator' },
      { status: 500 }
    );
  }
}
