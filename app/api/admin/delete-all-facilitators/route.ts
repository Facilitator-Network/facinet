/**
 * POST /api/admin/delete-all-facilitators
 *
 * Deletes ALL facilitators and related data from Redis.
 * ADMIN ONLY — requires admin secret header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

export async function POST(request: NextRequest) {
  // Auth check — must provide admin secret
  const authHeader = request.headers.get('x-admin-secret');
  if (!ADMIN_SECRET || !authHeader || authHeader !== ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const redis = getRedis();

    const activeIds = await redis.smembers('facilitators:active');

    let deletedFacilitators = 0;
    for (const id of activeIds as string[]) {
      await redis.del(`facilitator:${id}`);
      deletedFacilitators++;
    }

    await redis.del('facilitators:active');

    const explorerKeys = ['explorer:logs'];
    for (const key of explorerKeys) {
      await redis.del(key);
    }

    let deletedFacilitatorLogs = 0;
    for (const id of activeIds as string[]) {
      await redis.del(`explorer:facilitator:${id}`);
      deletedFacilitatorLogs++;
    }

    return NextResponse.json({
      success: true,
      message: 'All facilitators and related data deleted successfully',
      summary: {
        facilitatorsDeleted: deletedFacilitators,
        activeSetCleared: true,
        explorerLogsCleared: true,
        facilitatorLogsDeleted: deletedFacilitatorLogs,
      },
    });
  } catch (error) {
    console.error('Error deleting facilitators:', error);
    return NextResponse.json(
      { error: 'Failed to delete facilitators' },
      { status: 500 }
    );
  }
}
