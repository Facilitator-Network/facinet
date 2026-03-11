"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Code2,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Copy,
  ExternalLink,
  Server,
  User,
  Wallet,
  Play,
  Terminal,
} from "lucide-react"
import { useAccount, useSignTypedData } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { getNetworkConfig } from "@/lib/networks"
import {
  createTransferAuthorization,
  getTypedDataForSigning,
  createSignedAuthorization,
} from "@/lib/erc3009"
import { ApiKeySection } from "@/components/docs/api-key-section"

interface Facilitator {
  id: string
  name: string
  facilitatorWallet: string
  paymentRecipient: string
  network: string
  status: string
}

export default function DemoPage() {
  const { address, isConnected, chain } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()

  const [activeStep, setActiveStep] = useState(1)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const [selectedFacilitator, setSelectedFacilitator] = useState<Facilitator | null>(null)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  // Step 1 -> Step 2: Call the demo API
  const callDemoApi = async () => {
    setApiLoading(true)
    setError("")
    try {
      const res = await fetch("/api/weather")
      const data = await res.json()
      setApiResponse(data)
      setActiveStep(2)
    } catch (err) {
      setError("Failed to call API. Please try again.")
    } finally {
      setApiLoading(false)
    }
  }

  // Step 2 -> Step 3: Move to payment
  const goToPayment = () => {
    setActiveStep(3)
    setError("")
  }

  // Step 3: Perform actual payment
  const handlePayment = async () => {
    if (!address || !isConnected) {
      setError("Please connect your wallet first.")
      return
    }

    const networkConfig = getNetworkConfig("avalanche-fuji")
    if (chain?.id !== networkConfig.chain.id) {
      setError("Please switch your wallet to Avalanche Fuji testnet.")
      return
    }

    try {
      setPaymentLoading(true)
      setError("")

      // Get random facilitator
      const facRes = await fetch("/api/facilitator/random?network=avalanche-fuji")
      const facData = await facRes.json()

      if (!facRes.ok || !facData.success) {
        throw new Error(facData.error || "No active facilitators available")
      }

      const facilitator: Facilitator = facData.facilitator
      setSelectedFacilitator(facilitator)

      // Create authorization for 0.10 USDC
      const auth = createTransferAuthorization(
        address,
        facilitator.paymentRecipient as `0x${string}`,
        "0.10",
        "avalanche-fuji"
      )

      const typedData = getTypedDataForSigning(auth, "avalanche-fuji")

      // Request signature
      const signature = await signTypedDataAsync({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.message,
      })

      const signedAuth = createSignedAuthorization(auth, signature)

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

      // Submit to settlement
      const settleRes = await fetch("/api/x402/settle-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilitatorId: facilitator.id,
          network: "avalanche-fuji",
          authorizations: [serializableAuth],
        }),
      })

      if (!settleRes.ok) {
        const errText = await settleRes.text()
        throw new Error(`Settlement failed: ${errText}`)
      }

      const result = await settleRes.json()
      const txHash = result.txHash || result.tx || result.transaction

      // Now call the API with payment header
      const paidRes = await fetch("/api/weather", {
        headers: { "x-payment": txHash || "paid" },
      })
      const paidData = await paidRes.json()

      setPaymentResult({
        status: 200,
        data: paidData.data,
        x402: {
          paidVia: "Facinet x402 Protocol",
          network: "avalanche-fuji",
          facilitator: facilitator.name,
          txHash: txHash || "0x...",
        },
      })
      setPaymentSuccess(true)
    } catch (err) {
      let msg = "Payment failed. Please try again."
      if (err instanceof Error) {
        if (err.message.includes("User rejected")) {
          msg = "Signature rejected. Please approve the signature in your wallet."
        } else {
          msg = err.message
        }
      }
      setError(msg)
    } finally {
      setPaymentLoading(false)
    }
  }

  // Simulate payment for judges without testnet USDC
  const handleSimulatePayment = async () => {
    setPaymentLoading(true)
    setError("")

    // Short delay for realism
    await new Promise((r) => setTimeout(r, 1500))

    const res = await fetch("/api/weather", {
      headers: { "x-demo-mode": "true" },
    })
    const data = await res.json()

    setPaymentResult({
      status: 200,
      data: data.data,
      x402: {
        paidVia: "Facinet x402 Protocol",
        network: "avalanche-fuji",
        facilitator: "DemoFacilitator",
        txHash: "0x" + "a4b3c2d1e5f6".repeat(5) + "abcdef01",
      },
    })
    setPaymentSuccess(true)
    setPaymentLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetDemo = () => {
    setActiveStep(1)
    setApiResponse(null)
    setPaymentSuccess(false)
    setPaymentResult(null)
    setSelectedFacilitator(null)
    setError("")
  }

  const stepConfig = [
    { number: 1, label: "THE API", icon: Code2 },
    { number: 2, label: "THE 402 RESPONSE", icon: ShieldAlert },
    { number: 3, label: "THE PAYMENT", icon: CreditCard },
  ]

  return (
    <div className="relative py-8 md:py-12 space-y-8">
      {/* 1. HERO HEADER */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-[var(--accent)] mb-4">
             <div className="h-px w-12 bg-[var(--accent)]" />
             <span className="text-sm font-mono uppercase tracking-widest text-[var(--accent)] font-bold">API & Demo</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-[var(--text-primary)] uppercase tracking-tight">
            Build with Facinet
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-none font-body font-light leading-relaxed">
            Try the x402 paywall live and get your gasless API key. The simplest way to integrate decentralized payments.
          </p>
        </div>

      </div>

      {/* Gasless API Key — inline purchase */}
      <section className="pb-8 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <ApiKeySection />
        </div>
      </section>

      {/* ====== SECTION 2: THE DEMO — 3-STEP FLOW ====== */}
      <section className="py-8 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Stepper */}
          <div className="relative mb-14">
            <div className="relative flex items-start justify-between max-w-2xl mx-auto">
              {stepConfig.map((step) => {
                const Icon = step.icon
                const isActive = activeStep === step.number
                const isComplete = activeStep > step.number

                return (
                  <div key={step.number} className="flex flex-col items-center" style={{ flex: '1 1 0' }}>
                    <div className="text-[8px] font-mono font-bold tracking-widest uppercase mb-1.5 text-white/70">
                      Step {step.number}
                    </div>

                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border border-white/20 bg-white/5 text-white/80">
                      <Icon size={20} strokeWidth={1.5} />
                    </div>

                    <span className="mt-3 text-[10px] md:text-[11px] font-mono font-bold uppercase tracking-[0.12em] text-center leading-tight text-white/70">
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {/* ===== STEP 1: THE API ===== */}
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-mono uppercase tracking-tight">
                    Step 1: The API
                  </h2>
                  <p className="text-[var(--text-secondary)] font-body text-sm">
                    A developer protects their API with one middleware call
                  </p>
                </div>

                {/* Code Block */}
                  <div className="relative group">
                    <div className="relative rounded-[var(--radius-xl)] overflow-hidden glass border-[var(--bg-border)] shadow-[var(--glass-shadow)] group-hover:border-[var(--accent-muted)] transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--glass-subtle-bg)] to-transparent pointer-events-none" />
                      {/* Code window header */}
                      <div className="flex items-center gap-4 px-4 py-3 bg-[var(--glass-subtle-bg)] border-b border-[var(--bg-border)]">
                        <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[var(--bg-border)]" />
                          <div className="w-3 h-3 rounded-full bg-[var(--glass-subtle-bg)]" />
                          <div className="w-3 h-3 rounded-full bg-[var(--glass-subtle-bg)]" />
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)] font-mono select-none uppercase tracking-widest">server.js</div>
                      </div>
                    {/* Code content */}
                    <div className="p-4 md:p-6 overflow-x-auto">
                      <pre className="font-mono text-xs md:text-sm leading-relaxed">
                        <span className="text-[var(--syn-comment)] italic">{"// Developer adds one line to protect their API"}</span>{"\n"}
                        <span className="text-[var(--syn-keyword)]">const</span>{" "}
                        <span className="text-[var(--syn-function)]">{"{ "}</span>
                        <span className="text-[var(--accent-hover)]">paywall</span>
                        <span className="text-[var(--syn-function)]">{" } = "}</span>
                        <span className="text-[var(--text-secondary)]">require</span>
                        <span className="text-[var(--syn-function)]">{"("}</span>
                        <span className="text-[var(--syn-string)]">{"'facinet-sdk'"}</span>
                        <span className="text-[var(--syn-function)]">{");"}</span>{"\n\n"}
                        <span className="text-[var(--syn-keyword)]">app</span>
                        <span className="text-[var(--syn-function)]">.</span>
                        <span className="text-[var(--accent-hover)]">get</span>
                        <span className="text-[var(--syn-function)]">{"("}</span>
                        <span className="text-[var(--syn-string)]">{"'/api/premium-weather'"}</span>
                        <span className="text-[var(--syn-function)]">{","}</span>{"\n"}
                        <span className="text-[var(--syn-function)]">{"  "}</span>
                        <span className="text-[var(--accent-hover)]">paywall</span>
                        <span className="text-[var(--syn-function)]">{"({"}</span>{"\n"}
                        <span className="text-[var(--syn-function)]">{"    "}</span>
                        <span className="text-[var(--text-primary)]">amount</span>
                        <span className="text-[var(--syn-function)]">{": "}</span>
                        <span className="text-[var(--syn-string)]">{"'0.10'"}</span>
                        <span className="text-[var(--syn-function)]">{","}</span>{"\n"}
                        <span className="text-[var(--syn-function)]">{"    "}</span>
                        <span className="text-[var(--text-primary)]">recipient</span>
                        <span className="text-[var(--syn-function)]">{": "}</span>
                        <span className="text-[var(--syn-string)]">{"'0xDEV_WALLET'"}</span>
                        <span className="text-[var(--syn-function)]">{","}</span>{"\n"}
                        <span className="text-[var(--syn-function)]">{"    "}</span>
                        <span className="text-[var(--text-primary)]">network</span>
                        <span className="text-[var(--syn-function)]">{": "}</span>
                        <span className="text-[var(--syn-string)]">{"'avalanche-fuji'"}</span>{"\n"}
                        <span className="text-[var(--syn-function)]">{"  }),"}</span>{"\n"}
                        <span className="text-[var(--syn-function)]">{"  ("}</span>
                        <span className="text-[var(--text-primary)]">req</span>
                        <span className="text-[var(--syn-function)]">{", "}</span>
                        <span className="text-[var(--text-primary)]">res</span>
                        <span className="text-[var(--syn-function)]">{" ) "}</span>
                        <span className="text-[var(--syn-keyword)]">{"=>"}</span>
                        <span className="text-[var(--syn-function)]">{" {"}</span>{"\n"}
                        <span className="text-[var(--syn-function)]">{"    "}</span>
                        <span className="text-[var(--text-primary)]">res</span>
                        <span className="text-[var(--syn-function)]">.</span>
                        <span className="text-[var(--accent-hover)]">json</span>
                        <span className="text-[var(--syn-function)]">{"({ "}</span>
                        <span className="text-[var(--text-primary)]">forecast</span>
                        <span className="text-[var(--syn-function)]">{": "}</span>
                        <span className="text-[var(--syn-string)]">{"'Sunny, 24C'"}</span>
                        <span className="text-[var(--syn-function)]">{" });"}</span>{"\n"}
                        <span className="text-[var(--syn-function)]">{"  }"}</span>{"\n"}
                        <span className="text-[var(--syn-function)]">{");"}</span>
                      </pre>
                    </div>
                    {/* Footer */}
                    <div className="px-4 py-3 bg-[var(--glass-subtle-bg)] border-t border-[var(--bg-border)] text-xs text-[var(--text-secondary)] font-light font-body">
                      One middleware. Any Express/Next.js API becomes a paid endpoint.
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="flex justify-center">
                  <button
                    onClick={callDemoApi}
                    disabled={apiLoading}
                    className="group flex items-center gap-3 bg-[var(--accent)] text-white px-8 py-4 rounded-[var(--radius-lg)] font-mono font-bold uppercase tracking-wider hover:bg-white hover:text-[var(--bg-void)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {apiLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Calling API...
                      </>
                    ) : (
                      <>
                        <Play size={18} />
                        Call This API
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ===== STEP 2: THE 402 RESPONSE ===== */}
            {activeStep === 2 && apiResponse && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-mono uppercase tracking-tight">
                    Step 2: The 402 Response
                  </h2>
                  <p className="text-[var(--text-secondary)] font-body text-sm">
                    The server responded with HTTP 402 Payment Required
                  </p>
                </div>

                {/* Response status badge */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--error-border)] bg-[var(--error-bg)]">
                    <ShieldAlert size={16} className="text-[var(--error)]" />
                    <span className="text-[var(--error)] font-mono text-sm font-bold">402 PAYMENT REQUIRED</span>
                  </div>
                </div>

                    <div className="relative group">
                      <div className="relative rounded-[var(--radius-xl)] overflow-hidden glass border-[var(--bg-border)] shadow-[var(--glass-shadow)] group-hover:border-[var(--accent-muted)] transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--error-bg)] to-transparent pointer-events-none opacity-20" />
                        <div className="flex items-center justify-between px-4 py-3 bg-[var(--glass-subtle-bg)] border-b border-[var(--bg-border)]">
                          <div className="flex items-center gap-4">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-[var(--bg-border)]" />
                              <div className="w-3 h-3 rounded-full bg-[var(--glass-subtle-bg)]" />
                              <div className="w-3 h-3 rounded-full bg-[var(--glass-subtle-bg)]" />
                            </div>
                            <div className="text-xs text-[var(--text-tertiary)] font-mono select-none uppercase tracking-widest">response.json</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(apiResponse, null, 2))}
                            className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <div className="p-4 md:p-6 overflow-x-auto">
                          <pre className="font-mono text-xs md:text-sm leading-relaxed text-[var(--text-primary)]">
                            {JSON.stringify(apiResponse, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>

                {/* Explanation */}
                <div className="p-5 rounded-[var(--radius-xl)] border border-[var(--bg-border)] glass-subtle">
                  <p className="text-[var(--text-secondary)] font-body text-sm leading-relaxed">
                    The API returned <span className="text-[var(--error)] font-bold">402 Payment Required</span>.
                    You need to pay <span className="text-[var(--text-primary)] font-bold">0.10 USDC</span> on{" "}
                    <span className="text-[var(--text-primary)] font-bold">Avalanche Fuji</span> to access this data.
                    No wallet needed for this step — the 402 response is just an HTTP status code.
                  </p>
                </div>

                {/* CTA Button */}
                <div className="flex justify-center">
                  <button
                    onClick={goToPayment}
                    className="group flex items-center gap-3 bg-[var(--accent)] text-[var(--bg-void)] px-8 py-4 rounded-[var(--radius-lg)] font-mono font-bold uppercase tracking-wider hover:bg-[var(--accent-hover)] transition-all"
                  >
                    <CreditCard size={18} />
                    Pay & Retry
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ===== STEP 3: THE PAYMENT ===== */}
            {activeStep === 3 && !paymentSuccess && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-mono uppercase tracking-tight">
                    Step 3: The Payment
                  </h2>
                  <p className="text-[var(--text-secondary)] font-body text-sm">
                    Sign an ERC-3009 authorization. The facilitator pays gas for you.
                  </p>
                </div>

                {/* Payment Card */}
                <div className="p-6 md:p-8 rounded-[var(--radius-xl)] border border-[var(--bg-border)] glass space-y-6">
                  {/* Amount */}
                  <div className="text-center space-y-1">
                    <div className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] font-mono tracking-tighter">
                      0.10 USDC
                    </div>
                    <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-[0.2em]">
                      Avalanche Fuji Testnet
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 p-4 rounded-[var(--radius-xl)] glass-subtle">
                    <div className="flex justify-between items-center text-sm font-body">
                      <span className="text-[var(--text-secondary)]">Network</span>
                      <span className="text-[var(--text-primary)]">Avalanche Fuji</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-body">
                      <span className="text-[var(--text-secondary)]">Token</span>
                      <span className="text-[var(--text-primary)]">USDC</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-body">
                      <span className="text-[var(--text-secondary)]">Gas Cost to You</span>
                      <span className="text-[var(--success)] font-bold">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-body">
                      <span className="text-[var(--text-secondary)]">Protocol</span>
                      <span className="text-[var(--text-primary)]">x402 + ERC-3009</span>
                    </div>
                  </div>

                  {/* Wallet Section */}
                  {!isConnected ? (
                    <div className="p-5 rounded-[var(--radius-xl)] border border-[var(--accent-muted)] bg-[var(--accent-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="text-[var(--text-primary)] font-mono font-bold mb-1 text-sm uppercase tracking-wider">
                          Connect Wallet
                        </h3>
                        <p className="text-[var(--text-secondary)] text-xs font-body">
                          Connect to sign the payment authorization
                        </p>
                      </div>
                      <ConnectButton.Custom>
                        {({ openConnectModal, mounted }) => (
                          <button
                            onClick={openConnectModal}
                            disabled={!mounted}
                            className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-[var(--bg-void)] transition-all duration-300"
                          >
                            Connect Wallet
                          </button>
                        )}
                      </ConnectButton.Custom>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chain?.id !== getNetworkConfig("avalanche-fuji").chain.id && (
                        <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--warning-bg)] border border-[var(--warning-border)]">
                          <p className="text-sm text-[var(--warning)] font-body">
                            Please switch your wallet to Avalanche Fuji testnet
                          </p>
                        </div>
                      )}
                      <button
                        onClick={handlePayment}
                        disabled={paymentLoading || chain?.id !== getNetworkConfig("avalanche-fuji").chain.id}
                        className="w-full bg-[var(--accent)] text-[var(--bg-void)] py-4 rounded-[var(--radius-lg)] font-mono font-bold uppercase tracking-wider hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {paymentLoading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Wallet size={18} />
                            Sign & Pay
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-[var(--bg-border)]" />
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-[var(--bg-border)]" />
                  </div>

                  {/* Simulate Button */}
                  <button
                    onClick={handleSimulatePayment}
                    disabled={paymentLoading}
                    className="w-full border border-[var(--bg-border)] text-[var(--text-secondary)] py-3 rounded-[var(--radius-lg)] font-mono text-sm uppercase tracking-wider hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <Terminal size={16} />
                        Simulate Payment (no wallet needed)
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--error-bg)] border border-[var(--error-border)] flex items-start gap-3">
                      <AlertCircle size={16} className="text-[var(--error)] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-[var(--error)] font-body">{error}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ===== STEP 3: SUCCESS ===== */}
            {activeStep === 3 && paymentSuccess && paymentResult && (
              <motion.div
                key="step3-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-[var(--success-bg)] border border-[var(--success-border)]">
                      <CheckCircle2 size={32} className="text-[var(--success)]" />
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-mono uppercase tracking-tight">
                    Payment Complete
                  </h2>
                  <p className="text-[var(--text-secondary)] font-body text-sm">
                    Payment settled on Avalanche. Data received. Zero gas paid by you.
                  </p>
                </div>

                    <div className="relative group">
                      <div className="relative rounded-[var(--radius-xl)] overflow-hidden glass border-[var(--bg-border)] shadow-[var(--glass-shadow)] group-hover:border-[var(--accent-muted)] transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--glass-subtle-bg)] to-transparent pointer-events-none opacity-10" />
                        <div className="flex items-center justify-between px-4 py-3 bg-[var(--glass-subtle-bg)] border-b border-[var(--bg-border)]">
                          <div className="flex items-center gap-4">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-[var(--bg-border)]" />
                              <div className="w-3 h-3 rounded-full bg-[var(--glass-subtle-bg)]" />
                              <div className="w-3 h-3 rounded-full bg-[var(--glass-subtle-bg)]" />
                            </div>
                            <div className="text-xs text-[var(--text-tertiary)] font-mono select-none uppercase tracking-widest">200 OK - response.json</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(paymentResult, null, 2))}
                            className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <div className="p-4 md:p-6 overflow-x-auto">
                          <pre className="font-mono text-xs md:text-sm leading-relaxed text-[var(--text-primary)]">
                            {JSON.stringify(paymentResult, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>

                {/* Restart */}
                <div className="flex justify-center">
                  <button
                    onClick={resetDemo}
                    className="group flex items-center gap-3 border border-[var(--bg-border)] text-[var(--text-secondary)] px-8 py-3 rounded-[var(--radius-lg)] font-mono text-sm uppercase tracking-wider hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)] transition-all"
                  >
                    Restart Demo
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ====== SECTION 3: HOW IT WORKS ====== */}
      <section className="py-8 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] uppercase tracking-tight font-mono mb-4">
              How It Works
            </h2>
            <p className="text-[var(--text-secondary)] font-body text-sm">
              Three roles. One seamless flow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Code2,
                title: "Developer",
                description: "Adds paywall() middleware. Earns USDC per API call. No payment infrastructure needed.",
              },
              {
                icon: User,
                title: "User / Agent",
                description: "Calls API. Gets 402. Signs payment authorization. Gets data. Zero gas fees.",
              },
              {
                icon: Server,
                title: "Facilitator",
                description: "Receives signed auth. Pays gas on behalf of user. Settles on Avalanche.",
              },
            ].map((role, i) => {
              const Icon = role.icon
              return (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="p-6 md:p-8 rounded-[var(--radius-xl)] glass hover:border-[var(--accent-muted)] transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-[var(--glass-subtle-bg)] flex items-center justify-center border border-[var(--glass-subtle-border)] mb-5">
                    <Icon size={18} className="text-[var(--accent)]" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] font-mono uppercase tracking-wider mb-3">
                    {role.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] font-body text-sm leading-relaxed">
                    {role.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ====== SECTION 4: ADD TO YOUR APP CTA ====== */}
      <section className="py-8 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] uppercase tracking-tight font-mono">
              Add to Your App
            </h2>
            <p className="text-[var(--text-secondary)] font-body text-sm">
              Start earning from your APIs in under 5 minutes.
            </p>

            {/* NPM Install */}
            <div className="relative group">
              <div className="relative rounded-[var(--radius-xl)] overflow-hidden glass border-[var(--bg-border)] shadow-[var(--glass-shadow)] group-hover:border-[var(--accent-muted)] transition-all duration-500 text-left">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--glass-subtle-bg)] to-transparent pointer-events-none" />
                <div className="flex items-center justify-between px-4 py-3 bg-[var(--glass-subtle-bg)] border-b border-[var(--bg-border)]">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--bg-border)]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--glass-subtle-bg)]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--glass-subtle-bg)]" />
                    </div>
                    <div className="text-[10px] text-[var(--text-tertiary)] font-mono select-none uppercase tracking-widest">terminal</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard("npm install facinet-sdk")}
                    className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1.5"
                  >
                    <Copy size={10} />
                    <span className="text-[9px] font-mono uppercase tracking-wider">
                      {copied ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>
                <div className="p-5">
                  <pre className="font-mono text-sm md:text-base text-[var(--text-primary)]">
                    <span className="text-[var(--accent)]">$</span> npm install facinet-sdk
                  </pre>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/docs"
                className="group flex items-center gap-2 bg-[var(--accent)] text-[var(--bg-void)] px-6 py-3 rounded-[var(--radius-lg)] font-mono font-bold text-sm uppercase tracking-wider hover:bg-[var(--accent-hover)] transition-all"
              >
                Read the Docs
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://github.com/Facilitator-Network/Facinet-SDK"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 border border-[var(--bg-border)] text-[var(--text-secondary)] px-6 py-3 rounded-[var(--radius-lg)] font-mono text-sm uppercase tracking-wider hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)] transition-all"
              >
                <ExternalLink size={16} />
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
