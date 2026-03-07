/**
 * GET /api/keys/status?key=fk_xxx
 * GET /api/keys/status?wallet=0x...
 *
 * Check API key status and remaining calls.
 * If wallet is provided, returns all keys for that wallet.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key');
    const wallet = request.nextUrl.searchParams.get('wallet');

    const redis = getRedis();

    // Single key lookup
    if (key) {
      const keyData = await redis.get(`apikey:${key}`);
      if (!keyData) {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        );
      }

      const info = typeof keyData === 'string' ? JSON.parse(keyData) : keyData;
      return NextResponse.json({
        success: true,
        key: info.key,
        totalCalls: info.totalCalls,
        usedCalls: info.usedCalls,
        remainingCalls: info.totalCalls - info.usedCalls,
        createdAt: info.createdAt,
        lastUsed: info.lastUsed,
        status: info.usedCalls >= info.totalCalls ? 'exhausted' : 'active',
      });
    }

    // Wallet lookup — all keys
    if (wallet) {
      const walletLower = wallet.toLowerCase();
      const keyIds = await redis.smembers(`apikeys:wallet:${walletLower}`);

      if (!keyIds || keyIds.length === 0) {
        return NextResponse.json({
          success: true,
          keys: [],
        });
      }

      const keys = [];
      for (const kid of keyIds) {
        const kData = await redis.get(`apikey:${kid}`);
        if (kData) {
          const info = typeof kData === 'string' ? JSON.parse(kData) : kData;
          keys.push({
            key: info.key,
            totalCalls: info.totalCalls,
            usedCalls: info.usedCalls,
            remainingCalls: info.totalCalls - info.usedCalls,
            createdAt: info.createdAt,
            lastUsed: info.lastUsed,
            status: info.usedCalls >= info.totalCalls ? 'exhausted' : 'active',
          });
        }
      }

      // Sort by most recent first
      keys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({
        success: true,
        keys,
      });
    }

    return NextResponse.json(
      { error: 'Provide either key or wallet parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('❌ API key status error:', error);
    return NextResponse.json(
      { error: 'Failed to check API key status' },
      { status: 500 }
    );
  }
}
