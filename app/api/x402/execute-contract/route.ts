/**
 * POST /api/x402/execute-contract
 *
 * Execute arbitrary smart contract calls via facilitator network
 * Facilitator pays gas fees for the transaction
 *
 * Supports:
 * - Any contract method call (registry.register, transferFrom, etc.)
 * - Native token transfers (sendTransaction)
 * - EIP-712 meta-transactions (with signature)
 *
 * Request Body:
 * {
 *   facilitatorId: string;
 *   network: string;           // e.g., 'ethereum-sepolia'
 *   chainId: number;           // e.g., 11155111
 *   contractAddress: string;  // Target contract address
 *   functionName: string;      // e.g., 'register'
 *   functionArgs: any[];       // Array of function arguments
 *   abi: any[];                // Contract ABI
 *   value?: string;            // Optional: native token value (for payable functions)
 *   signature?: {              // Optional: EIP-712 signature for meta-transactions
 *     domain: EIP712Domain;
 *     types: Record<string, any[]>;
 *     message: any;
 *     signature: string;
 *   };
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacilitator, recordPayment } from '@/lib/facilitator-storage';
import { decryptPrivateKey } from '@/lib/facilitator-crypto';
import { Wallet, JsonRpcProvider, Contract, Interface } from 'ethers';
import { getNetworkConfig, isNetworkSupported } from '@/lib/networks';
import { logEvent } from '@/lib/explorer-logging';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Network, X-Chain-Id',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      facilitatorId,
      network: requestNetwork,
      chainId: requestChainId,
      contractAddress,
      functionName,
      functionArgs = [],
      abi,
      value = '0',
      signature,
    } = body;

    // Validate required fields
    if (!facilitatorId || !contractAddress || !functionName || !abi) {
      return NextResponse.json(
        { error: 'Missing required fields: facilitatorId, contractAddress, functionName, abi' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate network
    if (!requestNetwork || !isNetworkSupported(requestNetwork)) {
      return NextResponse.json(
        { error: `Unsupported network: ${requestNetwork}` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate contract address format
    if (!contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid contract address format' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`🔧 Executing contract call: ${functionName} on ${contractAddress} (${requestNetwork})`);

    // Get facilitator
    const facilitator = await getFacilitator(facilitatorId);
    if (!facilitator) {
      return NextResponse.json(
        { error: 'Facilitator not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Validate facilitator network matches request
    if (facilitator.network && facilitator.network !== requestNetwork) {
      return NextResponse.json(
        { error: `Facilitator ${facilitatorId} is registered for network ${facilitator.network}, but request is for ${requestNetwork}` },
        { status: 400, headers: corsHeaders }
      );
    }

    if (facilitator.chainId !== undefined && facilitator.chainId !== requestChainId) {
      return NextResponse.json(
        { error: `Facilitator ${facilitatorId} is registered for chain ID ${facilitator.chainId}, but request is for ${requestChainId}` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get network configuration
    const networkConfig = getNetworkConfig(requestNetwork);

    // Decrypt facilitator private key
    const masterKey = process.env.SYSTEM_MASTER_KEY;
    if (!masterKey) {
      console.error('❌ SYSTEM_MASTER_KEY not set');
      return NextResponse.json(
        { error: 'System configuration error' },
        { status: 500, headers: corsHeaders }
      );
    }

    const privateKey = decryptPrivateKey(facilitator.systemEncryptedKey, masterKey);
    const provider = new JsonRpcProvider(networkConfig.rpcUrl);
    const wallet = new Wallet(privateKey, provider);

    console.log(`💰 Facilitator wallet: ${wallet.address}`);
    console.log(`🌐 Network: ${networkConfig.displayName} (Chain ID: ${networkConfig.chain.id})`);
    console.log(`📝 Contract: ${contractAddress}`);
    console.log(`🔧 Function: ${functionName}(${functionArgs.join(', ')})`);

    // Create contract instance
    const contractInterface = new Interface(abi);
    const contract = new Contract(contractAddress, abi, wallet);

    // Execute contract call
    let tx;
    try {
      // Check if function exists in ABI
      if (!contractInterface.getFunction(functionName)) {
        throw new Error(`Function ${functionName} not found in provided ABI`);
      }

      // Estimate gas first
      const gasEstimate = await contract[functionName].estimateGas(...functionArgs, {
        value: value !== '0' ? value : undefined,
      });

      console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);

      // Execute transaction
      tx = await contract[functionName](...functionArgs, {
        value: value !== '0' ? value : undefined,
        gasLimit: gasEstimate + (gasEstimate / BigInt(10)), // Add 10% buffer
      });

      console.log(`⏳ Transaction submitted: ${tx.hash}`);
    } catch (error: any) {
      console.error('❌ Contract call execution error:', error);
      return NextResponse.json(
        {
          error: 'Contract call execution failed',
          message: error.message || 'Unknown error',
          reason: error.reason || error.data?.message || 'Execution reverted',
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Wait for confirmation
    let receipt;
    try {
      receipt = await tx.wait();
      console.log(`✅ Transaction confirmed: ${tx.hash}`);
    } catch (error: any) {
      console.error('❌ Transaction confirmation error:', error);
      // Transaction was submitted but failed - return tx hash anyway
      return NextResponse.json(
        {
          success: false,
          error: 'Transaction submitted but failed',
          txHash: tx.hash,
          message: error.message || 'Transaction reverted',
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Calculate gas spent
    const gasSpent = receipt
      ? (BigInt(receipt.gasUsed) * BigInt((receipt as any).gasPrice || 0)).toString()
      : '0';

    // Record payment (for statistics)
    await recordPayment(facilitatorId);

    // Log event
    await logEvent({
      eventType: 'contract_execution',
      facilitatorId: facilitatorId,
      facilitatorName: facilitator.name,
      txHash: tx.hash,
      chainId: networkConfig.chain.id,
      chainName: networkConfig.displayName,
      contractAddress: contractAddress,
      functionName: functionName,
      gasSpent: gasSpent,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      facilitatorWallet: wallet.address,
      facilitatorName: facilitator.name,
      network: requestNetwork,
      networkId: networkConfig.chain.id,
      contractAddress: contractAddress,
      functionName: functionName,
      gasUsed: receipt?.gasUsed?.toString() || '0',
      gasSpent: gasSpent,
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('❌ Contract execution error:', error);
    return NextResponse.json(
      {
        error: 'Contract execution failed',
        message: error.message || 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
