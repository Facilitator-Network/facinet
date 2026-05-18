/**
 * Nonce-managed transaction submission.
 *
 * Every route that has a facilitator wallet sign and broadcast a tx must
 * go through here. It assigns a unique nonce from the Redis nonce manager
 * (so concurrent serverless invocations don't collide), submits, waits for
 * confirmation, and retries on nonce errors after a resync.
 *
 * Before this helper, the retry loop was hand-rolled in /x402/settle and
 * /x402/settle-custom and entirely absent from /x402/settle-default,
 * /x402/settle-batch, and /v1/execute — meaning those three would collide
 * under any concurrency. One implementation, used everywhere, fixes that.
 */

import type { JsonRpcProvider, Wallet, TransactionResponse, TransactionReceipt } from 'ethers';
import { getNextNonce, reportTxSuccess, reportTxFailure } from './nonce-manager';

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_CONFIRM_TIMEOUT_MS = 45_000;

export interface SubmitResult {
  tx: TransactionResponse;
  receipt: TransactionReceipt | null;
}

export interface SubmitOptions {
  /** Max nonce-error retries (default 2 → up to 3 attempts total). */
  maxRetries?: number;
  /** Abort tx.wait() after this many ms so a stuck RPC can't hang the
   *  serverless function until the platform timeout. Default 45s. */
  confirmTimeoutMs?: number;
  /** Label for logs, e.g. "settle" or "v1/execute". */
  label?: string;
}

/**
 * Build and send a transaction with a managed nonce, retrying only on
 * nonce-class errors.
 *
 * @param wallet    Facilitator wallet (already connected to `provider`).
 * @param provider  Same provider the wallet is connected to.
 * @param sendTx    Given an explicit nonce, build+broadcast the tx and
 *                   return the ethers TransactionResponse. Keep this a
 *                   thin closure over `contract.method(args, { nonce })`.
 * @param opts      Tuning knobs.
 *
 * Throws the last error if all attempts fail. Callers classify the error
 * (permanent vs transient) and decide whether to fail over to another
 * facilitator — that lives in the route/executor, not here.
 */
export async function submitWithNonceRetry(
  wallet: Wallet,
  provider: JsonRpcProvider,
  sendTx: (nonce: number) => Promise<TransactionResponse>,
  opts: SubmitOptions = {}
): Promise<SubmitResult> {
  const maxRetries = opts.maxRetries ?? DEFAULT_MAX_RETRIES;
  const confirmTimeoutMs = opts.confirmTimeoutMs ?? DEFAULT_CONFIRM_TIMEOUT_MS;
  const label = opts.label ?? 'tx';

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const nonce = await getNextNonce(wallet.address, provider);
      console.log(`[${label}] [attempt ${attempt + 1}/${maxRetries + 1}] nonce ${nonce}`);

      const tx = await sendTx(nonce);
      console.log(`[${label}] submitted ${tx.hash}`);

      const receipt = await waitWithTimeout(tx, confirmTimeoutMs, label);
      console.log(`[${label}] confirmed ${tx.hash}`);

      await reportTxSuccess(wallet.address);
      return { tx, receipt };
    } catch (error) {
      lastError = error;

      const wasNonceError = await reportTxFailure(wallet.address, provider, error);
      if (wasNonceError && attempt < maxRetries) {
        console.log(`[${label}] nonce error — resynced, retrying`);
        continue;
      }
      // Non-nonce error, or retries exhausted: stop and surface it.
      break;
    }
  }

  throw lastError;
}

/**
 * Wait for one confirmation but give up after `timeoutMs`. A timeout here
 * does NOT mean the tx failed — it may still land. The caller should treat
 * a timeout as "unknown / transient" and must rely on the ERC-3009 nonce
 * (or an idempotency key) to stay safe against double-spend on failover.
 */
async function waitWithTimeout(
  tx: TransactionResponse,
  timeoutMs: number,
  label: string
): Promise<TransactionReceipt | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`[${label}] confirmation timed out after ${timeoutMs}ms (tx ${tx.hash})`)),
      timeoutMs
    );
  });

  try {
    return await Promise.race([tx.wait(), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
