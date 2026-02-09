/**
 * Payment Status API Route
 *
 * Checks if a payment has been verified and grants access
 * Validates ERC-3009 payment proofs with ON-CHAIN verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { decodePaymentHeader, X402_CONFIG } from '@/lib/x402';
import { parseUnits } from 'viem';
import { verifyPayment } from '@/lib/verify-payment';

const ONE_USDC_ATOMIC = '1000000'; // 1 USDC with 6 decimals

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentHeader, txHash } = body;

    if (!paymentHeader) {
      return NextResponse.json(
        { error: 'Missing payment header', verified: false },
        { status: 200 }
      );
    }

    // Decode and validate payment proof
    const paymentPayload = decodePaymentHeader(paymentHeader);

    // Basic validation
    if (!paymentPayload || !paymentPayload.payload) {
      return NextResponse.json(
        { error: 'Invalid payment proof format', verified: false },
        { status: 200 }
      );
    }

    const payload = paymentPayload.payload;

    // Check if this is an ERC-3009 authorization (has signature and authorization fields)
    const isERC3009 = 'authorization' in payload && 'signature' in payload;

    let from: string, to: string, amount: string;

    if (isERC3009) {
      // ERC-3009 authorization payload
      const auth = (payload as any).authorization;
      from = auth.from;
      to = auth.to;
      amount = auth.value; // Already in atomic units (string)
    } else {
      // Simple payload
      from = (payload as any).from;
      to = (payload as any).to;
      amount = (payload as any).amount;
    }

    // Validate payment details match expected values
    const expectedAmount = parseUnits(X402_CONFIG.PAYMENT_AMOUNT, X402_CONFIG.USDC_DECIMALS).toString();

    // Check amount, network, and scheme
    const validPayment =
      amount === expectedAmount &&
      paymentPayload.network === X402_CONFIG.NETWORK &&
      paymentPayload.scheme === 'exact';

    if (!validPayment) {
      console.error('❌ Payment validation failed:', {
        expectedAmount,
        actualAmount: amount,
        paymentRecipient: to,
        expectedNetwork: X402_CONFIG.NETWORK,
        actualNetwork: paymentPayload.network,
      });
      return NextResponse.json(
        { error: 'Payment details do not match requirements', verified: false },
        { status: 200 }
      );
    }

    // ============================================
    // ON-CHAIN VERIFICATION (if txHash provided)
    // ============================================
    if (txHash) {
      console.log('🔍 Verifying payment transaction on-chain:', txHash);

      // Verify the transaction exists on blockchain and is valid
      const verification = await verifyPayment(
        txHash,
        from, // Expected payer
        to,   // Expected recipient (facilitator's payment recipient)
        ONE_USDC_ATOMIC
      );

      if (!verification.valid) {
        console.error('❌ On-chain verification failed:', verification.error);
        return NextResponse.json(
          {
            error: `On-chain verification failed: ${verification.error}`,
            verified: false
          },
          { status: 200 }
        );
      }

      console.log('✅ Payment verified on-chain:', verification.details);
    } else {
      console.warn('⚠️  No txHash provided - skipping on-chain verification (not recommended)');
    }

    console.log('✅ Payment verified:', {
      from,
      to,
      amount,
      network: paymentPayload.network,
      type: isERC3009 ? 'ERC-3009' : 'Simple',
      onChainVerified: !!txHash,
    });

    return NextResponse.json({
      verified: true,
      payment: {
        from,
        to,
        amount,
        network: paymentPayload.network,
        onChainVerified: !!txHash,
      },
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check payment status',
        message: error instanceof Error ? error.message : 'Unknown error',
        verified: false,
      },
      { status: 200 }
    );
  }
}
