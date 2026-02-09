/**
 * GET /api/facilitator/random?network=avalanche-fuji
 *
 * Get a random active facilitator from a specific network
 * Used for demo payments to distribute load across facilitators
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveFacilitators, getFacilitator } from '@/lib/facilitator-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network') || 'avalanche-fuji';

    // Get all active facilitators
    const allFacilitators = await getActiveFacilitators();

    // Filter by network and active status
    const networkFacilitators = allFacilitators.filter(
      (f) => (f.network || 'avalanche-fuji') === network && f.status === 'active'
    );

    if (networkFacilitators.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No active facilitators available on ${network}. Please try a different network or create a facilitator.`
        },
        { status: 404 }
      );
    }

    // Select random facilitator
    const randomIndex = Math.floor(Math.random() * networkFacilitators.length);
    const selectedPublicInfo = networkFacilitators[randomIndex];

    // Get full facilitator data (including paymentRecipient)
    const facilitator = await getFacilitator(selectedPublicInfo.id);

    if (!facilitator) {
      return NextResponse.json(
        { success: false, error: 'Selected facilitator not found' },
        { status: 404 }
      );
    }

    console.log(`🎲 Selected random facilitator: ${facilitator.name} (${facilitator.id}) on ${network}`);

    // Return facilitator info (without private key)
    return NextResponse.json({
      success: true,
      facilitator: {
        id: facilitator.id,
        name: facilitator.name,
        facilitatorWallet: facilitator.facilitatorWallet,
        paymentRecipient: facilitator.paymentRecipient,
        network: facilitator.network || 'avalanche-fuji',
        status: facilitator.status,
      },
    });
  } catch (error) {
    console.error('❌ Error selecting random facilitator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to select facilitator' },
      { status: 500 }
    );
  }
}
