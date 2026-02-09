/**
 * DELETE /api/facilitator/delete
 *
 * Delete a facilitator
 * Only the creator can delete their facilitator
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacilitator } from '@/lib/facilitator-storage';
import { getRedis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilitatorId, userAddress } = body;

    if (!facilitatorId || !userAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Check if user is the creator
    if (facilitator.createdBy.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Only the creator can delete this facilitator' },
        { status: 403 }
      );
    }

    // Delete from Redis
    const redis = getRedis();
    const key = `facilitator:${facilitatorId}`;
    await redis.del(key);

    console.log(`✅ Deleted facilitator: ${facilitatorId} by ${userAddress}`);

    return NextResponse.json({
      success: true,
      message: 'Facilitator deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting facilitator:', error);
    return NextResponse.json(
      { error: 'Failed to delete facilitator' },
      { status: 500 }
    );
  }
}
