/**
 * POST /api/x402/settle
 *
 * Settles an ERC-3009 payment using a facilitator from the network.
 * The facilitator pays gas to execute transferWithAuthorization on-chain.
 *
 * Uses Redis-based nonce manager for parallel transaction support.
 *
 * Body:
 * {
 *   facilitatorId: string,
 *   network: string,
 *   authorization: {
 *     signature: string,
 *     authorization: { from, to, value, validAfter, validBefore, nonce }
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { Wallet, JsonRpcProvider, Contract } from 'ethers';
import { getFacilitator } from '@/lib/facilitator-storage';
import { decryptPrivateKey } from '@/lib/facilitator-crypto';
import { getNetworkConfig } from '@/lib/networks';
import { getUSDCContract } from '@/lib/contracts';
import { logEvent } from '@/lib/explorer-logging';
import { getNextNonce, reportTxSuccess, reportTxFailure } from '@/lib/nonce-manager';

const ERC3009_ABI = [
  'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external',
];

const MAX_RETRIES = 2;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilitatorId, network = 'avalanche-fuji', authorization } = body;

    if (!facilitatorId || !authorization) {
      return NextResponse.json(
        { error: 'Missing facilitatorId or authorization' },
        { status: 400 }
      );
    }

    const { signature, authorization: auth } = authorization;
    if (!signature || !auth) {
      return NextResponse.json(
        { error: 'Missing signature or authorization data' },
        { status: 400 }
      );
    }

    const { from, to, value, validAfter, validBefore, nonce } = auth;

    // Load facilitator from Redis
    const facilitator = await getFacilitator(facilitatorId);
    if (!facilitator) {
      return NextResponse.json(
        { error: 'Facilitator not found' },
        { status: 404 }
      );
    }

    // Decrypt facilitator private key
    const masterKey = process.env.SYSTEM_MASTER_KEY;
    if (!masterKey) {
      return NextResponse.json(
        { error: 'System configuration error' },
        { status: 500 }
      );
    }

    const privateKey = decryptPrivateKey(facilitator.systemEncryptedKey, masterKey);
    const networkConfig = getNetworkConfig(network);
    const usdcContract = getUSDCContract(network);

    const provider = new JsonRpcProvider(networkConfig.rpcUrl);
    const wallet = new Wallet(privateKey, provider);

    // Split signature into v, r, s
    const sig = signature.slice(2);
    const r = '0x' + sig.slice(0, 64);
    const s = '0x' + sig.slice(64, 128);
    let v = parseInt(sig.slice(128, 130), 16);
    if (v < 27) v += 27;

    const contract = new Contract(usdcContract.address, ERC3009_ABI, wallet);

    console.log(`[settle] Executing transferWithAuthorization via ${facilitator.name}`);
    console.log(`  From: ${from}, To: ${to}, Value: ${value}`);
    console.log(`  Network: ${networkConfig.displayName}, USDC: ${usdcContract.address}`);
    console.log(`  Facilitator wallet: ${wallet.address}`);

    // Retry loop for nonce conflicts
    let lastError: any;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Get unique nonce from Redis-based nonce manager
        const txNonce = await getNextNonce(wallet.address, provider);

        console.log(`[settle] [Attempt ${attempt + 1}] Using nonce ${txNonce}`);

        const tx = await contract.transferWithAuthorization(
          from,
          to,
          value,
          validAfter,
          validBefore,
          nonce,
          v,
          r,
          s,
          { nonce: txNonce }
        );

        console.log(`[settle] TX submitted: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`[settle] TX confirmed: ${tx.hash}`);

        // Report success
        await reportTxSuccess(wallet.address);

        // Log the event
        const gasSpent = receipt
          ? (BigInt(receipt.gasUsed) * BigInt(receipt.gasPrice || 0)).toString()
          : '0';

        await logEvent({
          eventType: 'transaction',
          facilitatorId: facilitator.id,
          facilitatorName: facilitator.name,
          txHash: tx.hash,
          chainId: networkConfig.chain.id,
          chainName: networkConfig.displayName,
          amount: value,
          gasSpent,
          status: 'success',
        });

        return NextResponse.json({
          success: true,
          txHash: tx.hash,
          tx: tx.hash,
          facilitatorWallet: wallet.address,
          network,
          networkId: networkConfig.chain.id,
        });
      } catch (error: any) {
        lastError = error;

        const wasNonceError = await reportTxFailure(wallet.address, provider, error);

        if (wasNonceError && attempt < MAX_RETRIES) {
          console.log(`[settle] Retrying (attempt ${attempt + 2}/${MAX_RETRIES + 1}) after nonce resync...`);
          continue;
        }

        break;
      }
    }

    // All retries exhausted
    console.error('[settle] Error:', lastError);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to settle payment',
        message: lastError?.message || 'Unknown error',
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('[settle] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to settle payment',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
