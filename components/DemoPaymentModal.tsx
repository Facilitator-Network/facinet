"use client"

/**
 * DemoPaymentModal Component
 *
 * Handles batch x402 payment for home page demo
 * - User selects network from 4 testnets
 * - User pays 0.2 USDC total via batch transaction:
 *   - 0.199 USDC (99.5%) → Random facilitator's payment recipient
 *   - 0.001 USDC (0.5%) → Platform (default facilitator)
 * - Redirects to apex-hunt.vercel.app after success
 */

import { useState, useEffect } from "react"
import { X, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { useAccount, useSignTypedData } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { NetworkSelector } from "@/components/NetworkSelector"
import { getNetworkConfig, NETWORK_CONFIGS } from "@/lib/networks"
import {
  createTransferAuthorization,
  getTypedDataForSigning,
  createSignedAuthorization,
} from "@/lib/erc3009"

interface DemoPaymentModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Facilitator {
  id: string
  name: string
  facilitatorWallet: string
  paymentRecipient: string
  network: string
  status: string
}

const PLATFORM_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT || '0x0000000000000000000000000000000000000000'
const REDIRECT_URL = 'https://apex-hunt.vercel.app/'

export function DemoPaymentModal({ isOpen, onClose }: DemoPaymentModalProps) {
  const { address, isConnected, chain } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()

  const [selectedNetwork, setSelectedNetwork] = useState<string>('avalanche-fuji')
  const [step, setStep] = useState<'network' | 'payment' | 'processing' | 'success' | 'error'>('network')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [txHash, setTxHash] = useState<string>('')
  const [selectedFacilitator, setSelectedFacilitator] = useState<Facilitator | null>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('network')
        setError('')
        setTxHash('')
        setSelectedFacilitator(null)
      }, 300)
    }
  }, [isOpen])

  // Handle network selection and proceed to payment
  const handleNetworkSelected = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    const networkConfig = getNetworkConfig(selectedNetwork)
    if (chain?.id !== networkConfig.chain.id) {
      setError(`Please switch your wallet to ${networkConfig.displayName}`)
      return
    }

    setError('')
    setStep('payment')
  }

  // Handle batch payment
  const handlePayment = async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet')
      return
    }

    try {
      setIsProcessing(true)
      setError('')
      setStep('processing')

      console.log(`🚀 Starting batch x402 payment on ${selectedNetwork}...`)

      // Step 1: Get random facilitator from selected network
      console.log('🎲 Selecting random facilitator...')
      const facilitatorResponse = await fetch(`/api/facilitator/random?network=${selectedNetwork}`)
      const facilitatorData = await facilitatorResponse.json()

      if (!facilitatorResponse.ok || !facilitatorData.success) {
        throw new Error(facilitatorData.error || 'No active facilitators available on this network')
      }

      const facilitator: Facilitator = facilitatorData.facilitator
      setSelectedFacilitator(facilitator)
      console.log(`✅ Selected facilitator: ${facilitator.name} (${facilitator.id})`)

      // Step 2: Create batch authorizations (2 signatures)
      // Authorization #1: 0.199 USDC to facilitator's payment recipient
      console.log('📝 Creating batch authorizations...')
      const auth1 = createTransferAuthorization(
        address,
        facilitator.paymentRecipient as `0x${string}`,
        '0.199', // 99.5% of 0.2 USDC
        selectedNetwork
      )

      // Authorization #2: 0.001 USDC to platform
      const auth2 = createTransferAuthorization(
        address,
        PLATFORM_ADDRESS as `0x${string}`,
        '0.001', // 0.5% of 0.2 USDC
        selectedNetwork
      )

      // Step 3: Get typed data for both authorizations
      const typedData1 = getTypedDataForSigning(auth1, selectedNetwork)
      const typedData2 = getTypedDataForSigning(auth2, selectedNetwork)

      // Step 4: Request user signatures (MetaMask will pop up twice)
      console.log('🔐 Requesting signature #1 (0.199 USDC to facilitator)...')
      const signature1 = await signTypedDataAsync({
        domain: typedData1.domain,
        types: typedData1.types,
        primaryType: typedData1.primaryType,
        message: typedData1.message,
      })

      console.log('🔐 Requesting signature #2 (0.001 USDC to platform)...')
      const signature2 = await signTypedDataAsync({
        domain: typedData2.domain,
        types: typedData2.types,
        primaryType: typedData2.primaryType,
        message: typedData2.message,
      })

      console.log('✅ Both authorizations signed (no gas paid by user)')

      // Step 5: Create signed authorizations
      const signedAuth1 = createSignedAuthorization(auth1, signature1)
      const signedAuth2 = createSignedAuthorization(auth2, signature2)

      // Step 6: Convert BigInt values to strings for JSON serialization
      const serializableAuth1 = {
        signature: signedAuth1.signature,
        authorization: {
          from: signedAuth1.authorization.from,
          to: signedAuth1.authorization.to,
          value: signedAuth1.authorization.value.toString(),
          validAfter: signedAuth1.authorization.validAfter.toString(),
          validBefore: signedAuth1.authorization.validBefore.toString(),
          nonce: signedAuth1.authorization.nonce,
        },
      }

      const serializableAuth2 = {
        signature: signedAuth2.signature,
        authorization: {
          from: signedAuth2.authorization.from,
          to: signedAuth2.authorization.to,
          value: signedAuth2.authorization.value.toString(),
          validAfter: signedAuth2.authorization.validAfter.toString(),
          validBefore: signedAuth2.authorization.validBefore.toString(),
          nonce: signedAuth2.authorization.nonce,
        },
      }

      // Step 7: Submit to batch settlement API
      console.log('🚀 Submitting batch payment to facilitator...')
      const settlementResponse = await fetch('/api/x402/settle-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilitatorId: facilitator.id,
          network: selectedNetwork,
          authorizations: [serializableAuth1, serializableAuth2],
        }),
      })

      if (!settlementResponse.ok) {
        const errorData = await settlementResponse.text()
        throw new Error(`Settlement failed: ${errorData}`)
      }

      const settlementResult = await settlementResponse.json()
      console.log('📦 Settlement result:', settlementResult)

      const transactionHash = settlementResult.txHash || settlementResult.tx || settlementResult.transaction
      if (!transactionHash) {
        throw new Error('No transaction hash returned from facilitator')
      }

      console.log('✅ Batch payment settled on-chain:', transactionHash)
      setTxHash(transactionHash)
      setStep('success')

      // Redirect after 3 seconds
      setTimeout(() => {
        console.log('🎯 Redirecting to apex-hunt...')
        window.location.href = REDIRECT_URL
      }, 3000)

    } catch (err) {
      console.error('❌ Batch payment error:', err)
      let errorMsg = 'Payment failed. Please try again.'
      if (err instanceof Error) {
        if (err.message.includes('User rejected')) {
          errorMsg = 'Signature rejected. Please approve both signatures in MetaMask.'
        } else {
          errorMsg = err.message
        }
      }
      setError(errorMsg)
      setStep('error')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-black border border-white/10 rounded-2xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
        <div className="max-h-[85vh] overflow-y-auto p-8 space-y-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold font-mono text-white uppercase tracking-tight">
              x402 Demo Payment
            </h2>
            <p className="text-white/60 font-light">Experience gasless payments with x402 protocol</p>
          </div>

          {/* Wallet Connection */}
          {!isConnected && (
            <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div>
                <h3 className="text-white font-mono font-bold mb-1">Connect Your Wallet</h3>
                <p className="text-white/60 text-sm">Connect to continue with demo payment</p>
              </div>
              <ConnectButton />
            </div>
          )}

          {/* Step 1: Network Selection */}
          {isConnected && step === 'network' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
                <h3 className="font-bold text-white font-mono uppercase tracking-tight">Select Network</h3>
                <p className="text-sm text-white/60 font-mono">
                  Choose which network you want to make the payment on
                </p>
              </div>

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

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-300 font-mono">❌ {error}</p>
                </div>
              )}

              <button
                onClick={handleNetworkSelected}
                disabled={chain?.id !== getNetworkConfig(selectedNetwork).chain.id}
                className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {/* Step 2: Payment Confirmation */}
          {isConnected && step === 'payment' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                <div className="text-5xl font-bold text-white font-mono tracking-tighter">0.2 USDC</div>
                <div className="text-xs font-mono text-white/40 uppercase tracking-widest">
                  on {NETWORK_CONFIGS[selectedNetwork].displayName}
                </div>
              </div>

              <div className="p-6 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
                <h3 className="font-bold text-blue-300 text-sm uppercase tracking-wide">Payment Breakdown</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between text-white/60">
                    <span>To Facilitator (99.5%):</span>
                    <span className="text-white">0.199 USDC</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Platform Fee (0.5%):</span>
                    <span className="text-white">0.001 USDC</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                    <span className="text-white">Total:</span>
                    <span className="text-primary">0.2 USDC</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/60 font-mono text-center">
                  You'll sign 2 authorizations. A random facilitator will execute the transfers and pay gas fees.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-300 font-mono">❌ {error}</p>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? 'Processing...' : 'Pay 0.2 USDC via x402'}
              </button>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Processing Payment...</h3>
                <p className="text-sm text-white/60 font-mono">
                  {selectedFacilitator ? `Facilitator "${selectedFacilitator.name}" is executing the transfers` : 'Selecting facilitator...'}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-500/20 border border-green-500/20">
                  <CheckCircle2 className="w-16 h-16 text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                <p className="text-sm text-white/60 font-mono mb-4">
                  Your payment has been processed via x402 protocol
                </p>
                {txHash && (
                  <div className="p-3 rounded-lg bg-black/50 border border-white/10">
                    <p className="text-xs text-white/40 mb-1">Transaction Hash:</p>
                    <p className="text-xs text-white/80 font-mono break-all">{txHash}</p>
                  </div>
                )}
              </div>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-primary font-mono">
                  🎯 Redirecting to Apex Hunt in 3 seconds...
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Error */}
          {step === 'error' && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-red-500/20 border border-red-500/20">
                  <AlertCircle className="w-16 h-16 text-red-400" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Payment Failed</h3>
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-300 font-mono">{error}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setStep('network')}
                className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
