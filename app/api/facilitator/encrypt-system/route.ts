/**
 * POST /api/facilitator/encrypt-system
 *
 * Encrypts a private key with the system master key
 * This allows the backend to decrypt and use the key later
 */

import { NextRequest, NextResponse } from 'next/server';
import { encryptPrivateKey } from '@/lib/facilitator-crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-secret');
  if (!ADMIN_SECRET || !authHeader || authHeader !== ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const { privateKey } = await request.json();

    if (!privateKey) {
      return NextResponse.json(
        { error: 'Private key is required' },
        { status: 400 }
      );
    }

    // Get system master key from environment
    const masterKey = process.env.SYSTEM_MASTER_KEY;
    if (!masterKey) {
      console.error('❌ SYSTEM_MASTER_KEY not set in environment');
      return NextResponse.json(
        { error: 'System configuration error' },
        { status: 500 }
      );
    }

    // Encrypt with system master key
    const encrypted = encryptPrivateKey(privateKey, masterKey);

    return NextResponse.json({
      success: true,
      encrypted,
    });
  } catch (error) {
    console.error('❌ Error encrypting with system key:', error);
    return NextResponse.json(
      { error: 'Failed to encrypt' },
      { status: 500 }
    );
  }
}
