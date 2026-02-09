/**
 * POST /api/x402/settle-custom
 *
 * Settles payment using a custom facilitator.
 * Uses network/chainId/usdcAddress FROM REQUEST BODY (sent by SDK/CLI).
 * Supports: Avalanche Fuji, Ethereum Sepolia, Base Sepolia, Polygon Amoy.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacilitator, recordPayment } from '@/lib/facilitator-storage';
import { decryptPrivateKey } from '@/lib/facilitator-crypto';
import { Wallet, JsonRpcProvider, Contract } from 'ethers';
import { getNetworkConfig, getNetworkByChainId, isNetworkSupported } from '@/lib/networks';
import { getUSDCContract } from '@/lib/contracts';
import { logEvent } from '@/lib/explorer-logging';

const ERC3009_ABI = [
  'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      facilitatorId,
      paymentPayload,
      network: requestNetwork,
      chainId: requestChainId,
      usdcAddress: bodyUsdcAddress,
      contractAddress: bodyContractAddress,
      verifyingContract: bodyVerifyingContract,
    } = body;

    if (!facilitatorId || !paymentPayload) {
      return NextResponse.json(
        { error: 'Missing facilitatorId or paymentPayload' },
        { status: 400 }
      );
    }

    console.log('🔧 Custom facilitator payment:', facilitatorId, 'network hint:', requestNetwork, 'chainId:', requestChainId);

    const facilitator = await getFacilitator(facilitatorId);
    if (!facilitator) {
      return NextResponse.json(
        { error: 'Facilitator not found' },
        { status: 404 }
      );
    }

    let networkName: string;
    if (requestNetwork && typeof requestNetwork === 'string' && isNetworkSupported(requestNetwork)) {
      networkName = requestNetwork;
    } else if (typeof requestChainId === 'number') {
      const byChain = getNetworkByChainId(requestChainId);
      networkName = byChain ? byChain.name : (facilitator.network || 'avalanche-fuji');
    } else {
      networkName = facilitator.network || 'avalanche-fuji';
    }

    console.log('🌐 Resolved network:', networkName);

    const networkConfig = getNetworkConfig(networkName);
    const usdcContractConfig = getUSDCContract(networkName);

    const masterKey = process.env.SYSTEM_MASTER_KEY;
    if (!masterKey) {
      console.error('❌ SYSTEM_MASTER_KEY not set');
      return NextResponse.json(
        { error: 'System configuration error' },
        { status: 500 }
      );
    }

    const privateKey = decryptPrivateKey(facilitator.systemEncryptedKey, masterKey);
    const provider = new JsonRpcProvider(networkConfig.rpcUrl);
    const wallet = new Wallet(privateKey, provider);

    const { signature, authorization } = paymentPayload;
    const { from, to, value, validAfter, validBefore, nonce } = authorization;

    const sig = signature.slice(2);
    const r = '0x' + sig.slice(0, 64);
    const s = '0x' + sig.slice(64, 128);
    const v = parseInt(sig.slice(128, 130), 16);

    const payloadDomain = (paymentPayload as any).domain || {};
    const candidateAddresses = [
      bodyUsdcAddress,
      bodyContractAddress,
      bodyVerifyingContract,
      payloadDomain.verifyingContract,
      usdcContractConfig.address,
    ].filter((addr): addr is string => typeof addr === 'string' && addr !== '0x' && addr.length >= 42);

    const finalUsdcAddress = (candidateAddresses[0] || usdcContractConfig.address) as `0x${string}`;

    console.log('💵 USDC contract:', finalUsdcAddress, '(network:', networkName + ')');

    const contract = new Contract(finalUsdcAddress, ERC3009_ABI, wallet);

    console.log('📡 Executing transferWithAuthorization on', networkConfig.displayName, '...');

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

    const receipt = await tx.wait();
    const gasSpent = receipt
      ? (BigInt(receipt.gasUsed) * BigInt((receipt as any).gasPrice || 0)).toString()
      : '0';

    await recordPayment(facilitatorId);

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
      gasSpent: gasSpent,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      facilitatorWallet: wallet.address,
      facilitatorName: facilitator.name,
      network: networkName,
      networkId: networkConfig.chain.id,
      usdcAddress: finalUsdcAddress,
    });
  } catch (error: any) {
    console.error('❌ Custom facilitator settlement error:', error);
    return NextResponse.json(
      {
        error: 'Settlement failed',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
