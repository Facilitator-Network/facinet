"use client"

import Link from "next/link"
import { ShieldCheck, Server, Activity, Wallet, Clock, ArrowRight, Cloud, X, AlertCircle, Terminal, Trash2, RadioTower, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { AnimatedArchitectureFlow } from "@/components/ui/architecture-flow"
import { SectionHeading } from "@/components/ui/section-heading"
import { GlassIcon } from "@/components/ui/glass-icon"
import { ONBOARDING_FLOW } from "@/lib/data/whitepaper"
import { useAccount, useSignTypedData } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { ethers } from "ethers"
import { NetworkSelector } from "@/components/NetworkSelector"
import { getNetworkConfig, NETWORK_CONFIGS } from "@/lib/networks"
import {
  createTransferAuthorization,
  getTypedDataForSigning,
  createSignedAuthorization,
  createX402ExactPayload,
} from "@/lib/erc3009"
import { createPaymentRequirements } from "@/lib/x402"

interface Facilitator {
  id: string
  name: string
  facilitatorWallet: string
  paymentRecipient: string
  createdBy: string
  status: 'needs_funding' | 'active' | 'inactive'
  totalPayments: number
  lastUsed: number
  reputation?: number
  network?: string
  chainId?: number
}

// Default facilitator address for registration fee (platform wallet)
const DEFAULT_FACILITATOR = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT || '0x0000000000000000000000000000000000000000'

export default function FacilitatorPage() {
  const { address, isConnected, chain } = useAccount()
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [deployStep, setDeployStep] = useState(1)
  const [reuseExistingAccount, setReuseExistingAccount] = useState(false)
  const [facilitatorName, setFacilitatorName] = useState("")
  const [paymentAddress, setPaymentAddress] = useState("")
  const [selectedNetwork, setSelectedNetwork] = useState<string>('avalanche-fuji')
  const [facilitators, setFacilitators] = useState<Facilitator[]>([])
  const [myFacilitators, setMyFacilitators] = useState<Facilitator[]>([])
  const [networkStats, setNetworkStats] = useState({
    activeNodes: 0,
    totalStaked: "$0",
    feesGenerated: "$0",
    transactions: 0,
    networkUptime: "0%"
  })
  const [loading, setLoading] = useState(true)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [facilitatorBalances, setFacilitatorBalances] = useState<Record<string, string>>({})

  // Wallet generation states
  const [generatedWallet, setGeneratedWallet] = useState<{ address: string; privateKey: string } | null>(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [encryptedKey, setEncryptedKey] = useState("")

  // Created facilitator tracking
  const [createdFacilitatorId, setCreatedFacilitatorId] = useState<string | null>(null)
  const [facilitatorStatus, setFacilitatorStatus] = useState<'needs_funding' | 'active'>('needs_funding')
  const [facilitatorBalance, setFacilitatorBalance] = useState<string>('0')
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  // Payment status tracking for x402 ERC-3009 protocol
  const [txHash, setTxHash] = useState<string>('')
  const [isPaymentPending, setIsPaymentPending] = useState(false)
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState<string>('')

  // Whitelist states
  const [whitelistStatus, setWhitelistStatus] = useState<'loading' | 'none' | 'pending' | 'approved'>('loading')
  const [showWhitelistModal, setShowWhitelistModal] = useState(false)
  const [whitelistName, setWhitelistName] = useState('')
  const [whitelistEmail, setWhitelistEmail] = useState('')
  const [whitelistSubmitting, setWhitelistSubmitting] = useState(false)
  const [whitelistMessage, setWhitelistMessage] = useState('')

  // Pagination for active facilitators list
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || ''
  const isAdmin = address?.toLowerCase() === ADMIN_WALLET.toLowerCase()

  // wagmi hook for signing typed data (ERC-3009)
  const { signTypedDataAsync } = useSignTypedData()

  // Get network-specific minimum balance and currency
  const getNetworkMinimums = (network: string) => {
    const networkConfig = getNetworkConfig(network)

    // Minimum native gas requirements per network (native token units)
    const minimums: Record<string, { amount: number; faucet?: string }> = {
      "avalanche-fuji": { amount: 1.0, faucet: "https://core.app/tools/testnet-faucet/" },
      "ethereum-sepolia": { amount: 0.05, faucet: "https://sepoliafaucet.com/" },
      "base-sepolia": { amount: 0.05, faucet: "https://www.alchemy.com/faucets/base-sepolia" },
      "polygon-amoy": { amount: 0.1, faucet: "https://faucet.polygon.technology/" },
      "arbitrum-sepolia": { amount: 0.05, faucet: "https://sepoliafaucet.com/" }, // Needs ETH on Arbitrum Sepolia
      "monad-testnet": { amount: 0.1, faucet: "https://testnet.monadvision.com" }, // Explorer; faucet may vary
      "optimism-sepolia": { amount: 0.05, faucet: "https://sepolia-optimism.etherscan.io" }, // Explorer; faucet may vary
    }

    const entry = minimums[network] || { amount: 0.1 }
    return {
      amount: entry.amount,
      currency: networkConfig.nativeCurrency.symbol,
      faucet: entry.faucet || "",
    }
  };

  const networkMinimums = getNetworkMinimums(selectedNetwork);

  // Set payment address to connected wallet (always use connected wallet as recipient)
  useEffect(() => {
    if (address && !generatedWallet) {
      setPaymentAddress(address)
    }
  }, [address, generatedWallet])

  // Check whitelist status when wallet connects
  useEffect(() => {
    if (!address) {
      setWhitelistStatus('loading')
      return
    }

    // Admin is always approved
    if (address.toLowerCase() === ADMIN_WALLET.toLowerCase()) {
      setWhitelistStatus('approved')
      return
    }

    const checkWhitelist = async () => {
      try {
        const res = await fetch(`/api/whitelist/check?wallet=${address}`)
        const data = await res.json()
        if (data.success) {
          setWhitelistStatus(data.status as 'none' | 'pending' | 'approved')
        }
      } catch {
        setWhitelistStatus('none')
      }
    }
    checkWhitelist()
  }, [address])

  // Handle whitelist application submit
  const handleWhitelistApply = async () => {
    if (!whitelistName || !whitelistEmail || !address) return

    setWhitelistSubmitting(true)
    setWhitelistMessage('')
    try {
      const res = await fetch('/api/whitelist/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: whitelistName,
          email: whitelistEmail,
          wallet: address,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setWhitelistMessage(data.message)
        setWhitelistStatus(data.status === 'already_approved' ? 'approved' : 'pending')
        if (data.status !== 'already_approved') {
          setTimeout(() => setShowWhitelistModal(false), 2000)
        }
      } else {
        setWhitelistMessage(data.error || 'Failed to submit application')
      }
    } catch {
      setWhitelistMessage('Network error. Please try again.')
    } finally {
      setWhitelistSubmitting(false)
    }
  }

  // Generate a new wallet (for first-time facilitator account)
  const handleGenerateWallet = () => {
    const wallet = ethers.Wallet.createRandom()
    setGeneratedWallet({
      address: wallet.address,
      privateKey: wallet.privateKey
    })
    setReuseExistingAccount(false)
    // Keep paymentAddress as connected wallet (not the generated wallet)
    setDeployStep(2)
  }

  // Reuse existing facilitator account (same underlying wallet across networks)
  const handleUseExistingAccount = () => {
    if (myFacilitators.length === 0) {
      alert('You do not have an existing facilitator account yet. Please create your first facilitator.')
      return
    }

    // Use the most recently used facilitator as the canonical account
    const primary = myFacilitators[0]
    setGeneratedWallet({
      address: primary.facilitatorWallet,
      // We never expose the private key again for existing accounts
      privateKey: '',
    })
    setReuseExistingAccount(true)
    setDeployStep(2)
  }

  // Validate password
  const validatePassword = (pwd: string): boolean => {
    if (pwd.length < 8) return false
    if (!/[A-Z]/.test(pwd)) return false // Has uppercase
    if (!/[a-z]/.test(pwd)) return false // Has lowercase
    if (!/[0-9]/.test(pwd)) return false // Has number
    return true
  }

  // Encrypt private key with password (first-time account) or just validate password (reuse)
  const handleEncryptKey = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    if (!validatePassword(password)) {
      alert('Password must be at least 8 characters with uppercase, lowercase, and number')
      return
    }

    // For existing accounts we only need to confirm the password and move on.
    if (reuseExistingAccount) {
      setDeployStep(3)
      return
    }

    if (!generatedWallet) return

    try {
      // Simple encryption using AES (for demo purposes)
      // In production, use proper key derivation (PBKDF2, scrypt, etc.)
      const encoder = new TextEncoder()
      const data = encoder.encode(generatedWallet.privateKey)
      const passwordKey = encoder.encode(password.padEnd(32, '0').slice(0, 32))

      const key = await crypto.subtle.importKey(
        'raw',
        passwordKey,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      )

      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      )

      // Store IV + encrypted data as base64
      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv, 0)
      combined.set(new Uint8Array(encrypted), iv.length)
      const encryptedB64 = btoa(String.fromCharCode(...combined))

      setEncryptedKey(encryptedB64)
      setDeployStep(3)
    } catch (error) {
      console.error('Encryption failed:', error)
      alert('Failed to encrypt private key')
    }
  }

  // Handle USDC payment for registration using x402 ERC-3009 protocol
  const handlePaymentClick = async () => {
    if (!address || !isConnected) {
      alert('Please connect your wallet first!')
      return
    }

    // Check if wallet is on correct network
    const networkConfig = getNetworkConfig(selectedNetwork)
    if (chain?.id !== networkConfig.chain.id) {
      alert(`Please switch your wallet to ${networkConfig.displayName}`)
      return
    }

    try {
      setIsPaymentPending(true)
      setPaymentError('')

      console.log(`Starting x402 ERC-3009 payment on ${selectedNetwork}...`)

      // Step 1: Create ERC-3009 authorization
      // Payment goes to DEFAULT_FACILITATOR (platform wallet)
      const authorization = createTransferAuthorization(
        address,
        DEFAULT_FACILITATOR as `0x${string}`,
        '1', // 1 USDC
        selectedNetwork // Network parameter for network-specific EIP-712 domain
      )

      console.log('Authorization created:', authorization)

      // Step 2: Get typed data for signing with network-specific domain
      const typedData = getTypedDataForSigning(authorization, selectedNetwork)
      console.log('Typed data prepared for network:', selectedNetwork)

      // Step 3: Request user signature (MetaMask will pop up) - NO GAS PAID
      console.log('Requesting signature from wallet...')
      const signature = await signTypedDataAsync({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.message,
      })

      console.log('Authorization signed (no gas paid by user)')

      // Step 4: Create signed authorization
      const signedAuth = createSignedAuthorization(authorization, signature)

      // Step 5: Create x402 payload
      const x402Payload = createX402ExactPayload(signedAuth)

      // Step 6: Create payment requirements
      const paymentRequirements = createPaymentRequirements('1')

      // Step 7: Submit to default facilitator API with network parameter
      console.log('Submitting payment to x402 default facilitator...')

      const response = await fetch('/api/x402/settle-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentPayload: x402Payload,
          paymentRequirements: paymentRequirements,
          network: selectedNetwork, // Pass network for multichain support
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Default facilitator settlement failed: ${error}`)
      }

      const settlementResult = await response.json()
      console.log('Settlement result:', settlementResult)

      // Extract transaction hash
      const transactionHash = settlementResult.txHash || settlementResult.tx || settlementResult.transaction

      if (!transactionHash) {
        throw new Error('No transaction hash returned from facilitator')
      }

      console.log('Payment settled on-chain by default facilitator:', transactionHash)
      setTxHash(transactionHash)
      setIsPaymentSuccess(true)

      console.log('x402 ERC-3009 payment complete! User only signed, facilitator paid gas.')

    } catch (error) {
      console.error('x402 payment error:', error)
      let errorMsg = 'Payment failed. Please try again.'
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          errorMsg = 'Signature rejected. Please approve the signature in MetaMask.'
        } else {
          errorMsg = error.message
        }
      }
      setPaymentError(errorMsg)
      alert(errorMsg)
    } finally {
      setIsPaymentPending(false)
    }
  }

  // After payment success, proceed to final step
  useEffect(() => {
    if (isPaymentSuccess && txHash && generatedWallet) {
      console.log('Payment successful, proceeding to step 4')
      setDeployStep(4)
    }
  }, [isPaymentSuccess, txHash, generatedWallet])

  // Fetch all facilitators and network stats
  useEffect(() => {
    fetchFacilitators()
  }, [address])

  // Auto-check and activate facilitators that need funding (on page load)
  useEffect(() => {
    if (myFacilitators.length > 0) {
      autoCheckFacilitators()
    }
  }, [myFacilitators.length]) // Only run when count changes to avoid loops

  // Auto-check all facilitators with "needs_funding" status
  const autoCheckFacilitators = async () => {
    const needsFundingFacilitators = myFacilitators.filter(
      (f) => f.status === 'needs_funding'
    )

    if (needsFundingFacilitators.length === 0) {
      return
    }

    console.log(`Auto-checking ${needsFundingFacilitators.length} facilitator(s) for activation...`)

    // Check each facilitator in parallel
    const checkPromises = needsFundingFacilitators.map(async (facilitator) => {
      try {
        const response = await fetch('/api/facilitator/check-and-activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ facilitatorId: facilitator.id }),
        })

        const data = await response.json()

        if (data.success && data.facilitator.status === 'active') {
          const currency = data.facilitator.currency || 'tokens'
          console.log(`Auto-activated facilitator: ${facilitator.name} (${data.facilitator.balance} ${currency})`)
          return true
        }
        return false
      } catch (error) {
        console.error(`Failed to auto-check facilitator ${facilitator.id}:`, error)
        return false
      }
    })

    const results = await Promise.all(checkPromises)
    const activatedCount = results.filter((r) => r).length

    // Refresh the list if any were activated
    if (activatedCount > 0) {
      console.log(`Auto-activated ${activatedCount} facilitator(s)`)
      await fetchFacilitators()
    }
  }

  const fetchFacilitators = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/facilitator/list')
      const data = await response.json()

      if (data.success) {
        const allFacilitators = data.facilitators || []
        setFacilitators(allFacilitators)

        // Filter for user's facilitators if connected
        if (address) {
          const userFacilitators = allFacilitators.filter(
            (f: Facilitator) => f.createdBy?.toLowerCase() === address.toLowerCase()
          )
          setMyFacilitators(userFacilitators)

          // Fetch balances for user's facilitators
          if (userFacilitators.length > 0) {
            fetchFacilitatorBalances(userFacilitators)
          }
        }

        // Calculate network stats
        const activeCount = allFacilitators.filter((f: Facilitator) => f.status === 'active').length
        setNetworkStats({
          activeNodes: activeCount,
          totalStaked: "$0", // Add staking API if available
          feesGenerated: "$0", // Add from payment API
          transactions: 0, // Add transaction count API
          networkUptime: activeCount > 0 ? "99.9%" : "0%"
        })
      }
    } catch (error) {
      console.error('Failed to fetch facilitators:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch real balances for facilitators
  const fetchFacilitatorBalances = async (facilitators: Facilitator[]) => {
    setBalanceLoading(true)
    const balances: Record<string, string> = {}

    try {
      await Promise.all(
        facilitators.map(async (facilitator) => {
          try {
            const network = facilitator.network || 'avalanche-fuji'
            const response = await fetch(`/api/facilitator/balance?address=${facilitator.facilitatorWallet}&network=${network}`)
            const data = await response.json()

            if (data.success) {
              balances[facilitator.id] = parseFloat(data.balance).toFixed(4)
            }
          } catch (error) {
            console.error(`Failed to fetch balance for ${facilitator.id}:`, error)
            balances[facilitator.id] = '0'
          }
        })
      )

      setFacilitatorBalances(balances)
    } catch (error) {
      console.error('Error fetching balances:', error)
    } finally {
      setBalanceLoading(false)
    }
  }

  // Delete facilitator
  const handleDeleteFacilitator = async (facilitatorId: string, facilitatorName: string) => {
    if (!address) {
      alert('Please connect your wallet')
      return
    }

    if (!confirm(`Are you sure you want to delete "${facilitatorName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch('/api/facilitator/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilitatorId,
          userAddress: address,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`Facilitator "${facilitatorName}" deleted successfully`)
        await fetchFacilitators() // Refresh list
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to delete facilitator:', error)
      alert('Failed to delete facilitator')
    }
  }

  // Check balance and activate facilitator
  const handleCheckAndActivate = async () => {
    if (!createdFacilitatorId) {
      alert('No facilitator to check')
      return
    }

    setIsCheckingStatus(true)
    try {
      const response = await fetch('/api/facilitator/check-and-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilitatorId: createdFacilitatorId }),
      })

      const data = await response.json()

      if (data.success) {
        setFacilitatorStatus(data.facilitator.status)
        setFacilitatorBalance(data.facilitator.balance)

        const currency = data.facilitator.currency || networkMinimums.currency

        if (data.facilitator.status === 'active') {
          alert(`Facilitator activated! Balance: ${data.facilitator.balance} ${currency}`)
        } else {
          alert(`Not enough ${currency}. Current: ${data.facilitator.balance} ${currency}, Required: ${data.facilitator.minimumRequired} ${currency}`)
        }

        // Refresh facilitator list
        await fetchFacilitators()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to check and activate:', error)
      alert('Failed to check balance')
    } finally {
      setIsCheckingStatus(false)
    }
  }

  // Handle facilitator creation
  const handleCreateFacilitator = async () => {
    if (!generatedWallet || !facilitatorName || !paymentAddress || !address || !txHash) {
      alert('Missing required information. Please complete all steps.')
      return
    }

    try {
      const networkConfig = getNetworkConfig(selectedNetwork)

      const endpoint = reuseExistingAccount
        ? '/api/facilitator/create-from-existing'
        : '/api/facilitator/create'

      const baseBody: any = {
        name: facilitatorName,
        paymentRecipient: paymentAddress,            // Where fees go (connected wallet)
        createdBy: address,                          // Connected wallet that created it
        registrationTxHash: txHash,                  // USDC payment tx hash
        network: selectedNetwork,                    // Selected network
        chainId: networkConfig.chain.id,             // Chain ID
      }

      const body = reuseExistingAccount
        ? {
            ...baseBody,
            password, // Password used to encrypt the original facilitator key
          }
        : {
            ...baseBody,
            encryptedPrivateKey: encryptedKey,          // User's password-encrypted private key (for backup/export)
            privateKey: generatedWallet.privateKey,     // Plain private key (backend will encrypt with SYSTEM_MASTER_KEY)
            facilitatorWallet: generatedWallet.address, // The generated wallet address (new facilitator account)
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        // Save the created facilitator ID and initial status
        setCreatedFacilitatorId(data.facilitator.id)
        setFacilitatorStatus('needs_funding')
        setFacilitatorBalance('0')
        setDeployStep(5)
        await fetchFacilitators() // Refresh the list
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to create facilitator:', error)
      alert('Failed to create facilitator')
    }
  }

  return (
    <div className="relative py-8 md:py-12 space-y-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* HERO HEADER */}
        <div className="space-y-4 mb-16">
          <div className="flex items-center gap-3 text-[var(--accent)] mb-4">
             <div className="h-px w-12 bg-[var(--accent)]" />
             <span className="text-sm font-mono uppercase tracking-widest text-[var(--accent)] font-bold">Network Dashboard</span>
          </div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-[var(--text-tertiary)]">NETWORK DASHBOARD</p>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-[var(--text-primary)] uppercase tracking-tight">
            Facilitator Network
          </h1>
          <p className="text-xl font-body text-[var(--text-secondary)] max-w-none font-light leading-relaxed">
            The backbone of the autonomous economy. Run a node, earn fees, and secure agent transactions.
          </p>
        </div>

        <div className="mb-16" />



        {/* WALLET CONNECTION PROMPT */}
        {!isConnected && (
          <>
            <div className="mb-8 p-6 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-muted)] flex items-center justify-between">
              <div>
                <h3 className="text-[var(--text-primary)] font-mono font-bold mb-1">Connect Your Wallet</h3>
                <p className="text-[var(--text-secondary)] text-sm font-body">Connect to view and manage your facilitators</p>
              </div>
              <ConnectButton.Custom>
                {({ openConnectModal, mounted }) => (
                  <button
                    onClick={openConnectModal}
                    disabled={!mounted}
                    className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-mono text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-[var(--bg-void)] transition-all duration-300"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          </>
        )}

        {/* Facilitator Joining Flow Diagram */}
        <div className="mb-12">
          <AnimatedArchitectureFlow
            steps={ONBOARDING_FLOW.steps}
            edges={ONBOARDING_FLOW.edges}
            direction="horizontal"
          />
        </div>





        {/* 1. NETWORK STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-24">
          <StatCard label="Active Nodes" value={loading ? "..." : networkStats.activeNodes.toString()} icon={Server} color="text-[var(--text-primary)]" />
          <StatCard label="Total Staked" value={networkStats.totalStaked} icon={Wallet} color="text-[var(--text-primary)]" />
          <StatCard label="Fees Generated" value={networkStats.feesGenerated} icon={Activity} color="text-[var(--text-primary)]" />
          <StatCard label="Transactions" value={networkStats.transactions.toString()} icon={ArrowRight} color="text-[var(--text-primary)]" />
          <StatCard label="Network Uptime" value={networkStats.networkUptime} icon={Clock} color="text-[var(--text-primary)]" />
        </div>





        {/* 2. MY FACILITATORS DASHBOARD */}
        {isConnected && (
          <>
          <div className="mb-24 space-y-6">
             <SectionHeading
                title="Deploy Facilitator"
                description="Choose your deployment method"
                icon={Server}
                iconColor="text-[var(--accent)]"
             />

             {/* CREATE OPTIONS */}


             <div className="grid md:grid-cols-2 gap-6 mb-12">
               {/* CLI CARD */}
               <div
                 className="relative group p-6 rounded-xl border border-[var(--bg-border)] glass-subtle backdrop-blur-md transition-all text-left opacity-60 cursor-not-allowed"
               >
                 <div className="absolute top-4 right-4 p-2 rounded-lg bg-[var(--glass-subtle-bg)] text-[var(--text-primary)] transition-colors">
                   <Terminal size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-[var(--text-primary)] font-mono uppercase tracking-tight mb-2">CLI Node</h3>
                 <div className="flex items-center gap-2 mb-2">
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-bg)]">
                     Under Development
                   </span>
                 </div>
                 <p className="text-[var(--text-tertiary)] text-sm font-body font-light max-w-[80%]">
                   Run a self-hosted node via command line. For advanced users.
                 </p>
               </div>

               {/* CLOUD CARD -- conditional based on whitelist status */}
               {whitelistStatus === 'approved' || myFacilitators.length > 0 ? (
                 /* WHITELISTED OR ALREADY HAS FACILITATOR -- show Cloud Node */
                 <button
                   onClick={() => {
                     if (myFacilitators.length > 0) {
                       alert('You already have a facilitator registered. Each wallet can only create one facilitator.')
                       return
                     }
                     setShowDeployModal(true)
                   }}
                   className={`relative group p-6 rounded-xl border backdrop-blur-md transition-all text-left shadow-lg ${
                     myFacilitators.length > 0
                       ? 'border-[var(--bg-border)] glass-subtle opacity-60 cursor-not-allowed'
                       : 'border-[var(--accent-muted)] bg-gradient-to-br from-[var(--accent-subtle)] via-[var(--glass-subtle-bg)] to-[var(--glass-subtle-bg)] hover:border-[var(--accent)] hover:from-[var(--accent-subtle)] hover:to-[var(--glass-subtle-bg)] shadow-[var(--accent-muted)] hover:shadow-[var(--accent-muted)]'
                   }`}
                 >
                   <div className="absolute top-4 right-4 flex gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--success-bg)] border border-[var(--success-border)] text-[10px] font-bold text-[var(--success)] uppercase tracking-wider animate-pulse">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                          LIVE
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] group-hover:bg-[var(--accent-muted)] transition-colors">
                          <Cloud size={24} />
                      </div>
                   </div>
                   <h3 className="text-xl font-bold text-[var(--text-primary)] font-mono uppercase tracking-tight mb-2">Cloud Node</h3>
                   <div className="flex items-center gap-2 mb-3">
                     {myFacilitators.length > 0 ? (
                       <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-bg)]">
                         Already Registered (1 per wallet)
                       </span>
                     ) : (
                       <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-muted)]">
                         Recommended
                       </span>
                     )}
                   </div>
                   <p className="text-[var(--text-secondary)] text-sm font-body font-light max-w-[85%]">
                     Deploy a managed facilitator node instantly. No setup required. Start earning rewards immediately.
                 </p>
                 </button>
               ) : whitelistStatus === 'pending' ? (
                 /* PENDING -- show waiting card */
                 <div className="relative p-6 rounded-xl border border-[var(--warning)]/30 bg-gradient-to-br from-[var(--warning-bg)] via-orange-500/5 to-[var(--warning-bg)] backdrop-blur-md text-left">
                   <div className="absolute top-4 right-4 flex gap-2">
                     <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--warning-bg)] border border-[var(--warning)]/30 text-[10px] font-bold text-[var(--warning)] uppercase tracking-wider animate-pulse">
                       <div className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                       PENDING
                     </div>
                   </div>
                   <h3 className="text-xl font-bold text-[var(--text-primary)] font-mono uppercase tracking-tight mb-2">Application Under Review</h3>
                   <div className="flex items-center gap-2 mb-3">
                     <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-bg)]">
                       Awaiting Approval
                     </span>
                   </div>
                   <p className="text-[var(--text-secondary)] text-sm font-body font-light max-w-[85%]">
                     Your whitelist application is being reviewed. You&apos;ll receive an email once approved.
                   </p>
                 </div>
               ) : (
                 /* NOT WHITELISTED -- show Apply button */
                 <button
                   onClick={() => setShowWhitelistModal(true)}
                   className="relative group p-6 rounded-xl border border-[var(--accent-muted)] bg-gradient-to-br from-[var(--accent-subtle)] via-[var(--glass-subtle-bg)] to-[var(--glass-subtle-bg)] hover:border-[var(--accent)] hover:from-[var(--accent-subtle)] hover:to-[var(--glass-subtle-bg)] backdrop-blur-md transition-all text-left shadow-lg shadow-[var(--accent-muted)] hover:shadow-[var(--accent-muted)]"
                 >
                   <div className="absolute top-4 right-4 flex gap-2">
                     <div className="p-2 rounded-lg bg-[var(--accent-subtle)] text-[var(--text-secondary)] group-hover:bg-[var(--accent-muted)] transition-colors">
                       <Cloud size={24} />
                     </div>
                   </div>
                   <h3 className="text-xl font-bold text-[var(--text-primary)] font-mono uppercase tracking-tight mb-2">Apply for Whitelist</h3>
                   <div className="flex items-center gap-2 mb-3">
                     <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-[var(--accent-subtle)] text-[var(--text-secondary)] border border-[var(--accent-muted)]">
                       Required to Deploy
                     </span>
                   </div>
                   <p className="text-[var(--text-secondary)] text-sm font-body font-light max-w-[85%]">
                     Apply to become a facilitator. Submit your details and get whitelisted to deploy a cloud node.
                   </p>
                 </button>
               )}
             </div>

             {/* MY FACILITATORS SECTION */}
             <div className="space-y-6">
                <SectionHeading
                    title="My Facilitators"
                    description="Manage your facilitator instances"
                    icon={ShieldCheck}
                    iconColor="text-[var(--accent)]"
                />

             {loading ? (
               <div className="text-center py-12 text-[var(--text-tertiary)]">Loading...</div>
             ) : myFacilitators.length > 0 ? (
               <>
                 {/* Aggregate Stats Dashboard */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-muted)]">
                   <div className="text-center">
                     <div className="text-3xl font-bold text-[var(--text-primary)] font-display mb-1">
                       {myFacilitators.length}
                     </div>
                     <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-mono">Total Facilitators</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-[var(--success)] font-display mb-1">
                       {myFacilitators.filter(f => f.status === 'active').length}
                     </div>
                     <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-mono">Active</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-[var(--accent)] font-display mb-1">
                       {myFacilitators.reduce((sum, f) => sum + (f.totalPayments || 0), 0)}
                     </div>
                     <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-mono">Total Payments</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-[var(--text-secondary)] font-display mb-1">
                       {myFacilitators.length > 0
                         ? (myFacilitators.reduce((sum, f) => sum + (f.reputation || 0), 0) / myFacilitators.length).toFixed(1)
                         : '0'}
                     </div>
                     <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-mono">Avg Reputation</div>
                   </div>
                 </div>

                 {/* Individual Facilitators */}
                 <div className="grid md:grid-cols-2 gap-6">
                  {myFacilitators.map((facilitator) => (
                    <div key={facilitator.id} className="p-6 rounded-xl border border-[var(--bg-border)] glass-subtle hover:bg-[var(--bg-raised)] transition-colors group relative">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-muted)] flex items-center justify-center">
                                <Cloud className="text-[var(--accent)]" size={20} />
                             </div>
                             <div>
                                <div className="text-[var(--text-primary)] font-bold font-mono">{facilitator.name}</div>
                                <div className="text-xs text-[var(--text-tertiary)] font-mono">ID: {facilitator.id.slice(0, 8)}...</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             {/* Delete Button */}
                             <button
                               onClick={() => handleDeleteFacilitator(facilitator.id, facilitator.name)}
                               className="p-1.5 rounded-lg bg-[var(--error-bg)] border border-[var(--error-bg)] text-[var(--error)] hover:bg-[var(--error)]/20 transition-colors opacity-0 group-hover:opacity-100"
                               title="Delete facilitator"
                             >
                               <Trash2 size={14} />
                             </button>
                             {/* Status Badge */}
                             <div className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wide flex items-center gap-1.5 ${
                               facilitator.status === 'active'
                                 ? 'bg-[var(--success-bg)] border border-[var(--success-border)] text-[var(--success)]'
                                 : 'bg-[var(--accent-subtle)] border border-[var(--accent-muted)] text-[var(--accent)]'
                             }`}>
                                <div className={`w-1 h-1 rounded-full ${facilitator.status === 'active' ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--warning)]'}`} />
                                {facilitator.status}
                             </div>
                          </div>
                       </div>
                       <div className="grid grid-cols-3 gap-4 text-xs font-mono text-[var(--text-secondary)]">
                          <div>
                             <div className="text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Balance</div>
                             <div className="text-[var(--text-primary)]">
                               {balanceLoading ? 'Loading...' : (facilitatorBalances[facilitator.id] || '0')} {getNetworkMinimums(facilitator.network || 'avalanche-fuji').currency}
                             </div>
                          </div>
                          <div className="text-center">
                             <div className="text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Payments</div>
                             <div className="text-[var(--accent)]">{facilitator.totalPayments || 0}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Reputation</div>
                             <div className="text-[var(--success)]">{facilitator.reputation || 0}/5</div>
                          </div>
                       </div>
                    </div>
                  ))}
                 </div>
               </>
             ) : (
                <div className="p-12 rounded-xl border border-[var(--bg-border)] glass-subtle text-center space-y-6">
                  <div className="space-y-2">
                    <p className="text-[var(--text-secondary)] font-body">You don't have any facilitators yet.</p>
                    <p className="text-sm text-[var(--text-tertiary)] font-body">
                      {whitelistStatus === 'approved' ? 'Launch a cloud node to start earning rewards.' : 'Apply for whitelist to deploy a cloud node.'}
                    </p>
                  </div>
                  {whitelistStatus === 'approved' ? (
                    <button
                      onClick={() => setShowDeployModal(true)}
                      className="group flex items-center gap-2 mx-auto px-8 py-3 bg-[var(--accent)] text-[var(--text-primary)] rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-[var(--accent-hover)] transition-all shadow-[0_0_20px_var(--accent-muted)] hover:shadow-[0_0_30px_var(--accent-muted)]"
                    >
                      <Cloud size={18} className="text-[var(--text-primary)] group-hover:scale-110 transition-transform" />
                      <span>Deploy Now</span>
                    </button>
                  ) : whitelistStatus === 'pending' ? (
                    <div className="px-6 py-3 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-muted)] text-[var(--accent)] font-mono text-sm animate-pulse">
                      Your whitelist application is under review
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowWhitelistModal(true)}
                      className="group flex items-center gap-2 mx-auto px-10 py-4 bg-[var(--accent)] text-[var(--text-primary)] rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-[var(--accent-hover)] transition-all shadow-[0_0_20px_var(--accent-muted)] hover:shadow-[0_0_40px_var(--accent-muted)]"
                    >
                      <span>Apply for Whitelist</span>
                    </button>
                  )}
                </div>
              )}
           </div>
           </div>
          </>
        )}


        {/* 4. ACTIVE FACILITATORS LIST */}
        <div className="space-y-8">
           <SectionHeading
                title="Active Facilitators"
                description="Real-time network node status"
                icon={Activity}
                iconColor="text-[var(--accent)]"
                rightElement={
                  <Link href="/explorer" className="text-sm font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2">
                     View Full Explorer <ArrowRight size={14} />
                  </Link>
                }
           />

           {/* Table Header */}
           <div className="grid grid-cols-12 gap-4 px-4 py-3 glass-subtle rounded-t-lg border border-[var(--bg-border)] font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
              <div className="col-span-4 md:col-span-3">Node Name</div>
              <div className="col-span-4 md:col-span-3">ID</div>
              <div className="col-span-2 hidden md:block text-right">Payments</div>
              <div className="col-span-2 hidden md:block text-right">Balance</div>
              <div className="col-span-4 md:col-span-2 text-right">Status</div>
           </div>

           {/* Table Rows (Real Data - Only Active, Paginated) */}
           {(() => {
             const activeFacilitators = facilitators.filter(f => f.status === 'active')
             const totalPages = Math.max(1, Math.ceil(activeFacilitators.length / ITEMS_PER_PAGE))
             const safePage = Math.min(currentPage, totalPages)
             const startIdx = (safePage - 1) * ITEMS_PER_PAGE
             const pageItems = activeFacilitators.slice(startIdx, startIdx + ITEMS_PER_PAGE)

             return (
               <>
                 <div className="space-y-2">
                   {loading ? (
                     <div className="text-center py-12 text-[var(--text-tertiary)]">Loading facilitators...</div>
                   ) : pageItems.length > 0 ? (
                     pageItems.map((node) => (
                       <div key={node.id} className="grid grid-cols-12 gap-4 px-4 py-4 rounded-lg border border-[var(--bg-border)] hover:border-[var(--bg-border)] hover:bg-[var(--glass-subtle-bg)] transition-colors items-center">
                          <div className="col-span-4 md:col-span-3 font-medium text-[var(--text-primary)] font-body">{node.name}</div>
                          <div className="col-span-4 md:col-span-3 font-mono text-xs text-[var(--text-tertiary)] truncate">{node.id}</div>
                          <div className="col-span-2 hidden md:block text-right text-sm text-[var(--text-secondary)] font-mono">{node.totalPayments || 0}</div>
                          <div className="col-span-2 hidden md:block text-right text-sm text-[var(--text-secondary)] font-mono">N/A</div>
                          <div className="col-span-4 md:col-span-2 flex justify-end">
                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide ${
                               node.status === 'active'
                                 ? 'bg-[var(--success-bg)] border border-[var(--success-border)] text-[var(--success)]'
                                 : 'bg-[var(--accent-subtle)] border border-[var(--accent-muted)] text-[var(--accent)]'
                             }`}>
                               <span className={`w-1.5 h-1.5 rounded-full ${node.status === 'active' ? 'bg-[var(--success)]' : 'bg-[var(--text-tertiary)]'}`} />
                               {node.status}
                             </span>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-12 text-[var(--text-tertiary)] font-body">No facilitators found. Be the first to create one!</div>
                   )}
                 </div>

                 {/* Pagination */}
                 {!loading && activeFacilitators.length > ITEMS_PER_PAGE && (
                   <div className="flex items-center justify-between pt-4">
                     <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
                       {startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, activeFacilitators.length)} of {activeFacilitators.length}
                     </span>
                     <div className="flex items-center gap-1">
                       <button
                         onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                         disabled={safePage <= 1}
                         className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                       >
                         <ChevronLeft size={14} />
                       </button>
                       {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                         <button
                           key={page}
                           onClick={() => setCurrentPage(page)}
                           className={`w-7 h-7 rounded-lg font-mono text-[11px] font-bold transition-colors ${
                             page === safePage
                               ? 'bg-white/10 border border-white/20 text-white'
                               : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                           }`}
                         >
                           {page}
                         </button>
                       ))}
                       <button
                         onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                         disabled={safePage >= totalPages}
                         className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                       >
                         <ChevronRight size={14} />
                       </button>
                     </div>
                   </div>
                 )}
               </>
             )
           })()}
        </div>

      </div>

      {/* DEPLOY MODAL */}
      {/* ADMIN BUTTON -- only visible for admin wallet */}
      {isConnected && isAdmin && (
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--error-bg)] border border-[var(--error-bg)] text-[var(--error)] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[var(--error)]/20 transition-colors"
          >
            <ShieldCheck size={14} />
            Admin Panel -- Whitelist Manager
          </Link>
        </div>
      )}

      {/* WHITELIST APPLICATION MODAL */}
      {showWhitelistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-void)]/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[var(--bg-void)] border border-[var(--bg-border)] rounded-2xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
            <div className="p-8 space-y-6">
              <button
                onClick={() => { setShowWhitelistModal(false); setWhitelistMessage('') }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] uppercase tracking-tight">
                  Apply for Whitelist
                </h2>
                <p className="text-[var(--text-secondary)] text-sm font-body font-light">
                  Get approved to deploy a facilitator node on Facinet
                </p>
              </div>

              {whitelistMessage ? (
                <div className={`p-6 rounded-xl border text-center space-y-2 ${
                  whitelistStatus === 'pending' || whitelistStatus === 'approved'
                    ? 'border-[var(--success-border)] bg-[var(--success-bg)]'
                    : 'border-[var(--error-bg)] bg-[var(--error-bg)]'
                }`}>
                  <div className={`text-lg font-bold font-mono ${
                    whitelistStatus === 'pending' || whitelistStatus === 'approved' ? 'text-[var(--success)]' : 'text-[var(--error)]'
                  }`}>
                    {whitelistStatus === 'pending' || whitelistStatus === 'approved' ? '>' : 'x'}
                  </div>
                  <p className={`text-sm font-mono ${
                    whitelistStatus === 'pending' || whitelistStatus === 'approved' ? 'text-[var(--success)]' : 'text-[var(--error)]'
                  }`}>
                    {whitelistMessage}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">Your Name</label>
                    <input
                      type="text"
                      value={whitelistName}
                      onChange={(e) => setWhitelistName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent)]/50 transition-colors placeholder:text-[var(--text-tertiary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">Email Address</label>
                    <input
                      type="email"
                      value={whitelistEmail}
                      onChange={(e) => setWhitelistEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent)]/50 transition-colors placeholder:text-[var(--text-tertiary)]"
                    />
                    <p className="text-[10px] text-[var(--text-tertiary)] font-mono">We&apos;ll notify you when your application is approved</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">Wallet Address</label>
                    <div className="w-full bg-[var(--glass-subtle-bg)] border border-[var(--accent)]/20 rounded-lg px-4 py-3 text-[var(--accent)] font-mono text-sm break-all">
                      {address || '0x...'}
                    </div>
                    <p className="text-[10px] text-[var(--text-tertiary)] font-mono">Auto-filled from your connected wallet</p>
                  </div>

                  <button
                    onClick={handleWhitelistApply}
                    disabled={!whitelistName || !whitelistEmail || whitelistSubmitting}
                    className="w-full bg-[var(--text-primary)] text-[var(--bg-void)] py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {whitelistSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-void)]/80 backdrop-blur-md overflow-y-auto">
           <div className="relative w-full max-w-2xl bg-[var(--bg-void)] border border-[var(--bg-border)] rounded-2xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
              <div className="max-h-[85vh] overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <button
                  onClick={() => { setShowDeployModal(false); setDeployStep(1); }}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors z-10"
                >
                   <X size={20} />
                </button>

                <div className="text-center space-y-2">
                   <h2 className="text-3xl font-bold font-display text-[var(--text-primary)] uppercase tracking-tight">Create Your Facilitator</h2>
                   <p className="text-[var(--text-secondary)] font-body font-light">Launch your cloud node in minutes.</p>
                </div>

              {/* STEP 1: NAME & GUIDE */}
              {deployStep === 1 && (
                <>
                  <div className="p-6 rounded-xl border border-[var(--bg-border)] glass-subtle space-y-4">
                     <h3 className="font-bold text-[var(--text-primary)] font-mono uppercase tracking-tight">How it works:</h3>
                     <ul className="space-y-2 text-sm text-[var(--text-secondary)] font-mono">
                        {[
                          "1. Choose a name for your facilitator",
                          "2. Generate a new facilitator wallet",
                          "3. Set a password to encrypt your private key",
                          "4. Pay 1 USDC registration fee (gasless via x402)",
                          "5. Fund your facilitator with at least 1 AVAX for gas",
                          "6. Your facilitator goes live and starts earning fees!",
                        ].map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                     </ul>
                  </div>

                  <div className="space-y-6">
                     {/* COMMENTED: Network selector UI removed -- hardcoded to avalanche-fuji */}
                     {/* <NetworkSelector
                       selectedNetwork={selectedNetwork}
                       onNetworkChange={setSelectedNetwork}
                     /> */}

                     {/* Network info display (locked to Avalanche Fuji) */}
                     <div className="p-4 rounded-xl border border-[var(--bg-border)] glass-subtle">
                       <p className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Network</p>
                       <p className="text-sm text-[var(--text-primary)] font-mono">Avalanche Fuji (Chain ID: 43113)</p>
                     </div>

                     {/* Network Mismatch Warning */}
                     {chain && chain.id !== getNetworkConfig(selectedNetwork).chain.id && (
                       <div className="p-4 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-muted)]">
                         <p className="text-sm text-[var(--text-secondary)] font-mono">
                           Please switch your wallet to {NETWORK_CONFIGS[selectedNetwork].displayName}
                         </p>
                       </div>
                     )}

                     <div className="space-y-2">
                        <label className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">Facilitator Name</label>
                        <input
                           type="text"
                           value={facilitatorName}
                           onChange={(e) => setFacilitatorName(e.target.value)}
                           placeholder="My Facilitator"
                           className="w-full bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent)]/50 transition-colors placeholder:text-[var(--text-tertiary)]"
                        />
                        <p className="text-[10px] text-[var(--text-tertiary)] font-mono">Min 3 characters, max 50</p>
                     </div>

                    {myFacilitators.length > 0 && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={handleGenerateWallet}
                          className={`flex-1 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border ${
                            !reuseExistingAccount
                              ? 'bg-[var(--text-primary)] text-[var(--bg-void)] border-[var(--text-primary)]'
                              : 'bg-transparent text-[var(--text-primary)] border-[var(--bg-border)] hover:border-[var(--text-secondary)]'
                          }`}
                        >
                          New Facilitator Account
                        </button>
                        <button
                          type="button"
                          onClick={handleUseExistingAccount}
                          className={`flex-1 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border ${
                            reuseExistingAccount
                              ? 'bg-[var(--text-primary)] text-[var(--bg-void)] border-[var(--text-primary)]'
                              : 'bg-transparent text-[var(--text-primary)] border-[var(--bg-border)] hover:border-[var(--text-secondary)]'
                          }`}
                        >
                          Use Existing Account
                        </button>
                      </div>
                    )}

                    {!myFacilitators.length && (
                      <button
                        disabled={!facilitatorName || facilitatorName.length < 3 || (chain && chain.id !== getNetworkConfig(selectedNetwork).chain.id)}
                        onClick={handleGenerateWallet}
                        className="w-full bg-[var(--text-primary)] text-[var(--bg-void)] py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Generate Wallet
                      </button>
                    )}
                    {myFacilitators.length > 0 && (
                      <button
                        disabled={
                          !facilitatorName ||
                          facilitatorName.length < 3 ||
                          (chain && chain.id !== getNetworkConfig(selectedNetwork).chain.id)
                        }
                        onClick={reuseExistingAccount ? handleUseExistingAccount : handleGenerateWallet}
                        className="w-full bg-[var(--text-primary)] text-[var(--bg-void)] py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Continue
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* STEP 2: KEYS & PASSWORD */}
              {deployStep === 2 && (
                <div className="space-y-6">
                   {/* Info Box */}
                   <div className="p-6 rounded-xl border border-[var(--bg-border)] glass-subtle space-y-4">
                      <div className="space-y-1">
                         <div className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">Facilitator Name</div>
                         <div className="text-xl font-bold text-[var(--text-primary)] font-display">{facilitatorName}</div>
                      </div>

                      <div className="space-y-1">
                         <div className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">Wallet Address</div>
                         <div className="bg-[var(--glass-bg)] p-3 rounded-lg border border-[var(--bg-border)] font-mono text-xs text-[var(--text-primary)] break-all">
                            {generatedWallet?.address || 'Generating...'}
                         </div>
                      </div>

                      {!reuseExistingAccount && (
                        <div className="p-4 rounded-lg bg-[var(--error-bg)] border border-[var(--error-bg)] space-y-3">
                           <div className="flex items-center gap-2 text-[var(--error)] font-bold text-sm uppercase tracking-wide">
                              <ShieldCheck size={16} /> Save Your Private Key!
                           </div>
                           <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              You'll need it to import to MetaMask and fund with {networkMinimums.currency}. We do not store this.
                           </p>
                           {showPrivateKey && generatedWallet && (
                             <div className="bg-[var(--bg-void)]/70 p-3 rounded-lg border border-[var(--error)]/30 font-mono text-xs text-[var(--error)] break-all select-all">
                               {generatedWallet.privateKey}
                             </div>
                           )}
                           <button
                             onClick={() => setShowPrivateKey(!showPrivateKey)}
                             className="px-4 py-2 bg-[var(--error-bg)] hover:bg-[var(--error)]/20 text-[var(--error)] rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                           >
                              {showPrivateKey ? 'Hide Private Key' : 'Show Private Key'}
                           </button>
                        </div>
                      )}

                      {reuseExistingAccount && (
                        <div className="p-4 rounded-lg bg-[var(--success-bg)] border border-[var(--success-border)] space-y-2">
                          <div className="flex items-center gap-2 text-[var(--success)] font-bold text-sm uppercase tracking-wide">
                            <ShieldCheck size={16} /> Using Existing Facilitator Account
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            This facilitator will reuse your existing secured wallet across all supported networks. We will verify your password but never re-expose your private key.
                          </p>
                        </div>
                      )}
                   </div>

                   {/* Password Form */}
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <h3 className="font-bold text-[var(--text-primary)] font-mono uppercase tracking-tight">Encrypt with Password</h3>
                         <div className="grid gap-3">
                            <input
                               type="password"
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               placeholder="Password (8+ chars, uppercase, lowercase, number)"
                               className="w-full bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent)]/50 transition-colors placeholder:text-[var(--text-tertiary)]"
                            />
                            <input
                               type="password"
                               value={confirmPassword}
                               onChange={(e) => setConfirmPassword(e.target.value)}
                               placeholder="Confirm password"
                               className="w-full bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent)]/50 transition-colors placeholder:text-[var(--text-tertiary)]"
                            />
                         </div>
                         {password && !validatePassword(password) && (
                           <p className="text-xs text-[var(--error)] font-mono">Password must have 8+ chars, uppercase, lowercase, and number</p>
                         )}
                         {password && confirmPassword && password !== confirmPassword && (
                           <p className="text-xs text-[var(--error)] font-mono">Passwords do not match</p>
                         )}
                      </div>

                      <button
                         onClick={handleEncryptKey}
                         disabled={!password || !confirmPassword || password !== confirmPassword || !validatePassword(password)}
                         className="w-full bg-[var(--text-primary)] text-[var(--bg-void)] py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                         Encrypt & Continue
                      </button>
                   </div>
                </div>
              )}

              {/* STEP 3: REGISTRATION FEE */}
              {deployStep === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
                   <div className="text-center space-y-4">
                      <div className="inline-block px-3 py-1 rounded-full bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-primary)]">
                         x402 Protocol (ERC-3009)
                      </div>
                      <h3 className="text-2xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight">Facilitator Registration Fee</h3>
                      <p className="text-[var(--text-secondary)] font-body font-light">Register your facilitator on x402:</p>
                   </div>

                   <div className="p-8 rounded-2xl glass-subtle border border-[var(--bg-border)] text-center space-y-2">
                      <div className="text-5xl font-bold text-[var(--text-primary)] font-display tracking-tighter">1 USDC</div>
                      <div className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">
                        on {NETWORK_CONFIGS[selectedNetwork].displayName}
                      </div>
                   </div>

                   {/* Network Mismatch Warning */}
                   {chain && chain.id !== getNetworkConfig(selectedNetwork).chain.id && (
                     <div className="p-4 rounded-xl bg-[var(--warning-bg)] border border-[var(--warning-bg)]">
                       <p className="text-sm text-[var(--warning)] font-mono">
                         Please switch your wallet to {NETWORK_CONFIGS[selectedNetwork].displayName}
                       </p>
                     </div>
                   )}

                   <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--bg-border)] font-mono text-sm">
                         <span className="text-[var(--text-secondary)]">Your USDC Balance:</span>
                         <span className="text-[var(--text-primary)] font-bold">1.00 USDC</span>
                      </div>

                      <button
                         onClick={handlePaymentClick}
                         disabled={!isConnected || isPaymentPending || chain?.id !== getNetworkConfig(selectedNetwork).chain.id}
                         className="w-full bg-[var(--text-primary)] text-[var(--bg-void)] py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                         {isPaymentPending ? 'Processing Payment...' : 'Pay 1 USDC via x402'}
                      </button>

                      {paymentError && (
                        <div className="p-4 rounded-xl bg-[var(--error-bg)] border border-[var(--error-bg)]">
                          <p className="text-sm text-[var(--error)] font-mono">{paymentError}</p>
                        </div>
                      )}

                      <p className="text-center text-[10px] text-[var(--text-tertiary)] font-mono uppercase tracking-widest">
                         Using x402 default facilitator on {selectedNetwork}
                      </p>
                   </div>
                </div>
              )}

              {/* STEP 4: CLAIM WALLET (PAYOUT ADDRESS) */}
              {deployStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                   <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight">Set Payout Address</h3>
                      <p className="text-[var(--text-secondary)] font-body font-light">Where should your facilitator fees be sent?</p>
                   </div>

                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">Facilitator Wallet Address</label>
                         <div className="w-full bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] rounded-lg px-4 py-3 text-[var(--text-secondary)] font-mono text-sm break-all">
                            {generatedWallet?.address || 'N/A'}
                         </div>
                         <p className="text-[10px] text-[var(--text-tertiary)] font-mono">This wallet processes payments and pays gas fees.</p>
                      </div>

                      <div className="space-y-2">
                         <label className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">Fee Recipient Address (Your Connected Wallet)</label>
                         <div className="w-full bg-[var(--accent-muted)] border border-[var(--accent)]/20 rounded-lg px-4 py-3 text-[var(--accent)] font-mono text-sm break-all">
                            {paymentAddress || address || '0x...'}
                         </div>
                         <p className="text-[10px] text-[var(--text-tertiary)] font-mono">All earned fees will be sent to your connected wallet automatically.</p>
                      </div>

                      <button
                         onClick={handleCreateFacilitator}
                         disabled={!paymentAddress || !generatedWallet}
                         className="w-full bg-[var(--text-primary)] text-[var(--bg-void)] py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                         Confirm & Launch
                      </button>
                   </div>
                </div>
              )}

              {/* STEP 5: FUNDING & ACTIVATION */}
              {deployStep === 5 && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                   {/* Success Banner */}
                   <div className="bg-[var(--success-bg)] border border-[var(--success-border)] p-6 rounded-xl text-center space-y-1">
                      <div className="text-[var(--success)] font-bold text-xl font-display uppercase tracking-tight">Facilitator Created Successfully!</div>
                      <div className="text-[var(--text-secondary)] font-mono text-sm">{facilitatorName}</div>
                   </div>

                   {/* Status Display */}
                   <div className="p-6 rounded-xl border border-[var(--bg-border)] glass-subtle space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <div className="text-[10px] text-[var(--text-tertiary)] font-mono uppercase tracking-widest">Current Status</div>
                            {facilitatorStatus === 'active' ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--success-bg)] text-[var(--success)] text-xs font-bold font-mono uppercase">
                                 <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                                 Active
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--warning-bg)] text-[var(--warning)] text-xs font-bold font-mono uppercase">
                                 <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                                 Needs Funding
                              </div>
                            )}
                         </div>
                         <div className="space-y-1">
                            <div className="text-[10px] text-[var(--text-tertiary)] font-mono uppercase tracking-widest">{networkMinimums.currency} Balance</div>
                            <div className="text-lg text-[var(--text-primary)] font-display font-bold">{facilitatorBalance} {networkMinimums.currency}</div>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <div className="text-[10px] text-[var(--text-tertiary)] font-mono uppercase tracking-widest">Facilitator Wallet Address</div>
                         <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[var(--glass-bg)] border border-[var(--bg-border)] rounded px-3 py-2 text-[var(--text-primary)] font-mono text-xs break-all">
                               {generatedWallet?.address || 'N/A'}
                            </div>
                            <button
                               onClick={() => {
                                 navigator.clipboard.writeText(generatedWallet?.address || '')
                                 alert('Address copied to clipboard!')
                               }}
                               className="px-3 py-2 bg-[var(--glass-subtle-bg)] hover:bg-[var(--bg-raised)] border border-[var(--bg-border)] rounded text-[var(--text-primary)] text-xs font-mono transition-colors"
                            >
                               Copy
                            </button>
                         </div>
                      </div>
                   </div>

                   {/* Funding Instructions */}
                   {facilitatorStatus === 'needs_funding' ? (
                     <div className="p-6 rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-bg)] space-y-3">
                        <div className="flex items-center gap-2 text-[var(--warning)] font-bold text-sm uppercase tracking-wide">
                           <AlertCircle size={16} /> Action Required: Fund Your Facilitator
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                           Your facilitator needs <strong>at least {networkMinimums.amount} {networkMinimums.currency}</strong> to pay for gas fees when processing payments.
                        </p>
                        <div className="space-y-2">
                           <div className="text-[10px] text-[var(--text-tertiary)] font-mono uppercase tracking-widest">Steps:</div>
                           <ol className="text-xs text-[var(--text-secondary)] space-y-1 list-decimal list-inside">
                              <li>Copy the facilitator wallet address above</li>
                              <li>Send at least {networkMinimums.amount} {networkMinimums.currency} to this address from your wallet or <a href={networkMinimums.faucet} target="_blank" className="text-[var(--warning)] underline">get testnet {networkMinimums.currency} from faucet</a></li>
                              <li>Click "Check Balance & Activate" below</li>
                              <li>Once activated, return to the hub to see your active facilitator</li>
                           </ol>
                        </div>
                     </div>
                   ) : (
                     <div className="p-6 rounded-xl border border-[var(--success-border)] bg-[var(--success-bg)] space-y-2">
                        <div className="flex items-center gap-2 text-[var(--success)] font-bold text-sm uppercase tracking-wide">
                           <Activity size={16} /> Facilitator Activated!
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                           Your facilitator is <strong>ACTIVE</strong> and ready to process payments. It will automatically handle gas fees for transactions.
                        </p>
                     </div>
                   )}

                   {/* Action Buttons */}
                   <div className="flex gap-4">
                      <button
                         onClick={() => {
                           setShowDeployModal(false)
                           setDeployStep(1)
                           setCreatedFacilitatorId(null)
                           setFacilitatorStatus('needs_funding')
                           setFacilitatorBalance('0')
                         }}
                         className="flex-1 py-3 border border-[var(--bg-border)] hover:bg-[var(--glass-subtle-bg)] text-[var(--text-primary)] rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                      >
                         Back to Hub
                      </button>
                      <button
                         onClick={handleCheckAndActivate}
                         disabled={isCheckingStatus || facilitatorStatus === 'active'}
                         className="flex-1 py-3 bg-[var(--accent)] hover:opacity-90 text-[var(--text-primary)] rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         {isCheckingStatus ? 'Checking...' : facilitatorStatus === 'active' ? 'Activated' : 'Check Balance & Activate'}
                      </button>
                   </div>

                   {/* Payout Recipient Info */}
                   <div className="pt-4 border-t border-[var(--bg-border)]">
                      <div className="text-[10px] text-[var(--text-tertiary)] font-mono uppercase tracking-widest mb-1">Payment Recipient Address</div>
                      <div className="text-xs text-[var(--text-secondary)] font-mono truncate">{paymentAddress}</div>
                   </div>
                </div>
              )}
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="p-6 rounded-xl border border-[var(--bg-border)] glass-subtle backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
         <div className={`p-2 rounded-lg bg-[var(--glass-subtle-bg)] ${color}`}>
            <Icon size={18} />
         </div>
         <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-bold text-[var(--text-primary)] font-display tracking-tighter">
        {value}
      </div>
    </div>
  )
}
