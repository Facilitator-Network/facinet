/**
 * GET /api/whitelist/pending
 * Admin-only: List all pending whitelist applications
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-secret');
  if (!ADMIN_SECRET || !authHeader || authHeader !== ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {

    const redis = getRedis();

    // Get all pending wallets
    const pendingWallets = await redis.smembers('whitelist:pending_set');
    const applications = [];

    for (const wallet of pendingWallets) {
      const data = await redis.get(`whitelist:pending:${wallet}`);
      if (data) {
        applications.push(typeof data === 'string' ? JSON.parse(data) : data);
      }
    }

    // Sort by most recent first
    applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

    // Also get approved list
    const approvedWallets = await redis.smembers('whitelist:approved_set');
    const approved = [];

    for (const wallet of approvedWallets) {
      const data = await redis.get(`whitelist:approved:${wallet}`);
      if (data) {
        approved.push(typeof data === 'string' ? JSON.parse(data) : data);
      }
    }

    approved.sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime());

    return NextResponse.json({
      success: true,
      pending: applications,
      approved,
      stats: {
        pendingCount: applications.length,
        approvedCount: approved.length,
      },
    });
  } catch (error) {
    console.error('❌ Whitelist pending list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending applications' },
      { status: 500 }
    );
  }
}
