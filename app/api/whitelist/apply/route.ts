/**
 * POST /api/whitelist/apply
 * Submit a whitelist application (name, email, wallet address)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, wallet } = body;

    if (!name || !email || !wallet) {
      return NextResponse.json(
        { error: 'Name, email, and wallet address are required' },
        { status: 400 }
      );
    }

    // Input sanitization
    const sanitizedName = String(name).trim().slice(0, 100).replace(/[<>]/g, '');
    const sanitizedEmail = String(email).trim().slice(0, 200);

    if (sanitizedName.length < 1) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    if (!sanitizedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const walletLower = wallet.toLowerCase();

    // Check if already approved
    const approved = await redis.get(`whitelist:approved:${walletLower}`);
    if (approved) {
      return NextResponse.json(
        { success: true, status: 'already_approved', message: 'This wallet is already whitelisted.' }
      );
    }

    // Check if already pending
    const pending = await redis.get(`whitelist:pending:${walletLower}`);
    if (pending) {
      return NextResponse.json(
        { success: true, status: 'already_pending', message: 'Your application is already under review.' }
      );
    }

    // Store application
    const application = {
      name: sanitizedName,
      email: sanitizedEmail,
      wallet: walletLower,
      appliedAt: new Date().toISOString(),
    };

    await redis.set(`whitelist:pending:${walletLower}`, JSON.stringify(application));

    // Add to pending set for easy listing
    await redis.sadd('whitelist:pending_set', walletLower);

    return NextResponse.json({
      success: true,
      status: 'pending',
      message: 'Application submitted successfully! You will receive an email once approved.',
    });
  } catch (error) {
    console.error('❌ Whitelist apply error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
