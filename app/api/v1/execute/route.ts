/**
 * POST /api/v1/execute
 *
 * Public Gasless API — execute any contract call with an API key.
 * Facilitator is auto-selected. Developer doesn't think about facilitators.
 *
 * Headers:
 *   X-API-Key: fk_xxxxxxxxxxxx
 *
 * Body:
 * {
 *   network: string,          // e.g. 'avalanche-fuji'
 *   contractAddress: string,  // target contract
 *   functionName: string,     // e.g. 'mint'
 *   abi: any[],               // contract ABI (or just the function fragment)
 *   functionArgs: any[],      // arguments
 *   value?: string            // native token value for payable functions
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { getActiveFacilitators, getFacilitator, recordPayment } from '@/lib/facilitator-storage';
import { decryptPrivateKey } from '@/lib/facilitator-crypto';
import { getNetworkConfig, isNetworkSupported } from '@/lib/networks';
import { logEvent } from '@/lib/explorer-logging';
import { submitWithNonceRetry } from '@/lib/tx-submit';
import { Wallet, JsonRpcProvider, Contract, Interface } from 'ethers';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing X-API-Key header. Get an API key at https://facinet.vercel.app/docs' },
        { status: 401, headers: corsHeaders }
      );
    }

    const redis = getRedis();
    const keyData = await redis.get(`apikey:${apiKey}`);
    if (!keyData) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401, headers: corsHeaders }
      );
    }

    const keyInfo = typeof keyData === 'string' ? JSON.parse(keyData) : keyData;

    // 2. Check remaining calls
    if (keyInfo.usedCalls >= keyInfo.totalCalls) {
      return NextResponse.json(
        {
          error: 'API key exhausted. All calls have been used.',
          used: keyInfo.usedCalls,
          total: keyInfo.totalCalls,
          upgrade: 'Purchase a new API key at https://facinet.vercel.app/docs',
        },
        { status: 429, headers: corsHeaders }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const {
      network,
      contractAddress,
      functionName,
      abi,
      functionArgs = [],
      value = '0',
    } = body;

    if (!network || !contractAddress || !functionName || !abi) {
      return NextResponse.json(
        { error: 'Missing required fields: network, contractAddress, functionName, abi' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!isNetworkSupported(network)) {
      return NextResponse.json(
        { error: `Unsupported network: ${network}` },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid contract address format' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 4. Auto-select facilitator for this network
    const activeFacilitators = await getActiveFacilitators(network);
    if (!activeFacilitators || activeFacilitators.length === 0) {
      return NextResponse.json(
        { error: `No active facilitators available on ${network}` },
        { status: 503, headers: corsHeaders }
      );
    }

    const selectedPublic = activeFacilitators[Math.floor(Math.random() * activeFacilitators.length)];
    const facilitator = await getFacilitator(selectedPublic.id);
    if (!facilitator) {
      return NextResponse.json(
        { error: 'Failed to load facilitator' },
        { status: 500, headers: corsHeaders }
      );
    }

    // 5. Decrypt facilitator key & execute
    const masterKey = process.env.SYSTEM_MASTER_KEY;
    if (!masterKey) {
      return NextResponse.json(
        { error: 'System configuration error' },
        { status: 500, headers: corsHeaders }
      );
    }

    const networkConfig = getNetworkConfig(network);
    const privateKey = decryptPrivateKey(facilitator.systemEncryptedKey, masterKey);
    const provider = new JsonRpcProvider(networkConfig.rpcUrl);
    const wallet = new Wallet(privateKey, provider);

    const contractInterface = new Interface(abi);
    const contract = new Contract(contractAddress, abi, wallet);

    // Gas estimation is a read-only preflight. Failures here are almost
    // always a bad/reverting call (permanent), so fail fast — switching
    // facilitators wouldn't help.
    let gasEstimate: bigint;
    try {
      if (!contractInterface.getFunction(functionName)) {
        throw new Error(`Function ${functionName} not found in provided ABI`);
      }

      gasEstimate = await contract[functionName].estimateGas(...functionArgs, {
        value: value !== '0' ? value : undefined,
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'Contract execution failed',
          message: error.message || 'Unknown error',
          reason: error.reason || 'Execution reverted',
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // 6. Submit through the Redis nonce manager (was unmanaged — concurrent
    //    /v1/execute calls on the same facilitator collided) and wait for
    //    confirmation with a timeout.
    let tx;
    let receipt;
    try {
      const result = await submitWithNonceRetry(
        wallet,
        provider,
        (txNonce) =>
          contract[functionName](...functionArgs, {
            value: value !== '0' ? value : undefined,
            gasLimit: gasEstimate + gasEstimate / BigInt(10),
            nonce: txNonce,
          }),
        { label: 'v1/execute' }
      );
      tx = result.tx;
      receipt = result.receipt;
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transaction submission or confirmation failed',
          txHash: error?.tx?.hash,
          message: error?.message || 'Unknown error',
          reason: error?.reason || undefined,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // 7. Increment used calls
    keyInfo.usedCalls += 1;
    keyInfo.lastUsed = new Date().toISOString();
    await redis.set(`apikey:${apiKey}`, JSON.stringify(keyInfo));

    // 8. Record payment & log
    await recordPayment(facilitator.id);

    const gasSpent = receipt
      ? (BigInt(receipt.gasUsed) * BigInt((receipt as any).gasPrice || 0)).toString()
      : '0';

    await logEvent({
      eventType: 'contract_execution',
      facilitatorId: facilitator.id,
      facilitatorName: facilitator.name,
      txHash: tx.hash,
      chainId: networkConfig.chain.id,
      chainName: networkConfig.displayName,
      contractAddress,
      functionName,
      gasSpent,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      network,
      contractAddress,
      functionName,
      gasUsed: receipt?.gasUsed?.toString() || '0',
      callsUsed: keyInfo.usedCalls,
      callsRemaining: keyInfo.totalCalls - keyInfo.usedCalls,
    }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Execution failed', message: error.message || 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
