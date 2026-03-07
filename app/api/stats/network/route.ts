/**
 * GET /api/stats/network
 *
 * Get network-wide statistics with real data from Redis
 * - Total facilitators
 * - Active facilitators
 * - Total payments processed
 * - Networks supported
 * - Total gas saved (estimated)
 * - Auto-deactivation for low-balance facilitators
 *
 * Query Parameters:
 * - network (optional): Filter by network name (default: 'avalanche-fuji')
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveFacilitators, getFacilitator, updateFacilitatorStatus } from '@/lib/facilitator-storage';
import { createPublicClient, http, formatEther } from 'viem';
import { getNetworkConfig, isNetworkSupported } from '@/lib/networks';

// Balance threshold below which a facilitator is auto-deactivated
const AUTO_DEACTIVATION_THRESHOLD = 0.5; // 0.5 AVAX (or native token)

// Average gas cost per transaction in native token (used for gas saved estimate)
const AVG_GAS_COST_PER_TX = 0.003;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const networkParam = searchParams.get('network');

    // Default network filter to 'avalanche-fuji' if not specified
    let networkFilter: string | undefined;
    if (networkParam && isNetworkSupported(networkParam)) {
      networkFilter = networkParam;
    }

    // Fetch all facilitators from Redis (with optional network filter)
    const allFacilitators = await getActiveFacilitators(networkFilter);

    // Auto-deactivation check: for each facilitator, check if balance is below threshold
    for (const publicInfo of allFacilitators) {
      try {
        const facilitator = await getFacilitator(publicInfo.id);
        if (!facilitator) continue;

        const network = facilitator.network || 'avalanche-fuji';
        const networkConfig = getNetworkConfig(network);

        const publicClient = createPublicClient({
          chain: networkConfig.chain,
          transport: http(networkConfig.rpcUrl),
        });

        const balance = await publicClient.getBalance({
          address: facilitator.facilitatorWallet as `0x${string}`,
        });

        const balanceInToken = parseFloat(formatEther(balance));

        // Auto-deactivate if balance is below 0.5 native token
        if (balanceInToken < AUTO_DEACTIVATION_THRESHOLD && facilitator.status === 'active') {
          await updateFacilitatorStatus(facilitator.id, 'inactive');
          publicInfo.status = 'inactive';
          console.log(
            `Auto-deactivated facilitator ${facilitator.name} (${facilitator.id}): ` +
            `balance ${balanceInToken.toFixed(4)} ${networkConfig.nativeCurrency.symbol} < ${AUTO_DEACTIVATION_THRESHOLD}`
          );
        }
      } catch (error) {
        console.error(`Failed to check balance for auto-deactivation (${publicInfo.id}):`, error);
        // Continue with other facilitators even if one fails
      }
    }

    // Calculate real stats
    const totalFacilitators = allFacilitators.length;
    const activeFacilitators = allFacilitators.filter(
      (f) => f.status === 'active'
    ).length;

    // Sum total payments across all facilitators
    let totalPaymentsProcessed = 0;
    for (const facilitator of allFacilitators) {
      totalPaymentsProcessed += facilitator.totalPayments || 0;
    }

    // Hardcoded: 7 networks supported
    const networksSupported = 7;

    // Estimate total gas saved based on payments processed
    const totalGasSaved = (totalPaymentsProcessed * AVG_GAS_COST_PER_TX).toFixed(3);

    return NextResponse.json({
      success: true,
      stats: {
        totalFacilitators,
        activeFacilitators,
        totalPaymentsProcessed,
        networksSupported,
        totalGasSaved,
        lastUpdated: new Date().toISOString(),
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching network stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network stats' },
      { status: 500, headers: corsHeaders }
    );
  }
}
