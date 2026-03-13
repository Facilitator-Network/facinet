/**
 * Redis-Based Nonce Manager
 *
 * Enables parallel transaction submission by assigning unique sequential nonces
 * to each transaction per facilitator wallet. Uses Redis atomic INCR to prevent
 * nonce collisions across Vercel serverless instances.
 *
 * Flow:
 * 1. First request for a wallet → sync on-chain nonce to Redis
 * 2. Each subsequent request → Redis INCR (atomic) → unique nonce
 * 3. If a tx fails → detect gap and resync from chain
 *
 * No new secrets needed — uses existing UPSTASH_REDIS_REST_URL/TOKEN.
 */

import { getRedis } from './redis';
import { JsonRpcProvider } from 'ethers';

const NONCE_KEY_PREFIX = 'nonce:';
const NONCE_LOCK_PREFIX = 'nonce_lock:';
const NONCE_SYNC_TTL = 300; // Re-sync with chain every 5 minutes

/**
 * Get the next available nonce for a wallet address.
 * Uses Redis INCR for atomic nonce assignment across serverless instances.
 *
 * @param walletAddress - The facilitator wallet address
 * @param provider - ethers JsonRpcProvider for on-chain nonce lookup
 * @returns The next nonce to use for this wallet
 */
export async function getNextNonce(
  walletAddress: string,
  provider: JsonRpcProvider
): Promise<number> {
  const redis = getRedis();
  const nonceKey = `${NONCE_KEY_PREFIX}${walletAddress.toLowerCase()}`;
  const syncKey = `${nonceKey}:last_sync`;

  // Check if we have a nonce counter initialized in Redis
  const currentNonce = await redis.get(nonceKey);
  const lastSync = await redis.get(syncKey);

  if (currentNonce === null || lastSync === null) {
    // First time or expired — sync from chain
    return await syncAndGetNonce(walletAddress, provider);
  }

  // Atomic increment — each caller gets a unique nonce
  const nextNonce = await redis.incr(nonceKey);

  // The value after INCR is the nonce we should use
  // (We store "next nonce to assign", so INCR returns the assigned nonce)
  return nextNonce - 1;
}

/**
 * Sync nonce from the blockchain and initialize/reset the Redis counter.
 * Uses a Redis lock to prevent multiple instances from syncing simultaneously.
 */
async function syncAndGetNonce(
  walletAddress: string,
  provider: JsonRpcProvider
): Promise<number> {
  const redis = getRedis();
  const nonceKey = `${NONCE_KEY_PREFIX}${walletAddress.toLowerCase()}`;
  const syncKey = `${nonceKey}:last_sync`;
  const lockKey = `${NONCE_LOCK_PREFIX}${walletAddress.toLowerCase()}`;

  // Try to acquire a lock (prevents race condition during sync)
  const lockAcquired = await redis.set(lockKey, '1', { nx: true, ex: 10 });

  if (!lockAcquired) {
    // Another instance is syncing — wait briefly and read from Redis
    await new Promise((resolve) => setTimeout(resolve, 100));
    const existing = await redis.get(nonceKey);
    if (existing !== null) {
      const nextNonce = await redis.incr(nonceKey);
      return nextNonce - 1;
    }
    // If still null, fall through to sync ourselves
  }

  try {
    // Get the pending nonce from chain (includes pending txs in mempool)
    const onChainNonce = await provider.getTransactionCount(walletAddress, 'pending');

    console.log(`[NonceManager] Synced on-chain nonce for ${walletAddress.slice(0, 10)}...: ${onChainNonce}`);

    // Set the counter to onChainNonce + 1 (so next INCR returns onChainNonce + 1,
    // and we return onChainNonce for this call)
    await redis.set(nonceKey, onChainNonce + 1);
    await redis.set(syncKey, Date.now().toString(), { ex: NONCE_SYNC_TTL });

    return onChainNonce;
  } finally {
    // Release the lock
    await redis.del(lockKey);
  }
}

/**
 * Force re-sync nonce from blockchain.
 * Call this when a transaction fails due to nonce issues.
 */
export async function resyncNonce(
  walletAddress: string,
  provider: JsonRpcProvider
): Promise<number> {
  const redis = getRedis();
  const nonceKey = `${NONCE_KEY_PREFIX}${walletAddress.toLowerCase()}`;
  const syncKey = `${nonceKey}:last_sync`;

  // Clear existing nonce data to force a fresh sync
  await redis.del(nonceKey);
  await redis.del(syncKey);

  return await syncAndGetNonce(walletAddress, provider);
}

/**
 * Report a successful transaction.
 * This helps keep the nonce counter accurate.
 */
export async function reportTxSuccess(walletAddress: string): Promise<void> {
  // Nothing to do — the counter is already incremented.
  // This is a hook for future metrics/logging if needed.
}

/**
 * Report a failed transaction and attempt recovery.
 * If the failure is nonce-related, re-sync from chain.
 *
 * @returns true if the error was nonce-related and a resync was performed
 */
export async function reportTxFailure(
  walletAddress: string,
  provider: JsonRpcProvider,
  error: any
): Promise<boolean> {
  const errorMessage = (error?.message || '').toLowerCase();

  const isNonceError =
    errorMessage.includes('nonce') ||
    errorMessage.includes('replacement transaction underpriced') ||
    errorMessage.includes('already known') ||
    errorMessage.includes('transaction underpriced');

  if (isNonceError) {
    console.log(`[NonceManager] Nonce error detected for ${walletAddress.slice(0, 10)}..., re-syncing...`);
    await resyncNonce(walletAddress, provider);
    return true;
  }

  return false;
}
