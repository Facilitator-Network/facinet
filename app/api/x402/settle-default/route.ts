/**
 * POST /api/x402/settle-default
 *
 * Default facilitator for ERC-3009 payments
 * Uses the payment recipient's private key from environment
 * Supports multiple networks: Avalanche Fuji, Ethereum Sepolia, Base Sepolia, Polygon Amoy
 */

import { NextRequest, NextResponse } from 'next/server';
import { Wallet, JsonRpcProvider, Contract } from 'ethers';
import { getNetworkConfig } from '@/lib/networks';
import { getUSDCContract } from '@/lib/contracts';
import { submitWithNonceRetry } from '@/lib/tx-submit';

// ERC-3009 ABI for transferWithAuthorization
const ERC3009_ABI = [
  'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentPayload, paymentRequirements, network = 'avalanche-fuji' } = body;

    if (!paymentPayload) {
      return NextResponse.json(
        { error: 'Missing paymentPayload' },
        { status: 400 }
      );
    }

    console.log(`💰 Default facilitator payment on ${network}`);

    // Get network-specific configuration
    const networkConfig = getNetworkConfig(network);
    const usdcContract = getUSDCContract(network);

    // Get default facilitator private key from environment
    // Try network-specific key first, fallback to generic key
    const networkSpecificKey = process.env[`DEFAULT_FACILITATOR_PRIVATE_KEY_${network.toUpperCase().replace(/-/g, '_')}`];
    const privateKey = networkSpecificKey || process.env.DEFAULT_FACILITATOR_PRIVATE_KEY;

    if (!privateKey) {
      console.error(`❌ DEFAULT_FACILITATOR_PRIVATE_KEY not set for network: ${network}`);
      return NextResponse.json(
        { error: 'Default facilitator not configured for this network' },
        { status: 500 }
      );
    }

    // Initialize provider and wallet with network-specific RPC
    const provider = new JsonRpcProvider(networkConfig.rpcUrl);
    const wallet = new Wallet(privateKey, provider);

    console.log('💰 Default facilitator wallet:', wallet.address);
    console.log(`🌐 Network: ${networkConfig.displayName} (Chain ID: ${networkConfig.chain.id})`);

    // Extract ERC-3009 parameters from payload
    const { signature, authorization } = paymentPayload.payload;
    const { from, to, value, validAfter, validBefore, nonce } = authorization;

    // Split signature into v, r, s components
    const sig = signature.slice(2); // Remove 0x
    const r = '0x' + sig.slice(0, 64);
    const s = '0x' + sig.slice(64, 128);
    let v = parseInt(sig.slice(128, 130), 16);
    if (v < 27) v += 27;

    // Create contract instance with network-specific USDC address
    const contract = new Contract(usdcContract.address, ERC3009_ABI, wallet);

    console.log('📡 Executing transferWithAuthorization...');
    console.log('  From:', from);
    console.log('  To:', to);
    console.log('  Value:', value);
    console.log('  USDC Contract:', usdcContract.address);
    console.log('  Facilitator (gas payer):', wallet.address);

    // Submit through the Redis nonce manager so concurrent settle-default
    // calls on the same default wallet don't collide.
    const { tx } = await submitWithNonceRetry(
      wallet,
      provider,
      (txNonce) =>
        contract.transferWithAuthorization(
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
        ),
      { label: 'settle-default' }
    );

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      tx: tx.hash,
      facilitatorWallet: wallet.address,
      network,
      networkId: networkConfig.chain.id,
    });

  } catch (error: any) {
    console.error('❌ Default facilitator settlement error:', error);
    return NextResponse.json(
      {
        error: 'Settlement failed',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
