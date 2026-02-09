/**
 * x402 Payment Protocol Client
 * Implements the full x402 payment flow for Avalanche
 */

import { parseUnits, type Address } from 'viem';

export interface PaymentRequirement {
  amount: string;
  token: string;
  network: string;
  recipient: Address;
  facilitatorUrl: string;
}

export interface PaymentProof {
  txHash: string;
  from: Address;
  to: Address;
  amount: string;
  token: Address;
  network: string;
  timestamp: number;
}

/**
 * Parse payment requirements from 402 response headers
 */
export function parsePaymentRequirements(response: Response): PaymentRequirement | null {
  if (response.status !== 402) return null;

  const acceptPayment = response.headers.get('x-accept-payment');
  const paymentAddress = response.headers.get('x-payment-address');
  const facilitatorUrl = response.headers.get('x-facilitator-url');
  const network = response.headers.get('x-payment-network');
  const token = response.headers.get('x-payment-token');

  if (!acceptPayment || !paymentAddress || !facilitatorUrl) {
    return null;
  }

  // Parse format: "usdc-avalanche-fuji:1.0"
  const [tokenNetwork, amount] = acceptPayment.split(':');

  return {
    amount: amount || '1.0',
    token: token || 'USDC',
    network: network || 'avalanche-fuji',
    recipient: paymentAddress as Address,
    facilitatorUrl,
  };
}

/**
 * Create payment proof from transaction
 */
export function createPaymentProof(
  txHash: string,
  from: Address,
  to: Address,
  amount: string,
  tokenAddress: Address,
  network: string
): PaymentProof {
  return {
    txHash,
    from,
    to,
    amount,
    token: tokenAddress,
    network,
    timestamp: Date.now(),
  };
}

/**
 * Submit payment to facilitator for verification
 */
export async function submitPaymentToFacilitator(
  facilitatorUrl: string,
  proof: PaymentProof
): Promise<{ verified: boolean; sessionToken?: string }> {
  try {
    const response = await fetch(`${facilitatorUrl}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proof),
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    }

    return { verified: false };
  } catch (error) {
    console.error('Facilitator verification error:', error);
    return { verified: false };
  }
}

/**
 * Attempt to access protected resource with payment proof
 */
export async function accessProtectedResource(
  url: string,
  proof: PaymentProof
): Promise<Response> {
  return fetch(url, {
    headers: {
      'x-payment-proof': JSON.stringify(proof),
      'x-payment-tx-hash': proof.txHash,
    },
  });
}

/**
 * Full x402 payment flow
 */
export async function x402PaymentFlow(
  protectedUrl: string,
  onPaymentRequired: (requirements: PaymentRequirement) => Promise<PaymentProof>
): Promise<Response> {
  // Step 1: Try to access protected resource
  const initialResponse = await fetch(protectedUrl);

  // Step 2: If 402, parse payment requirements
  if (initialResponse.status === 402) {
    const requirements = parsePaymentRequirements(initialResponse);

    if (!requirements) {
      throw new Error('Invalid payment requirements');
    }

    // Step 3: Execute payment (via callback)
    const proof = await onPaymentRequired(requirements);

    // Step 4: Submit to facilitator (optional, for verification)
    // await submitPaymentToFacilitator(requirements.facilitatorUrl, proof);

    // Step 5: Retry access with payment proof
    return accessProtectedResource(protectedUrl, proof);
  }

  // Already have access or other status
  return initialResponse;
}
