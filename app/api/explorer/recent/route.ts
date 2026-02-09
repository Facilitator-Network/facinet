/**
 * GET /api/explorer/recent
 *
 * Get recent activity across the entire network
 * Returns latest events sorted by timestamp
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecentLogs } from '@/lib/explorer-logging';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 200) {
      return NextResponse.json(
        { error: 'Invalid limit. Must be between 1 and 200' },
        { status: 400 }
      );
    }

    // Get recent logs
    const logs = await getRecentLogs(limit);

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
