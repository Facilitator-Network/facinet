import React from 'react';
import { Layers, Activity, ArrowRight } from "lucide-react"
import { AnimatedArchitectureFlow } from '@/components/ui/architecture-flow';
import { VENDOR_FLOW } from '@/lib/data/whitepaper';

export function VendorBenefitsSection() {
  return (
    <section className="pt-12 pb-24 relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto relative z-10">

        {/* Vendor Integration Flow */}
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
                <h2 className="text-3xl font-bold font-mono text-[var(--text-primary)] uppercase tracking-tight">Why This Matters for Vendors</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="p-3 bg-[var(--glass-subtle-bg)] rounded-lg h-fit">
                      <Layers size={24} className="text-[var(--text-secondary)]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1 font-mono">Verify Once, Everywhere</h4>
                      <p className="text-[var(--text-secondary)] text-sm font-body">Instead of running RPCs for every chain, vendors check one API on Facinet. Massive infrastructure savings.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="p-3 bg-[var(--glass-subtle-bg)] rounded-lg h-fit">
                      <Activity size={24} className="text-[var(--text-secondary)]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1 font-mono">Real SaaS & AI Usage</h4>
                      <p className="text-[var(--text-secondary)] text-sm font-body">Simplifies complexity so non-crypto teams can integrate global payments securely.</p>
                    </div>
                  </div>
                </div>
            </div>

            <div className="rounded-2xl border border-[var(--bg-border)] bg-[var(--glass-bg)] backdrop-blur-sm overflow-hidden">
              {/* Without Facinet */}
              <div className="p-5 border-b border-[var(--bg-border)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Without Facinet</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error-border)]">COMPLEX</span>
                </div>
                <div className="space-y-2">
                  {['Eth RPC', 'Avax RPC', 'Base RPC', 'Poly RPC'].map((rpc) => (
                    <div key={rpc} className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-[var(--text-tertiary)] w-16 text-right">Vendor</span>
                      <div className="flex-1 flex items-center gap-1">
                        <div className="h-px flex-1 bg-[var(--error)] opacity-30" />
                        <span className="text-[var(--error)] text-[10px]">&times;</span>
                        <div className="h-px flex-1 bg-[var(--error)] opacity-30" />
                      </div>
                      <span className="text-[var(--text-tertiary)] w-16">{rpc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider with arrow */}
              <div className="flex items-center justify-center py-2 bg-[var(--glass-subtle-bg)]">
                <ArrowRight className="h-4 w-4 text-[var(--accent)] rotate-90" />
              </div>

              {/* With Facinet */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">With Facinet</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success-border)]">SIMPLE</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs p-3 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-muted)]">
                  <span className="text-[var(--text-primary)] font-medium w-16 text-right">Vendor</span>
                  <div className="flex-1 flex items-center gap-1">
                    <div className="h-px flex-1 bg-[var(--accent)]" />
                    <span className="text-[var(--accent)] text-[10px]">&rarr;</span>
                    <div className="h-px flex-1 bg-[var(--accent)]" />
                  </div>
                  <span className="text-[var(--accent)] font-bold w-20">FACINET API</span>
                </div>
                <div className="mt-3 flex items-center justify-center gap-4 font-mono text-[10px] text-[var(--text-tertiary)]">
                  <span>All chains</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--bg-border)]" />
                  <span>One endpoint</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--bg-border)]" />
                  <span>Zero gas</span>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
};
