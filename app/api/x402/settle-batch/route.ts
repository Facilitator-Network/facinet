/**
 * POST /api/x402/settle-batch
 *
 * Settles batch payments using a custom facilitator
 * Executes multiple transferWithAuthorization calls
 * Used for demo payments with platform fee split
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacilitator, recordPayment } from '@/lib/facilitator-storage';
import { decryptPrivateKey } from '@/lib/facilitator-crypto';
import { Wallet, JsonRpcProvider, Contract } from 'ethers';
import { getNetworkConfig } from '@/lib/networks';
import { logEvent } from '@/lib/explorer-logging';

// ERC-3009 ABI for transferWithAuthorization
const ERC3009_ABI = [
  'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external'
];

interface SignedAuthorization {
  signature: string;
  authorization: {
    from: string;
    to: string;
    value: string;
    validAfter: string;
    validBefore: string;
    nonce: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilitatorId, network, authorizations } = body;

    if (!facilitatorId || !network || !authorizations || !Array.isArray(authorizations)) {
      return NextResponse.json(
        { error: 'Missing required fields: facilitatorId, network, authorizations' },
        { status: 400 }
      );
    }

    if (authorizations.length === 0) {
      return NextResponse.json(
        { error: 'At least one authorization required' },
        { status: 400 }
      );
    }

    console.log(`🔧 Batch payment on ${network}: ${authorizations.length} transfers`);

    // Get facilitator from storage
    const facilitator = await getFacilitator(facilitatorId);
    if (!facilitator) {
      return NextResponse.json(
        { error: 'Facilitator not found' },
        { status: 404 }
      );
    }

    // Verify facilitator is on correct network
    const facilitatorNetwork = facilitator.network || 'avalanche-fuji';
    if (facilitatorNetwork !== network) {
      return NextResponse.json(
        { error: `Facilitator is on ${facilitatorNetwork}, not ${network}` },
        { status: 400 }
      );
    }

    console.log('✅ Found facilitator:', facilitator.name, 'on', network);

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

    // Get network configuration
    const networkConfig = getNetworkConfig(network);

    // Initialize provider and wallet with network-specific RPC
    const provider = new JsonRpcProvider(networkConfig.rpcUrl);
    const wallet = new Wallet(privateKey, provider);

    console.log('💰 Facilitator wallet:', wallet.address);
    console.log('🌐 Network:', networkConfig.displayName);
    console.log('💵 USDC contract:', networkConfig.usdcAddress);

    // Create contract instance with network-specific USDC
    const contract = new Contract(
      networkConfig.usdcAddress,
      ERC3009_ABI,
      wallet
    );

    // Execute all transfers
    const txHashes: string[] = [];
    let totalGasSpent = BigInt(0);

    for (let i = 0; i < authorizations.length; i++) {
      const signedAuth: SignedAuthorization = authorizations[i];
      const { signature, authorization } = signedAuth;
      const { from, to, value, validAfter, validBefore, nonce } = authorization;

      // Split signature into v, r, s components
      const sig = signature.slice(2); // Remove 0x
      const r = '0x' + sig.slice(0, 64);
      const s = '0x' + sig.slice(64, 128);
      const v = parseInt(sig.slice(128, 130), 16);

      console.log(`📡 Executing transfer ${i + 1}/${authorizations.length}...`);
      console.log('  From:', from);
      console.log('  To:', to);
      console.log('  Value:', value);

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

      console.log(`⏳ Transfer ${i + 1} submitted:`, tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Transfer ${i + 1} confirmed:`, tx.hash);

      txHashes.push(tx.hash);

      // Calculate gas spent for this transfer
      if (receipt) {
        const gasSpent = BigInt(receipt.gasUsed) * BigInt(receipt.gasPrice || 0);
        totalGasSpent += gasSpent;

        // Log each transfer event
        await logEvent({
          eventType: 'transaction',
          facilitatorId: facilitatorId,
          facilitatorName: facilitator.name,
          txHash: tx.hash,
          chainId: networkConfig.chain.id,
          chainName: networkConfig.displayName,
          fromAddress: from,
          toAddress: to,
          amount: value.toString(),
          gasSpent: gasSpent.toString(),
          status: 'success',
        });
      }
    }

    // Record payment for facilitator (increments totalPayments counter)
    await recordPayment(facilitatorId);

    console.log(`✅ Batch settlement complete! ${txHashes.length} transfers executed`);
    console.log('📊 Total gas spent:', totalGasSpent.toString(), 'wei');

    return NextResponse.json({
      success: true,
      txHashes: txHashes,
      txHash: txHashes[0], // Primary tx hash for compatibility
      facilitatorWallet: wallet.address,
      facilitatorName: facilitator.name,
      transferCount: txHashes.length,
      totalGasSpent: totalGasSpent.toString(),
      network: networkConfig.displayName,
    });

  } catch (error: any) {
    console.error('❌ Batch settlement error:', error);
    return NextResponse.json(
      {
        error: 'Batch settlement failed',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
