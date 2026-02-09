import React from 'react';
import { Layers, Activity, ArrowRight, Shield, Zap } from "lucide-react"
import { AnimatedArchitectureFlow } from '@/components/ui/architecture-flow';
import { VENDOR_FLOW } from '@/lib/data/whitepaper';

export function VendorBenefitsSection() {
  return (
    <section className="pt-12 pb-24 relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        
        {/* Vendor Integration Flow (Moved from Chain Page) */}
        <div className="mb-24">

           <AnimatedArchitectureFlow 
              title="Vendor Integration" 
              description="How APIs and Apps integrate the SDK."
              steps={VENDOR_FLOW.steps}
              edges={VENDOR_FLOW.edges}
           />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
                    <h2 className="text-3xl font-bold font-mono text-white uppercase tracking-tight">Why This Matters for Vendors</h2>
                    <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="p-3 bg-white/5 rounded-lg h-fit">
                            <Layers size={24} className="text-white/60" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-1">Verify Once, Everywhere</h4>
                            <p className="text-white/50 text-sm">Instead of running RPCs for every chain, vendors check one API on Facinet. Massive infrastructure savings.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="p-3 bg-white/5 rounded-lg h-fit">
                            <Activity size={24} className="text-white/60" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-1">Real SaaS & AI Usage</h4>
                            <p className="text-white/50 text-sm">Simplifies complexity so non-crypto teams can integrate global payments securely.</p>
                        </div>
                    </div>
                    </div>
                </div>
                
                <div className="p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex flex-col justify-center gap-4">
                    <div className="flex items-center justify-between text-sm font-mono text-white/60 border-b border-white/10 pb-2">
                    <span>Without Facinet</span>
                    <span className="text-red-400">Complex</span>
                    </div>
                    <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-red-200/50 space-y-2">
                    <div>[Vendor] &larr;&rarr; [Eth RPC]</div>
                    <div>[Vendor] &larr;&rarr; [Avax RPC]</div>
                    <div>[Vendor] &larr;&rarr; [Base RPC]</div>
                    <div>[Vendor] &larr;&rarr; [Poly RPC]</div>
                    </div>

                    <div className="flex items-center justify-between text-sm font-mono text-white/60 border-b border-white/10 pb-2 pt-4">
                    <span>With Facinet</span>
                    <span className="text-green-400">Simple</span>
                    </div>
                    <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-green-200/70 border border-green-500/20">
                    <div>[Vendor] &larr;&rarr; <span className="text-green-400 font-bold">[FACINET API]</span></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};
