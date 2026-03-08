/**
 * POST /api/admin/fix-facilitator-status
 *
 * Fix all facilitators with "active" status but insufficient AVAX balance.
 * ADMIN ONLY — requires admin secret header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveFacilitators, getFacilitator, updateFacilitatorStatus } from '@/lib/facilitator-storage';
import { createPublicClient, http, formatEther } from 'viem';
import { avalancheFuji } from 'viem/chains';

const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.RPC_URL_AVALANCHE_FUJI || 'https://api.avax-test.network/ext/bc/C/rpc'),
});

const MINIMUM_BALANCE = 0.1;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-secret');
  if (!ADMIN_SECRET || !authHeader || authHeader !== ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const allFacilitators = await getActiveFacilitators();

    let updatedCount = 0;
    let alreadyCorrect = 0;
    let errors = 0;
    const results = [];

    for (const publicInfo of allFacilitators) {
      const facilitator = await getFacilitator(publicInfo.id);
      if (!facilitator || facilitator.status !== 'active') continue;

      try {
        const balance = await publicClient.getBalance({
          address: facilitator.facilitatorWallet as `0x${string}`,
        });

        const balanceInAvax = parseFloat(formatEther(balance));

        if (balanceInAvax < MINIMUM_BALANCE) {
          await updateFacilitatorStatus(facilitator.id, 'needs_funding');
          results.push({ id: facilitator.id, name: facilitator.name, balance: balanceInAvax.toFixed(4), status: 'updated' });
          updatedCount++;
        } else {
          results.push({ id: facilitator.id, name: facilitator.name, balance: balanceInAvax.toFixed(4), status: 'already_active' });
          alreadyCorrect++;
        }
      } catch (error) {
        results.push({ id: facilitator.id, name: facilitator.name, status: 'error' });
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: { total: allFacilitators.length, updated: updatedCount, alreadyCorrect, errors },
      results,
    });
  } catch (error) {
    console.error('Error fixing facilitator statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fix facilitator statuses' },
      { status: 500 }
    );
  }
}
