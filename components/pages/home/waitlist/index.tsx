"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Loader2, CheckCircle2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export function WaitlistSection() {
  const { address, isConnected } = useAccount()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [status, setStatus] = useState<'none' | 'pending' | 'approved'>('none')

  // Check whitelist status when wallet connects
  useEffect(() => {
    if (!address) return
    fetch(`/api/whitelist/check?wallet=${address}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setStatus(data.status)
      })
      .catch(() => {})
  }, [address])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !address) return

    setLoading(true)
    setError("")
    try {
      const res = await fetch('/api/whitelist/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, wallet: address }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setStatus('pending')
      } else {
        setError(data.error || 'Application failed')
      }
    } catch {
      setError('Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="waitlist" className="pt-16 pb-12 relative bg-transparent border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden relative">

          {/* Top Bar */}
          <div className="h-12 border-b border-white/10 flex items-center px-6 gap-2 bg-white/5">
            <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50" />
            <div className="ml-4 font-mono text-xs text-white/30 tracking-widest">FACINET_WHITELIST_V1.0.exe</div>
          </div>

          <div className="p-8 md:p-12 lg:p-16 grid gap-12 relative">

            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            {/* Header */}
            <div className="space-y-6 text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                WHITELIST_OPEN
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">
                Apply for Whitelist
              </h2>

              <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed font-light">
                Get whitelisted to deploy facilitators and purchase gasless API keys.
              </p>
            </div>

            {/* Form */}
            <div className="max-w-md mx-auto w-full relative z-10">
              {!isConnected ? (
                <div className="text-center space-y-4">
                  <p className="text-white/40 font-mono text-sm">Connect your wallet to apply</p>
                  <div className="flex justify-center">
                    <ConnectButton />
                  </div>
                </div>
              ) : status === 'approved' ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-white font-bold font-mono text-lg">WHITELISTED</h3>
                      <p className="text-white/50 text-sm font-mono">
                        You're approved! Deploy facilitators or get API keys.
                      </p>
                    </div>
                    <a href="/facilitator" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono text-xs uppercase tracking-wider hover:bg-primary/20 transition-colors">
                      <Shield className="h-4 w-4" /> Go to Activation Hub <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : status === 'pending' || success ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50">
                      <Shield className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-white font-bold font-mono text-lg">APPLICATION PENDING</h3>
                      <p className="text-white/50 text-sm font-mono">
                        Your application is under review. You'll receive an email when approved.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative space-y-3">
                      <div className="relative flex items-center bg-black border border-white/20 rounded-xl overflow-hidden focus-within:border-primary/50 transition-colors">
                        <div className="pl-4 text-primary font-mono select-none">{">"}</div>
                        <input
                          type="text"
                          required
                          placeholder="your_name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="flex-1 bg-transparent border-none px-4 py-4 text-white placeholder-white/30 focus:ring-0 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="relative flex items-center bg-black border border-white/20 rounded-xl overflow-hidden focus-within:border-primary/50 transition-colors">
                        <div className="pl-4 text-primary font-mono select-none">{">"}</div>
                        <input
                          type="email"
                          required
                          placeholder="your_email@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 bg-transparent border-none px-4 py-4 text-white placeholder-white/30 focus:ring-0 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="relative flex items-center bg-black border border-white/20 rounded-xl overflow-hidden">
                        <div className="pl-4 text-primary font-mono select-none">{">"}</div>
                        <div className="flex-1 px-4 py-4 text-white/40 font-mono text-sm truncate">
                          {address}
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs font-mono text-center">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all h-auto py-4 text-sm font-mono font-bold uppercase tracking-wider"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>Apply for Whitelist <ArrowRight className="h-4 w-4 ml-2" /></>
                    )}
                  </Button>

                  <div className="flex justify-between text-xs font-mono text-white/30 px-2">
                    <span>STATUS: WAITING_FOR_INPUT</span>
                    <span>WALLET: CONNECTED</span>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
