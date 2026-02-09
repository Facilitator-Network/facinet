/**
 * GET /api/explorer/transaction/[txHash]
 *
 * Get transaction details by transaction hash
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLogByTxHash } from '@/lib/explorer-logging';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ txHash: string }> }
) {
  try {
    const { txHash } = await params;

    if (!txHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    // Validate txHash format
    if (!txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      return NextResponse.json(
        { error: 'Invalid transaction hash format' },
        { status: 400 }
      );
    }

    // Get transaction log
    const log = await getLogByTxHash(txHash);

    if (!log) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: log,
    });
  } catch (error) {
    console.error('❌ Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}
