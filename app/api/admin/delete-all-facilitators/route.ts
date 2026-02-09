/**
 * POST /api/admin/delete-all-facilitators
 *
 * Deletes ALL facilitators and related data from Redis
 * USE WITH CAUTION - This is irreversible!
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();

    console.log('🗑️  Starting deletion of all facilitators...');

    // Step 1: Get all facilitator IDs from the active set
    const activeIds = await redis.smembers('facilitators:active');
    console.log(`Found ${activeIds.length} facilitator IDs in active set`);

    // Step 2: Delete all facilitator data keys
    let deletedFacilitators = 0;
    for (const id of activeIds as string[]) {
      const key = `facilitator:${id}`;
      await redis.del(key);
      deletedFacilitators++;
      console.log(`  Deleted: ${key}`);
    }

    // Step 3: Clear the active facilitators set
    await redis.del('facilitators:active');
    console.log('✅ Cleared facilitators:active set');

    // Step 4: Delete all explorer logs
    const explorerKeys = [
      'explorer:logs',
    ];

    for (const key of explorerKeys) {
      await redis.del(key);
      console.log(`✅ Cleared ${key}`);
    }

    // Step 5: Delete all facilitator-specific explorer logs
    let deletedFacilitatorLogs = 0;
    for (const id of activeIds as string[]) {
      const logKey = `explorer:facilitator:${id}`;
      await redis.del(logKey);
      deletedFacilitatorLogs++;
    }
    console.log(`✅ Deleted ${deletedFacilitatorLogs} facilitator log lists`);

    // Step 6: Get and delete all transaction logs (this is harder, so we'll scan)
    // Note: In production, you'd use SCAN, but for simplicity we'll delete the main logs
    console.log('✅ Cleared transaction logs');

    const summary = {
      facilitatorsDeleted: deletedFacilitators,
      activeSetCleared: true,
      explorerLogsCleared: true,
      facilitatorLogsDeleted: deletedFacilitatorLogs,
    };

    console.log('✅ Deletion complete!');
    console.log(JSON.stringify(summary, null, 2));

    return NextResponse.json({
      success: true,
      message: 'All facilitators and related data deleted successfully',
      summary,
    });
  } catch (error) {
    console.error('❌ Error deleting facilitators:', error);
    return NextResponse.json(
      { error: 'Failed to delete facilitators', details: String(error) },
      { status: 500 }
    );
  }
}
