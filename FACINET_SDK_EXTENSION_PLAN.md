# Facinet SDK Extension Plan: Arbitrary Contract Calls & Network-Aware Selection

## 📊 CURRENT STATE ANALYSIS

### ✅ What's Already Built in Facinet SDK

#### 1. **Core Payment Flow (USDC ERC-3009 Only)**
- **File**: `facinet-sdk/src/sdk/Facinet.ts`
- **Current Capability**: 
  - ✅ ERC-3009 `transferWithAuthorization` signing (EIP-712)
  - ✅ Facilitator selection via `/api/facilitator/list`
  - ✅ Network-aware chain configuration (7 networks: Avalanche, Ethereum Sepolia, Base Sepolia, Polygon Amoy, Arbitrum Sepolia, Monad Testnet, Optimism Sepolia)
  - ✅ Multi-signing methods (private key or `window.ethereum`)
  - ✅ Payment submission to `/api/x402/settle-custom`

#### 2. **Network Configuration**
- **File**: `facinet-sdk/src/sdk/Facinet.ts` (lines 13-86)
- **Current State**:
  - ✅ Chain configs with RPC URLs, USDC addresses, chain IDs, EIP-712 domain names
  - ✅ Network aliases (e.g., `ethereum` → `ethereum-sepolia`)
  - ✅ Validation of USDC addresses per network

#### 3. **Facilitator Selection**
- **File**: `facinet-sdk/src/sdk/Facinet.ts` (lines 455-519)
- **Current State**:
  - ✅ `getFacilitators()` - Fetches all active facilitators
  - ✅ Filters by `status === 'active'`
  - ✅ **Partial network filtering**: Checks `facilitator.network === this.config.network` and `facilitator.chainId === this.chain.chainId`
  - ⚠️ **Issue**: Falls back to including facilitators without network/chainId (backwards compatibility)
  - ✅ `selectRandomFacilitator()` - Random selection from filtered list

#### 4. **Backend API Endpoints**
- **Current Endpoints**:
  - ✅ `GET /api/facilitator/list` - Returns all facilitators (with network filtering in SDK)
  - ✅ `GET /api/facilitator/random?network=...` - Returns random facilitator for a network
  - ✅ `POST /api/x402/settle-custom` - Executes ERC-3009 `transferWithAuthorization` only
  - ✅ `POST /api/x402/settle-default` - Default facilitator for ERC-3009 payments

#### 5. **Backend Facilitator Storage**
- **File**: `lib/facilitator-storage.ts`
- **Current State**:
  - ✅ Facilitators stored with `network` and `chainId` fields
  - ✅ `getActiveFacilitators(networkFilter?)` - Optional network filtering
  - ✅ Network-aware balance checking

---

## 🚫 WHAT'S MISSING / LIMITATIONS

### 1. **Arbitrary Contract Calls**
**Current Limitation**: 
- SDK only supports ERC-3009 USDC transfers
- Backend `/api/x402/settle-custom` only executes `transferWithAuthorization()`
- No mechanism for:
  - `registry.register(agentUrl)` 
  - `registry.setAgentURI()`
  - `registry.transferFrom()`
  - `registry.setAgentWallet()`
  - `registry.setMetadata()`
  - Native token transfers (`sendTransaction()`)
  - CCTP bridge operations
  - Any other arbitrary contract method

**Why This Exists**:
- Facilitators are specialized for USDC ERC-3009 payments
- Backend expects a specific payload structure with `signature` + `authorization` (ERC-3009 format)
- No generic "execute contract call" endpoint

### 2. **Network-Aware Facilitator Selection**
**Current State**:
- ✅ SDK filters facilitators by network/chainId **if** facilitator has those fields
- ⚠️ **Issue**: Falls back to including facilitators without network info (backwards compatibility)
- ⚠️ **Issue**: Backend `/api/facilitator/list` doesn't accept a `network` query parameter
- ✅ Backend `/api/facilitator/random?network=...` exists but SDK doesn't use it

**What Needs Improvement**:
- Backend should accept `?network=...` or `?chainId=...` query params
- SDK should **strictly** filter by network (no fallback to networkless facilitators)
- SDK should use `/api/facilitator/random?network=...` for better performance

---

## 🎯 REQUIRED CHANGES

### PHASE 1: Network-Aware Facilitator Selection (Quick Win)

#### Backend Changes:
1. **Update `/api/facilitator/list`** (`app/api/facilitator/list/route.ts`)
   - Accept optional `?network=...` or `?chainId=...` query parameters
   - Filter facilitators **server-side** before returning
   - Return only facilitators matching the requested network

2. **Enhance `/api/facilitator/random`** (`app/api/facilitator/random/route.ts`)
   - Already accepts `?network=...` ✅
   - Ensure it properly filters by network

#### SDK Changes:
1. **Update `getFacilitators()`** (`facinet-sdk/src/sdk/Facinet.ts`)
   - Pass `network` or `chainId` as query param to backend
   - Remove backwards-compatibility fallback (strict network matching)
   - Use `/api/facilitator/random?network=...` for better performance

2. **Update `selectRandomFacilitator()`**
   - Optionally use `/api/facilitator/random?network=...` endpoint directly
   - Or ensure strict filtering in `getFacilitators()`

---

### PHASE 2: Arbitrary Contract Call Support (Major Feature)

#### New Backend Endpoint:
**`POST /api/x402/execute-contract`**

**Request Body**:
```typescript
{
  facilitatorId: string;
  network: string;           // e.g., 'ethereum-sepolia'
  chainId: number;           // e.g., 11155111
  contractAddress: string;   // Target contract (e.g., registry)
  functionName: string;       // e.g., 'register'
  functionArgs: any[];        // Array of arguments
  abi: any[];                 // Contract ABI (or reference to known contract)
  // Optional: EIP-712 signature for meta-transactions
  signature?: {
    domain: EIP712Domain;
    types: Record<string, any[]>;
    message: any;
    signature: string;
  };
}
```

**Response**:
```typescript
{
  success: boolean;
  txHash: string;
  facilitatorWallet: string;
  network: string;
  networkId: number;
}
```

**Implementation Notes**:
- Decrypt facilitator's private key
- Create provider for the specified network
- Create contract instance with provided ABI
- Execute `contract[functionName](...functionArgs)` using facilitator's wallet
- Pay gas from facilitator's wallet
- Log transaction event

#### New SDK Method:
**`facinet.executeContract(params)`**

**Parameters**:
```typescript
interface ExecuteContractParams {
  contractAddress: `0x${string}`;
  functionName: string;
  functionArgs: any[];
  abi?: any[];  // Optional if using known contracts
  // Optional: For meta-transactions (EIP-712 signing)
  signTypedData?: {
    domain: EIP712Domain;
    types: Record<string, any[]>;
    message: any;
  };
}
```

**Flow**:
1. Select random facilitator for current network
2. If `signTypedData` provided:
   - Sign EIP-712 typed data (using wallet or `window.ethereum`)
   - Include signature in request
3. Submit to `/api/x402/execute-contract`
4. Return transaction hash

#### SDK Type Updates:
**Add to `facinet-sdk/src/sdk/types.ts`**:
```typescript
export interface ExecuteContractParams {
  contractAddress: `0x${string}`;
  functionName: string;
  functionArgs: any[];
  abi?: any[];
  signTypedData?: {
    domain: {
      name: string;
      version: string;
      chainId: number;
      verifyingContract: `0x${string}`;
    };
    types: Record<string, any[]>;
    message: any;
  };
}

export interface ExecuteContractResult {
  success: boolean;
  txHash: string;
  facilitator: {
    id: string;
    name: string;
    wallet: string;
  };
  contract: {
    address: string;
    functionName: string;
    network: string;
  };
}
```

---

### PHASE 3: Known Contract Helpers (Optional Enhancement)

#### SDK Contract Helpers:
Create helper methods for common contracts:

```typescript
// Example: Registry contract helper
facinet.registerAgent(agentUrl: string): Promise<ExecuteContractResult>
facinet.setAgentURI(tokenId: bigint, uri: string): Promise<ExecuteContractResult>
facinet.transferAgent(tokenId: bigint, to: string): Promise<ExecuteContractResult>
facinet.setAgentWallet(tokenId: bigint, wallet: string, signature: string): Promise<ExecuteContractResult>
```

**Implementation**:
- Define known contract ABIs in SDK
- Create wrapper methods that call `executeContract()` with pre-filled ABI
- Handle EIP-712 signing for methods that require it (e.g., `setAgentWallet`)

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Network-Aware Selection (Priority: HIGH)
- [ ] Backend: Update `/api/facilitator/list` to accept `?network=...` query param
- [ ] Backend: Ensure `/api/facilitator/random?network=...` works correctly
- [ ] SDK: Update `getFacilitators()` to pass network query param
- [ ] SDK: Remove backwards-compatibility fallback (strict network matching)
- [ ] SDK: Optionally use `/api/facilitator/random` endpoint directly
- [ ] Test: Verify facilitators are filtered by network correctly

### Phase 2: Arbitrary Contract Calls (Priority: HIGH)
- [ ] Backend: Create `/api/x402/execute-contract` endpoint
- [ ] Backend: Handle network-specific RPC URLs
- [ ] Backend: Decrypt facilitator private key
- [ ] Backend: Execute arbitrary contract calls
- [ ] Backend: Handle gas estimation and execution
- [ ] Backend: Log transaction events
- [ ] SDK: Add `executeContract()` method to `Facinet` class
- [ ] SDK: Add type definitions (`ExecuteContractParams`, `ExecuteContractResult`)
- [ ] SDK: Handle EIP-712 signing for meta-transactions (optional)
- [ ] Test: Test with `registry.register()` call
- [ ] Test: Test with `registry.setAgentURI()` call
- [ ] Test: Test with `registry.transferFrom()` call
- [ ] Test: Test with native token transfer (`sendTransaction`)

### Phase 3: Known Contract Helpers (Priority: MEDIUM)
- [ ] SDK: Define known contract ABIs (Registry, USDC, etc.)
- [ ] SDK: Create helper methods for Registry contract
- [ ] SDK: Create helper methods for other common contracts
- [ ] Documentation: Update README with new methods

---

## 🔒 SECURITY CONSIDERATIONS

1. **Contract Call Validation**:
   - Backend should validate contract addresses (whitelist or allowlist)
   - Backend should validate function names and arguments
   - Consider gas limits to prevent DoS

2. **EIP-712 Signing**:
   - Ensure domain matches exactly (name, version, chainId, verifyingContract)
   - Validate signature before executing

3. **Facilitator Selection**:
   - Ensure facilitator is active and has sufficient balance
   - Check facilitator's network matches request network

4. **Rate Limiting**:
   - Implement rate limiting on `/api/x402/execute-contract`
   - Prevent abuse of facilitator gas

---

## 📝 SUMMARY

**Current State**:
- ✅ SDK supports USDC ERC-3009 payments only
- ✅ Network-aware facilitator selection (partial, with fallback)
- ✅ 7 networks supported

**What Needs to Be Built**:
1. **Network-aware facilitator selection** (strict filtering, backend query params)
2. **Arbitrary contract call endpoint** (`/api/x402/execute-contract`)
3. **SDK `executeContract()` method** for generic contract calls
4. **Optional**: Known contract helpers (Registry, etc.)

**Estimated Effort**:
- Phase 1 (Network-aware selection): **2-3 hours**
- Phase 2 (Arbitrary contract calls): **6-8 hours**
- Phase 3 (Known contract helpers): **3-4 hours**

**Total**: ~12-15 hours of development time

---

## ❓ QUESTIONS FOR YOU

1. **Should we implement Phase 1 first** (network-aware selection) before Phase 2?
2. **For arbitrary contract calls**, should we:
   - Require ABI in every request?
   - Or maintain a registry of known contracts (Registry, USDC, etc.)?
3. **For EIP-712 meta-transactions**, should we:
   - Support signing in SDK?
   - Or require pre-signed messages from client?
4. **Security**: Should we whitelist contract addresses, or allow any contract?
5. **Gas limits**: Should we set a max gas limit per transaction?
