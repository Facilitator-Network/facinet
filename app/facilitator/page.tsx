"use client"

import Link from "next/link"
import { ShieldCheck, Server, Activity, Wallet, Clock, ArrowRight, Cloud, X, AlertCircle, Terminal, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { AnimatedArchitectureFlow } from "@/components/ui/architecture-flow"
import { SectionHeading } from "@/components/ui/section-heading"
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

  // wagmi hook for signing typed data (ERC-3009)
  const { signTypedDataAsync } = useSignTypedData()

  // Get network-specific minimum balance and currency
  const getNetworkMinimums = (network: string) => {
    const minimums: Record<string, { amount: number; currency: string; faucet: string }> = {
      'avalanche-fuji': { amount: 0.1, currency: 'AVAX', faucet: 'https://faucet.avax.network/' },
      'ethereum-sepolia': { amount: 0.05, currency: 'ETH', faucet: 'https://sepoliafaucet.com/' },
      'base-sepolia': { amount: 0.05, currency: 'ETH', faucet: 'https://www.alchemy.com/faucets/base-sepolia' },
      'polygon-amoy': { amount: 0.1, currency: 'MATIC', faucet: 'https://faucet.polygon.technology/' },
    };
    return minimums[network] || { amount: 0.1, currency: 'AVAX', faucet: 'https://faucet.avax.network/' };
  };

  const networkMinimums = getNetworkMinimums(selectedNetwork);

  // Set payment address to connected wallet (always use connected wallet as recipient)
  useEffect(() => {
    if (address && !generatedWallet) {
      setPaymentAddress(address)
    }
  }, [address, generatedWallet])

  // Generate a new wallet
  const handleGenerateWallet = () => {
    const wallet = ethers.Wallet.createRandom()
    setGeneratedWallet({
      address: wallet.address,
      privateKey: wallet.privateKey
    })
    // Keep paymentAddress as connected wallet (not the generated wallet)
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

  // Encrypt private key with password
  const handleEncryptKey = async () => {
    if (!generatedWallet) return

    if (password !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    if (!validatePassword(password)) {
      alert('Password must be at least 8 characters with uppercase, lowercase, and number')
      return
    }

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

      console.log(`✍️ Starting x402 ERC-3009 payment on ${selectedNetwork}...`)

      // Step 1: Create ERC-3009 authorization
      // Payment goes to DEFAULT_FACILITATOR (platform wallet)
      const authorization = createTransferAuthorization(
        address,
        DEFAULT_FACILITATOR as `0x${string}`,
        '1', // 1 USDC
        selectedNetwork // Network parameter for network-specific EIP-712 domain
      )

      console.log('📝 Authorization created:', authorization)

      // Step 2: Get typed data for signing with network-specific domain
      const typedData = getTypedDataForSigning(authorization, selectedNetwork)
      console.log('📋 Typed data prepared for network:', selectedNetwork)

      // Step 3: Request user signature (MetaMask will pop up) - NO GAS PAID
      console.log('🔐 Requesting signature from wallet...')
      const signature = await signTypedDataAsync({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.message,
      })

      console.log('✅ Authorization signed (no gas paid by user)')

      // Step 4: Create signed authorization
      const signedAuth = createSignedAuthorization(authorization, signature)

      // Step 5: Create x402 payload
      const x402Payload = createX402ExactPayload(signedAuth)

      // Step 6: Create payment requirements
      const paymentRequirements = createPaymentRequirements('1')

      // Step 7: Submit to default facilitator API with network parameter
      console.log('🚀 Submitting payment to x402 default facilitator...')

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
      console.log('📦 Settlement result:', settlementResult)

      // Extract transaction hash
      const transactionHash = settlementResult.txHash || settlementResult.tx || settlementResult.transaction

      if (!transactionHash) {
        throw new Error('No transaction hash returned from facilitator')
      }

      console.log('✅ Payment settled on-chain by default facilitator:', transactionHash)
      setTxHash(transactionHash)
      setIsPaymentSuccess(true)

      console.log('🎉 x402 ERC-3009 payment complete! User only signed, facilitator paid gas.')

    } catch (error) {
      console.error('❌ x402 payment error:', error)
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
      console.log('✅ Payment successful, proceeding to step 4')
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

    console.log(`🔄 Auto-checking ${needsFundingFacilitators.length} facilitator(s) for activation...`)

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
          console.log(`✅ Auto-activated facilitator: ${facilitator.name} (${data.facilitator.balance} ${currency})`)
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
      console.log(`✅ Auto-activated ${activatedCount} facilitator(s)`)
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
        alert(`✅ Facilitator "${facilitatorName}" deleted successfully`)
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
          alert(`✅ Facilitator activated! Balance: ${data.facilitator.balance} ${currency}`)
        } else {
          alert(`⚠️ Not enough ${currency}. Current: ${data.facilitator.balance} ${currency}, Required: ${data.facilitator.minimumRequired} ${currency}`)
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

      const response = await fetch('/api/facilitator/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: facilitatorName,
          encryptedPrivateKey: encryptedKey,          // User's password-encrypted private key (for backup/export)
          privateKey: generatedWallet.privateKey,      // Plain private key (backend will encrypt with SYSTEM_MASTER_KEY)
          facilitatorWallet: generatedWallet.address,  // The generated wallet address
          paymentRecipient: paymentAddress,            // Where fees go (connected wallet)
          createdBy: address,                          // Connected wallet that created it
          registrationTxHash: txHash,                  // USDC payment tx hash
          network: selectedNetwork,                    // Selected network
          chainId: networkConfig.chain.id,             // Chain ID
        }),
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
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-primary mb-4">
             <div className="h-px w-12 bg-primary" />
             <span className="text-sm font-mono uppercase tracking-widest text-primary font-bold">Network Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-white uppercase tracking-tight">
            Facilitator Network
          </h1>
          <p className="text-xl text-white/50 max-w-none font-light leading-relaxed">
            The backbone of the autonomous economy. Run a node, earn fees, and secure agent transactions.
          </p>
        </div>



        {/* WALLET CONNECTION PROMPT */}
        {!isConnected && (
          <>
            <div className="mb-8 p-6 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div>
                <h3 className="text-white font-mono font-bold mb-1">Connect Your Wallet</h3>
                <p className="text-white/60 text-sm">Connect to view and manage your facilitators</p>
              </div>
              <ConnectButton />
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
          <StatCard label="Active Nodes" value={loading ? "..." : networkStats.activeNodes.toString()} icon={Server} color="text-green-400" />
          <StatCard label="Total Staked" value={networkStats.totalStaked} icon={Wallet} color="text-purple-400" />
          <StatCard label="Fees Generated" value={networkStats.feesGenerated} icon={Activity} color="text-blue-400" />
          <StatCard label="Transactions" value={networkStats.transactions.toString()} icon={ArrowRight} color="text-orange-400" />
          <StatCard label="Network Uptime" value={networkStats.networkUptime} icon={Clock} color="text-white" />
        </div>





        {/* 2. MY FACILITATORS DASHBOARD */}
        {isConnected && (
          <>
          <div className="mb-24 space-y-6">
             <SectionHeading 
                title="Deploy Facilitator"
                description="Choose your deployment method"
                icon={Server}
                iconColor="text-primary"
             />

             {/* CREATE OPTIONS */}
             

             <div className="grid md:grid-cols-2 gap-6 mb-12">
               {/* CLI CARD */}
               <div
                 className="relative group p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all text-left opacity-60 cursor-not-allowed"
               >
                 <div className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white transition-colors">
                   <Terminal size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-white font-mono uppercase tracking-tight mb-2">CLI Node</h3>
                 <div className="flex items-center gap-2 mb-2">
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                     Under Development
                   </span>
                 </div>
                 <p className="text-white/40 text-sm font-light max-w-[80%]">
                   Run a self-hosted node via command line. For advanced users.
                 </p>
               </div>

               {/* CLOUD CARD */}
               <button
                 onClick={() => setShowDeployModal(true)}
                 className="relative group p-6 rounded-xl border border-blue-500/40 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-blue-500/5 hover:border-blue-400/60 hover:from-blue-500/30 hover:to-blue-500/10 backdrop-blur-md transition-all text-left shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
               >
                 <div className="absolute top-4 right-4 flex gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/20 border border-green-500/30 text-[10px] font-bold text-green-400 uppercase tracking-wider animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        LIVE
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                        <Cloud size={24} />
                    </div>
                 </div>
                 <h3 className="text-xl font-bold text-white font-mono uppercase tracking-tight mb-2">Cloud Node</h3>
                 <div className="flex items-center gap-2 mb-3">
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-500/20">
                     Recommended
                   </span>
                 </div>
                 <p className="text-blue-100/80 text-sm font-light max-w-[85%]">
                   Deploy a managed facilitator node instantly. No setup required. Start earning rewards immediately.
                 </p>
               </button>
             </div>

             {/* MY FACILITATORS SECTION */}
             <div className="space-y-6">
                <SectionHeading 
                    title="My Facilitators"
                    description="Manage your facilitator instances"
                    icon={ShieldCheck}
                    iconColor="text-primary"
                />

             {loading ? (
               <div className="text-center py-12 text-white/40">Loading...</div>
             ) : myFacilitators.length > 0 ? (
               <>
                 {/* Aggregate Stats Dashboard */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl border border-primary/20 bg-primary/5">
                   <div className="text-center">
                     <div className="text-3xl font-bold text-white font-mono mb-1">
                       {myFacilitators.length}
                     </div>
                     <div className="text-xs text-white/40 uppercase tracking-wider font-mono">Total Facilitators</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-green-400 font-mono mb-1">
                       {myFacilitators.filter(f => f.status === 'active').length}
                     </div>
                     <div className="text-xs text-white/40 uppercase tracking-wider font-mono">Active</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-blue-400 font-mono mb-1">
                       {myFacilitators.reduce((sum, f) => sum + (f.totalPayments || 0), 0)}
                     </div>
                     <div className="text-xs text-white/40 uppercase tracking-wider font-mono">Total Payments</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-purple-400 font-mono mb-1">
                       {myFacilitators.length > 0
                         ? (myFacilitators.reduce((sum, f) => sum + (f.reputation || 0), 0) / myFacilitators.length).toFixed(1)
                         : '0'}
                     </div>
                     <div className="text-xs text-white/40 uppercase tracking-wider font-mono">Avg Reputation</div>
                   </div>
                 </div>

                 {/* Individual Facilitators */}
                 <div className="grid md:grid-cols-2 gap-6">
                  {myFacilitators.map((facilitator) => (
                    <div key={facilitator.id} className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group relative">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Cloud className="text-blue-400" size={20} />
                             </div>
                             <div>
                                <div className="text-white font-bold font-mono">{facilitator.name}</div>
                                <div className="text-xs text-white/40 font-mono">ID: {facilitator.id.slice(0, 8)}...</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             {/* Delete Button */}
                             <button
                               onClick={() => handleDeleteFacilitator(facilitator.id, facilitator.name)}
                               className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                               title="Delete facilitator"
                             >
                               <Trash2 size={14} />
                             </button>
                             {/* Status Badge */}
                             <div className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wide flex items-center gap-1.5 ${
                               facilitator.status === 'active'
                                 ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                 : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                             }`}>
                                <div className={`w-1 h-1 rounded-full ${facilitator.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                                {facilitator.status}
                             </div>
                          </div>
                       </div>
                       <div className="grid grid-cols-3 gap-4 text-xs font-mono text-white/60">
                          <div>
                             <div className="text-white/30 uppercase tracking-wider mb-1">Balance</div>
                             <div className="text-white">
                               {balanceLoading ? 'Loading...' : (facilitatorBalances[facilitator.id] || '0')} {getNetworkMinimums(facilitator.network || 'avalanche-fuji').currency}
                             </div>
                          </div>
                          <div className="text-center">
                             <div className="text-white/30 uppercase tracking-wider mb-1">Payments</div>
                             <div className="text-blue-400">{facilitator.totalPayments || 0}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-white/30 uppercase tracking-wider mb-1">Reputation</div>
                             <div className="text-green-400">{facilitator.reputation || 0}/5</div>
                          </div>
                       </div>
                    </div>
                  ))}
                 </div>
               </>
             ) : (
                <div className="p-12 rounded-xl border border-white/10 bg-white/5 text-center space-y-6">
                  <div className="space-y-2">
                    <p className="text-white/60">You don't have any facilitators yet.</p>
                    <p className="text-sm text-white/40">Launch a cloud node to start earning rewards.</p>
                  </div>
                  <button
                    onClick={() => setShowDeployModal(true)}
                    className="group flex items-center gap-2 mx-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                  >
                    <Cloud size={18} className="text-white group-hover:scale-110 transition-transform" />
                    <span>Deploy Now</span>
                  </button>
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
                iconColor="text-primary"
                rightElement={
                  <Link href="/explorer" className="text-sm font-mono text-white/50 hover:text-white transition-colors flex items-center gap-2">
                     View Full Explorer <ArrowRight size={14} />
                  </Link>
                }
           />

           {/* Table Header */}
           <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 rounded-t-lg border border-white/10 font-mono text-xs text-white/40 uppercase tracking-wider">
              <div className="col-span-4 md:col-span-3">Node Name</div>
              <div className="col-span-4 md:col-span-3">ID</div>
              <div className="col-span-2 hidden md:block text-right">Payments</div>
              <div className="col-span-2 hidden md:block text-right">Balance</div>
              <div className="col-span-4 md:col-span-2 text-right">Status</div>
           </div>

           {/* Table Rows (Real Data - Only Active) */}
           <div className="space-y-2">
             {loading ? (
               <div className="text-center py-12 text-white/40">Loading facilitators...</div>
             ) : facilitators.filter(f => f.status === 'active').length > 0 ? (
               facilitators.filter(f => f.status === 'active').map((node) => (
                 <div key={node.id} className="grid grid-cols-12 gap-4 px-4 py-4 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-colors items-center">
                    <div className="col-span-4 md:col-span-3 font-medium text-white">{node.name}</div>
                    <div className="col-span-4 md:col-span-3 font-mono text-xs text-white/40 truncate">{node.id}</div>
                    <div className="col-span-2 hidden md:block text-right text-sm text-white/60 font-mono">{node.totalPayments || 0}</div>
                    <div className="col-span-2 hidden md:block text-right text-sm text-white/60 font-mono">N/A</div>
                    <div className="col-span-4 md:col-span-2 flex justify-end">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide ${
                         node.status === 'active'
                           ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                           : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                       }`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${node.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                         {node.status}
                       </span>
                    </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-12 text-white/40">No facilitators found. Be the first to create one!</div>
             )}
           </div>
        </div>

      </div>

      {/* DEPLOY MODAL */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
           <div className="relative w-full max-w-2xl bg-black border border-white/10 rounded-2xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
              <div className="max-h-[85vh] overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <button
                  onClick={() => { setShowDeployModal(false); setDeployStep(1); }}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10"
                >
                   <X size={20} />
                </button>

                <div className="text-center space-y-2">
                   <h2 className="text-3xl font-bold font-mono text-white uppercase tracking-tight">Create Your Facilitator</h2>
                   <p className="text-white/60 font-light">Launch your cloud node in minutes.</p>
                </div>

              {/* STEP 1: NAME & GUIDE */}
              {deployStep === 1 && (
                <>
                  <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
                     <h3 className="font-bold text-white font-mono uppercase tracking-tight">How it works:</h3>
                     <ul className="space-y-2 text-sm text-white/60 font-mono">
                        {[
                          "1. Select network for your facilitator",
                          "2. Choose a name for your facilitator",
                          "3. Generate a new wallet",
                          "4. Encrypt the private key",
                          "5. Pay 1 USDC registration fee",
                          "6. Start earning fees!"
                        ].map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                     </ul>
                  </div>

                  <div className="space-y-6">
                     {/* Network Selector */}
                     <NetworkSelector
                       selectedNetwork={selectedNetwork}
                       onNetworkChange={setSelectedNetwork}
                     />

                     {/* Network Mismatch Warning */}
                     {chain && chain.id !== getNetworkConfig(selectedNetwork).chain.id && (
                       <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                         <p className="text-sm text-yellow-300 font-mono">
                           ⚠️ Please switch your wallet to {NETWORK_CONFIGS[selectedNetwork].displayName}
                         </p>
                       </div>
                     )}

                     <div className="space-y-2">
                        <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Facilitator Name</label>
                        <input
                           type="text"
                           value={facilitatorName}
                           onChange={(e) => setFacilitatorName(e.target.value)}
                           placeholder="My Facilitator"
                           className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                        />
                        <p className="text-[10px] text-white/30 font-mono">Min 3 characters, max 50</p>
                     </div>

                     <button
                        disabled={!facilitatorName || facilitatorName.length < 3 || (chain && chain.id !== getNetworkConfig(selectedNetwork).chain.id)}
                        onClick={handleGenerateWallet}
                        className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                     >
                        Generate Wallet →
                     </button>
                  </div>
                </>
              )}

              {/* STEP 2: KEYS & PASSWORD */}
              {deployStep === 2 && (
                <div className="space-y-6">
                   {/* Info Box */}
                   <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
                      <div className="space-y-1">
                         <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Facilitator Name</div>
                         <div className="text-xl font-bold text-white font-mono">{facilitatorName}</div>
                      </div>
                      
                      <div className="space-y-1">
                         <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Wallet Address</div>
                         <div className="bg-black/50 p-3 rounded-lg border border-white/10 font-mono text-xs text-white/80 break-all">
                            {generatedWallet?.address || 'Generating...'}
                         </div>
                      </div>

                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 space-y-3">
                         <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wide">
                            <ShieldCheck size={16} /> Save Your Private Key!
                         </div>
                         <p className="text-xs text-red-200/60 leading-relaxed">
                            You'll need it to import to MetaMask and fund with AVAX. We do not store this.
                         </p>
                         {showPrivateKey && generatedWallet && (
                           <div className="bg-black/70 p-3 rounded-lg border border-red-500/30 font-mono text-xs text-red-200 break-all select-all">
                             {generatedWallet.privateKey}
                           </div>
                         )}
                         <button
                           onClick={() => setShowPrivateKey(!showPrivateKey)}
                           className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                         >
                            {showPrivateKey ? 'Hide Private Key' : 'Show Private Key'}
                         </button>
                      </div>
                   </div>

                   {/* Password Form */}
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <h3 className="font-bold text-white font-mono uppercase tracking-tight">Encrypt with Password</h3>
                         <div className="grid gap-3">
                            <input
                               type="password"
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               placeholder="Password (8+ chars, uppercase, lowercase, number)"
                               className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                            />
                            <input
                               type="password"
                               value={confirmPassword}
                               onChange={(e) => setConfirmPassword(e.target.value)}
                               placeholder="Confirm password"
                               className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                            />
                         </div>
                         {password && !validatePassword(password) && (
                           <p className="text-xs text-red-400 font-mono">Password must have 8+ chars, uppercase, lowercase, and number</p>
                         )}
                         {password && confirmPassword && password !== confirmPassword && (
                           <p className="text-xs text-red-400 font-mono">Passwords do not match</p>
                         )}
                      </div>

                      <button
                         onClick={handleEncryptKey}
                         disabled={!password || !confirmPassword || password !== confirmPassword || !validatePassword(password)}
                         className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                         Encrypt & Continue →
                      </button>
                   </div>
                </div>
              )}

              {/* STEP 3: REGISTRATION FEE */}
              {deployStep === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
                   <div className="text-center space-y-4">
                      <div className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono font-bold uppercase tracking-widest text-white/80">
                         x402 Protocol (ERC-3009)
                      </div>
                      <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-tight">Facilitator Registration Fee</h3>
                      <p className="text-white/60 font-light">Register your facilitator on x402:</p>
                   </div>

                   <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                      <div className="text-5xl font-bold text-white font-mono tracking-tighter">1 USDC</div>
                      <div className="text-xs font-mono text-white/40 uppercase tracking-widest">
                        on {NETWORK_CONFIGS[selectedNetwork].displayName}
                      </div>
                   </div>

                   {/* Network Mismatch Warning */}
                   {chain && chain.id !== getNetworkConfig(selectedNetwork).chain.id && (
                     <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                       <p className="text-sm text-yellow-300 font-mono">
                         ⚠️ Please switch your wallet to {NETWORK_CONFIGS[selectedNetwork].displayName}
                       </p>
                     </div>
                   )}

                   <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 rounded-lg bg-black/50 border border-white/10 font-mono text-sm">
                         <span className="text-white/60">Your USDC Balance:</span>
                         <span className="text-white font-bold">1.00 USDC</span>
                      </div>

                      <button
                         onClick={handlePaymentClick}
                         disabled={!isConnected || isPaymentPending || chain?.id !== getNetworkConfig(selectedNetwork).chain.id}
                         className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                         {isPaymentPending ? 'Processing Payment...' : 'Pay 1 USDC via x402'}
                      </button>

                      {paymentError && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="text-sm text-red-300 font-mono">❌ {paymentError}</p>
                        </div>
                      )}

                      <p className="text-center text-[10px] text-white/20 font-mono uppercase tracking-widest">
                         Using x402 default facilitator on {selectedNetwork}
                      </p>
                   </div>
                </div>
              )}

              {/* STEP 4: CLAIM WALLET (PAYOUT ADDRESS) */}
              {deployStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                   <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-tight">Set Payout Address</h3>
                      <p className="text-white/60 font-light">Where should your facilitator fees be sent?</p>
                   </div>

                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Facilitator Wallet Address</label>
                         <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/60 font-mono text-sm break-all">
                            {generatedWallet?.address || 'N/A'}
                         </div>
                         <p className="text-[10px] text-white/30 font-mono">This wallet processes payments and pays gas fees.</p>
                      </div>

                      <div className="space-y-2">
                         <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Fee Recipient Address (Your Connected Wallet)</label>
                         <div className="w-full bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-primary font-mono text-sm break-all">
                            {paymentAddress || address || '0x...'}
                         </div>
                         <p className="text-[10px] text-green-400/60 font-mono">✓ All earned fees will be sent to your connected wallet automatically.</p>
                      </div>

                      <button
                         onClick={handleCreateFacilitator}
                         disabled={!paymentAddress || !generatedWallet}
                         className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                         Confirm & Launch →
                      </button>
                   </div>
                </div>
              )}

              {/* STEP 5: FUNDING & ACTIVATION */}
              {deployStep === 5 && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                   {/* Success Banner */}
                   <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl text-center space-y-1">
                      <div className="text-green-400 font-bold text-xl font-mono uppercase tracking-tight">Facilitator Created Successfully!</div>
                      <div className="text-white/60 font-mono text-sm">{facilitatorName}</div>
                   </div>

                   {/* Status Display */}
                   <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Current Status</div>
                            {facilitatorStatus === 'active' ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-bold font-mono uppercase">
                                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                 Active
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold font-mono uppercase">
                                 <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                 Needs Funding
                              </div>
                            )}
                         </div>
                         <div className="space-y-1">
                            <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{networkMinimums.currency} Balance</div>
                            <div className="text-lg text-white font-mono font-bold">{facilitatorBalance} {networkMinimums.currency}</div>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Facilitator Wallet Address</div>
                         <div className="flex items-center gap-2">
                            <div className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-white font-mono text-xs break-all">
                               {generatedWallet?.address || 'N/A'}
                            </div>
                            <button
                               onClick={() => {
                                 navigator.clipboard.writeText(generatedWallet?.address || '')
                                 alert('Address copied to clipboard!')
                               }}
                               className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded text-white text-xs font-mono transition-colors"
                            >
                               Copy
                            </button>
                         </div>
                      </div>
                   </div>

                   {/* Funding Instructions */}
                   {facilitatorStatus === 'needs_funding' ? (
                     <div className="p-6 rounded-xl border border-yellow-500/30 bg-yellow-500/5 space-y-3">
                        <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm uppercase tracking-wide">
                           <AlertCircle size={16} /> Action Required: Fund Your Facilitator
                        </div>
                        <p className="text-xs text-yellow-200/80 leading-relaxed">
                           Your facilitator needs <strong>at least {networkMinimums.amount} {networkMinimums.currency}</strong> to pay for gas fees when processing payments.
                        </p>
                        <div className="space-y-2">
                           <div className="text-[10px] text-yellow-200/60 font-mono uppercase tracking-widest">Steps:</div>
                           <ol className="text-xs text-yellow-200/80 space-y-1 list-decimal list-inside">
                              <li>Copy the facilitator wallet address above</li>
                              <li>Send at least {networkMinimums.amount} {networkMinimums.currency} to this address from your wallet or <a href={networkMinimums.faucet} target="_blank" className="text-yellow-400 underline">get testnet {networkMinimums.currency} from faucet</a></li>
                              <li>Click "Check Balance & Activate" below</li>
                              <li>Once activated, return to the hub to see your active facilitator</li>
                           </ol>
                        </div>
                     </div>
                   ) : (
                     <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/5 space-y-2">
                        <div className="flex items-center gap-2 text-green-400 font-bold text-sm uppercase tracking-wide">
                           <Activity size={16} /> Facilitator Activated!
                        </div>
                        <p className="text-xs text-green-200/60 leading-relaxed">
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
                         className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                      >
                         ← Back to Hub
                      </button>
                      <button
                         onClick={handleCheckAndActivate}
                         disabled={isCheckingStatus || facilitatorStatus === 'active'}
                         className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         {isCheckingStatus ? 'Checking...' : facilitatorStatus === 'active' ? '✓ Activated' : 'Check Balance & Activate'}
                      </button>
                   </div>
                   
                   {/* Payout Recipient Info */}
                   <div className="pt-4 border-t border-white/10">
                      <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1">Payment Recipient Address</div>
                      <div className="text-xs text-white/60 font-mono truncate">{paymentAddress}</div>
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
    <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
         <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
            <Icon size={18} />
         </div>
         <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-bold text-white font-mono tracking-tighter">
        {value}
      </div>
    </div>
  )
}

