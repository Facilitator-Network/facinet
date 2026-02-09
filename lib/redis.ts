/**
 * Redis Connection Utility
 *
 * Automatically connects to the right Redis instance:
 * - Production (Vercel): Uses Upstash Redis (REST API)
 * - Local (Docker): Uses local Redis container
 */

import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

/**
 * Get Redis client instance
 * Auto-detects environment and uses appropriate connection
 */
export function getRedis(): Redis {
  if (redis) {
    return redis;
  }

  // Check for Upstash Redis (Production/Vercel)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    console.log('🔗 Connecting to Upstash Redis (Production)');
    redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    });
    return redis;
  }

  // Fallback to local Docker Redis
  console.log('🔗 Connecting to Local Redis (Docker)');
  redis = Redis.fromEnv();

  return redis;
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const client = getRedis();
    await client.ping();
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}
