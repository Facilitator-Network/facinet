/**
 * Protected API Route - Builder Hub Access
 *
 * This route demonstrates the x402 protocol:
 * 1. Client requests without payment -> Returns 402 with payment requirements
 * 2. Client pays through facilitator
 * 3. Client retries with X-PAYMENT header -> Verifies payment -> Returns content
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentRequirements, decodePaymentHeader } from '@/lib/x402';

// Server-side can call facilitator directly (no CORS)
const FACILITATOR_URL = process.env.NEXT_PUBLIC_FACILITATOR_URL || 'http://localhost:8080';

async function verifyPaymentServerSide(
  paymentHeader: string,
  paymentRequirements: any
): Promise<{ isValid: boolean; invalidReason?: string }> {
  const response = await fetch(`${FACILITATOR_URL}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      x402Version: 1,
      paymentHeader,
      paymentRequirements,
    }),
  });

  if (!response.ok) {
    throw new Error(`Facilitator verify failed: ${response.statusText}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  // Check for X-PAYMENT header
  const paymentHeader = request.headers.get('x-payment');

  // No payment provided - return 402 Payment Required
  if (!paymentHeader) {
    const paymentRequirements = createPaymentRequirements();

    return new NextResponse(
      JSON.stringify({
        error: 'Payment Required',
        message: 'Please pay to access this content',
        paymentRequirements,
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-Accept-Payment': JSON.stringify(paymentRequirements),
        },
      }
    );
  }

  // Payment header provided - verify it
  try {
    const paymentRequirements = createPaymentRequirements();

    // Verify payment with facilitator (server-side direct call)
    const verificationResult = await verifyPaymentServerSide(paymentHeader, paymentRequirements);

    if (!verificationResult.isValid) {
      return new NextResponse(
        JSON.stringify({
          error: 'Invalid Payment',
          message: verificationResult.invalidReason || 'Payment verification failed',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Payment is valid - decode to get transaction details
    const paymentPayload = decodePaymentHeader(paymentHeader);

    // Return protected content
    return NextResponse.json({
      success: true,
      message: 'Payment verified! Welcome to Builder Hub',
      access: {
        granted: true,
        paidBy: paymentPayload.payload.from,
        amount: paymentPayload.payload.amount,
        network: paymentPayload.network,
      },
      content: {
        title: 'Builder Hub - Exclusive Content',
        description: 'You have successfully paid using the x402 protocol!',
        features: [
          'Pay-Per-Use APIs',
          'AI Agent Payments',
          'Data Marketplaces',
          'Gaming Microtransactions',
          'Content Monetization',
          'Micropayment Services',
        ],
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);

    return new NextResponse(
      JSON.stringify({
        error: 'Verification Error',
        message: error instanceof Error ? error.message : 'Failed to verify payment',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
