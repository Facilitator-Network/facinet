"use client"

import { useState, useEffect } from "react"
import { useAccount, useSignTypedData } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Key, Copy, CheckCircle2, Loader2, X, AlertCircle, Zap } from "lucide-react"
import { getNetworkConfig } from "@/lib/networks"
import {
  createTransferAuthorization,
  getTypedDataForSigning,
  createSignedAuthorization,
} from "@/lib/erc3009"

const PLATFORM_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT || '0x0000000000000000000000000000000000000000'
const PAYMENT_AMOUNT = '10' // 10 USDC
const NETWORK = 'avalanche-fuji'

interface ApiKey {
  key: string
  totalCalls: number
  usedCalls: number
  remainingCalls: number
  createdAt: string
  lastUsed: string | null
  status: string
}

export function ApiKeySection() {
  const { address, isConnected, chain } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()

  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseStep, setPurchaseStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm')
  const [newApiKey, setNewApiKey] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [whitelistStatus, setWhitelistStatus] = useState<'none' | 'pending' | 'approved'>('none')
  const [whitelistChecking, setWhitelistChecking] = useState(false)

  // Fetch existing keys and whitelist status
  useEffect(() => {
    if (!address) return
    const fetchKeys = async () => {
      setLoadingKeys(true)
      try {
        const res = await fetch(`/api/keys/status?wallet=${address}`)
        const data = await res.json()
        if (data.success) setKeys(data.keys || [])
      } catch {
        // ignore
      } finally {
        setLoadingKeys(false)
      }
    }
    const checkWhitelist = async () => {
      setWhitelistChecking(true)
      try {
        const res = await fetch(`/api/whitelist/check?wallet=${address}`)
        const data = await res.json()
        if (data.success) setWhitelistStatus(data.status)
      } catch {
        // ignore
      } finally {
        setWhitelistChecking(false)
      }
    }
    fetchKeys()
    checkWhitelist()
  }, [address])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePurchase = async () => {
    if (!address || !isConnected) return

    const networkConfig = getNetworkConfig(NETWORK)
    if (chain?.id !== networkConfig.chain.id) {
      setError(`Please switch your wallet to ${networkConfig.displayName}`)
      return
    }

    try {
      setPurchaseStep('processing')
      setError('')

      // Step 1: Get a random facilitator to process the payment
      const facRes = await fetch(`/api/facilitator/random?network=${NETWORK}`)
      const facData = await facRes.json()
      if (!facRes.ok || !facData.success) {
        throw new Error(facData.error || 'No active facilitators available')
      }

      // Step 2: Create ERC-3009 authorization for 10 USDC to platform
      const auth = createTransferAuthorization(
        address,
        PLATFORM_ADDRESS as `0x${string}`,
        PAYMENT_AMOUNT,
        NETWORK
      )

      const typedData = getTypedDataForSigning(auth, NETWORK)

      // Step 3: Sign
      const signature = await signTypedDataAsync({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.message,
      })

      const signedAuth = createSignedAuthorization(auth, signature)

      // Step 4: Settle payment
      const serializableAuth = {
        signature: signedAuth.signature,
        authorization: {
          from: signedAuth.authorization.from,
          to: signedAuth.authorization.to,
          value: signedAuth.authorization.value.toString(),
          validAfter: signedAuth.authorization.validAfter.toString(),
          validBefore: signedAuth.authorization.validBefore.toString(),
          nonce: signedAuth.authorization.nonce,
        },
      }

      const settleRes = await fetch('/api/x402/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilitatorId: facData.facilitator.id,
          network: NETWORK,
          authorization: serializableAuth,
        }),
      })

      if (!settleRes.ok) {
        const errData = await settleRes.text()
        throw new Error(`Payment failed: ${errData}`)
      }

      const settleResult = await settleRes.json()
      const txHash = settleResult.txHash || settleResult.tx || settleResult.transaction
      if (!txHash) throw new Error('No transaction hash returned')

      // Step 5: Purchase API key with payment proof
      const purchaseRes = await fetch('/api/keys/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: address,
          paymentTxHash: txHash,
          network: NETWORK,
        }),
      })

      const purchaseData = await purchaseRes.json()
      if (!purchaseData.success) {
        throw new Error(purchaseData.error || 'Failed to generate API key')
      }

      setNewApiKey(purchaseData.apiKey)
      setPurchaseStep('success')

      // Refresh keys list
      const keysRes = await fetch(`/api/keys/status?wallet=${address}`)
      const keysData = await keysRes.json()
      if (keysData.success) setKeys(keysData.keys || [])

    } catch (err: any) {
      setError(err.message || 'Purchase failed')
      setPurchaseStep('error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" /> Gasless API
        </h2>
        {isConnected && (
          whitelistStatus === 'approved' ? (
            <button
              onClick={() => { setShowPurchaseModal(true); setPurchaseStep('confirm'); setError(''); setNewApiKey('') }}
              className="px-4 py-2 rounded-lg bg-white text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-all border border-white"
            >
              Get API Key — 10 USDC
            </button>
          ) : whitelistStatus === 'pending' ? (
            <span className="px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-mono font-bold uppercase tracking-wider">
              Whitelist Pending
            </span>
          ) : (
            <a
              href="/facilitator"
              className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-white/20 transition-colors border border-white/10"
            >
              Apply for Whitelist First
            </a>
          )
        )}
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">
        Make any on-chain transaction gasless with a single API call. Your users never pay gas — Facinet facilitators handle it.
        Each API key includes <strong className="text-white">1,000 calls</strong>.
      </p>

      {/* Usage Example */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-2 border-b border-white/5 text-xs font-mono text-white/40 uppercase tracking-widest">
          Usage — Single API Call
        </div>
        <pre className="p-4 text-sm font-mono text-white/80 overflow-x-auto">
{`curl -X POST https://facinet.vercel.app/api/v1/execute \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: fk_your_api_key_here" \\
  -d '{
    "network": "avalanche-fuji",
    "contractAddress": "0xYourContract...",
    "functionName": "mint",
    "abi": [{"inputs":[...],"name":"mint","outputs":[],"type":"function"}],
    "functionArgs": ["0xRecipient", 1]
  }'`}
        </pre>
      </div>

      {/* Response Example */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-2 border-b border-white/5 text-xs font-mono text-white/40 uppercase tracking-widest">
          Response
        </div>
        <pre className="p-4 text-sm font-mono text-white/80 overflow-x-auto">
{`{
  "success": true,
  "txHash": "0xabc123...",
  "network": "avalanche-fuji",
  "contractAddress": "0xYourContract...",
  "functionName": "mint",
  "gasUsed": "52341",
  "callsUsed": 1,
  "callsRemaining": 999
}`}
        </pre>
      </div>

      {/* Connect prompt or keys list */}
      {!isConnected ? (
        <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
          <div>
            <h3 className="text-white font-mono font-bold mb-1">Connect Wallet</h3>
            <p className="text-white/60 text-sm">Connect to purchase an API key or view your existing keys</p>
          </div>
          <ConnectButton />
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold font-mono text-white/60 uppercase tracking-widest">Your API Keys</h3>
          {loadingKeys ? (
            <div className="text-center py-8 text-white/40 font-mono text-sm">Loading...</div>
          ) : keys.length === 0 ? (
            <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] text-center space-y-3">
              <p className="text-white/40 font-mono text-sm">No API keys yet</p>
              {whitelistStatus === 'approved' ? (
                <button
                  onClick={() => { setShowPurchaseModal(true); setPurchaseStep('confirm'); setError(''); setNewApiKey('') }}
                  className="px-6 py-2 rounded-lg bg-white text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
                >
                  Purchase Your First Key — 10 USDC
                </button>
              ) : whitelistStatus === 'pending' ? (
                <p className="text-yellow-300 font-mono text-xs">Your whitelist application is under review</p>
              ) : (
                <a href="/facilitator" className="inline-block px-6 py-2 rounded-lg bg-white/10 text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-white/20 transition-colors border border-white/10">
                  Apply for Whitelist First
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div key={k.key} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                        {k.key.slice(0, 12)}...{k.key.slice(-6)}
                      </code>
                      <button
                        onClick={() => handleCopy(k.key)}
                        className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        title="Copy full key"
                      >
                        {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      k.status === 'active'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                        : 'bg-red-500/20 text-red-400 border border-red-500/20'
                    }`}>
                      {k.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-xs font-mono text-white/40">
                    <span>Used: <strong className="text-white">{k.usedCalls}</strong> / {k.totalCalls}</span>
                    <span>Remaining: <strong className={k.remainingCalls > 0 ? 'text-green-400' : 'text-red-400'}>{k.remainingCalls}</strong></span>
                  </div>
                  {/* Usage bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full transition-all ${k.remainingCalls > 0 ? 'bg-primary' : 'bg-red-500'}`}
                      style={{ width: `${(k.usedCalls / k.totalCalls) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-black border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 space-y-6">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {purchaseStep === 'confirm' && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold font-mono text-white uppercase tracking-tight">
                      Purchase API Key
                    </h2>
                    <p className="text-white/50 text-sm">1,000 gasless API calls</p>
                  </div>

                  <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                    <div className="text-5xl font-bold text-white font-mono tracking-tighter">10 USDC</div>
                    <div className="text-xs font-mono text-white/40 uppercase tracking-widest">
                      on Avalanche Fuji
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono text-white/50">
                    <div className="flex justify-between"><span>API Calls Included</span><span className="text-white">1,000</span></div>
                    <div className="flex justify-between"><span>Price per Call</span><span className="text-white">$0.01</span></div>
                    <div className="flex justify-between"><span>Networks Supported</span><span className="text-white">7 chains</span></div>
                    <div className="flex justify-between"><span>Rate Limit</span><span className="text-white">None</span></div>
                  </div>

                  {chain?.id !== getNetworkConfig(NETWORK).chain.id && (
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-sm text-yellow-300 font-mono">
                        ⚠️ Please switch your wallet to Avalanche Fuji
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-300 font-mono">❌ {error}</p>
                    </div>
                  )}

                  <button
                    onClick={handlePurchase}
                    disabled={chain?.id !== getNetworkConfig(NETWORK).chain.id}
                    className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Pay 10 USDC & Get API Key
                  </button>
                </div>
              )}

              {purchaseStep === 'processing' && (
                <div className="space-y-6 text-center py-8">
                  <Loader2 className="w-16 h-16 text-white animate-spin mx-auto opacity-20" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Processing Payment...</h3>
                    <p className="text-sm text-white/60 font-mono">Sign the transaction in your wallet</p>
                  </div>
                </div>
              )}

              {purchaseStep === 'success' && (
                <div className="space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-green-500/20 border border-green-500/20">
                      <CheckCircle2 className="w-16 h-16 text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">API Key Generated!</h3>
                    <p className="text-sm text-white/60 font-mono mb-4">
                      Save this key — it won&apos;t be shown again in full
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/50 border border-primary/30 space-y-2">
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Your API Key</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-white/90 font-mono break-all select-all">{newApiKey}</code>
                      <button
                        onClick={() => handleCopy(newApiKey)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-xs text-yellow-300 font-mono">
                      ⚠️ Copy and save this key now. You won&apos;t see it in full again.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="w-full py-3 border border-white/10 hover:bg-white/5 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}

              {purchaseStep === 'error' && (
                <div className="space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-red-500/20 border border-red-500/20">
                      <AlertCircle className="w-16 h-16 text-red-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Purchase Failed</h3>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-300 font-mono">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setPurchaseStep('confirm'); setError('') }}
                    className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
