/**
 * GET /api/facilitator/list
 *
 * Get list of all facilitators with real-time status based on native token balance
 * Returns public info only (no private keys)
 *
 * Network-aware Status Logic:
 * - Avalanche Fuji: 0.1 AVAX minimum
 * - Ethereum Sepolia: 0.05 ETH minimum
 * - Base Sepolia: 0.05 ETH minimum
 * - Polygon Amoy: 0.1 MATIC minimum
 */

import { NextResponse } from 'next/server';
import { getActiveFacilitators, getFacilitator, updateFacilitatorStatus } from '@/lib/facilitator-storage';
import { createPublicClient, http, formatEther } from 'viem';
import { getNetworkConfig } from '@/lib/networks';

const RECOMMENDED_BALANCES: Record<string, number> = {
  'avalanche-fuji': 0.1,    // 0.1 AVAX
  'ethereum-sepolia': 0.05, // 0.05 ETH
  'base-sepolia': 0.05,     // 0.05 ETH
  'polygon-amoy': 0.1,      // 0.1 MATIC
  'arbitrum-sepolia': 0.05, // 0.05 ETH
  'monad-testnet': 0.1,     // 0.1 MON
};

const DEACTIVATION_THRESHOLD = 0.0001;

export async function GET() {
  try {
    const facilitators = await getActiveFacilitators();

    // Check and update status for each facilitator based on network-specific balance
    const facilitatorsWithUpdatedStatus = await Promise.all(
      facilitators.map(async (publicInfo) => {
        try {
          // Get full facilitator data
          const facilitator = await getFacilitator(publicInfo.id);
          if (!facilitator) return publicInfo;

          // Get network configuration
          const network = facilitator.network || 'avalanche-fuji'; // Default to Avalanche Fuji for old facilitators
          const networkConfig = getNetworkConfig(network);
          const recommendedBalance = RECOMMENDED_BALANCES[network] || 0.1;
          const currencySymbol = networkConfig.nativeCurrency.symbol;

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

          // Determine correct status based on balance (deactivation threshold)
          let correctStatus: 'active' | 'needs_funding';
          if (balanceInToken > DEACTIVATION_THRESHOLD) {
            correctStatus = 'active';
          } else {
            correctStatus = 'needs_funding';
          }

          // Update status in Redis if it changed
          if (facilitator.status !== correctStatus) {
            await updateFacilitatorStatus(facilitator.id, correctStatus);
            console.log(
              `✅ Auto-updated ${facilitator.name} status: ${facilitator.status} → ${correctStatus} ` +
              `(balance: ${balanceInToken.toFixed(4)} ${currencySymbol}, threshold: ${DEACTIVATION_THRESHOLD}, recommended: ${recommendedBalance})`
            );
          }

          // Return public info with updated status
          return {
            ...publicInfo,
            status: correctStatus,
          };
        } catch (error) {
          console.error(`Failed to check balance for ${publicInfo.id}:`, error);
          // Return original info if balance check fails
          return publicInfo;
        }
      })
    );

    return NextResponse.json({
      success: true,
      facilitators: facilitatorsWithUpdatedStatus,
      count: facilitatorsWithUpdatedStatus.length,
    });
  } catch (error) {
    console.error('❌ Error listing facilitators:', error);
    return NextResponse.json(
      { error: 'Failed to list facilitators' },
      { status: 500 }
    );
  }
}
