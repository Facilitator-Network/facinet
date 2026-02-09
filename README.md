# x402 Facilitator Network on Avalanche

A decentralized payment facilitator network powered by the x402 protocol on Avalanche. Users can create and run their own facilitators to process ERC-3009 USDC payments, earning fees while contributing to a permissionless payment infrastructure.

## 🌐 What is This?

This project enables anyone to become a **payment facilitator** in the x402 network:
- Create your own facilitator with a one-time 1 USDC registration
- Fund it with AVAX for gas fees
- Your facilitator processes payments and appears in the network dropdown
- Earn transaction fees while supporting decentralized payments

## ✨ Key Features

### For Facilitator Operators
- 🚀 **One-Click Facilitator Creation** - Generate and register facilitators in minutes
- 🔐 **Secure Key Management** - Encrypted private keys with user password + system master key
- 💰 **Automatic Status Tracking** - Real-time monitoring of AVAX balance and facilitator status
- 📊 **Dashboard** - View facilitator status, wallet address, balance, and payments processed
- ⚡ **ERC-3009 Compatible** - Process gasless USDC transfers on Avalanche

### For Payment Users
- 💳 **Choose Your Facilitator** - Select from available facilitators in the network
- 🎨 **Clean UI** - Modern black & white design with smooth animations
- 🔄 **AVAX to USDC Swap** - Integrated swap widget for easy token conversion
- 🌈 **Wallet Connect** - Easy connection with RainbowKit

## 📂 Project Structure

For a detailed map of the codebase, see [CODE_MAP.md](./CODE_MAP.md).

- **`app/`**: Next.js 14 App Router pages and API routes.
- **`components/`**: React UI components (Shadcn UI + custom).
- **`lib/`**: Core utilities, x402 protocol logic, and crypto helpers.
- **`contracts/`**: Solidity smart contracts for facilitator registry.
- **`hooks/`**: Custom React hooks.

## 🏗️ Architecture

### Facilitator Creation Flow
```
1. User connects wallet
2. Fills facilitator form (name, wallet, payment recipient)
3. Generates new facilitator wallet
4. Encrypts private key with password
5. Pays 1 USDC registration fee via x402
6. Facilitator registered in Redis
7. User funds facilitator wallet with AVAX (0.1+ AVAX)
8. Facilitator becomes ACTIVE and appears in dropdown
```

### Payment Processing Flow
```
1. User selects facilitator from dropdown
2. Signs ERC-3009 authorization for 1 USDC
3. Selected facilitator executes transaction (pays gas)
4. USDC transferred to merchant
5. Facilitator earns fee
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **wagmi + viem** - Web3 interactions
- **RainbowKit** - Wallet connection

### Backend
- **Next.js API Routes** - Serverless functions
- **Upstash Redis** - Facilitator data storage
- **ethers.js** - Blockchain interactions
- **ERC-3009** - Gasless USDC transfers

### Blockchain
- **Avalanche Fuji Testnet** - Fast, low-cost test environment
- **USDC Contract** - ERC-3009 compatible stablecoin
- **x402 Protocol** - HTTP 402 payment standard

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed
2. **Avalanche Fuji Testnet** funds:
   - Get AVAX from [Avalanche Faucet](https://core.app/tools/testnet-faucet/)
   - You'll need AVAX for gas fees and swapping to USDC
3. **WalletConnect Project ID**:
   - Get one free at [WalletConnect Cloud](https://cloud.walletconnect.com/)
4. **Upstash Redis** (for production):
   - Create account at [Upstash](https://upstash.com/)
   - Get REST URL and Token
5. **MetaMask** or any Web3 wallet

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd x402
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file:

```env
# ==========================================
# FRONTEND (Browser)
# ==========================================

# WalletConnect Project ID (Required)
# Get yours at: https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Payment Configuration
NEXT_PUBLIC_PAYMENT_RECIPIENT=0xYourWalletAddress
NEXT_PUBLIC_PAYMENT_AMOUNT=1
NEXT_PUBLIC_NETWORK=avalanche-fuji

# USDC Token Address on Avalanche Fuji
NEXT_PUBLIC_USDC_ADDRESS=0x5425890298aed601595a70AB815c96711a31Bc65

# ==========================================
# BACKEND (API Routes)
# ==========================================

# Default Facilitator Private Key (for fallback payments)
# This wallet needs AVAX for gas fees
DEFAULT_FACILITATOR_PRIVATE_KEY=your_private_key_here

# Upstash Redis (Required for production)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# System Master Key (for encrypting facilitator private keys)
# Generate a secure random string
SYSTEM_MASTER_KEY=your_secure_random_string_here

# Optional: RPC URL (defaults to public Avalanche Fuji RPC)
RPC_URL_AVALANCHE_FUJI=https://api.avax-test.network/ext/bc/C/rpc
```

### 3. Generate Secure Keys

**For SYSTEM_MASTER_KEY**, generate a secure random string:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `SYSTEM_MASTER_KEY`.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Deploy to Production

#### Deploy to Vercel

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy

**Important**: Make sure these are set in Vercel:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SYSTEM_MASTER_KEY`
- `DEFAULT_FACILITATOR_PRIVATE_KEY`

## 📖 How to Use

### Creating a Facilitator

1. **Navigate to Facilitator Hub**
   - Click "Create Facilitator" from homepage

2. **Fill Facilitator Details**
   - Enter facilitator name (e.g., "My Facilitator")
   - Click "Generate Wallet" - creates new wallet address

3. **Secure Your Private Key**
   - **IMPORTANT**: Save the private key shown
   - You'll need it to fund with AVAX later
   - Encrypt it with a strong password

4. **Enter Payment Recipient**
   - Your wallet address where USDC payments go

5. **Pay Registration Fee**
   - Click "Pay Facilitator Registration Fee (1 USDC)"
   - Approve transaction in wallet
   - Wait for confirmation

6. **Fund with AVAX**
   - Import facilitator wallet to MetaMask (use saved private key)
   - Send at least 0.1 AVAX to facilitator wallet
   - Get testnet AVAX: [Avalanche Faucet](https://core.app/tools/testnet-faucet/)

7. **Facilitator Activated**
   - Status changes to "ACTIVE"
   - Appears in payment dropdown on homepage
   - Ready to process payments!

### Making Payments (As User)

1. **Get USDC**
   - Swap AVAX to USDC using integrated swap widget
   - Or get USDC directly from faucet

2. **Select Facilitator**
   - Choose from available facilitators in dropdown
   - Each facilitator processes payments independently

3. **Make Payment**
   - Click "Launch App"
   - Sign ERC-3009 authorization (no gas needed from you!)
   - Selected facilitator executes transaction
   - Access granted to builder hub

## 🔑 Facilitator Dashboard

Once your facilitator is created, the dashboard shows:

### Status Cards
- **STATUS**: ACTIVE (green) or INACTIVE (yellow)
- **FACILITATOR WALLET**: Your facilitator's address
- **AVAX BALANCE**: Current gas balance
- **PAYMENTS PROCESSED**: Total transactions

### Activation Requirements
- **Minimum Balance**: 0.1 AVAX required
- **Status Updates**: Automatic when balance changes
- **Refresh Button**: Manually check latest status

## 🔒 Security Features

### Private Key Encryption
- **User Password**: First layer of encryption
- **System Master Key**: Second layer for backend operations
- **Never Stored Plain**: All keys encrypted at rest in Redis

### Payment Security
- **ERC-3009**: User signs authorization, facilitator executes
- **No Direct Key Exposure**: Frontend never sees unencrypted keys
- **On-Chain Verification**: All payments verified on Avalanche

## 📊 Contract Addresses (Avalanche Fuji)

- **USDC**: `0x5425890298aed601595a70AB815c96711a31Bc65`
- **WAVAX**: `0xd00ae08403B9bbb9124bB305C09058E32C39A48c`
- **Trader Joe Router**: `0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901`

## 🐛 Troubleshooting

### Facilitator Creation Issues

**"Failed to register facilitator"**
- Check you have 1 USDC in wallet
- Ensure connected to Avalanche Fuji
- Verify payment recipient address is valid


## 📚 Resources

- [x402 Protocol Documentation](https://github.com/x402-rs/x402-rs)
- [ERC-3009 Specification](https://eips.ethereum.org/EIPS/eip-3009)
- [Avalanche Documentation](https://docs.avax.network/)
- [Avalanche Fuji Explorer](https://testnet.snowtrace.io/)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)

## ⚠️ Important Notes

**Testnet Only**: This project uses Avalanche Fuji testnet. Do not use real funds.

**Demo Purpose**: This is a demonstration of decentralized payment facilitators. For production use, implement:
- Rate limiting
- Advanced monitoring
- Automated gas management
- Comprehensive error handling
- Security audits

**Private Keys**: Never commit private keys to version control. Always use environment variables and keep them secure.

**Gas Management**: Monitor facilitator AVAX balances. Facilitators become inactive when gas runs out.

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💬 Support

For issues and questions:
- Open a GitHub issue
- Check the troubleshooting section above

---

**Built with ❤️ using x402 protocol on Avalanche**

*Enabling anyone to become a payment facilitator in a decentralized network*
