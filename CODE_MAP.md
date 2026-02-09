# Codebase Map

This document provides a high-level overview of the project structure to build a mental model of the codebase.

## 📂 Directory Structure

### `/app`
The Next.js App Router directory containing pages and API routes.
- **`/api`**: Backend logic (Serverless functions).
  - `/facilitator`: Endpoints for facilitator creation and management.
  - `/x402`: Core x402 protocol endpoints (verify, settle).
- **`/facilitator`**: Frontend pages for facilitator dashboard and creation flow.
- **`/explorer`**: Explorer interface for viewing facilitators.
- **`/docs`**: Documentation pages.

### `/components`
React components used throughout the application.
- **`/ui`**: Reusable generic UI components (buttons, inputs, dialogs) - mostly from Shadcn UI.
- **`/facilitator`**: Components specific to facilitator features.
- **`/agents`**: AI agent related components.
- **`X402PaymentModal.tsx`**: Core component handling the payment flow.
- **`SwapWidget.tsx`**: Component for swapping AVAX to USDC.

### `/lib`
Core business logic, utilities, and configuration.
- **`x402.ts`**: Core x402 protocol implementation (payment requirements, verification).
- **`erc3009.ts`**: implementation of ERC-3009 (Gasless USDC transfers).
- **`facilitator-crypto.ts`**: Encryption/decryption logic for facilitator private keys.
- **`facilitator-storage.ts`**: Redis storage interface for facilitators.
- **`verify-payment.ts`**: Logic to verify on-chain payments.
- **`wagmi.ts`**: Web3 configuration (RainbowKit + Wagmi).

### `/contracts`
Smart contracts implementation (Hardhat project).
- **`FacilitatorIdentityRegistry.sol`**: Contract for registering facilitator identities.
- **`FacilitatorReputationRegistry.sol`**: Contract for managing reputation.

### `/hooks`
Custom React hooks.
- **`use-toast.ts`**: Toast notification hook.

## 🔑 Key Concepts

- **Facilitator**: An entity that processes gasless USDC payments for users.
- **x402 Protocol**: An HTTP status code 402 based payment protocol.
- **ERC-3009**: A standard allowing users to sign a transfer authorization that a facilitator pays gas to submit.
