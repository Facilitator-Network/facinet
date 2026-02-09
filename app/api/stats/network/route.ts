/**
 * GET /api/stats/network
 *
 * Get network-wide statistics
 * - Total facilitators
 * - Active facilitators
 * - Total stake amount (1 USDC per facilitator)
 * - Total payments processed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveFacilitators, getFacilitator } from '@/lib/facilitator-storage';

export async function GET(request: NextRequest) {
  try {
    // Get all facilitators
    const allFacilitators = await getActiveFacilitators();

    // Calculate stats
    const totalFacilitators = allFacilitators.length;
    const activeFacilitators = allFacilitators.filter(
      (f) => f.status === 'active'
    ).length;

    // Total stake: 1 USDC per facilitator
    const totalStakeAmount = totalFacilitators * 1; // 1 USDC each

    // Aggregate total payments
    let totalPayments = 0;
    for (const facilitator of allFacilitators) {
      totalPayments += facilitator.totalPayments || 0;
    }

    // Calculate mean uptime (simplified for now - all active facilitators are 100% up)
    // In a real system, you'd track downtime
    const meanUptime =
      totalFacilitators > 0
        ? ((activeFacilitators / totalFacilitators) * 100).toFixed(1)
        : '0.0';

    return NextResponse.json({
      success: true,
      stats: {
        totalFacilitators,
        activeFacilitators,
        needsFundingFacilitators: allFacilitators.filter(
          (f) => f.status === 'needs_funding'
        ).length,
        inactiveFacilitators: allFacilitators.filter(
          (f) => f.status === 'inactive'
        ).length,
        totalStakeAmount: `${totalStakeAmount.toFixed(2)} USDC`,
        totalPayments,
        meanUptime: `${meanUptime}%`,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching network stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network stats' },
      { status: 500 }
    );
  }
}
