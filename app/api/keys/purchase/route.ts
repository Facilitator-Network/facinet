/**
 * POST /api/keys/purchase
 *
 * Purchase an API key by paying 10 USDC via x402.
 * Requires whitelist approval.
 *
 * Body:
 * {
 *   wallet: string,              // buyer wallet
 *   paymentTxHash: string,       // x402 payment tx hash
 *   network: string              // network where payment was made
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, paymentTxHash, network } = body;

    if (!wallet || !paymentTxHash || !network) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet, paymentTxHash, network' },
        { status: 400 }
      );
    }

    if (!wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const walletLower = wallet.toLowerCase();

    // Check whitelist (admin is always allowed)
    const adminWallet = (process.env.ADMIN_WALLET || '').toLowerCase();
    if (walletLower !== adminWallet) {
      const approved = await redis.get(`whitelist:approved:${walletLower}`);
      if (!approved) {
        return NextResponse.json(
          { error: 'Your wallet is not whitelisted. Apply at /facilitator first.' },
          { status: 403 }
        );
      }
    }

    // Verify payment on-chain
    try {
      const { verifyPayment } = await import('@/lib/verify-payment');
      const platformWallet = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT || '';
      const API_KEY_PRICE = '10000000'; // 10 USDC (6 decimals)
      const verification = await verifyPayment(paymentTxHash, wallet, platformWallet, API_KEY_PRICE, network);
      if (!verification.valid) {
        return NextResponse.json(
          { error: `Payment verification failed: ${verification.error}` },
          { status: 400 }
        );
      }
    } catch (error: any) {
      return NextResponse.json(
        { error: `Payment verification error: ${error.message}` },
        { status: 400 }
      );
    }

    // Check if this tx hash was already used
    const txUsed = await redis.get(`apikey:tx:${paymentTxHash}`);
    if (txUsed) {
      return NextResponse.json(
        { error: 'This payment transaction has already been used to purchase an API key' },
        { status: 400 }
      );
    }

    // Generate API key
    const keyId = `fk_${randomBytes(20).toString('hex')}`;

    const keyData = {
      key: keyId,
      wallet: walletLower,
      totalCalls: 1000,
      usedCalls: 0,
      paymentTxHash,
      network,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      status: 'active',
    };

    // Store API key
    await redis.set(`apikey:${keyId}`, JSON.stringify(keyData));

    // Track tx hash to prevent reuse
    await redis.set(`apikey:tx:${paymentTxHash}`, keyId);

    // Add to wallet's key set
    await redis.sadd(`apikeys:wallet:${walletLower}`, keyId);

    return NextResponse.json({
      success: true,
      apiKey: keyId,
      totalCalls: 1000,
      message: 'API key generated successfully. Use X-API-Key header with /api/v1/execute.',
    });
  } catch (error: any) {
    console.error('❌ API key purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to purchase API key' },
      { status: 500 }
    );
  }
}
