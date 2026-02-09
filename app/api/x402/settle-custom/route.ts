/**
 * POST /api/x402/settle-custom
 *
 * Settles payment using a custom facilitator
 * Decrypts facilitator's private key and executes transaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacilitator, recordPayment } from '@/lib/facilitator-storage';
import { decryptPrivateKey } from '@/lib/facilitator-crypto';
import { Wallet, JsonRpcProvider } from 'ethers';
import { USDC_FUJI } from '@/lib/contracts';
import { logEvent } from '@/lib/explorer-logging';

// ERC-3009 ABI for transferWithAuthorization
// This allows the facilitator to pay gas while USDC goes to the payment recipient
const ERC3009_ABI = [
  'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilitatorId, paymentPayload } = body;

    if (!facilitatorId || !paymentPayload) {
      return NextResponse.json(
        { error: 'Missing facilitatorId or paymentPayload' },
        { status: 400 }
      );
    }

    console.log('🔧 Custom facilitator payment:', facilitatorId);

    // Get facilitator from storage
    const facilitator = await getFacilitator(facilitatorId);
    if (!facilitator) {
      return NextResponse.json(
        { error: 'Facilitator not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found facilitator:', facilitator.name);

    // Get system master key
    const masterKey = process.env.SYSTEM_MASTER_KEY;
    if (!masterKey) {
      console.error('❌ SYSTEM_MASTER_KEY not set');
      return NextResponse.json(
        { error: 'System configuration error' },
        { status: 500 }
      );
    }

    // Decrypt private key
    console.log('🔐 Decrypting facilitator private key...');
    const privateKey = decryptPrivateKey(facilitator.systemEncryptedKey, masterKey);
    console.log('✅ Private key decrypted');

    // Initialize provider and wallet
    const rpcUrl = process.env.RPC_URL_AVALANCHE_FUJI || 'https://api.avax-test.network/ext/bc/C/rpc';
    const provider = new JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(privateKey, provider);

    console.log('💰 Facilitator wallet:', wallet.address);
    console.log('💵 Payment recipient:', facilitator.paymentRecipient);

    // Extract ERC-3009 parameters from payload
    const { signature, authorization } = paymentPayload;
    const { from, to, value, validAfter, validBefore, nonce } = authorization;

    // Split signature into v, r, s components
    const sig = signature.slice(2); // Remove 0x
    const r = '0x' + sig.slice(0, 64);
    const s = '0x' + sig.slice(64, 128);
    const v = parseInt(sig.slice(128, 130), 16);

    // Create contract instance
    const contract = new (require('ethers').Contract)(
      USDC_FUJI.address,
      ERC3009_ABI,
      wallet
    );

    console.log('📡 Executing transferWithAuthorization...');
    console.log('  From:', from);
    console.log('  To:', to);
    console.log('  Value:', value);
    console.log('  Facilitator (gas payer):', wallet.address);

    // Execute transaction
    const tx = await contract.transferWithAuthorization(
      from,
      to,
      value,
      validAfter,
      validBefore,
      nonce,
      v,
      r,
      s
    );

    console.log('⏳ Transaction submitted:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed:', tx.hash);

    // Calculate gas spent
    const gasSpent = receipt ? (BigInt(receipt.gasUsed) * BigInt(receipt.gasPrice || 0)).toString() : '0';

    // Record payment for facilitator
    await recordPayment(facilitatorId);

    // Log transaction event
    await logEvent({
      eventType: 'transaction',
      facilitatorId: facilitatorId,
      facilitatorName: facilitator.name,
      txHash: tx.hash,
      chainId: 43113,
      chainName: 'Avalanche Fuji',
      fromAddress: from,
      toAddress: to,
      amount: value.toString(),
      gasSpent: gasSpent,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      facilitatorWallet: wallet.address,
      facilitatorName: facilitator.name,
    });

  } catch (error: any) {
    console.error('❌ Custom facilitator settlement error:', error);
    return NextResponse.json(
      {
        error: 'Settlement failed',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
