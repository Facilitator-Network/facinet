"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion" // Assuming framer-motion is available, if not I will fallback to standard CSS but standard for this codebase seems to be fancy UI
import { 
  Server, 
  Database, 
  Globe, 
  Zap, 
  Smartphone, 
  Code, 
  ArrowRight, 
  CheckCircle2,
  Cpu,
  ShieldCheck
} from "lucide-react"

export function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<'facilitator' | 'client'>('facilitator')
  const [isHovered, setIsHovered] = useState(false)

  // Auto-rotation
  useEffect(() => {
    if (isHovered) return

    const interval = setInterval(() => {
      setActiveTab(prev => prev === 'facilitator' ? 'client' : 'facilitator')
    }, 3000)

    return () => clearInterval(interval)
  }, [isHovered])

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
           <h2 className="text-3xl md:text-5xl font-bold font-mono text-white mb-6 tracking-tight uppercase">
              How It Works
           </h2>
           <p className="text-white/60 text-lg">
              A dual-sided network optimized for trustless security and instant verification.
           </p>
        </div>

        {/* Interactive Container */}
        <div 
          className="max-w-5xl mx-auto bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
           {/* Tab Controls */}
           <div className="flex border-b border-white/10">
              <button
                 onClick={() => setActiveTab('facilitator')}
                 className={`flex-1 py-6 text-center font-mono text-sm md:text-base tracking-widest uppercase transition-all duration-300 relative ${
                    activeTab === 'facilitator' ? 'text-white bg-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'
                 }`}
              >
                 <div className="flex items-center justify-center gap-3">
                    <Server size={18} className={activeTab === 'facilitator' ? 'text-blue-400' : ''} />
                    Facilitator Node
                 </div>
                 {activeTab === 'facilitator' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                 )}
              </button>
              
              <button
                 onClick={() => setActiveTab('client')}
                 className={`flex-1 py-6 text-center font-mono text-sm md:text-base tracking-widest uppercase transition-all duration-300 relative ${
                    activeTab === 'client' ? 'text-white bg-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'
                 }`}
              >
                 <div className="flex items-center justify-center gap-3">
                    <Smartphone size={18} className={activeTab === 'client' ? 'text-green-400' : ''} />
                    Client (User/Vendor)
                 </div>
                 {activeTab === 'client' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
                 )}
              </button>
           </div>

           {/* Content Area */}
           <div className="p-6 md:p-16 min-h-[300px] md:min-h-[400px] flex items-center justify-center relative bg-grid-white/[0.02]">
              {/* Animated Content Switcher */}
              <div className="w-full">
                 {activeTab === 'facilitator' ? (
                    <div className="animate-in fade-in zoom-in duration-500 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative z-10">
                       
                       {/* Step 1: Run Node */}
                       <div className="flex flex-col items-center gap-4 text-center group">
                          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center relative z-10 group-hover:bg-blue-500/20 transition-colors">
                             <Server className="text-blue-400 h-10 w-10" />
                             {/* Pulse effect */}
                             <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                             <h4 className="text-white font-bold font-mono">Run Node</h4>
                             <p className="text-white/40 text-xs mt-1 max-w-[120px]">Install CLI & connect to L1 RPCs</p>
                          </div>
                       </div>

                       {/* Arrow */}
                       <div className="hidden md:flex flex-col items-center gap-2 opacity-30">
                          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent w-24" />
                          <div className="text-[10px] font-mono uppercase">Listens</div>
                       </div>
                       <ArrowRight className="md:hidden text-white/20 rotate-90 md:rotate-0" />

                       {/* Step 2: Consensus */}
                       <div className="flex flex-col items-center gap-4 text-center group">
                          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center relative z-10 group-hover:bg-purple-500/20 transition-colors">
                             <Cpu className="text-purple-400 h-10 w-10" />
                             <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                             <h4 className="text-white font-bold font-mono">Consensus</h4>
                             <p className="text-white/40 text-xs mt-1 max-w-[120px]">Validate events & agree on truth</p>
                          </div>
                       </div>

                       {/* Arrow */}
                       <div className="hidden md:flex flex-col items-center gap-2 opacity-30">
                          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent w-24" />
                          <div className="text-[10px] font-mono uppercase">Earns</div>
                       </div>
                       <ArrowRight className="md:hidden text-white/20 rotate-90 md:rotate-0" />

                       {/* Step 3: Reward */}
                       <div className="flex flex-col items-center gap-4 text-center group">
                          <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center relative z-10 group-hover:bg-yellow-500/20 transition-colors">
                             <Zap className="text-yellow-400 h-10 w-10" />
                             <div className="absolute inset-0 bg-yellow-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                             <h4 className="text-white font-bold font-mono">Reward</h4>
                             <p className="text-white/40 text-xs mt-1 max-w-[120px]">Get paid in USDC for reliability</p>
                          </div>
                       </div>

                    </div>
                 ) : (
                    <div className="animate-in fade-in zoom-in duration-500 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative z-10">
                       
                       {/* Step 1: User Action */}
                       <div className="flex flex-col items-center gap-4 text-center group">
                          <div className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center relative z-10 group-hover:bg-green-500/20 transition-colors">
                             <Smartphone className="text-green-400 h-10 w-10" />
                             <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                             <h4 className="text-white font-bold font-mono">Request</h4>
                             <p className="text-white/40 text-xs mt-1 max-w-[120px]">User signs tx or Vendor queries data</p>
                          </div>
                       </div>

                       {/* Arrow */}
                       <div className="hidden md:flex flex-col items-center gap-2 opacity-30">
                          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent w-24" />
                          <div className="text-[10px] font-mono uppercase">API Call</div>
                       </div>
                       <ArrowRight className="md:hidden text-white/20 rotate-90 md:rotate-0" />

                       {/* Step 2: Facinet Network */}
                       <div className="flex flex-col items-center gap-4 text-center group">
                          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center relative z-10 group-hover:bg-blue-500/20 transition-colors">
                             <Globe className="text-blue-400 h-10 w-10" />
                             <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                             <h4 className="text-white font-bold font-mono">Index</h4>
                             <p className="text-white/40 text-xs mt-1 max-w-[120px]">Network retrieves canonical record</p>
                          </div>
                       </div>

                       {/* Arrow */}
                       <div className="hidden md:flex flex-col items-center gap-2 opacity-30">
                          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent w-24" />
                          <div className="text-[10px] font-mono uppercase">Returns</div>
                       </div>
                       <ArrowRight className="md:hidden text-white/20 rotate-90 md:rotate-0" />

                       {/* Step 3: Verification */}
                       <div className="flex flex-col items-center gap-4 text-center group">
                          <div className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center relative z-10 group-hover:bg-green-500/20 transition-colors">
                             <ShieldCheck className="text-green-400 h-10 w-10" />
                             <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                             <h4 className="text-white font-bold font-mono">Verified</h4>
                             <p className="text-white/40 text-xs mt-1 max-w-[120px]">Instant, trustless proof of execution</p>
                          </div>
                       </div>

                    </div>
                 )}
              </div>
           </div>

           {/* Footer Status Bar */}
           <div className="bg-black/40 border-t border-white/5 py-3 px-6 flex justify-between items-center text-[10px] font-mono text-white/20 uppercase tracking-widest">
              <div>System: Online</div>
              <div className="flex items-center gap-2">
                 <span>Auto-Cycle: {isHovered ? 'PAUSED' : 'ACTIVE'}</span>
                 <div className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
              </div>
           </div>
        </div>

      </div>
    </section>
  )
}
