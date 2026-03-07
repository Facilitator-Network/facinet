/**
 * POST /api/facilitator/create
 *
 * Create a new facilitator
 * 
 * @param {object} body - The request body
 * @param {string} body.name - Name of the facilitator
 * @param {string} body.encryptedPrivateKey - Private key encrypted with user password
 * @param {string} body.privateKey - Plain private key (will be encrypted with system key)
 * @param {string} body.facilitatorWallet - Wallet address of the facilitator
 * @param {string} body.paymentRecipient - Address to receive payments
 * @param {string} body.createdBy - Address of the user creating the facilitator
 * @param {string} body.registrationTxHash - Hash of the registration fee payment transaction
 * 
 * @returns {Promise<NextResponse>} JSON response with success status and facilitator details
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  storeFacilitator,
  generateFacilitatorId,
  getFacilitatorsByCreator,
  type Facilitator,
} from '@/lib/facilitator-storage';
import { logEvent } from '@/lib/explorer-logging';
import { isNetworkSupported, getNetworkConfig } from '@/lib/networks';
import { getRedis } from '@/lib/redis';

const CREATOR_KEY_PREFIX = 'facilitator:creator:';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      encryptedPrivateKey,
      privateKey, // Plain private key for system encryption
      facilitatorWallet,
      paymentRecipient,
      createdBy,
      registrationTxHash,
      network,
      chainId,
    } = body;

    // Whitelist check: only whitelisted wallets can create facilitators
    const ADMIN_WALLET = (process.env.ADMIN_WALLET || '').toLowerCase();
    if (createdBy && createdBy.toLowerCase() !== ADMIN_WALLET) {
      const redis = getRedis();
      const whitelistApproved = await redis.get(`whitelist:approved:${createdBy.toLowerCase()}`);
      if (!whitelistApproved) {
        return NextResponse.json(
          { success: false, error: 'Your wallet is not whitelisted. Please apply for whitelist access first.' },
          { status: 403 }
        );
      }
    }

    // Rate limit: each wallet can only create one facilitator
    if (createdBy) {
      // Check Redis key first (fast path)
      const redis = getRedis();
      const creatorKey = `${CREATOR_KEY_PREFIX}${createdBy.toLowerCase()}`;
      const existingFacilitator = await redis.get(creatorKey);
      if (existingFacilitator) {
        return NextResponse.json(
          { success: false, error: 'Each wallet can only create one facilitator. You already have a facilitator registered.' },
          { status: 429 }
        );
      }

      // Also check by creator in facilitator list (handles old facilitators without Redis key)
      const existingByCreator = await getFacilitatorsByCreator(createdBy);
      if (existingByCreator && existingByCreator.length > 0) {
        // Backfill the Redis key for future fast lookups
        await redis.set(creatorKey, existingByCreator[0].id);
        return NextResponse.json(
          { success: false, error: 'Each wallet can only create one facilitator. You already have a facilitator registered.' },
          { status: 429 }
        );
      }
    }

    // Validate required fields
    if (!name || !encryptedPrivateKey || !privateKey || !facilitatorWallet || !paymentRecipient || !createdBy || !registrationTxHash || !network || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate network
    if (!isNetworkSupported(network)) {
      return NextResponse.json(
        { error: `Unsupported network: ${network}` },
        { status: 400 }
      );
    }

    // Get system master key for encryption
    const masterKey = process.env.SYSTEM_MASTER_KEY;
    if (!masterKey) {
      console.error('❌ SYSTEM_MASTER_KEY not set');
      return NextResponse.json(
        { error: 'System configuration error - master key not configured' },
        { status: 500 }
      );
    }

    // Encrypt private key with system master key
    const { encryptPrivateKey } = await import('@/lib/facilitator-crypto');
    const systemEncryptedKey = encryptPrivateKey(privateKey, masterKey);

    // Validate name
    if (name.length < 3 || name.length > 50) {
      return NextResponse.json(
        { error: 'Facilitator name must be between 3 and 50 characters' },
        { status: 400 }
      );
    }

    // Validate addresses
    if (!facilitatorWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid facilitator wallet address' },
        { status: 400 }
      );
    }

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

    // Verify registration payment on-chain
    console.log(`🔍 Verifying registration payment on ${network}...`);
    const { verifyRegistrationPayment } = await import('@/lib/verify-payment');
    const verification = await verifyRegistrationPayment(registrationTxHash, createdBy, network);

    if (!verification.valid) {
      console.error('❌ Payment verification failed:', verification.error);
      return NextResponse.json(
        { error: `Payment verification failed: ${verification.error}` },
        { status: 400 }
      );
    }

    console.log('✅ Registration payment verified:', verification.details);

    // Generate facilitator ID
    const id = generateFacilitatorId();

    // Create facilitator object
    const facilitator: Facilitator = {
      id,
      name,
      encryptedPrivateKey,
      systemEncryptedKey,
      facilitatorWallet,
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

    // Store in Redis
    await storeFacilitator(facilitator);

    // Track creator address for rate limiting (one facilitator per wallet)
    const redis = getRedis();
    const creatorKey = `${CREATOR_KEY_PREFIX}${createdBy.toLowerCase()}`;
    await redis.set(creatorKey, id);

    console.log(`✅ Created facilitator: ${id} by ${createdBy}`);

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

    // Register on-chain (ERC-8004 Identity Registry)
    let onChainId = null;
    let onChainRegistrationTx = null;

    try {
      console.log('🔗 Registering facilitator on-chain...');

      // Create registration file data (could be stored on IPFS)
      const registrationData = {
        type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
        name: name,
        description: `x402 Facilitator - ${name}`,
        image: "", // TODO: Add facilitator image
        endpoints: [
          {
            name: "agentWallet",
            endpoint: `eip155:${chainId}:${facilitatorWallet}`
          },
          {
            name: "paymentRecipient",
            endpoint: `eip155:${chainId}:${paymentRecipient}`
          }
        ],
        supportedTrust: ["reputation"]
      };

      // For now, use a simple data URI (in production, upload to IPFS)
      const dataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(registrationData)).toString('base64')}`;

      // Register on-chain using backend wallet
      // NOTE: This requires a backend wallet with AVAX for gas
      // In production, you might want the user to do this transaction
      const { registerFacilitatorOnChain } = await import('@/lib/reputation-contract');
      const { ethers } = await import('ethers');

      if (process.env.BACKEND_WALLET_PRIVATE_KEY) {
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'
        );
        const backendSigner = new ethers.Wallet(process.env.BACKEND_WALLET_PRIVATE_KEY, provider);

        const result = await registerFacilitatorOnChain(dataUri, backendSigner);
        onChainId = result.facilitatorId;
        onChainRegistrationTx = result.txHash;

        console.log(`✅ Facilitator registered on-chain: ID ${onChainId}, TX ${onChainRegistrationTx}`);
      } else {
        console.warn('⚠️ BACKEND_WALLET_PRIVATE_KEY not set, skipping on-chain registration');
      }
    } catch (error) {
      console.error('❌ Failed to register on-chain:', error);
      // Don't fail the entire request - facilitator is still created in Redis
    }

    // Return public info
    return NextResponse.json({
      success: true,
      facilitator: {
        id: facilitator.id,
        facilitatorWallet: facilitator.facilitatorWallet,
        paymentRecipient: facilitator.paymentRecipient,
        status: facilitator.status,
        createdAt: facilitator.createdAt,
        onChainId, // ERC-8004 facilitator ID (null if not registered)
        onChainTxHash: onChainRegistrationTx,
      },
    });
  } catch (error) {
    console.error('❌ Error creating facilitator:', error);
    return NextResponse.json(
      { error: 'Failed to create facilitator' },
      { status: 500 }
    );
  }
}
