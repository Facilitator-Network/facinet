/**
 * POST /api/admin/fix-facilitator-status
 *
 * Fix all facilitators with "active" status but insufficient AVAX balance
 * Updates them to "needs_funding"
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveFacilitators, getFacilitator, updateFacilitatorStatus } from '@/lib/facilitator-storage';
import { createPublicClient, http, formatEther } from 'viem';
import { avalancheFuji } from 'viem/chains';

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.RPC_URL_AVALANCHE_FUJI || 'https://api.avax-test.network/ext/bc/C/rpc'),
});

const MINIMUM_BALANCE = 0.1; // 0.1 AVAX minimum

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Fetching all facilitators...');

    // Get all facilitators
    const allFacilitators = await getActiveFacilitators();

    console.log(`Found ${allFacilitators.length} facilitators`);

    let updatedCount = 0;
    let alreadyCorrect = 0;
    let errors = 0;

    const results = [];

    for (const publicInfo of allFacilitators) {
      const facilitator = await getFacilitator(publicInfo.id);

      if (!facilitator) continue;

      // Skip if already needs_funding or inactive
      if (facilitator.status !== 'active') {
        continue;
      }

      // Check AVAX balance
      try {
        const balance = await publicClient.getBalance({
          address: facilitator.facilitatorWallet as `0x${string}`,
        });

        const balanceInAvax = parseFloat(formatEther(balance));

        if (balanceInAvax < MINIMUM_BALANCE) {
          // Update to needs_funding
          await updateFacilitatorStatus(facilitator.id, 'needs_funding');

          results.push({
            id: facilitator.id,
            name: facilitator.name,
            balance: balanceInAvax.toFixed(4),
            status: 'updated',
          });

          console.log(`✅ Updated ${facilitator.name} (${facilitator.id}) → needs_funding (balance: ${balanceInAvax.toFixed(4)} AVAX)`);
          updatedCount++;
        } else {
          results.push({
            id: facilitator.id,
            name: facilitator.name,
            balance: balanceInAvax.toFixed(4),
            status: 'already_active',
          });
          alreadyCorrect++;
        }
      } catch (error) {
        console.error(`❌ Error checking ${facilitator.id}:`, error);
        results.push({
          id: facilitator.id,
          name: facilitator.name,
          status: 'error',
          error: String(error),
        });
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: allFacilitators.length,
        updated: updatedCount,
        alreadyCorrect,
        errors,
      },
      results,
    });
  } catch (error) {
    console.error('❌ Error fixing facilitator statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fix facilitator statuses' },
      { status: 500 }
    );
  }
}
