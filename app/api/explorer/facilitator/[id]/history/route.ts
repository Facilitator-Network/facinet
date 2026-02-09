/**
 * GET /api/explorer/facilitator/[id]/history
 *
 * Get all historical events for a specific facilitator
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacilitatorLogs } from '@/lib/explorer-logging';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    if (!id) {
      return NextResponse.json(
        { error: 'Facilitator ID is required' },
        { status: 400 }
      );
    }

    const limit = parseInt(searchParams.get('limit') || '100');

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: 'Invalid limit. Must be between 1 and 1000' },
        { status: 400 }
      );
    }

    // Get facilitator logs
    const logs = await getFacilitatorLogs(id, limit);

    return NextResponse.json({
      success: true,
      facilitatorId: id,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error('❌ Error fetching facilitator history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facilitator history' },
      { status: 500 }
    );
  }
}
