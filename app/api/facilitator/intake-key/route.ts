/**
 * GET /api/facilitator/intake-key
 *
 * Returns the RSA public key the browser uses to seal a facilitator
 * private key before sending it to /api/facilitator/create. The matching
 * private key never leaves the server (see lib/key-intake.ts).
 *
 * Public by design — a public key is not a secret. No auth needed.
 */

import { NextResponse } from 'next/server';
import { getIntakePublicKeyPem, isKeyIntakeConfigured } from '@/lib/key-intake';

export async function GET() {
  if (!isKeyIntakeConfigured()) {
    return NextResponse.json(
      { error: 'Key intake is not configured on this deployment.' },
      { status: 503 }
    );
  }

  try {
    const publicKeyPem = getIntakePublicKeyPem();
    return NextResponse.json(
      {
        publicKey: publicKeyPem,
        alg: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      {
        // Public key is stable for the life of the deployment; let the
        // browser cache it briefly to avoid a round-trip per creation.
        headers: { 'Cache-Control': 'public, max-age=300' },
      }
    );
  } catch (error) {
    console.error('❌ Failed to load intake public key:', error);
    return NextResponse.json(
      { error: 'Key intake misconfigured.' },
      { status: 500 }
    );
  }
}
