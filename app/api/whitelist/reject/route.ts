/**
 * POST /api/whitelist/reject
 * Admin-only: Reject a whitelist application
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-secret');
  if (!ADMIN_SECRET || !authHeader || authHeader !== ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { wallet } = body;

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
