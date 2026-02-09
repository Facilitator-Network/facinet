# x402 Facilitator Reputation System (ERC-8004)

Blockchain-based reputation system for the x402 Facilitator Network using the [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) standard.

## Overview

This system provides transparent, on-chain reputation tracking for facilitators in the x402 payment network. It enables:

- **Facilitator Discovery**: Browse all registered facilitators as ERC-721 NFTs
- **Reputation Tracking**: Transparent feedback from merchants after each payment
- **Trust Building**: Merchants can choose facilitators based on proven track records
- **Decentralization**: All reputation data stored on-chain, censorship-resistant

## Architecture

```
┌────────────────────────────────────────────────────────┐
│  FacilitatorIdentityRegistry (ERC-721)                 │
│  - Each facilitator = NFT with unique ID              │
│  - Points to registration file (IPFS/HTTPS)           │
│  - On-chain metadata (wallet, name, etc.)             │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  FacilitatorReputationRegistry                         │
│  - Feedback collection (score 0-100)                  │
│  - Tags for categorization                            │
│  - On-chain aggregation (count, average)              │
│  - IPFS links for detailed feedback                   │
└────────────────────────────────────────────────────────┘
```

## Smart Contracts

### 1. FacilitatorIdentityRegistry.sol

ERC-721 based registry for facilitator identities.

**Key Features:**
- Each facilitator gets a unique NFT
- TokenURI points to registration file (IPFS or HTTPS)
- On-chain metadata storage
- Transferable facilitator ownership

**Main Functions:**
```solidity
function register(string tokenURI) returns (uint256 facilitatorId)
function setMetadata(uint256 facilitatorId, string key, bytes value)
function getMetadata(uint256 facilitatorId, string key) returns (bytes)
```

### 2. FacilitatorReputationRegistry.sol

Reputation and feedback system.

**Key Features:**
- Score-based feedback (0-100)
- Two customizable tags per feedback
- On-chain and off-chain data
- Feedback revocation
- Response appending

**Main Functions:**
```solidity
function giveFeedback(uint256 facilitatorId, uint8 score, bytes32 tag1, bytes32 tag2, string fileuri, bytes32 filehash, bytes feedbackAuth)
function getSummary(uint256 facilitatorId, address[] clients, bytes32 tag1, bytes32 tag2) returns (uint64 count, uint8 averageScore)
function revokeFeedback(uint256 facilitatorId, uint64 feedbackIndex)
```

## Installation

```bash
cd contracts
npm install
```

## Deployment

### 1. Set up environment

Create `.env` file:
```env
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

### 2. Deploy to Avalanche Fuji Testnet

```bash
npm run deploy:fuji
```

This will:
1. Deploy FacilitatorIdentityRegistry
2. Deploy FacilitatorReputationRegistry
3. Save addresses to `deployed-addresses.json`
4. Print verification commands

### 3. Verify contracts on SnowTrace

```bash
npx hardhat verify --network fuji <IDENTITY_REGISTRY_ADDRESS>
npx hardhat verify --network fuji <REPUTATION_REGISTRY_ADDRESS> <IDENTITY_REGISTRY_ADDRESS>
```

## Registration File Format

The `tokenURI` points to a JSON file with facilitator information:

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "My Facilitator",
  "description": "Fast and reliable payment facilitator for x402",
  "image": "ipfs://QmHash/image.png",
  "endpoints": [
    {
      "name": "agentWallet",
      "endpoint": "eip155:43113:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7"
    },
    {
      "name": "apiEndpoint",
      "endpoint": "https://facilitator.example.com/api"
    }
  ],
  "registrations": [
    {
      "agentId": 1,
      "agentRegistry": "eip155:43113:{IDENTITY_REGISTRY_ADDRESS}"
    }
  ],
  "supportedTrust": [
    "reputation"
  ]
}
```

## Feedback Tags

Common tag examples (use `ethers.id()` to convert to bytes32):

**Tag1 - Response Time:**
- `fast` - Under 10 seconds
- `medium` - 10-30 seconds
- `slow` - Over 30 seconds

**Tag2 - Payment Size:**
- `small` - Under $10
- `medium` - $10-$100
- `large` - Over $100

## Integration with x402

### Backend Integration

1. **Add contract addresses to `.env`:**
```env
IDENTITY_REGISTRY_ADDRESS=0x...
REPUTATION_REGISTRY_ADDRESS=0x...
```

2. **Register facilitator:**
```typescript
import { registerFacilitatorOnChain } from '@/lib/reputation-contract';

const { facilitatorId, txHash } = await registerFacilitatorOnChain(
  'ipfs://QmHash/registration.json',
  signer
);
```

3. **Submit feedback after payment:**
```typescript
import { submitFeedback } from '@/lib/reputation-contract';

const txHash = await submitFeedback(
  facilitatorId,
  100, // score
  { tag1: 'fast', tag2: 'small' },
  merchantSigner
);
```

### Frontend Integration

View reputation leaderboard at `/facilitator-hub/reputation`

## API Endpoints

### Get Reputation

```bash
# Get all facilitators with reputation
GET /api/facilitator/reputation?all=true

# Get specific facilitator
GET /api/facilitator/reputation?facilitatorId=1&includeDetails=true
```

### Submit Feedback

```bash
POST /api/facilitator/feedback
Content-Type: application/json

{
  "facilitatorId": 1,
  "score": 100,
  "tag1": "fast",
  "tag2": "small",
  "merchantPrivateKey": "0x..."
}
```

## Security Considerations

1. **Feedback Authorization**: Currently simplified - implement proper EIP-191/ERC-1271 signature verification in production
2. **Sybil Resistance**: Filter by trusted reviewer addresses to prevent spam
3. **Private Keys**: Never expose private keys in frontend - use wallet connections
4. **Rate Limiting**: Implement rate limits on feedback submission

## Future Enhancements

- [ ] Implement ValidationRegistry for stake-secured verification
- [ ] Add zkML proofs for payment verification
- [ ] Implement proper feedback authorization signatures
- [ ] Build reputation-weighted facilitator selection
- [ ] Add facilitator insurance pools based on reputation
- [ ] Create reputation NFT badges

## License

MIT

## Resources

- [ERC-8004 Specification](https://eips.ethereum.org/EIPS/eip-8004)
- [Avalanche Fuji Explorer](https://testnet.snowtrace.io)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
