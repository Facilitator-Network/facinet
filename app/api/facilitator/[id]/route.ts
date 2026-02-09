/**
 * GET /api/facilitator/[id]
 *
 * Get specific facilitator by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacilitator } from '@/lib/facilitator-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Facilitator ID is required' },
        { status: 400 }
      );
    }

    // Get facilitator from storage
    const facilitator = await getFacilitator(id);

    if (!facilitator) {
      return NextResponse.json(
        { error: 'Facilitator not found' },
        { status: 404 }
      );
    }

    // Return public info only (exclude encrypted keys)
    const publicInfo = {
      id: facilitator.id,
      name: facilitator.name,
      facilitatorWallet: facilitator.facilitatorWallet,
      paymentRecipient: facilitator.paymentRecipient,
      createdBy: facilitator.createdBy,
      status: facilitator.status,
      totalPayments: facilitator.totalPayments,
      lastUsed: facilitator.lastUsed,
      createdAt: facilitator.createdAt,
      registrationTxHash: facilitator.registrationTxHash,
    };

    return NextResponse.json({
      success: true,
      facilitator: publicInfo,
    });
  } catch (error) {
    console.error('❌ Error fetching facilitator:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facilitator' },
      { status: 500 }
    );
  }
}
