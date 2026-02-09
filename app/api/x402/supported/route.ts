/**
 * Proxy for x402 Facilitator /supported endpoint
 * Avoids CORS issues by proxying through Next.js API
 */

import { NextResponse } from 'next/server';

// Use environment variable for facilitator URL
const FACILITATOR_URL = process.env.FACILITATOR_URL || process.env.NEXT_PUBLIC_FACILITATOR_URL || 'http://localhost:8080';

export async function GET() {
  try {
    console.log('[x402 Proxy] Calling facilitator at:', FACILITATOR_URL);

    const response = await fetch(`${FACILITATOR_URL}/supported`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Facilitator responded with ${response.status}`);
    }

    const data = await response.json();
    console.log('[x402 Proxy] Facilitator response:', JSON.stringify(data));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Facilitator /supported error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to facilitator', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 503 }
    );
  }
}
