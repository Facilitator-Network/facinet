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

// Network-specific minimum balance requirements (in native tokens)
const MINIMUM_BALANCES: Record<string, number> = {
  'avalanche-fuji': 0.1,    // 0.1 AVAX
  'ethereum-sepolia': 0.05, // 0.05 ETH
  'base-sepolia': 0.05,     // 0.05 ETH
  'polygon-amoy': 0.1,      // 0.1 MATIC
};

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
    const minimumBalance = MINIMUM_BALANCES[network] || 0.1;
    const currencySymbol = networkConfig.nativeCurrency.symbol;

    console.log(`🔍 Checking balance for facilitator ${facilitatorId} on ${networkConfig.displayName}`);
    console.log(`   Wallet: ${facilitator.facilitatorWallet}`);
    console.log(`   Required: ${minimumBalance} ${currencySymbol}`);

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

    // Determine new status based on balance
    let newStatus: 'active' | 'needs_funding';
    if (balanceInToken >= minimumBalance) {
      newStatus = 'active';
      console.log(`✅ Balance sufficient (>= ${minimumBalance} ${currencySymbol}), setting to active`);
    } else {
      newStatus = 'needs_funding';
      console.log(`⚠️  Balance insufficient (< ${minimumBalance} ${currencySymbol}), keeping as needs_funding`);
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
        minimumRequired: minimumBalance,
        isFunded: balanceInToken >= minimumBalance,
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
