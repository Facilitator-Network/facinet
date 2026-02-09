/**
 * POST /api/facilitator/update-status
 *
 * Update facilitator status (active/needs_funding/inactive)
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateFacilitatorStatus } from '@/lib/facilitator-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['needs_funding', 'active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await updateFacilitatorStatus(id, status);

    return NextResponse.json({
      success: true,
      message: `Facilitator status updated to ${status}`,
    });
  } catch (error) {
    console.error('❌ Error updating facilitator status:', error);
    return NextResponse.json(
      { error: 'Failed to update facilitator status' },
      { status: 500 }
    );
  }
}
