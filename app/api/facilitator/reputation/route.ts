/**
 * Facilitator Reputation API
 * Get reputation data for facilitators from on-chain ERC-8004 registry
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getFacilitatorReputation,
  getAllFeedback,
  getAllFacilitatorsWithReputation,
} from '@/lib/reputation-contract';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/facilitator/reputation
 *
 * Query params:
 * - facilitatorId: specific facilitator (optional)
 * - all: get all facilitators with reputation (true/false)
 * - includeDetails: include individual feedback (true/false)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilitatorId = searchParams.get('facilitatorId');
    const all = searchParams.get('all') === 'true';
    const includeDetails = searchParams.get('includeDetails') === 'true';

    // Get all facilitators
    if (all) {
      const facilitators = await getAllFacilitatorsWithReputation();

      return NextResponse.json(
        {
          success: true,
          facilitators,
          count: facilitators.length,
        },
        { headers: corsHeaders }
      );
    }

    // Get specific facilitator reputation
    if (facilitatorId) {
      const reputation = await getFacilitatorReputation(Number(facilitatorId));

      let details = null;
      if (includeDetails) {
        details = await getAllFeedback(Number(facilitatorId), {
          includeRevoked: false,
        });
      }

      return NextResponse.json(
        {
          success: true,
          facilitatorId: Number(facilitatorId),
          reputation,
          details,
        },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Please provide facilitatorId or set all=true',
      },
      { status: 400, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error fetching reputation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch reputation',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
