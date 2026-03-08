/**
 * DELETE /api/facilitator/delete
 *
 * Delete a facilitator
 * Only the creator can delete their facilitator
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacilitator } from '@/lib/facilitator-storage';
import { getRedis } from '@/lib/redis';

const ADMIN_SECRET = process.env.ADMIN_SECRET || '';
const ADMIN_WALLET = (process.env.ADMIN_WALLET || '').toLowerCase();

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

    // Auth: creator can delete their own OR admin with secret header
    const isCreator = facilitator.createdBy.toLowerCase() === userAddress.toLowerCase();
    const adminAuth = request.headers.get('x-admin-secret');
    const isAdmin = (ADMIN_SECRET && adminAuth === ADMIN_SECRET) || userAddress.toLowerCase() === ADMIN_WALLET;

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the creator or admin can delete this facilitator' },
        { status: 403 }
      );
    }

    // Delete from Redis
    const redis = getRedis();
    await redis.del(`facilitator:${facilitatorId}`);
    await redis.srem('facilitators:active', facilitatorId);
    await redis.del(`explorer:facilitator:${facilitatorId}`);

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
