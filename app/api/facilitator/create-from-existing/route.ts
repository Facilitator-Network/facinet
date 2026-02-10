/**
 * POST /api/facilitator/create-from-existing
 *
 * Create a new facilitator on a different network reusing an existing
 * facilitator account (same underlying private key / wallet address).
 *
 * Flow:
 * - User already created at least one facilitator (base account).
 * - Frontend asks for: network, name, password, registrationTxHash, etc.
 * - Backend:
 *   - Finds an existing facilitator for this user.
 *   - Verifies the password by attempting to decrypt the stored encryptedPrivateKey.
 *   - Verifies the new registration payment on the target network.
 *   - Creates a new facilitator record that reuses:
 *       - encryptedPrivateKey
 *       - systemEncryptedKey
 *       - facilitatorWallet (same address on all networks)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  storeFacilitator,
  generateFacilitatorId,
  getFacilitatorsByCreator,
  getFacilitator,
  type Facilitator,
} from '@/lib/facilitator-storage';
import { decryptPrivateKey } from '@/lib/facilitator-crypto';
import { logEvent } from '@/lib/explorer-logging';
import { isNetworkSupported, getNetworkConfig } from '@/lib/networks';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      password,
      paymentRecipient,
      createdBy,
      registrationTxHash,
      network,
      chainId,
    } = body;

    // Basic validation
    if (
      !name ||
      !password ||
      !paymentRecipient ||
      !createdBy ||
      !registrationTxHash ||
      !network ||
      !chainId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate network support
    if (!isNetworkSupported(network)) {
      return NextResponse.json(
        { error: `Unsupported network: ${network}` },
        { status: 400 }
      );
    }

    // Validate name
    if (name.length < 3 || name.length > 50) {
      return NextResponse.json(
        { error: 'Facilitator name must be between 3 and 50 characters' },
        { status: 400 }
      );
    }

    // Validate addresses
    if (!paymentRecipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid payment recipient address' },
        { status: 400 }
      );
    }

    if (!createdBy.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid creator address' },
        { status: 400 }
      );
    }

    // Find an existing facilitator for this user to act as the "account"
    const userFacilitators = await getFacilitatorsByCreator(createdBy);

    if (!userFacilitators || userFacilitators.length === 0) {
      return NextResponse.json(
        {
          error:
            'No existing facilitator account found. Please create your first facilitator before adding more networks.',
        },
        { status: 400 }
      );
    }

    // Use the most recently used facilitator as the primary account
    const baseFacilitatorPublic = userFacilitators[0];
    const baseFacilitator = await getFacilitator(baseFacilitatorPublic.id);

    if (!baseFacilitator) {
      return NextResponse.json(
        { error: 'Failed to load existing facilitator account' },
        { status: 500 }
      );
    }

    // Verify password by attempting to decrypt the stored encryptedPrivateKey.
    // We don't need the decrypted value here, only that the password is correct.
    try {
      decryptPrivateKey(baseFacilitator.encryptedPrivateKey, password);
    } catch (error) {
      console.error('❌ Failed to decrypt facilitator key with provided password:', error);
      return NextResponse.json(
        { error: 'Invalid password for existing facilitator account' },
        { status: 401 }
      );
    }

    // Verify registration payment on-chain for the NEW network
    console.log(`🔍 Verifying registration payment on ${network} for additional facilitator...`);
    const { verifyRegistrationPayment } = await import('@/lib/verify-payment');
    const verification = await verifyRegistrationPayment(
      registrationTxHash,
      createdBy,
      network
    );

    if (!verification.valid) {
      console.error('❌ Payment verification failed for additional facilitator:', verification.error);
      return NextResponse.json(
        { error: `Payment verification failed: ${verification.error}` },
        { status: 400 }
      );
    }

    console.log('✅ Registration payment verified for additional facilitator:', verification.details);

    // Generate new facilitator ID
    const id = generateFacilitatorId();

    // Create new facilitator that REUSES the underlying account information
    const facilitator: Facilitator = {
      id,
      name,
      encryptedPrivateKey: baseFacilitator.encryptedPrivateKey,
      systemEncryptedKey: baseFacilitator.systemEncryptedKey,
      facilitatorWallet: baseFacilitator.facilitatorWallet,
      paymentRecipient,
      createdBy,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      totalPayments: 0,
      status: 'needs_funding',
      registrationTxHash,
      network,
      chainId,
    };

    // Store facilitator in Redis
    await storeFacilitator(facilitator);

    console.log(
      `✅ Created additional facilitator ${id} on ${network} for existing account ${baseFacilitator.facilitatorWallet}`
    );

    // Log facilitator creation event
    const networkConfig = getNetworkConfig(network);
    await logEvent({
      eventType: 'facilitator_added',
      facilitatorId: id,
      facilitatorName: name,
      chainName: networkConfig.displayName,
      chainId: chainId,
      stakeAmount: '1 USDC',
      stakeTxHash: registrationTxHash,
      status: 'success',
    });

    // NOTE: We intentionally do NOT perform a second on-chain ERC-8004 registration here,
    // since the underlying account is already represented. This can be extended later
    // if per-network identity entries are desired.

    // Return public info
    return NextResponse.json({
      success: true,
      facilitator: {
        id: facilitator.id,
        facilitatorWallet: facilitator.facilitatorWallet,
        paymentRecipient: facilitator.paymentRecipient,
        status: facilitator.status,
        createdAt: facilitator.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error creating facilitator from existing account:', error);
    return NextResponse.json(
      { error: 'Failed to create facilitator from existing account' },
      { status: 500 }
    );
  }
}

