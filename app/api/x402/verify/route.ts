/**
 * Proxy for x402 Facilitator /verify endpoint
 * Avoids CORS issues by proxying through Next.js API
 */

import { NextRequest, NextResponse } from 'next/server';

// Use environment variable for facilitator URL
const FACILITATOR_URL = process.env.FACILITATOR_URL || process.env.NEXT_PUBLIC_FACILITATOR_URL || 'http://localhost:8080';

/**
 * Proxies the payment verification request to the running facilitator instance.
 * 
 * @param {NextRequest} request - The incoming request containing x402 headers and requirements
 * @returns {Promise<NextResponse>} JSON response indicating if payment is valid
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${FACILITATOR_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Facilitator responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Facilitator /verify error:', error);
    return NextResponse.json(
      { 
        isValid: false,
        invalidReason: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 503 }
    );
  }
}
