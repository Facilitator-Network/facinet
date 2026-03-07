/**
 * GET /api/whitelist/check?wallet=0x...
 * Check whitelist status for a wallet
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

const ADMIN_WALLET = (process.env.ADMIN_WALLET || '').toLowerCase();

export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const walletLower = wallet.toLowerCase();

    // Admin wallet is always whitelisted
    if (walletLower === ADMIN_WALLET) {
      return NextResponse.json({
        success: true,
        status: 'approved',
        isAdmin: true,
      });
    }

    const redis = getRedis();

    // Check approved
    const approved = await redis.get(`whitelist:approved:${walletLower}`);
    if (approved) {
      return NextResponse.json({
        success: true,
        status: 'approved',
      });
    }

    // Check pending
    const pending = await redis.get(`whitelist:pending:${walletLower}`);
    if (pending) {
      return NextResponse.json({
        success: true,
        status: 'pending',
      });
    }

    // Not applied
    return NextResponse.json({
      success: true,
      status: 'none',
    });
  } catch (error) {
    console.error('❌ Whitelist check error:', error);
    return NextResponse.json(
      { error: 'Failed to check whitelist status' },
      { status: 500 }
    );
  }
}
