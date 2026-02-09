/**
 * GET /api/explorer/logs
 *
 * Query explorer logs with filters
 * Supports filtering by:
 * - eventType
 * - facilitatorId
 * - status
 * - limit
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryLogs, type EventType } from '@/lib/explorer-logging';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const eventType = searchParams.get('eventType') as EventType | null;
    const facilitatorId = searchParams.get('facilitatorId');
    const status = searchParams.get('status') as 'success' | 'failed' | 'pending' | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: 'Invalid limit. Must be between 1 and 1000' },
        { status: 400 }
      );
    }

    // Query logs with filters
    const logs = await queryLogs({
      eventType: eventType || undefined,
      facilitatorId: facilitatorId || undefined,
      status: status || undefined,
      limit,
    });

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error('❌ Error querying logs:', error);
    return NextResponse.json(
      { error: 'Failed to query logs' },
      { status: 500 }
    );
  }
}
