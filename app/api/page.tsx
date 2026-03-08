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
    <div className="relative py-8 md:py-12 space-y-12">
      {/* 1. HERO HEADER */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 mb-16">
          <div className="flex items-center gap-3 text-primary mb-4">
             <div className="h-px w-12 bg-primary" />
             <span className="text-sm font-mono uppercase tracking-widest text-primary font-bold">API & Demo</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-white uppercase tracking-tight">
            Build with Facinet
          </h1>
          <p className="text-xl text-white/50 max-w-none font-light leading-relaxed">
            Try the x402 paywall live and get your gasless API key. The simplest way to integrate decentralized payments.
          </p>
        </div>

        <div className="border-t border-white/5 mb-16" />
      </div>

      {/* Gasless API Key — inline purchase */}
      <section className="pb-12 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <ApiKeySection />
        </div>
      </section>

      {/* ====== SECTION 2: THE DEMO — 3-STEP FLOW ====== */}
      <section className="py-12 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Stepper */}
          <div className="flex items-center justify-center mb-12">
            {stepConfig.map((step, i) => {
              const Icon = step.icon
              const isActive = activeStep === step.number
              const isComplete = activeStep > step.number
              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border transition-all duration-300
                        ${isComplete
                          ? "bg-white/30 border-white/50 text-white shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                          : isActive
                            ? "bg-white border-white text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] scale-110"
                            : "bg-white/20 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                        }
                      `}
                    >
                      {isComplete ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Icon size={18} />
                      )}
                    </div>
                    <span
                      className={`
                        mt-2 text-[9px] md:text-[10px] font-mono uppercase tracking-wider
                        ${isActive ? "text-white font-black" : isComplete ? "text-white/90" : "text-white"}
                      `}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < stepConfig.length - 1 && (
                    <div
                      className={`
                        w-12 md:w-24 h-px mx-2 md:mx-4 mb-6 transition-all duration-300
                        ${isComplete ? "bg-white/60" : "bg-white/30"}
                      `}
                    />
                  )}
                </div>
              )
            })}
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
                  <h2 className="text-2xl md:text-3xl font-bold text-white font-mono uppercase tracking-tight">
                    Step 1: The API
                  </h2>
                  <p className="text-white/50 font-mono text-sm">
                    A developer protects their API with one middleware call
                  </p>
                </div>

                {/* Code Block */}
                  <div className="relative group">
                    <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl group-hover:border-white/40 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                      {/* Code window header */}
                      <div className="flex items-center gap-4 px-4 py-3 bg-white/5 border-b border-white/5">
                        <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-white/20" />
                          <div className="w-3 h-3 rounded-full bg-white/10" />
                          <div className="w-3 h-3 rounded-full bg-white/5" />
                        </div>
                        <div className="text-xs text-white/40 font-mono select-none uppercase tracking-widest">server.js</div>
                      </div>
                    {/* Code content */}
                    <div className="p-4 md:p-6 overflow-x-auto">
                      <pre className="font-mono text-xs md:text-sm leading-relaxed">
                        <span className="text-white/40 italic">{"// Developer adds one line to protect their API"}</span>{"\n"}
                        <span className="text-blue-400">const</span>{" "}
                        <span className="text-white">{"{ "}</span>
                        <span className="text-blue-300">paywall</span>
                        <span className="text-white">{" } = "}</span>
                        <span className="text-white/70">require</span>
                        <span className="text-white">{"("}</span>
                        <span className="text-blue-400/70">{"'facinet-sdk'"}</span>
                        <span className="text-white">{");"}</span>{"\n\n"}
                        <span className="text-blue-400">app</span>
                        <span className="text-white">.</span>
                        <span className="text-blue-300">get</span>
                        <span className="text-white">{"("}</span>
                        <span className="text-blue-400/70">{"'/api/premium-weather'"}</span>
                        <span className="text-white">{","}</span>{"\n"}
                        <span className="text-white">{"  "}</span>
                        <span className="text-blue-300">paywall</span>
                        <span className="text-white">{"({"}</span>{"\n"}
                        <span className="text-white">{"    "}</span>
                        <span className="text-white/80">amount</span>
                        <span className="text-white">{": "}</span>
                        <span className="text-blue-400/70">{"'0.10'"}</span>
                        <span className="text-white">{","}</span>{"\n"}
                        <span className="text-white">{"    "}</span>
                        <span className="text-white/80">recipient</span>
                        <span className="text-white">{": "}</span>
                        <span className="text-blue-400/70">{"'0xDEV_WALLET'"}</span>
                        <span className="text-white">{","}</span>{"\n"}
                        <span className="text-white">{"    "}</span>
                        <span className="text-white/80">network</span>
                        <span className="text-white">{": "}</span>
                        <span className="text-blue-400/70">{"'avalanche-fuji'"}</span>{"\n"}
                        <span className="text-white">{"  }),"}</span>{"\n"}
                        <span className="text-white">{"  ("}</span>
                        <span className="text-white/80">req</span>
                        <span className="text-white">{", "}</span>
                        <span className="text-white/80">res</span>
                        <span className="text-white">{" ) "}</span>
                        <span className="text-blue-400">{"=>"}</span>
                        <span className="text-white">{" {"}</span>{"\n"}
                        <span className="text-white">{"    "}</span>
                        <span className="text-white/80">res</span>
                        <span className="text-white">.</span>
                        <span className="text-blue-300">json</span>
                        <span className="text-white">{"({ "}</span>
                        <span className="text-white/80">forecast</span>
                        <span className="text-white">{": "}</span>
                        <span className="text-blue-400/70">{"'Sunny, 24C'"}</span>
                        <span className="text-white">{" });"}</span>{"\n"}
                        <span className="text-white">{"  }"}</span>{"\n"}
                        <span className="text-white">{");"}</span>
                      </pre>
                    </div>
                    {/* Footer */}
                    <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 text-xs text-white/50 font-light font-mono">
                      One middleware. Any Express/Next.js API becomes a paid endpoint.
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="flex justify-center">
                  <button
                    onClick={callDemoApi}
                    disabled={apiLoading}
                    className="group flex items-center gap-3 bg-white/10 border border-white/20 text-white/80 px-8 py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white hover:text-black hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
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
                  <h2 className="text-2xl md:text-3xl font-bold text-white font-mono uppercase tracking-tight">
                    Step 2: The 402 Response
                  </h2>
                  <p className="text-white/50 font-mono text-sm">
                    The server responded with HTTP 402 Payment Required
                  </p>
                </div>

                {/* Response status badge */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10">
                    <ShieldAlert size={16} className="text-red-400" />
                    <span className="text-red-400 font-mono text-sm font-bold">402 PAYMENT REQUIRED</span>
                  </div>
                </div>

                    <div className="relative group">
                      <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl group-hover:border-white/40 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none opacity-20" />
                        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-white/20" />
                              <div className="w-3 h-3 rounded-full bg-white/10" />
                              <div className="w-3 h-3 rounded-full bg-white/5" />
                            </div>
                            <div className="text-xs text-white/40 font-mono select-none uppercase tracking-widest">response.json</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(apiResponse, null, 2))}
                            className="text-white/30 hover:text-white/70 transition-colors"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <div className="p-4 md:p-6 overflow-x-auto">
                          <pre className="font-mono text-xs md:text-sm leading-relaxed text-white/80">
                            {JSON.stringify(apiResponse, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>

                {/* Explanation */}
                <div className="p-5 rounded-xl border border-white/10 bg-white/5">
                  <p className="text-white/70 font-mono text-sm leading-relaxed">
                    The API returned <span className="text-red-400 font-bold">402 Payment Required</span>.
                    You need to pay <span className="text-white font-bold">0.10 USDC</span> on{" "}
                    <span className="text-white font-bold">Avalanche Fuji</span> to access this data.
                    No wallet needed for this step — the 402 response is just an HTTP status code.
                  </p>
                </div>

                {/* CTA Button */}
                <div className="flex justify-center">
                  <button
                    onClick={goToPayment}
                    className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-all"
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
                  <h2 className="text-2xl md:text-3xl font-bold text-white font-mono uppercase tracking-tight">
                    Step 3: The Payment
                  </h2>
                  <p className="text-white/50 font-mono text-sm">
                    Sign an ERC-3009 authorization. The facilitator pays gas for you.
                  </p>
                </div>

                {/* Payment Card */}
                <div className="p-6 md:p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl space-y-6">
                  {/* Amount */}
                  <div className="text-center space-y-1">
                    <div className="text-4xl md:text-5xl font-bold text-white font-mono tracking-tighter">
                      0.10 USDC
                    </div>
                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">
                      Avalanche Fuji Testnet
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span className="text-white/50">Network</span>
                      <span className="text-white">Avalanche Fuji</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span className="text-white/50">Token</span>
                      <span className="text-white">USDC</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span className="text-white/50">Gas Cost to You</span>
                      <span className="text-green-400 font-bold">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span className="text-white/50">Protocol</span>
                      <span className="text-white">x402 + ERC-3009</span>
                    </div>
                  </div>

                  {/* Wallet Section */}
                  {!isConnected ? (
                    <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="text-white font-mono font-bold mb-1 text-sm uppercase tracking-wider">
                          Connect Wallet
                        </h3>
                        <p className="text-white/50 text-xs font-mono">
                          Connect to sign the payment authorization
                        </p>
                      </div>
                      <ConnectButton />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chain?.id !== getNetworkConfig("avalanche-fuji").chain.id && (
                        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                          <p className="text-sm text-yellow-300 font-mono">
                            Please switch your wallet to Avalanche Fuji testnet
                          </p>
                        </div>
                      )}
                      <button
                        onClick={handlePayment}
                        disabled={paymentLoading || chain?.id !== getNetworkConfig("avalanche-fuji").chain.id}
                        className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Simulate Button */}
                  <button
                    onClick={handleSimulatePayment}
                    disabled={paymentLoading}
                    className="w-full border border-white/20 text-white/70 py-3 rounded-lg font-mono text-sm uppercase tracking-wider hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                      <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-300 font-mono">{error}</p>
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
                    <div className="p-4 rounded-full bg-green-500/20 border border-green-500/30">
                      <CheckCircle2 size={32} className="text-green-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white font-mono uppercase tracking-tight">
                    Payment Complete
                  </h2>
                  <p className="text-white/70 font-mono text-sm">
                    Payment settled on Avalanche. Data received. Zero gas paid by you.
                  </p>
                </div>

                    <div className="relative group">
                      <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl group-hover:border-white/40 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-10" />
                        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                          <div className="flex items-center gap-4">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-white/20" />
                              <div className="w-3 h-3 rounded-full bg-white/10" />
                              <div className="w-3 h-3 rounded-full bg-white/5" />
                            </div>
                            <div className="text-xs text-white/40 font-mono select-none uppercase tracking-widest">200 OK - response.json</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(paymentResult, null, 2))}
                            className="text-white/30 hover:text-white/70 transition-colors"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <div className="p-4 md:p-6 overflow-x-auto">
                          <pre className="font-mono text-xs md:text-sm leading-relaxed text-white/80">
                            {JSON.stringify(paymentResult, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>

                {/* Restart */}
                <div className="flex justify-center">
                  <button
                    onClick={resetDemo}
                    className="group flex items-center gap-3 border border-white/20 text-white/70 px-8 py-3 rounded-lg font-mono text-sm uppercase tracking-wider hover:bg-white/5 hover:text-white transition-all"
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
      <section className="py-24 relative border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight font-mono mb-4">
              How It Works
            </h2>
            <p className="text-white/50 font-mono text-sm">
              Three roles. One seamless flow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Code2,
                title: "Developer",
                description: "Adds paywall() middleware. Earns USDC per API call. No payment infrastructure needed.",
                color: "blue",
              },
              {
                icon: User,
                title: "User / Agent",
                description: "Calls API. Gets 402. Signs payment authorization. Gets data. Zero gas fees.",
                color: "blue",
              },
              {
                icon: Server,
                title: "Facilitator",
                description: "Receives signed auth. Pays gas on behalf of user. Settles on Avalanche.",
                color: "blue",
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
                  className="p-6 md:p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl hover:border-white/20 transition-all"
                >
                  <div
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center mb-5
                      ${role.color === "blue" ? "bg-white/5 border border-white/10" : ""}
                      ${role.color === "purple" ? "bg-white/5 border border-white/10" : ""}
                      ${role.color === "green" ? "bg-white/5 border border-white/10" : ""}
                    `}
                  >
                    <Icon
                      size={22}
                      className="text-white/80"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider mb-3">
                    {role.title}
                  </h3>
                  <p className="text-white/50 font-mono text-sm leading-relaxed">
                    {role.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ====== SECTION 4: ADD TO YOUR APP CTA ====== */}
      <section className="py-24 relative border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight font-mono">
              Add to Your App
            </h2>
            <p className="text-white/50 font-mono text-sm">
              Start earning from your APIs in under 5 minutes.
            </p>

            {/* NPM Install */}
            <div className="relative group">
              <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl group-hover:border-white/40 transition-all duration-500 text-left">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                    </div>
                    <div className="text-[10px] text-white/40 font-mono select-none uppercase tracking-widest">terminal</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard("npm install facinet-sdk")}
                    className="text-white/30 hover:text-white/70 transition-colors flex items-center gap-1.5"
                  >
                    <Copy size={10} />
                    <span className="text-[9px] font-mono uppercase tracking-wider">
                      {copied ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>
                <div className="p-5">
                  <pre className="font-mono text-sm md:text-base text-white/80">
                    <span className="text-blue-400">$</span> npm install facinet-sdk
                  </pre>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/docs"
                className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-mono font-bold text-sm uppercase tracking-wider hover:bg-white/90 transition-all"
              >
                Read the Docs
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 border border-white/20 text-white/70 px-6 py-3 rounded-lg font-mono text-sm uppercase tracking-wider hover:bg-white/5 hover:text-white transition-all"
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
