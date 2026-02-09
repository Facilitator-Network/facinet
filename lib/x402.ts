/**
 * x402 Protocol Utilities
 *
 * This module provides utilities for implementing the x402 payment protocol.
 * x402 is an HTTP-native payment protocol using the 402 Payment Required status code.
 */

import { parseUnits } from 'viem';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * x402 Payment Requirements
 * Server sends this in 402 response to specify payment details
 */
export interface X402PaymentRequirements {
  scheme: 'exact';
  network: string;
  resource: string; // The resource being paid for (e.g., "/builder-hub")
  maxAmountRequired: string; // Amount in atomic units (e.g., "1000000" for 1 USDC with 6 decimals)
  payTo: `0x${string}`;
  asset: `0x${string}`; // ERC20 token contract address
  maxTimeoutSeconds: number;
  mimeType?: string;
  description?: string;
}

/**
 * x402 Payment Payload
 * Client sends this in X-PAYMENT header
 */
export interface X402PaymentPayload {
  x402Version: number;
  scheme: 'exact';
  network: string;
  payload: {
    amount: string; // Amount in atomic units
    from: `0x${string}`;
    to: `0x${string}`;
    asset: `0x${string}`;
    deadline: number;
  };
}

/**
 * Facilitator Verify Request
 */
export interface FacilitatorVerifyRequest {
  x402Version: number;
  paymentHeader: string; // Base64-encoded X402PaymentPayload
  paymentRequirements: X402PaymentRequirements;
}

/**
 * Facilitator Verify Response
 */
export interface FacilitatorVerifyResponse {
  isValid: boolean;
  invalidReason?: string;
}

/**
 * Facilitator Settle Request
 */
export interface FacilitatorSettleRequest {
  x402Version: number;
  scheme: 'exact';
  network: string;
  paymentPayload: {  // Changed from 'payload' to 'paymentPayload'
    amount: string;
    from: `0x${string}`;
    to: `0x${string}`;
    asset: `0x${string}`;
    deadline: number;
  };
}

/**
 * Facilitator Settle Response
 */
export interface FacilitatorSettleResponse {
  success?: boolean;
  txHash?: `0x${string}`;
  tx?: `0x${string}`; // Alternative field name
  transaction?: `0x${string}`; // Alternative field name (ukstv/x402-facilitator)
  networkId?: string;
  network?: string; // Alternative field name
  error?: string;
  message?: string; // Error message field
}

/**
 * Facilitator Supported Response
 */
export interface FacilitatorSupportedResponse {
  kinds: Array<{
    network: string;
    scheme: string;
    x402Version: number;
  }>;
}

// ==========================================
// CONFIGURATION
// ==========================================

import { getNetworkConfig } from './networks';

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT) {
  throw new Error(
    '❌ NEXT_PUBLIC_PAYMENT_RECIPIENT environment variable is required. ' +
    'Please set it in .env.local or Vercel environment variables.'
  );
}

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn(
    '⚠️ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not set. ' +
    'Get one at https://cloud.walletconnect.com/'
  );
}

/**
 * Get x402 configuration for a specific network
 * @param network Network name (defaults to avalanche-fuji)
 * @returns Network-specific x402 configuration
 */
export function getX402Config(network?: string) {
  const networkName = network || process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'avalanche-fuji';
  const networkConfig = getNetworkConfig(networkName);

  return {
    VERSION: 1,
    FACILITATOR_URL: '/api/x402',
    NETWORK: networkName,
    USDC_ADDRESS: networkConfig.usdcAddress,
    PAYMENT_RECIPIENT: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT as `0x${string}`,
    PAYMENT_AMOUNT: process.env.NEXT_PUBLIC_PAYMENT_AMOUNT || '1',
    USDC_DECIMALS: networkConfig.usdcDecimals,
    TIMEOUT_SECONDS: 300,
  } as const;
}

// Backward compatibility - default to Avalanche Fuji
export const X402_CONFIG = getX402Config();

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Create payment requirements for a protected resource
 * @param amountUSDC Amount in USDC
 * @param resource Resource URL
 * @param network Network name (defaults to avalanche-fuji)
 */
export function createPaymentRequirements(
  amountUSDC: string = '1',
  resource: string = 'http://localhost:3000/builder-hub',
  network?: string
): X402PaymentRequirements {
  const config = getX402Config(network);
  const amountInAtomicUnits = parseUnits(amountUSDC, config.USDC_DECIMALS).toString();

  return {
    scheme: 'exact',
    network: config.NETWORK,
    resource: resource,
    maxAmountRequired: amountInAtomicUnits,
    payTo: config.PAYMENT_RECIPIENT,
    asset: config.USDC_ADDRESS,
    maxTimeoutSeconds: config.TIMEOUT_SECONDS,
    mimeType: 'application/json',
    description: 'Payment required to access Builder Hub',
  };
}

/**
 * Create payment payload for submission to facilitator
 * @param fromAddress User's wallet address
 * @param amountUSDC Amount in USDC
 * @param network Network name (defaults to avalanche-fuji)
 */
export function createPaymentPayload(
  fromAddress: `0x${string}`,
  amountUSDC: string = '1',
  network?: string
): X402PaymentPayload {
  const config = getX402Config(network);
  const amountInAtomicUnits = parseUnits(amountUSDC, config.USDC_DECIMALS).toString();
  const deadline = Math.floor(Date.now() / 1000) + config.TIMEOUT_SECONDS;

  return {
    x402Version: config.VERSION,
    scheme: 'exact',
    network: config.NETWORK,
    payload: {
      amount: amountInAtomicUnits,
      from: fromAddress,
      to: config.PAYMENT_RECIPIENT,
      asset: config.USDC_ADDRESS,
      deadline,
    },
  };
}

/**
 * Encode payment payload as base64 for X-PAYMENT header
 */
export function encodePaymentHeader(payload: X402PaymentPayload): string {
  const jsonString = JSON.stringify(payload);
  return Buffer.from(jsonString).toString('base64');
}

/**
 * Decode payment payload from base64 X-PAYMENT header
 */
export function decodePaymentHeader(base64String: string): X402PaymentPayload {
  const jsonString = Buffer.from(base64String, 'base64').toString('utf-8');
  return JSON.parse(jsonString);
}

/**
 * Call facilitator /verify endpoint
 */
export async function verifyPayment(
  paymentHeader: string,
  paymentRequirements: X402PaymentRequirements
): Promise<FacilitatorVerifyResponse> {
  const response = await fetch(`${X402_CONFIG.FACILITATOR_URL}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      x402Version: X402_CONFIG.VERSION,
      paymentHeader,
      paymentRequirements,
    } as FacilitatorVerifyRequest),
  });

  if (!response.ok) {
    throw new Error(`Facilitator verify failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Call facilitator /settle endpoint to execute payment with ERC-3009
 * This is the REAL x402 exact scheme using signed authorization
 */
export async function settlePaymentWithAuthorization(
  signedAuthorizationPayload: any,
  paymentRequirements: X402PaymentRequirements
): Promise<FacilitatorSettleResponse> {
  // Facilitator expects x402Version, paymentPayload, AND paymentRequirements
  const settleRequest = {
    x402Version: 1,
    paymentPayload: signedAuthorizationPayload,
    paymentRequirements: paymentRequirements,
  };

  console.log('[x402] Settle request with ERC-3009:', JSON.stringify(settleRequest, null, 2));

  const response = await fetch(`${X402_CONFIG.FACILITATOR_URL}/settle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settleRequest),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[x402] Settle error:', error);
    throw new Error(`Facilitator settle failed: ${error}`);
  }

  const data = await response.json();
  console.log('[x402] Settle success:', data);
  return data;
}

/**
 * Legacy function - kept for compatibility
 */
export async function settlePayment(
  fromAddress: `0x${string}`,
  amountUSDC: string = X402_CONFIG.PAYMENT_AMOUNT
): Promise<FacilitatorSettleResponse> {
  throw new Error('Use settlePaymentWithAuthorization for ERC-3009 payments');
}

/**
 * Get supported payment methods from facilitator
 */
export async function getSupportedPayments(): Promise<FacilitatorSupportedResponse> {
  const response = await fetch(`${X402_CONFIG.FACILITATOR_URL}/supported`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Facilitator supported failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if facilitator supports the required payment method
 */
export async function isFacilitatorReady(): Promise<boolean> {
  try {
    const supported = await getSupportedPayments();
    return supported.kinds.some(
      kind =>
        kind.network === X402_CONFIG.NETWORK &&
        kind.scheme === 'exact' &&
        kind.x402Version === X402_CONFIG.VERSION
    );
  } catch (error) {
    console.error('Facilitator not ready:', error);
    return false;
  }
}
