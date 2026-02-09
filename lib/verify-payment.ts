/**
 * Payment Verification Utility
 *
 * Verifies ERC-3009 payment transactions on-chain
 * - Checks transaction exists and succeeded
 * - Verifies payment amount, recipient, and sender
 * - Prevents transaction hash reuse
 * - Validates transaction is recent
 */

import { JsonRpcProvider, Contract, Interface } from 'ethers';
import { getRedis } from './redis';
import { getNetworkConfig } from './networks';
import { getUSDCContract } from './contracts';

// ERC-3009 ABI for transferWithAuthorization
const ERC3009_ABI = [
  'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external'
];

// Standard ERC-20 ABI
const ERC20_ABI = [
  'function transfer(address to, uint256 value) external returns (bool)'
];

const USDC_ADDRESS = '0x5425890298aed601595a70AB815c96711a31Bc65';
const ONE_USDC_ATOMIC = '1000000'; // 1 USDC with 6 decimals
const MAX_TX_AGE_MS = 60 * 60 * 1000; // 1 hour

export interface PaymentVerificationResult {
  valid: boolean;
  error?: string;
  details?: {
    from: string;
    to: string;
    value: string;
    blockTimestamp: number;
    txHash: string;
  };
}

/**
 * Verify an ERC-3009 payment transaction on-chain
 *
 * @param txHash - Transaction hash to verify
 * @param expectedFrom - Expected payer address
 * @param expectedTo - Expected recipient address
 * @param expectedAmount - Expected amount in atomic units (default: 1 USDC = 1000000)
 * @param network - Network name (defaults to avalanche-fuji)
 * @returns Verification result with details
 */
export async function verifyPayment(
  txHash: string,
  expectedFrom: string,
  expectedTo: string,
  expectedAmount: string = ONE_USDC_ATOMIC,
  network: string = 'avalanche-fuji'
): Promise<PaymentVerificationResult> {
  try {
    console.log(`🔍 Verifying payment transaction on ${network}:`, txHash);

    // Check if transaction hash has already been used
    const isUsed = await isTransactionUsed(txHash);
    if (isUsed) {
      console.error('❌ Transaction hash already used:', txHash);
      return {
        valid: false,
        error: 'Transaction hash has already been used'
      };
    }

    // Get network-specific configuration
    const networkConfig = getNetworkConfig(network);
    const usdcContract = getUSDCContract(network);

    // Initialize provider with network-specific RPC URL
    const provider = new JsonRpcProvider(networkConfig.rpcUrl);

    // Step 1: Get transaction from blockchain
    console.log('  📡 Fetching transaction from blockchain...');
    const tx = await provider.getTransaction(txHash);

    if (!tx) {
      console.error('❌ Transaction not found on blockchain:', txHash);
      return {
        valid: false,
        error: 'Transaction not found on blockchain'
      };
    }

    // Step 2: Get transaction receipt (check if successful)
    console.log('  📄 Fetching transaction receipt...');
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      console.error('❌ Transaction receipt not found:', txHash);
      return {
        valid: false,
        error: 'Transaction receipt not found'
      };
    }

    if (receipt.status !== 1) {
      console.error('❌ Transaction failed (status !== 1):', txHash);
      return {
        valid: false,
        error: 'Transaction failed on blockchain'
      };
    }

    // Step 3: Verify transaction is calling USDC contract
    if (tx.to?.toLowerCase() !== usdcContract.address.toLowerCase()) {
      console.error('❌ Transaction not to USDC contract:', tx.to);
      return {
        valid: false,
        error: `Transaction not to USDC contract. Expected: ${usdcContract.address}, Got: ${tx.to}`
      };
    }

    // Step 4: Decode transaction data (try both ERC-3009 and standard ERC-20)
    console.log('  🔓 Decoding transaction data...');

    let from: string;
    let to: string;
    let value: string;

    // Try ERC-3009 first
    const erc3009Interface = new Interface(ERC3009_ABI);
    let decodedData;
    try {
      decodedData = erc3009Interface.parseTransaction({ data: tx.data });
      if (decodedData && decodedData.name === 'transferWithAuthorization') {
        console.log('  ✓ Decoded as ERC-3009 transferWithAuthorization');
        from = decodedData.args[0] as string;
        to = decodedData.args[1] as string;
        value = decodedData.args[2].toString();
      } else {
        throw new Error('Not ERC-3009');
      }
    } catch (error) {
      // Try standard ERC-20 transfer
      console.log('  🔄 Not ERC-3009, trying standard ERC-20 transfer...');
      const erc20Interface = new Interface(ERC20_ABI);
      try {
        decodedData = erc20Interface.parseTransaction({ data: tx.data });
        if (decodedData && decodedData.name === 'transfer') {
          console.log('  ✓ Decoded as ERC-20 transfer');
          // For standard transfer, 'from' is the tx sender
          from = tx.from;
          to = decodedData.args[0] as string;
          value = decodedData.args[1].toString();
        } else {
          throw new Error('Not ERC-20 transfer');
        }
      } catch (erc20Error) {
        console.error('❌ Failed to decode as ERC-3009 or ERC-20:', erc20Error);
        return {
          valid: false,
          error: 'Transaction is not a valid USDC transfer (neither ERC-3009 nor ERC-20)'
        };
      }
    }

    console.log('  ✓ Decoded parameters:');
    console.log('    From:', from);
    console.log('    To:', to);
    console.log('    Value:', value);

    // Step 5: Verify parameters match expected values
    if (from.toLowerCase() !== expectedFrom.toLowerCase()) {
      console.error('❌ Payer mismatch. Expected:', expectedFrom, 'Got:', from);
      return {
        valid: false,
        error: `Payment from wrong address. Expected: ${expectedFrom}, Got: ${from}`
      };
    }

    if (to.toLowerCase() !== expectedTo.toLowerCase()) {
      console.error('❌ Recipient mismatch. Expected:', expectedTo, 'Got:', to);
      return {
        valid: false,
        error: `Payment to wrong recipient. Expected: ${expectedTo}, Got: ${to}`
      };
    }

    if (value !== expectedAmount) {
      console.error('❌ Amount mismatch. Expected:', expectedAmount, 'Got:', value);
      return {
        valid: false,
        error: `Wrong payment amount. Expected: ${expectedAmount} (1 USDC), Got: ${value}`
      };
    }

    // Step 6: Check transaction timestamp (must be recent)
    console.log('  🕐 Checking transaction timestamp...');
    const block = await provider.getBlock(receipt.blockNumber);

    if (!block) {
      console.error('❌ Block not found:', receipt.blockNumber);
      return {
        valid: false,
        error: 'Block not found'
      };
    }

    const blockTimestamp = block.timestamp * 1000; // Convert to milliseconds
    const now = Date.now();
    const age = now - blockTimestamp;

    if (age > MAX_TX_AGE_MS) {
      console.error('❌ Transaction too old:', age, 'ms');
      return {
        valid: false,
        error: `Transaction too old. Age: ${Math.floor(age / 60000)} minutes. Max: ${MAX_TX_AGE_MS / 60000} minutes`
      };
    }

    console.log('  ✓ Transaction age:', Math.floor(age / 1000), 'seconds');

    // Step 7: Mark transaction as used to prevent reuse
    console.log('  ✅ Marking transaction as used...');
    await markTransactionUsed(txHash);

    console.log('✅ Payment verification successful!');
    return {
      valid: true,
      details: {
        from,
        to,
        value,
        blockTimestamp: block.timestamp,
        txHash
      }
    };

  } catch (error: any) {
    console.error('❌ Payment verification error:', error);
    return {
      valid: false,
      error: `Verification failed: ${error.message || 'Unknown error'}`
    };
  }
}

/**
 * Check if a transaction hash has already been used
 */
async function isTransactionUsed(txHash: string): Promise<boolean> {
  const redis = getRedis();
  const key = `tx_used:${txHash.toLowerCase()}`;
  const result = await redis.get(key);
  return result !== null;
}

/**
 * Mark a transaction hash as used (prevents reuse)
 */
async function markTransactionUsed(txHash: string): Promise<void> {
  const redis = getRedis();
  const key = `tx_used:${txHash.toLowerCase()}`;

  // Store with expiry of 90 days (cleanup old entries)
  await redis.set(key, Date.now().toString(), {
    ex: 90 * 24 * 60 * 60 // 90 days in seconds
  });

  console.log('  ✓ Transaction marked as used:', txHash);
}

/**
 * Verify facilitator registration payment
 * 1 USDC to platform wallet
 * @param txHash - Transaction hash
 * @param payer - Address of the payer
 * @param network - Network name (defaults to avalanche-fuji)
 */
export async function verifyRegistrationPayment(
  txHash: string,
  payer: string,
  network: string = 'avalanche-fuji'
): Promise<PaymentVerificationResult> {
  const platformWallet = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT;

  if (!platformWallet) {
    return {
      valid: false,
      error: 'Platform wallet not configured (NEXT_PUBLIC_PAYMENT_RECIPIENT)'
    };
  }

  return verifyPayment(txHash, payer, platformWallet, ONE_USDC_ATOMIC, network);
}

/**
 * Verify builder hub access payment
 * 1 USDC to facilitator's payment recipient
 */
export async function verifyBuilderHubPayment(
  txHash: string,
  payer: string,
  facilitatorRecipient: string
): Promise<PaymentVerificationResult> {
  return verifyPayment(txHash, payer, facilitatorRecipient, ONE_USDC_ATOMIC);
}
