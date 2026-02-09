"use client"

/**
 * WaitlistSection Component
 * 
 * Captures user interest with a high-conversion, terminal-styled input form.
 * 
 * JUNIOR DEV NOTE:
 * - We use `useState` to manage the form state (email, loading, success).
 * - React state drives the UI changes (switching from form to success message).
 * - The `onSubmit` handler prevents default browser behavior (page reload) to create a SPA experience.
 */

import { useState } from "react"
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WaitlistSection() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Stop page reload
    if (!email) return

    setLoading(true)
    // Simulate API call to backend
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setSuccess(true)
    setEmail("")
  }

  return (
    <section className="pt-16 pb-12 relative bg-transparent border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Card Container with Glassmorphism */}
        <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden relative">
          
          {/* Top Bar (Terminal Window Controls) */}
          <div className="h-12 border-b border-white/10 flex items-center px-6 gap-2 bg-white/5">
            <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50" />
            <div className="ml-4 font-mono text-xs text-white/30 tracking-widest">FACINET_ACCESS_PROTOCOL_V1.0.exe</div>
          </div>

          <div className="p-8 md:p-12 lg:p-16 grid gap-12 relative">
            
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            {/* Header Content */}
            <div className="space-y-6 text-center relative z-10">
              {/* Batch Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                REGISTRATION_OPEN_BATCH_00
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">
                Initialize Access Protocol
              </h2>
              
              <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed font-light">
                The network is growing. Secure your node's position in the autonomous economy before the next halving.
              </p>
            </div>

            {/* Interactive Form Area */}
            <div className="max-w-md mx-auto w-full relative z-10">
              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative group">
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Input Container */}
                    <div className="relative flex items-center bg-black border border-white/20 rounded-xl overflow-hidden focus-within:border-primary/50 transition-colors">
                      <div className="pl-4 text-primary font-mono select-none">{">"}</div>
                      <input
                        type="email"
                        required
                        placeholder="enter_email_address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-transparent border-none px-4 py-4 text-white placeholder-white/30 focus:ring-0 focus:outline-none font-mono"
                      />
                      <div className="pr-2">
                         <Button 
                          type="submit" 
                          disabled={loading}
                          size="icon"
                          className="h-10 w-10 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Footer */}
                  <div className="flex justify-between text-xs font-mono text-white/30 px-2">
                    <span>STATUS: WAITING_FOR_INPUT</span>
                    <span>ENCRYPTION: ENABLED</span>
                  </div>
                </form>
              ) : (
                /* Success State */
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-white font-bold font-mono text-lg">ACCESS_GRANTED</h3>
                      <p className="text-white/50 text-sm font-mono">
                        You have been added to the priority queue.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </section>
  )
}
