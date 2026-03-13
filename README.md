# Facinet

**The decentralized gasless payment infrastructure for every chain.**

Facinet is a permissionless facilitator network built on the x402 protocol. It enables gasless USDC payments and arbitrary smart contract execution across 7 blockchain networks. Users sign authorizations off-chain; facilitators execute on-chain and pay gas. Anyone can become a facilitator.

**Live at**: [facilitator.network](https://facilitator.network)
**SDK**: [npmjs.com/package/facinet-sdk](https://www.npmjs.com/package/facinet-sdk)

---

## How It Works

```
User signs ERC-3009 authorization (off-chain, no gas)
        ↓
Facinet selects a facilitator from the network
        ↓
Facilitator submits tx on-chain (pays gas in AVAX/ETH/MATIC)
        ↓
USDC transferred to recipient — user paid $0 gas
```

Facilitators are independent operators with their own wallets. Each facilitator is registered on-chain with an ERC-8004 identity NFT and earns fees for processing transactions.

---

## Features

### Gasless Payments
Users sign ERC-3009 `TransferWithAuthorization` off-chain. No gas needed from the user — the facilitator pays all gas fees.

### Multi-Chain Support
7 testnets supported out of the box:

| Network | Chain ID | Gas Token |
|---------|----------|-----------|
| Avalanche Fuji | 43113 | AVAX |
| Ethereum Sepolia | 11155111 | ETH |
| Base Sepolia | 84532 | ETH |
| Polygon Amoy | 80002 | MATIC |
| Arbitrum Sepolia | 421614 | ETH |
| Optimism Sepolia | 11155420 | ETH |
| Monad Testnet | 10143 | MON |

### Decentralized Facilitator Network
Anyone can create a facilitator. Each facilitator has its own wallet, processes payments independently, and appears in the public network for SDK/API consumers to use.

### Gasless API Keys
Purchase an API key (10 USDC) and get 1,000 gasless contract execution calls. No wallet setup required for your backend — just an API key and a POST request.

### On-Chain Identity & Reputation (ERC-8004)
Every facilitator gets an ERC-721 identity NFT on-chain. Users can leave feedback (scores 0-100 with tags), building a transparent reputation system.

### Parallel Transaction Support
Redis-based nonce manager enables 1,000+ concurrent transactions without nonce collisions. Each facilitator wallet gets unique sequential nonces via atomic Redis INCR across serverless instances.

### Whitelist System
Controlled access for facilitator creation and API key purchases. Apply through the platform, get approved by an admin, then create facilitators or buy API keys.

---

## SDK

Install:

```bash
npm install facinet
```

### Make a Gasless Payment

```typescript
import { Facinet } from 'facinet';

const facinet = new Facinet({ network: 'avalanche-fuji' });

const result = await facinet.pay({
  amount: '1',
  recipient: '0xMerchantAddress',
  payerAddress: '0xCustomerAddress',
});

console.log('TX:', result.txHash);
```

### Execute Any Smart Contract (Gasless)

```typescript
const result = await facinet.executeContract({
  contractAddress: '0xRegistryAddress',
  functionName: 'register',
  functionArgs: ['https://example.com/agent'],
  abi: registryABI,
});
```

### List Facilitators

```typescript
const facilitators = await facinet.getFacilitators();
const random = await facinet.selectRandomFacilitator();
```

### Static Quick Pay

```typescript
await Facinet.quickPay({
  amount: '1',
  recipient: '0xMerchant',
  privateKey: process.env.PRIVATE_KEY,
  network: 'base-sepolia',
});
```

### Express.js Paywall Middleware

```typescript
import { Facinet } from 'facinet';
import express from 'express';

const app = express();

app.get('/premium', Facinet.paywall({
  amount: '0.10',
  recipient: '0xYourAddress',
}), (req, res) => {
  res.json({ content: 'Premium content' });
});
```

### CLI

```bash
facinet pay --amount 1 --to 0x... --network base-sepolia
facinet facilitator list --network ethereum-sepolia
facinet facilitator status <facilitatorId>
facinet facilitator balance <facilitatorId>
```

Full SDK documentation: [npmjs.com/package/facinet-sdk](https://www.npmjs.com/package/facinet-sdk)

---

## Public API

Base URL: `https://facilitator.network`

### Gasless Contract Execution

```
POST /api/v1/execute
Header: X-API-Key: fk_xxxxxxxxxxxx

{
  "network": "avalanche-fuji",
  "contractAddress": "0x...",
  "functionName": "register",
  "functionArgs": ["https://example.com"],
  "abi": [...]
}
```

Returns:

```json
{
  "success": true,
  "txHash": "0x...",
  "gasUsed": "125000",
  "callsRemaining": 999
}
```

### API Key Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/keys/purchase` | POST | Buy an API key (10 USDC, 1000 calls) |
| `/api/keys/status?key=fk_xxx` | GET | Check remaining calls |
| `/api/keys/status?wallet=0x...` | GET | List all keys for a wallet |

### Payment Settlement

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/x402/settle` | POST | Settle ERC-3009 payment via facilitator |
| `/api/x402/settle-custom` | POST | Settle with specific facilitator + network |
| `/api/x402/execute-contract` | POST | Execute arbitrary contract call via facilitator |
| `/api/x402/verify` | POST | Verify a payment header |

### Facilitator Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/facilitator/list` | GET | List active facilitators (filter by `network`, `chainId`) |
| `/api/facilitator/random?network=...` | GET | Get a random active facilitator |
| `/api/facilitator/search?name=...` | GET | Search facilitators by name |
| `/api/facilitator/{id}` | GET | Get facilitator details |
| `/api/facilitator/balance?address=...&network=...` | GET | Check native token balance |
| `/api/facilitator/check-and-activate` | POST | Check balance and auto-update status |
| `/api/facilitator/create` | POST | Create a new facilitator (whitelist required) |
| `/api/facilitator/delete` | POST | Delete a facilitator (creator or admin) |
| `/api/facilitator/reputation?facilitatorId=...` | GET | Get reputation score |
| `/api/facilitator/feedback` | POST | Submit on-chain feedback (ERC-8004) |

### Whitelist

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/whitelist/apply` | POST | Apply for whitelist (name, email, wallet) |
| `/api/whitelist/check?wallet=0x...` | GET | Check whitelist status |

### Explorer & Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/explorer/recent?limit=50` | GET | Recent network activity |
| `/api/explorer/logs` | GET | Query logs (filter by `eventType`, `facilitatorId`, `status`) |
| `/api/explorer/transaction/{txHash}` | GET | Transaction details |
| `/api/explorer/facilitator/{id}/history` | GET | Facilitator event history |
| `/api/stats/network` | GET | Network-wide statistics |

### Payment Verification

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payment/status` | POST | Verify ERC-3009 payment proof |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Next.js 16 · React 19 · Tailwind · RainbowKit  │
│  wagmi + viem · Framer Motion · GSAP · Three.js  │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              Next.js API Routes                   │
│  Vercel Serverless · Auto-scaling                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ x402     │ │ Facilit. │ │ Gasless API Keys │ │
│  │ Protocol │ │ CRUD     │ │ /api/v1/execute  │ │
│  └────┬─────┘ └────┬─────┘ └───────┬──────────┘ │
│       │             │               │             │
│  ┌────▼─────────────▼───────────────▼──────────┐ │
│  │         Redis Nonce Manager                  │ │
│  │  Atomic INCR · Per-wallet · Parallel TX      │ │
│  └──────────────────┬──────────────────────────┘ │
└─────────────────────┼────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────┐
│              Upstash Redis                        │
│  Facilitator data · Nonce counters · API keys     │
│  Whitelist · Explorer logs · Session state        │
└──────────────────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────┐
│           7 Blockchain Networks                   │
│  ERC-3009 USDC · ERC-8004 Identity · ERC-8004    │
│  Reputation · Facilitator Registry NFTs           │
└──────────────────────────────────────────────────┘
```

### Key Flows

**Facilitator Creation:**
Connect wallet → Apply for whitelist → Get approved → Create facilitator (name, wallet, recipient) → Pay 1 USDC registration → Fund with native gas token → Facilitator goes ACTIVE

**Payment via SDK:**
`facinet.pay()` → SDK fetches active facilitators for network → Selects random one → User signs ERC-3009 auth → SDK posts to `/api/x402/settle-custom` → Nonce manager assigns unique nonce → Facilitator wallet executes `transferWithAuthorization` on-chain → USDC moves, user paid $0 gas

**Gasless API Key:**
Purchase key (10 USDC) → Get `fk_xxxx` key → POST to `/api/v1/execute` with `X-API-Key` header → Auto-selects facilitator → Executes contract call → Deducts 1 call from key balance

---

## Security

- **Dual-layer key encryption**: Facilitator private keys encrypted with AES-256-GCM using both user password and system master key (PBKDF2, 100k iterations)
- **Keys never stored in plaintext**: Encrypted at rest in Redis, decrypted only at settlement time in serverless function memory
- **ERC-3009**: Users sign authorizations off-chain — private keys never leave the wallet
- **Whitelist gating**: Facilitator creation and API key purchases require admin approval
- **Admin endpoints**: Protected with `X-Admin-Secret` header
- **API key rate limiting**: 1,000 calls per key, tracked per-key in Redis
- **Nonce isolation**: Each facilitator wallet has independent nonce tracking — no cross-wallet interference

---

## License

MIT

---

**Built on Avalanche. Powering gasless payments for every chain.**
