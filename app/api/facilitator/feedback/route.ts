/**
 * Facilitator Feedback API
 * Submit feedback for facilitators to on-chain ERC-8004 registry
 */

import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { submitFeedback } from '@/lib/reputation-contract';

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
 * POST /api/facilitator/feedback
 *
 * Body:
 * {
 *   facilitatorId: number (on-chain facilitator ID, not Redis ID)
 *   score: number (0-100)
 *   tag1?: string (e.g., "fast", "slow", "reliable")
 *   tag2?: string (e.g., "small", "large")
 *   fileUri?: string (IPFS URI with detailed feedback)
 *   fileHash?: string (keccak256 hash of file)
 *   merchantPrivateKey: string (to sign transaction - in production use wallet)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      facilitatorId,
      score,
      tag1,
      tag2,
      fileUri,
      fileHash,
      merchantPrivateKey,
    } = body;

    // Validate inputs
    if (!facilitatorId || facilitatorId < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid facilitatorId',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (score === undefined || score < 0 || score > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Score must be between 0 and 100',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!merchantPrivateKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Merchant private key required to submit feedback on-chain',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create signer from private key
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'
    );
    const signer = new ethers.Wallet(merchantPrivateKey, provider);

    // Submit feedback on-chain
    const txHash = await submitFeedback(
      facilitatorId,
      score,
      {
        tag1,
        tag2,
        fileUri,
        fileHash,
      },
      signer
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback submitted successfully',
        txHash,
        facilitatorId,
        score,
        explorerUrl: `https://testnet.snowtrace.io/tx/${txHash}`,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit feedback',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * GET /api/facilitator/feedback?facilitatorId=X
 * Get feedback for a specific facilitator
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilitatorId = searchParams.get('facilitatorId');

    if (!facilitatorId) {
      return NextResponse.json(
        {
          success: false,
          error: 'facilitatorId required',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { getAllFeedback } = await import('@/lib/reputation-contract');

    const feedback = await getAllFeedback(Number(facilitatorId), {
      includeRevoked: false,
    });

    return NextResponse.json(
      {
        success: true,
        facilitatorId: Number(facilitatorId),
        feedback,
        count: feedback.length,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch feedback',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
