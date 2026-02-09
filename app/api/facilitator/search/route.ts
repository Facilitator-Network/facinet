/**
 * GET /api/facilitator/search?name=...
 *
 * Search facilitators by name
 * Supports partial matching (case-insensitive)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveFacilitators } from '@/lib/facilitator-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { error: 'Search query "name" is required' },
        { status: 400 }
      );
    }

    // Get all facilitators
    const allFacilitators = await getActiveFacilitators();

    // Filter by name (case-insensitive, partial match)
    const searchQuery = name.toLowerCase().trim();
    const matchingFacilitators = allFacilitators.filter((facilitator) =>
      facilitator.name.toLowerCase().includes(searchQuery)
    );

    return NextResponse.json({
      success: true,
      count: matchingFacilitators.length,
      facilitators: matchingFacilitators,
    });
  } catch (error) {
    console.error('❌ Error searching facilitators:', error);
    return NextResponse.json(
      { error: 'Failed to search facilitators' },
      { status: 500 }
    );
  }
}
