/**
 * Explorer Logging System
 *
 * Logs all facilitator events to Redis for explorer functionality
 * Uses Redis Lists for efficient querying and pagination
 */

import { getRedis } from './redis';
import { nanoid } from 'nanoid';

export type EventType =
  | 'facilitator_added'
  | 'facilitator_activated'
  | 'gas_funded'
  | 'transaction'
  | 'status_changed';

export interface ExplorerLog {
  id: string;
  timestamp: number;
  eventType: EventType;

  // Facilitator info
  facilitatorId?: string;
  facilitatorName?: string;

  // Staking/Creation
  stakeAmount?: string;
  stakeTxHash?: string;

  // Gas funding
  gasFundingTxHash?: string;
  gasFundingAmount?: string;

  // Transaction details
  txHash?: string;
  chainId?: number;
  chainName?: string;
  fromAddress?: string;
  toAddress?: string;
  amount?: string;
  gasSpent?: string;

  // Status
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}

// Redis keys
const LOGS_LIST_KEY = 'explorer:logs'; // All logs (sorted by timestamp)
const FACILITATOR_LOGS_PREFIX = 'explorer:facilitator:'; // Per-facilitator logs
const TX_LOG_PREFIX = 'explorer:tx:'; // Transaction hash lookup

/**
 * Log an event to the explorer
 */
export async function logEvent(log: Omit<ExplorerLog, 'id' | 'timestamp'>): Promise<string> {
  const redis = getRedis();

  const eventLog: ExplorerLog = {
    id: `log_${nanoid(16)}`,
    timestamp: Date.now(),
    ...log,
  };

  // Store in main logs list (prepend for newest first)
  await redis.lpush(LOGS_LIST_KEY, JSON.stringify(eventLog));

  // Store in facilitator-specific list if facilitatorId exists
  if (eventLog.facilitatorId) {
    const facilitatorKey = `${FACILITATOR_LOGS_PREFIX}${eventLog.facilitatorId}`;
    await redis.lpush(facilitatorKey, JSON.stringify(eventLog));
  }

  // Store transaction lookup if txHash exists
  if (eventLog.txHash) {
    const txKey = `${TX_LOG_PREFIX}${eventLog.txHash.toLowerCase()}`;
    await redis.set(txKey, JSON.stringify(eventLog));
  }

  console.log(`📝 Logged event: ${eventLog.eventType} (${eventLog.id})`);
  return eventLog.id;
}

/**
 * Get recent logs across the network
 */
export async function getRecentLogs(limit: number = 50): Promise<ExplorerLog[]> {
  const redis = getRedis();

  // Get latest logs from the list
  const logs = await redis.lrange(LOGS_LIST_KEY, 0, limit - 1);

  return logs.map((log) => {
    if (typeof log === 'string') {
      return JSON.parse(log) as ExplorerLog;
    }
    return log as ExplorerLog;
  });
}

/**
 * Get logs for a specific facilitator
 */
export async function getFacilitatorLogs(
  facilitatorId: string,
  limit: number = 100
): Promise<ExplorerLog[]> {
  const redis = getRedis();
  const key = `${FACILITATOR_LOGS_PREFIX}${facilitatorId}`;

  const logs = await redis.lrange(key, 0, limit - 1);

  return logs.map((log) => {
    if (typeof log === 'string') {
      return JSON.parse(log) as ExplorerLog;
    }
    return log as ExplorerLog;
  });
}

/**
 * Get log by transaction hash
 */
export async function getLogByTxHash(txHash: string): Promise<ExplorerLog | null> {
  const redis = getRedis();
  const key = `${TX_LOG_PREFIX}${txHash.toLowerCase()}`;

  const log = await redis.get(key);

  if (!log) {
    return null;
  }

  if (typeof log === 'string') {
    return JSON.parse(log) as ExplorerLog;
  }

  return log as ExplorerLog;
}

/**
 * Query logs with filters
 */
export async function queryLogs(options: {
  eventType?: EventType;
  facilitatorId?: string;
  status?: 'success' | 'failed' | 'pending';
  limit?: number;
}): Promise<ExplorerLog[]> {
  const { eventType, facilitatorId, status, limit = 50 } = options;

  // If facilitatorId specified, search facilitator-specific logs
  let logs: ExplorerLog[];
  if (facilitatorId) {
    logs = await getFacilitatorLogs(facilitatorId, limit * 2); // Get more for filtering
  } else {
    logs = await getRecentLogs(limit * 2);
  }

  // Apply filters
  let filtered = logs;

  if (eventType) {
    filtered = filtered.filter((log) => log.eventType === eventType);
  }

  if (status) {
    filtered = filtered.filter((log) => log.status === status);
  }

  // Return up to limit
  return filtered.slice(0, limit);
}

/**
 * Get network statistics from logs
 */
export async function getNetworkStatsFromLogs() {
  const redis = getRedis();

  // Get recent logs for aggregation
  const logs = await getRecentLogs(1000);

  const stats = {
    totalTransactions: logs.filter((log) => log.eventType === 'transaction').length,
    successfulTransactions: logs.filter(
      (log) => log.eventType === 'transaction' && log.status === 'success'
    ).length,
    failedTransactions: logs.filter(
      (log) => log.eventType === 'transaction' && log.status === 'failed'
    ).length,
    totalFacilitatorsCreated: logs.filter((log) => log.eventType === 'facilitator_added').length,
    totalGasFunded: logs.filter((log) => log.eventType === 'gas_funded').length,
  };

  return stats;
}
