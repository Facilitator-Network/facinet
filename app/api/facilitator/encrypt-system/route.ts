/**
 * POST /api/facilitator/encrypt-system
 *
 * Admin utility: encrypts a private key with the system master key so the
 * backend can decrypt and use it later.
 *
 * Body (preferred):  { sealedPrivateKey }  — RSA-sealed via the intake key.
 * Body (deprecated): { privateKey }         — plaintext, transitional only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { encryptPrivateKey } from '@/lib/facilitator-crypto';
import { unsealPrivateKey } from '@/lib/key-intake';

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
    const { sealedPrivateKey, privateKey } = await request.json();

    if (!sealedPrivateKey && !privateKey) {
      return NextResponse.json(
        { error: 'sealedPrivateKey (preferred) or privateKey is required' },
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

    // Resolve the raw key without logging/storing it.
    let rawKey: string;
    if (sealedPrivateKey) {
      try {
        rawKey = unsealPrivateKey(sealedPrivateKey);
      } catch (err) {
        console.error('❌ Failed to unseal key:', (err as Error).message);
        return NextResponse.json(
          { error: 'Could not unseal private key' },
          { status: 400 }
        );
      }
    } else {
      console.warn('⚠️ DEPRECATED: encrypt-system called with plaintext privateKey.');
      rawKey = privateKey;
    }

    // Encrypt with system master key, then drop the plaintext.
    const encrypted = encryptPrivateKey(rawKey, masterKey);
    rawKey = '';

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
