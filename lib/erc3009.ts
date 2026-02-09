/**
 * ERC-3009: Transfer With Authorization
 *
 * This implements the ERC-3009 standard for gasless token transfers.
 * Users sign an authorization message, and the facilitator submits it on-chain.
 */

import { parseUnits, hexToBytes, bytesToHex } from 'viem';
import { getX402Config } from './x402';
import { getNetworkConfig } from './networks';

// ==========================================
// ERC-3009 TYPE DEFINITIONS
// ==========================================

/**
 * ERC-3009 TransferWithAuthorization struct
 * For signing with wagmi (uses bigint)
 */
export interface TransferWithAuthorization {
  from: `0x${string}`;      // Token owner
  to: `0x${string}`;        // Recipient
  value: bigint;            // Amount in atomic units
  validAfter: bigint;       // Unix timestamp - authorization valid after this time
  validBefore: bigint;      // Unix timestamp - authorization valid before this time
  nonce: `0x${string}`;     // Unique nonce (32 bytes hex)
}

/**
 * ERC-3009 Authorization for JSON payload
 * For sending to facilitator (uses string)
 */
export interface TransferAuthorizationJSON {
  from: `0x${string}`;
  to: `0x${string}`;
  value: string;
  validAfter: string;
  validBefore: string;
  nonce: `0x${string}`;
}

/**
 * ERC-3009 signed authorization (for signing)
 */
export interface SignedAuthorization {
  signature: `0x${string}`;
  authorization: TransferWithAuthorization;
}

/**
 * ERC-3009 signed authorization (for JSON)
 */
export interface SignedAuthorizationJSON {
  signature: `0x${string}`;
  authorization: TransferAuthorizationJSON;
}

/**
 * Get EIP-712 Domain for USDC on a specific network
 * @param network Network name (defaults to avalanche-fuji)
 * @returns EIP-712 domain for the network
 */
export function getERC3009Domain(network?: string) {
  const networkName = network || 'avalanche-fuji';
  const networkConfig = getNetworkConfig(networkName);
  return networkConfig.erc3009Domain;
}

/**
 * Backward compatibility - default to Avalanche Fuji
 */
export const ERC3009_DOMAIN = getERC3009Domain('avalanche-fuji');

/**
 * EIP-712 TransferWithAuthorization type definition
 */
export const ERC3009_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Generate a unique nonce for ERC-3009 authorization
 */
export function generateNonce(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

/**
 * Create ERC-3009 authorization message (with bigint for signing)
 * @param from Token owner address
 * @param to Recipient address
 * @param amountUSDC Amount in USDC
 * @param network Network name (defaults to avalanche-fuji)
 */
export function createTransferAuthorization(
  from: `0x${string}`,
  to: `0x${string}`,
  amountUSDC: string,
  network?: string
): TransferWithAuthorization {
  const config = getX402Config(network);
  const value = parseUnits(amountUSDC, config.USDC_DECIMALS);
  const now = Math.floor(Date.now() / 1000);
  const validAfter = BigInt(now - 60);
  const validBefore = BigInt(now + config.TIMEOUT_SECONDS);
  const nonce = generateNonce();

  return {
    from,
    to,
    value,
    validAfter,
    validBefore,
    nonce,
  };
}

/**
 * Get EIP-712 typed data for signing
 * This should be used with wagmi's signTypedData hook
 * @param authorization Transfer authorization
 * @param network Network name (defaults to avalanche-fuji)
 */
export function getTypedDataForSigning(
  authorization: TransferWithAuthorization,
  network?: string
) {
  return {
    domain: getERC3009Domain(network),
    types: ERC3009_TYPES,
    primaryType: 'TransferWithAuthorization' as const,
    message: authorization,
  };
}

/**
 * Create signed authorization from signature
 */
export function createSignedAuthorization(
  authorization: TransferWithAuthorization,
  signature: `0x${string}`
): SignedAuthorization {
  return {
    signature,
    authorization,
  };
}

/**
 * Convert SignedAuthorization to SignedAuthorizationJSON
 * Converts all BigInt values to strings for JSON serialization
 */
export function signedAuthorizationToJSON(
  signedAuth: SignedAuthorization
): SignedAuthorizationJSON {
  return {
    signature: signedAuth.signature,
    authorization: {
      from: signedAuth.authorization.from,
      to: signedAuth.authorization.to,
      value: signedAuth.authorization.value.toString(),
      validAfter: signedAuth.authorization.validAfter.toString(),
      validBefore: signedAuth.authorization.validBefore.toString(),
      nonce: signedAuth.authorization.nonce,
    },
  };
}

/**
 * Create x402 exact payment payload with ERC-3009 authorization
 * Converts bigint values to strings for JSON serialization
 * @param signedAuth Signed authorization
 * @param network Network name (defaults to avalanche-fuji)
 */
export function createX402ExactPayload(
  signedAuth: SignedAuthorization,
  network?: string
): any {
  const config = getX402Config(network);

  // Convert bigint values to strings for JSON
  const authJSON: TransferAuthorizationJSON = {
    from: signedAuth.authorization.from,
    to: signedAuth.authorization.to,
    value: signedAuth.authorization.value.toString(),
    validAfter: signedAuth.authorization.validAfter.toString(),
    validBefore: signedAuth.authorization.validBefore.toString(),
    nonce: signedAuth.authorization.nonce,
  };

  return {
    x402Version: 1,
    scheme: 'exact',
    network: config.NETWORK,
    payload: {
      signature: signedAuth.signature,
      authorization: authJSON,
    },
  };
}

// ==========================================
// WINDOW ETHEREUM TYPE
// ==========================================

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      selectedAddress?: string;
    };
  }
}
