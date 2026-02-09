/**
 * Proxy for x402 Facilitator /settle endpoint
 * Avoids CORS issues by proxying through Next.js API
 */

import { NextRequest, NextResponse } from 'next/server';

// Use environment variable for facilitator URL
// Development: http://localhost:8080
// Production: https://your-facilitator.railway.app
const FACILITATOR_URL = process.env.FACILITATOR_URL || process.env.NEXT_PUBLIC_FACILITATOR_URL || 'http://localhost:8080';

/**
 * Proxies the payment settlement request to the running facilitator instance.
 * Executes the payment on-chain using the facilitator's wallet.
 * 
 * @param {NextRequest} request - The incoming request containing signed authorization
 * @returns {Promise<NextResponse>} JSON response with transaction hash and status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[x402 Proxy /settle] Request body:', JSON.stringify(body, null, 2));
    console.log('[x402 Proxy /settle] Calling facilitator at:', FACILITATOR_URL);

    const response = await fetch(`${FACILITATOR_URL}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[x402 Proxy /settle] Facilitator error:', response.status, errorText);
      throw new Error(`Facilitator responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('[x402 Proxy /settle] Success:', JSON.stringify(data, null, 2));

    // Ensure response has the expected format
    const formattedResponse = {
      success: true,
      txHash: data.txHash || data.tx || data.transaction, // Map all possible field names
      networkId: data.networkId || data.network,
      ...data
    };

    console.log('[x402 Proxy /settle] Formatted response:', JSON.stringify(formattedResponse, null, 2));
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Facilitator /settle error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to settle payment', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 503 }
    );
  }
}
