/**
 * POST /api/whitelist/reject
 * Admin-only: Reject a whitelist application
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

const ADMIN_WALLET = (process.env.ADMIN_WALLET || '').toLowerCase();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, admin } = body;

    if (!admin || admin.toLowerCase() !== ADMIN_WALLET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const walletLower = wallet.toLowerCase();

    // Remove from pending
    await redis.del(`whitelist:pending:${walletLower}`);
    await redis.srem('whitelist:pending_set', walletLower);

    return NextResponse.json({
      success: true,
      message: `Application for ${wallet} has been rejected.`,
    });
  } catch (error) {
    console.error('❌ Whitelist reject error:', error);
    return NextResponse.json(
      { error: 'Failed to reject application' },
      { status: 500 }
    );
  }
}
