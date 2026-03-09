"use client"

import React from 'react';
import {
  Network,
  Shield,
  Cpu,
  Zap,
  Layers,
  Globe,
  ArrowRight,
  Hexagon,
  Activity,
  Server,
  FileText,
  Scale,
  BarChart3,
  XCircle,
  CheckCircle,
  Lock,
  Check,
  X,
  Coins,
  Terminal,
  Cloud,
  AlertTriangle,
  Database
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { SystemArchitectureDiagram } from '@/components/ui/system-architecture-diagram';
import { WHITEPAPER_CONTENT } from '@/lib/data/whitepaper';
import MagicBento, { MagicBentoGrid, MagicCard } from '@/components/ui/MagicBento';

const FEATURES = [
  {
    title: "Execution Ledger",
    desc: "Records settlement proofs, tx hashes, chains, fees, and facilitators.",
    matter: "Creates a single source of truth without moving funds.",
    icon: FileText,
    className: "lg:col-span-2 bg-gradient-to-br from-[var(--glass-subtle-bg)] to-transparent"
  },
  {
    title: "Facilitator Accountability",
    desc: "Tracks jobs, success rate, missed deadlines, and uptime.",
    matter: "Facilitators are measurable, replaceable, and non-trusted.",
    icon: Activity
  },
  {
    title: "Objective Slashing",
    desc: "Slashes only provable faults (invalid txs, false claims, deadlines).",
    matter: "Strong security without punishing infra issues.",
    icon: Shield
  },
  {
    title: "Reputation System",
    desc: "Computes reputation from performance and slashing history.",
    matter: "Better facilitator selection over time.",
    icon: Zap
  },
  {
    title: "Distributed Coordination",
    desc: "Registers facilitators and tracks eligibility.",
    matter: "Enables a permissionless facilitator network.",
    icon: Network
  },
  {
    title: "Cross-Chain Verification",
    desc: "One-chain verification for multi-chain settlements.",
    matter: "Vendors integrate once, support many chains.",
    icon: Layers
  },
  {
    title: "ERC-8004 Compatibility",
    desc: "Exposes facilitator identity & reputation.",
    matter: "Portable trust for agents and future markets.",
    icon: Cpu
  },
  {
    title: "Dispute Resolution Layer",
    desc: "Verifies settlement evidence and finalizes outcomes.",
    matter: "Neutral, automated resolution without human trust.",
    icon: Scale
  },
  {
    title: "Analytics & Metrics",
    desc: "Execution latency, throughput, gas efficiency.",
    matter: "Network optimization and transparency.",
    icon: BarChart3
  },
  {
    title: "Minimal Trust Surface",
    desc: "No custody, no execution, no gas payments.",
    matter: "Reduced attack surface and systemic risk.",
    icon: Lock,
    className: "lg:col-span-2 bg-gradient-to-br from-[var(--glass-subtle-bg)] to-transparent"
  }
];

export default function ChainPage() {
  return (
    <div className="relative py-8 md:py-12 space-y-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* 1. HERO HEADER */}
        <div className="space-y-4 mb-16">
          <div className="flex items-center gap-3 text-[var(--accent)] mb-4">
             <div className="h-px w-12 bg-[var(--accent)]" />
             <span className="text-sm font-mono uppercase tracking-widest text-[var(--accent)] font-bold">Architecture Deep Dive</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-[var(--text-primary)] uppercase tracking-tight">
            What is Facinet Chain?
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-none font-body font-light leading-relaxed">
            Facinet's chain is the coordination layer that makes decentralized X402 payments reliable across networks—
            without moving user funds or introducing trust.
          </p>
        </div>

        <div className="mb-12" />

        <div className="w-full mt-12">
           <div className="mb-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-xs font-mono text-[var(--success)] uppercase tracking-widest">
                Live System Architecture
              </span>
           </div>
           <SystemArchitectureDiagram />
        </div>
      </div>

      <div className="my-12" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2. KEY FEATURES - FEATURE GRID */}
        <div>
           <SectionHeading
              title="Key Features"
              description="A purpose-built coordination layer"
              icon={Layers}
              iconColor="text-[var(--accent)]"
           />

           <MagicBentoGrid
             className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
             glowColor="59, 130, 246"
           >
              {FEATURES.map((feature, i) => (
                <MagicCard
                  key={i}
                  className={`magic-card group p-6 rounded-2xl border border-[var(--bg-border)] bg-[var(--glass-subtle-bg)] hover:bg-[var(--bg-raised)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${feature.className || ''}`}
                  enableStars={false}
                  enableTilt={false}
                  enableMagnetism={true}
                  enableBorderGlow={true}
                  clickEffect={true}
                  glowColor="59, 130, 246"
                >
                   {/* Background Glow Effect (Original one + Magic one combining) */}
                   <div className="absolute top-0 right-0 p-24 bg-[var(--accent-muted)] rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[var(--accent-muted)] transition-colors opacity-0 group-hover:opacity-100 pointer-events-none" />

                   <div className="relative z-10 space-y-4 pointer-events-none"> {/* Content pointer-events-none to let card handle clicks mostly, or not */}
                      <div className="w-10 h-10 rounded-lg bg-[var(--glass-subtle-bg)] flex items-center justify-center text-[var(--accent)] border border-[var(--bg-border)] group-hover:border-[var(--accent)]/30 transition-colors">
                         <feature.icon size={20} />
                      </div>

                      <div>
                         <h3 className="text-xl font-bold text-[var(--text-primary)] font-mono uppercase tracking-tight mb-2">{feature.title}</h3>
                         <p className="text-[var(--text-secondary)] text-sm font-body leading-relaxed mb-3">{feature.desc}</p>
                      </div>
                   </div>

                   <div className="relative z-10 pt-4 mt-auto pointer-events-none">
                      <div className="flex items-start gap-2 text-xs text-[var(--text-tertiary)] font-mono">
                        <ArrowRight size={12} className="mt-0.5 shrink-0 text-[var(--accent)]/50" />
                        <span>{feature.matter}</span>
                      </div>
                   </div>
                </MagicCard>
              ))}
           </MagicBentoGrid>

           {/* Footer Quote */}

        </div>

        <div className="my-12" />

        {/* 3. WHAT IT IS vs WHAT IT IS NOT */}
        <div>
           <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* NOT */}
               <div className="flex flex-col h-full space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="p-3 rounded-lg bg-[var(--error-bg)] border border-[var(--error)]/20">
                        <XCircle className="text-[var(--error)]" size={24} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-bold font-display text-[var(--text-primary)] uppercase tracking-tight">What it is NOT</h3>
                        <p className="text-[var(--text-secondary)] font-body font-light text-sm">Common misconceptions</p>
                     </div>
                  </div>
                  <div className="p-8 rounded-2xl bg-[var(--error)]/[0.03] border border-[var(--error)]/20 space-y-4 flex-1">
                     {[
                       "Not a settlement chain",
                       "Not a replacement for Avalanche or Ethereum",
                       "Not a place where user funds move",
                       "Not a rollup competing for blockspace"
                     ].map((item, i) => (
                       <div key={i} className="flex items-start gap-3">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--error)]/50" />
                          <span className="text-[var(--text-secondary)] font-mono text-sm">{item}</span>
                       </div>
                     ))}
                  </div>
               </div>

               {/* IS */}
               <div className="flex flex-col h-full space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="p-3 rounded-lg bg-[var(--success-bg)] border border-[var(--success)]/20">
                        <CheckCircle className="text-[var(--success)]" size={24} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-bold font-display text-[var(--text-primary)] uppercase tracking-tight">What it IS</h3>
                        <p className="text-[var(--text-secondary)] font-body font-light text-sm">Core value proposition</p>
                     </div>
                  </div>
                  <div className="p-8 rounded-2xl bg-[var(--success)]/[0.03] border border-[var(--success)]/20 space-y-4 flex-1">
                     {[
                       "A coordination layer for facilitators",
                       "A verifiable ledger of execution",
                       "A gas management and accounting layer",
                       "A reputation and slashing anchor",
                       "A single verification surface for vendors"
                     ].map((item, i) => (
                       <div key={i} className="flex items-start gap-3">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--success)]/50" />
                          <span className="text-[var(--text-primary)] font-mono text-sm font-bold">{item}</span>
                       </div>
                     ))}
                  </div>
               </div>
           </div>
        </div>

        <div className="my-12" />

        {/* 3. WHY THIS CHAIN EXISTS */}
        <div>
           <SectionHeading
              title="Why This Chain Exists"
              description="The Coordination Problem"

              icon={Globe}
              iconColor="text-[var(--accent)]"
           />
           <div className="grid md:grid-cols-2 gap-12 text-[var(--text-secondary)] leading-relaxed font-body font-light">
              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight">The Coordination Problem</h3>
                 <p>
                    Facinet operates across multiple settlement chains, facilitators, vendors, and agents.
                    While settlement chains are excellent at <strong className="text-[var(--text-primary)] font-medium">moving funds</strong>, they are not designed to:
                 </p>
                 <ul className="space-y-2 list-disc pl-4 marker:text-[var(--accent)]">
                    <li>Coordinate execution across independent facilitators</li>
                    <li>Enforce accountability between unknown actors</li>
                    <li>Provide a single verification surface across chains</li>
                 </ul>
                 <p>
                    As the network scales, relying on off-chain coordination or per-chain verification becomes fragile, complex, and expensive.
                 </p>
              </div>
              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight">Why Verification Needs a Neutral Layer</h3>
                 <p>
                    Multi-chain execution requires a <strong className="text-[var(--text-primary)] font-medium">neutral, chain-agnostic place</strong> to verify what actually happened, record who executed it, and enforce accountability objectively.
                 </p>
                 <div className="p-6 rounded-xl bg-[var(--glass-subtle-bg)] border-l-2 border-[var(--accent)]">
                    <p className="italic text-[var(--text-primary)] font-body">
                       "Facinet Chain exists to solve this coordination problem without custody, execution, or discretionary control. A single neutral layer enables verifiable execution, enforceable accountability, and scalable coordination — without introducing new trust assumptions."
                    </p>
                 </div>
              </div>
           </div>
        </div>

        <div className="my-12" />

        {/* 4. WHAT GETS WRITTEN ON-CHAIN */}
        <div>
           <SectionHeading
              title="What Gets Written On-Chain"
              description="Execution Data Model"

              icon={FileText}
              iconColor="text-[var(--accent)]"
           />
           <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div className="p-6 rounded-2xl bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)]">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] font-mono uppercase tracking-tight mb-4 flex items-center gap-2">
                       <Database size={16} className="text-[var(--accent)]" /> Stored Execution Metadata
                    </h3>
                    <ul className="space-y-3 font-mono text-sm text-[var(--text-secondary)]">
                       {[
                         "paymentId — deterministic identifier",
                         "settlementChain — chain where funds settled",
                         "txHash — settlement transaction hash",
                         "facilitatorId — executing facilitator identity",
                         "executionTimestamp — time of execution",
                         "feeMetadata — protocol/facilitator fees",
                         "executionProof — cryptographic proof"
                       ].map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                             <div className="mt-1.5 w-1 h-1 rounded-full bg-[var(--accent)]" />
                             <span>{item}</span>
                          </li>
                       ))}
                    </ul>
                 </div>
              </div>
              <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed font-body font-light">
                 <h3 className="text-xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight">Explicitly NOT Stored</h3>
                 <p>To minimize risk and surface area, Facinet Chain never stores:</p>
                 <ul className="space-y-2 list-disc pl-4 marker:text-[var(--error)]/50">
                    <li>User or vendor balances</li>
                    <li>Private keys or signatures</li>
                    <li>Personally identifiable information (PII)</li>
                    <li>Application payloads or content</li>
                 </ul>
                 <p className="text-sm border-l-2 border-[var(--bg-border)] pl-4 py-1 text-[var(--text-secondary)]">
                    The chain records <strong>what happened</strong>, not who paid whom or why.
                 </p>
              </div>
           </div>
        </div>

        <div className="my-12" />

        {/* 5. TRUST & SECURITY MODEL */}
        <div>
           <SectionHeading
              title="Trust & Security Model"
              description="Minimal Trust Assumptions"

              icon={Shield}
              iconColor="text-[var(--success)]"
           />
           <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-[var(--glass-bg)]/[0.02] border border-[var(--bg-border)] space-y-4">
                 <Lock className="text-[var(--success)] mb-4" size={32} />
                 <h3 className="text-xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight">Minimal Trust</h3>
                 <p className="text-[var(--text-secondary)] text-sm font-body leading-relaxed">
                    Facinet Chain is designed so participants do <strong>not</strong> need to trust facilitators, vendors, or off-chain services. Correctness is derived from public settlement chains and cryptographic proofs.
                 </p>
              </div>
              <div className="p-8 rounded-3xl bg-[var(--glass-bg)]/[0.02] border border-[var(--bg-border)] space-y-4">
                 <CheckCircle className="text-[var(--success)] mb-4" size={32} />
                 <h3 className="text-xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight">Cannot Lie</h3>
                 <p className="text-[var(--text-secondary)] text-sm font-body leading-relaxed">
                    Facinet Chain does not create execution events. It only records verifiable evidence directly derived from settlement chains. If a transaction isn't on the settlement chain, it cannot be logged.
                 </p>
              </div>
              <div className="p-8 rounded-3xl bg-[var(--glass-bg)]/[0.02] border border-[var(--bg-border)] space-y-4">
                 <Scale className="text-[var(--success)] mb-4" size={32} />
                 <h3 className="text-xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight">Verification</h3>
                 <p className="text-[var(--text-secondary)] text-sm font-body leading-relaxed">
                    Execution proofs are verified by checking settlement chain state, validating tx hashes, and confirming execution parameters. Invalid claims are rejected automatically.
                 </p>
              </div>
           </div>
        </div>

        <div className="my-12" />

        {/* 6. SLASHING & ACCOUNTABILITY */}
        <div>
           <SectionHeading
              title="Slashing & Accountability"
              description="Objective Enforcement"

              icon={Scale}
              iconColor="text-[var(--error)]"
           />
           <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight flex items-center gap-2">
                    <AlertTriangle size={20} className="text-[var(--error)]" /> What Is Slashable
                 </h3>
                 <p className="text-[var(--text-secondary)] font-body font-light">A facilitator is slashable only when a fault is provable:</p>
                 <ul className="space-y-3">
                    {[
                      "Submitting an invalid settlement transaction",
                      "Falsely claiming execution without proof",
                      "Cryptographic proof mismatches",
                      "Missing defined execution deadlines"
                    ].map((item, i) => (
                       <li key={i} className="px-4 py-3 rounded-lg bg-[var(--error-bg)] border border-[var(--error)]/20 text-[var(--text-secondary)] text-sm font-mono">
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>
              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight flex items-center gap-2">
                    <Cloud size={20} className="text-[var(--text-secondary)]" /> What Is NOT Slashable
                 </h3>
                 <p className="text-[var(--text-secondary)] font-body font-light">Infrastructure failures affect reputation, not stake, to encourage decentralization:</p>
                 <ul className="space-y-3">
                    {[
                      "RPC downtime",
                      "Gas price spikes",
                      "Temporary network outages",
                      "Chain congestion"
                    ].map((item, i) => (
                       <li key={i} className="px-4 py-3 rounded-lg bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] text-[var(--text-secondary)] text-sm font-mono">
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>

        <div className="my-12" />

        {/* 7. REPUTATION & DEV UX */}
        <div className="grid lg:grid-cols-2 gap-16">
           {/* Reputation */}
           <div>
              <SectionHeading
                 title="Reputation System"
                 description="Trust Score"

                 icon={Zap}
                 iconColor="text-[var(--warning)]"
              />
              <div className="space-y-6 text-[var(--text-secondary)] font-body font-light leading-relaxed">
                 <p>
                    Facilitators earn reputation through consistent, correct execution. Reputation is not subjective — it is derived from measurable performance like total executions, latency, uptime, and slashing history.
                 </p>
                 <div className="p-6 rounded-xl bg-[var(--warning)]/5 border border-[var(--warning)]/20">
                    <h4 className="text-[var(--warning)] font-bold font-mono uppercase tracking-wider text-sm mb-2">ERC-8004 Portability</h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                       Facilitator identities and reputation data can be exposed via ERC-8004, enabling portable trust, agent discovery, and future reputation markets. Identity is metadata — not authority.
                    </p>
                 </div>
              </div>
           </div>

           {/* Developer Experience */}
           <div>
              <SectionHeading
                 title="Developer Experience"
                 description="One-Chain Verification"

                 icon={Terminal}
                 iconColor="text-[var(--text-secondary)]"
              />
              <div className="space-y-6 text-[var(--text-secondary)] font-body font-light leading-relaxed">
                 <p>
                    Facinet Chain dramatically simplifies how developers verify payments. Builders can verify execution on a single chain, rely on uniform proof formats, and integrate once to scale across chains.
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-muted)] text-center">
                       <div className="text-[var(--text-secondary)] font-bold font-mono text-xl mb-1">Simple SDK</div>
                       <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-mono">Minimal Code</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-muted)] text-center">
                       <div className="text-[var(--text-secondary)] font-bold font-mono text-xl mb-1">Low Cost</div>
                       <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-mono">No Custom Infra</div>
                    </div>
                 </div>
                 <blockquote className="pl-4 border-l-2 border-[var(--accent)] text-[var(--text-primary)] font-body italic">
                    "Builders focus on products and agents — not execution plumbing."
                 </blockquote>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
