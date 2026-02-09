/**
 * Contract interaction utilities for ERC-8004 Facilitator Reputation System
 */

import { ethers } from 'ethers';

// Contract ABIs (simplified - only functions we need)
const IDENTITY_REGISTRY_ABI = [
  'function register(string memory tokenURI) external returns (uint256 facilitatorId)',
  'function register(string memory tokenURI, tuple(string key, bytes value)[] calldata metadata) external returns (uint256 facilitatorId)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function tokenURI(uint256 tokenId) external view returns (string memory)',
  'function totalFacilitators() external view returns (uint256)',
  'function setMetadata(uint256 facilitatorId, string calldata key, bytes calldata value) external',
  'function getMetadata(uint256 facilitatorId, string calldata key) external view returns (bytes memory)',
];

const REPUTATION_REGISTRY_ABI = [
  'function giveFeedback(uint256 facilitatorId, uint8 score, bytes32 tag1, bytes32 tag2, string calldata fileuri, bytes32 filehash, bytes memory feedbackAuth) external',
  'function getSummary(uint256 facilitatorId, address[] calldata clientAddresses, bytes32 tag1, bytes32 tag2) external view returns (uint64 count, uint8 averageScore)',
  'function readAllFeedback(uint256 facilitatorId, address[] calldata clientAddresses, bytes32 tag1, bytes32 tag2, bool includeRevoked) external view returns (address[] memory clients, uint8[] memory scores, bytes32[] memory tag1s, bytes32[] memory tag2s, bool[] memory revokedStatuses)',
  'function getClients(uint256 facilitatorId) external view returns (address[] memory)',
  'function revokeFeedback(uint256 facilitatorId, uint64 feedbackIndex) external',
  'event NewFeedback(uint256 indexed facilitatorId, address indexed clientAddress, uint8 score, bytes32 indexed tag1, bytes32 tag2, string fileuri, bytes32 filehash)',
];

// Environment variables (set these in .env)
const IDENTITY_REGISTRY_ADDRESS = process.env.IDENTITY_REGISTRY_ADDRESS || '';
const REPUTATION_REGISTRY_ADDRESS = process.env.REPUTATION_REGISTRY_ADDRESS || '';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

// Create provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

/**
 * Get Identity Registry contract instance
 */
export function getIdentityRegistry(signerOrProvider?: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(
    IDENTITY_REGISTRY_ADDRESS,
    IDENTITY_REGISTRY_ABI,
    signerOrProvider || provider
  );
}

/**
 * Get Reputation Registry contract instance
 */
export function getReputationRegistry(signerOrProvider?: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(
    REPUTATION_REGISTRY_ADDRESS,
    REPUTATION_REGISTRY_ABI,
    signerOrProvider || provider
  );
}

/**
 * Register a new facilitator on-chain
 */
export async function registerFacilitatorOnChain(
  registrationUri: string,
  signer: ethers.Signer
): Promise<{ facilitatorId: number; txHash: string }> {
  const contract = getIdentityRegistry(signer);

  const tx = await contract.register(registrationUri);
  const receipt = await tx.wait();

  // Parse Registered event to get facilitatorId
  const event = receipt.logs.find(
    (log: any) => log.eventName === 'Registered'
  );

  const facilitatorId = Number(event.args[0]);

  return {
    facilitatorId,
    txHash: receipt.hash,
  };
}

/**
 * Get reputation summary for a facilitator
 */
export async function getFacilitatorReputation(
  facilitatorId: number,
  filters?: {
    clientAddresses?: string[];
    tag1?: string;
    tag2?: string;
  }
): Promise<{ count: number; averageScore: number }> {
  const contract = getReputationRegistry();

  const clientAddresses = filters?.clientAddresses || [];
  const tag1 = filters?.tag1 ? ethers.id(filters.tag1) : ethers.ZeroHash;
  const tag2 = filters?.tag2 ? ethers.id(filters.tag2) : ethers.ZeroHash;

  const [count, averageScore] = await contract.getSummary(
    facilitatorId,
    clientAddresses,
    tag1,
    tag2
  );

  return {
    count: Number(count),
    averageScore: Number(averageScore),
  };
}

/**
 * Get all feedback for a facilitator
 */
export async function getAllFeedback(
  facilitatorId: number,
  filters?: {
    clientAddresses?: string[];
    tag1?: string;
    tag2?: string;
    includeRevoked?: boolean;
  }
) {
  const contract = getReputationRegistry();

  const clientAddresses = filters?.clientAddresses || [];
  const tag1 = filters?.tag1 ? ethers.id(filters.tag1) : ethers.ZeroHash;
  const tag2 = filters?.tag2 ? ethers.id(filters.tag2) : ethers.ZeroHash;
  const includeRevoked = filters?.includeRevoked ?? false;

  const [clients, scores, tag1s, tag2s, revokedStatuses] = await contract.readAllFeedback(
    facilitatorId,
    clientAddresses,
    tag1,
    tag2,
    includeRevoked
  );

  // Format response
  return clients.map((client: string, i: number) => ({
    clientAddress: client,
    score: Number(scores[i]),
    tag1: tag1s[i],
    tag2: tag2s[i],
    isRevoked: revokedStatuses[i],
  }));
}

/**
 * Submit feedback for a facilitator
 */
export async function submitFeedback(
  facilitatorId: number,
  score: number,
  options: {
    tag1?: string;
    tag2?: string;
    fileUri?: string;
    fileHash?: string;
  },
  signer: ethers.Signer
): Promise<string> {
  const contract = getReputationRegistry(signer);

  const tag1 = options.tag1 ? ethers.id(options.tag1) : ethers.ZeroHash;
  const tag2 = options.tag2 ? ethers.id(options.tag2) : ethers.ZeroHash;
  const fileUri = options.fileUri || '';
  const fileHash = options.fileHash || ethers.ZeroHash;

  // For now, empty feedbackAuth (in production, implement proper signature)
  const feedbackAuth = '0x';

  const tx = await contract.giveFeedback(
    facilitatorId,
    score,
    tag1,
    tag2,
    fileUri,
    fileHash,
    feedbackAuth
  );

  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Get all facilitators with reputation
 */
export async function getAllFacilitatorsWithReputation(): Promise<
  Array<{
    facilitatorId: number;
    count: number;
    averageScore: number;
  }>
> {
  const identityContract = getIdentityRegistry();
  const totalFacilitators = await identityContract.totalFacilitators();

  const facilitators = [];

  for (let i = 1; i <= Number(totalFacilitators); i++) {
    try {
      const reputation = await getFacilitatorReputation(i);
      facilitators.push({
        facilitatorId: i,
        ...reputation,
      });
    } catch (error) {
      // Skip if facilitator doesn't exist
      continue;
    }
  }

  return facilitators;
}

/**
 * Convert tag bytes32 to string (reverse of ethers.id())
 */
export function bytes32ToString(bytes32: string): string {
  // This is a simplified version - in reality, we'd need to store the original string
  // For now, return the hex value
  return bytes32;
}
