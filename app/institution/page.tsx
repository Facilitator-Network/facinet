"use client"

import React from 'react';
import {
  Building2,
  ShieldCheck,
  Network,
  FileCheck,
  Scale,
  Lock,
  Server,
  Activity,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Cpu,
  Globe,
  Zap,
  LayoutDashboard,
  Timer
} from 'lucide-react';
import { MagicCard } from '@/components/ui/MagicBento';
import { SectionHeading } from "@/components/ui/section-heading";

// --- VISUAL COMPONENTS ---

const ArchitectureDiagram = () => (
  <div className="relative w-full p-8 md:p-12 rounded-3xl bg-[var(--glass-bg)] border border-[var(--bg-border)] overflow-hidden group">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-center">
      {/* Institution Box */}
      <div className="flex-1 p-6 rounded-2xl bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] backdrop-blur-sm relative">
        <div className="absolute -top-3 left-6 px-3 py-1 bg-[var(--accent-subtle)] border border-[var(--accent-muted)] rounded-full text-[10px] font-mono text-[var(--accent)] uppercase tracking-widest">
          Institution Perimeter
        </div>
        <div className="flex flex-col gap-4 mt-2">
           <div className="p-4 rounded-xl bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] flex items-center gap-3">
              <LayoutDashboard className="text-[var(--text-secondary)]" size={20} />
              <span className="text-sm font-mono text-[var(--text-primary)]">Inst. Application</span>
           </div>
           <ArrowDown className="text-[var(--text-tertiary)] mx-auto" size={16} />
           <div className="p-4 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-muted)] flex items-center gap-3 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Building2 className="text-[var(--accent)]" size={20} />
              <span className="text-sm font-mono text-[var(--text-primary)] font-bold">Owned Facilitator</span>
           </div>
           <ArrowDown className="text-[var(--text-tertiary)] mx-auto" size={16} />
           <div className="p-4 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-muted)] flex items-center gap-3">
              <Scale className="text-[var(--accent)]" size={20} />
              <div className="flex flex-col">
                <span className="text-sm font-mono text-[var(--text-primary)] font-bold">Policy Engine</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">SLA Checks</span>
              </div>
           </div>
        </div>
      </div>

      {/* Connection Arrows */}
      <div className="flex md:flex-col gap-24 items-center justify-center">
         {/* Success Path */}
         <div className="flex items-center gap-2">
            <div className="h-0.5 w-8 md:w-16 bg-[var(--accent-muted)]" />
            <span className="text-[10px] font-mono text-[var(--accent)] uppercase bg-[var(--accent-subtle)] px-2 py-0.5 rounded border border-[var(--accent-muted)]">SLA Checked</span>
            <ArrowRight className="text-[var(--accent)]" size={16} />
         </div>

         {/* Fail Path */}
         <div className="flex items-center gap-2">
            <div className="h-0.5 w-8 md:w-16 bg-[var(--bg-border)]" />
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase bg-[var(--glass-subtle-bg)] px-2 py-0.5 rounded border border-[var(--bg-border)]">Fallback</span>
            <ArrowRight className="text-[var(--text-tertiary)]" size={16} />
         </div>
      </div>

      {/* External/Facinet Box */}
      <div className="flex-1 flex flex-col gap-8">
         {/* Settlement */}
         <div className="p-6 rounded-2xl bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Globe className="text-[var(--accent)]" size={24} />
               <div className="flex flex-col">
                  <span className="text-sm font-mono text-[var(--text-primary)] font-bold">Settlement Chain</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">Funds Moved</span>
               </div>
            </div>
            <div className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
         </div>

         {/* Distributed Facilitator */}
         <div className="p-6 rounded-2xl bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] border-dashed relative">
             <div className="absolute -top-3 left-6 px-3 py-1 bg-[var(--error-bg)] border border-[var(--error)]/30 rounded-full text-[10px] font-mono text-[var(--error)] uppercase tracking-widest">
                Fallback Layer
             </div>
             <div className="flex items-center gap-3 mt-2">
               <Network className="text-[var(--text-secondary)]" size={24} />
               <div className="flex flex-col">
                  <span className="text-sm font-mono text-[var(--text-primary)]">Distributed Network</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">Public Facilitators</span>
               </div>
             </div>
             {/* Path to Settlement */}
             <div className="absolute -top-6 right-8 h-8 w-0.5 bg-[var(--bg-border)]" />
             <ArrowDown className="absolute -top-[10px] right-[29px] text-[var(--text-tertiary)]" size={12} />
         </div>
      </div>
    </div>

    {/* Bottom Layer: Facinet Chain */}
    <div className="mt-8 pt-8 flex items-center justify-center">
       <div className="w-full max-w-2xl p-4 rounded-xl bg-[var(--glass-bg)]/[0.02] border border-[var(--bg-border)] flex items-center justify-center gap-4 text-[var(--text-tertiary)]">
          <FileCheck size={16} />
          <span className="text-xs font-mono tracking-widest uppercase">Facinet Chain: Audit & Accountability Layer (Connected to All)</span>
       </div>
    </div>
  </div>
);

const ComplianceGrid = () => {
   const items = [
      {
        title: "No Custody of Funds",
        desc: "Facinet never holds user, vendor, or institutional assets.",
        icon: Lock,
        color: "text-[var(--accent)]"
      },
      {
        title: "Separation of Duties",
        desc: "Settlement chains move funds. Facilitators execute. Facinet verifies.",
        icon: Scale,
        color: "text-[var(--text-secondary)]"
      },
      {
        title: "Objective Accountability",
        desc: "Slashing applies only to provable faults (invalid txs, false claims).",
        icon: ShieldCheck,
        color: "text-[var(--success)]"
      },
      {
        title: "Immutable Audit Trail",
        desc: "All executions and fallback events are logged on-chain.",
        icon: FileText,
        color: "text-[var(--warning)]"
      }
   ];

   return (
      <div className="grid md:grid-cols-2 gap-4">
         {items.map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] hover:bg-[var(--bg-raised)] transition-colors">
               <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-[var(--glass-subtle-bg)] ${item.color}`}>
                     <item.icon size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold font-mono text-[var(--text-primary)] uppercase tracking-tight mb-2">{item.title}</h3>
                     <p className="text-sm text-[var(--text-secondary)] font-body leading-relaxed">{item.desc}</p>
                  </div>
               </div>
            </div>
         ))}
      </div>
   );
};

const UseCasesGrid = () => {
   const cases = [
      {
         title: "Financial Institutions",
         points: ["Internal execution control", "Deterministic settlement paths", "Audit-ready logs", "No pooled custody risk"],
         icon: Building2
      },
      {
         title: "Regulated AI Platforms",
         points: ["Agents never hold gas/keys", "Machine-verifiable proofs", "Policy-bound autonomous execution"],
         icon: Cpu
      },
      {
         title: "Public Infrastructure",
         points: ["No vendor lock-in", "Public verifiability", "Transparent accountability"],
         icon: Globe
      }
   ];

   return (
      <div className="grid md:grid-cols-3 gap-6">
         {cases.map((c, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] hover:border-[var(--accent)]/30 transition-all">
                <div className="mb-6 p-4 rounded-2xl bg-[var(--glass-subtle-bg)] inline-block group-hover:bg-[var(--accent-muted)] group-hover:text-[var(--accent)] transition-colors">
                   <c.icon size={32} />
                </div>
                <h3 className="text-xl font-bold font-mono text-[var(--text-primary)] uppercase tracking-tight mb-6">{c.title}</h3>
                <ul className="space-y-3">
                   {c.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-[var(--text-secondary)] font-body">
                         <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)]/40 shrink-0" />
                         <span>{p}</span>
                      </li>
                   ))}
                </ul>
            </div>
         ))}
      </div>
   )
}

// --- MAIN PAGE COMPONENT ---

export default function InstitutionPage() {
  return (
    <div className="relative py-8 md:py-12 space-y-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* 1. HERO HEADER */}
        {/* 1. HERO HEADER */}
        <div className="space-y-4 mb-16">
          <div className="flex items-center gap-3 text-[var(--accent)] mb-4">
             <div className="h-px w-12 bg-[var(--accent)]" />
             <span className="text-sm font-mono uppercase tracking-widest text-[var(--accent)] font-bold">Enterprise & Regulation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-[var(--text-primary)] uppercase tracking-tight">
            Institutional Execution
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-none font-body font-light leading-relaxed">
            Enterprise-grade facilitator execution with compliance, verifiability, and guaranteed decentralized fallback.
          </p>
        </div>

        <div className="mb-12" />

        <div className="my-12" />

        {/* 2. VALUE PROP & INTRODUCTION */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
               <h2 className="text-3xl font-bold font-display text-[var(--text-primary)] uppercase tracking-tight">
                  <span className="text-[var(--accent)]">Internal Control.</span> <br />
                  Decentralized Reliability.
               </h2>
               <p className="text-[var(--text-secondary)] text-lg font-body leading-relaxed">
                  Facinet enables banks, regulated AI platforms, and public institutions to run <strong>institution-owned facilitators</strong> for X402 and crypto payments, while retaining <strong>automatic, policy-driven fallback</strong> to a decentralized facilitator network.
               </p>
               <p className="text-[var(--text-secondary)] text-lg font-body leading-relaxed">
                  This model preserves <strong>control, auditability, and governance</strong>, without introducing custody risk or discretionary execution.
               </p>
            </div>
            <div className="bg-[var(--glass-subtle-bg)] rounded-3xl p-8 border border-[var(--bg-border)]">
               <h3 className="text-sm font-mono text-[var(--text-tertiary)] uppercase tracking-widest mb-6">What This Enables</h3>
               <ul className="space-y-4">
                  {[
                     "Institution-owned facilitators by default",
                     "SLA-based automated fallback",
                     "No custody of funds",
                     "Objective, on-chain accountability",
                     "Full audit trail across all executions"
                  ].map((item, i) => (
                     <li key={i} className="flex items-center gap-3 text-[var(--text-primary)] font-body">
                        <CheckCircle2 className="text-[var(--accent)]" size={20} />
                        <span className="font-light">{item}</span>
                     </li>
                  ))}
               </ul>
            </div>
        </div>

        <div className="my-12" />

        {/* 3. ARCHITECTURE DIAGRAM */}
        <div className="space-y-8">
           <SectionHeading
                title="High-Level Architecture"
                description="Bank-Style Integration with Fallback"
                icon={Network}
                iconColor="text-[var(--accent)]"
           />
           <ArchitectureDiagram />
        </div>

        <div className="my-12" />

        {/* 4. EXECUTION FLOW & POLICY */}
        <div className="grid lg:grid-cols-2 gap-12">
           {/* Policy Config */}
           <div className="space-y-8">
              <SectionHeading
                   title="SLA & Policy"
                   description="Deterministic Configuration"
                   icon={FileText}
                   iconColor="text-[var(--warning)]"
              />
              <p className="text-[var(--text-secondary)] text-sm font-body leading-relaxed">
                 Institutions define explicit execution policies. All fallback behavior is deterministic and auditable. Policies are enforced automatically—no manual overrides.
              </p>

              {/* SLA Table */}
              <div className="overflow-hidden rounded-2xl border border-[var(--bg-border)]">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--glass-subtle-bg)] text-[var(--text-tertiary)] font-mono uppercase text-xs">
                       <tr>
                          <th className="px-6 py-4">Policy Parameter</th>
                          <th className="px-6 py-4">Description</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--bg-border)] text-[var(--text-secondary)] font-body">
                       {[
                         ["Execution Timeout", "Max time before fallback (e.g. 3s)"],
                         ["Gas Availability", "Minimum gas balance threshold"],
                         ["Chain Coverage", "Approved settlement chains"],
                         ["Facilitator Priority", "Private → Network"],
                         ["Fee Cap", "Max fallback fee per transaction"],
                         ["Retry Count", "Number of fallback attempts"]
                       ].map(([param, desc], i) => (
                          <tr key={i} className="hover:bg-[var(--bg-raised)]">
                             <td className="px-6 py-4 font-mono font-bold text-[var(--text-primary)]">{param}</td>
                             <td className="px-6 py-4">{desc}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Logic Flow Visual */}
           <div className="p-8 rounded-3xl bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] flex flex-col justify-center space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-[var(--accent-subtle)] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

               <h3 className="text-sm font-mono text-[var(--text-tertiary)] uppercase tracking-widest text-center mb-4">Execution Logic Path</h3>

               <div className="flex flex-col items-center gap-4 text-sm font-mono">
                  <div className="w-full max-w-xs p-3 text-center rounded-lg bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] text-[var(--text-primary)]">Payment Request</div>
                  <ArrowDown size={16} className="text-[var(--text-tertiary)]" />
                  <div className="w-full max-w-xs p-3 text-center rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-muted)] text-[var(--accent)] font-bold">Institution Facilitator</div>
                  <ArrowDown size={16} className="text-[var(--text-tertiary)]" />

                  <div className="w-full max-w-xs p-4 text-center rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-muted)] text-[var(--text-primary)] relative">
                      <div className="font-bold mb-1 text-[var(--accent)]">SLA Check</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Gas, Uptime, Latency</div>

                      {/* Branching */}
                      <div className="absolute top-full left-1/4 h-8 w-0.5 bg-[var(--success)]/30" />
                      <div className="absolute top-full right-1/4 h-8 w-0.5 bg-[var(--error)]/30" />
                  </div>

                  <div className="w-full max-w-xs flex justify-between gap-4 mt-4">
                     <div className="w-1/2 p-3 text-center rounded-lg bg-[var(--success-bg)] border border-[var(--success)]/20 text-[var(--success)] text-xs">
                        <div className="font-bold">Pass</div>
                        Execute Internally
                     </div>
                     <div className="w-1/2 p-3 text-center rounded-lg bg-[var(--error-bg)] border border-[var(--error)]/20 text-[var(--error)] text-xs">
                        <div className="font-bold">Fail</div>
                        Trigger Fallback
                     </div>
                  </div>

                  <ArrowDown size={16} className="text-[var(--text-tertiary)]" />
                  <div className="w-full max-w-xs p-3 text-center rounded-lg bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] text-[var(--text-secondary)] text-xs">
                     Facinet Verification & Log
                  </div>
               </div>
           </div>
        </div>

        <div className="my-12" />

        {/* 5. COMPLIANCE & RISK */}
        <div className="space-y-12">
           <SectionHeading
                title="Compliance & Risk Model"
                description="Facinet supports compliance by design"
                icon={ShieldCheck}
                iconColor="text-[var(--accent)]"
           />

           <ComplianceGrid />

           {/* SOC 2 / ISO Mapping Table */}
           <div className="rounded-2xl border border-[var(--bg-border)] bg-[var(--glass-bg)]/[0.02] overflow-hidden">
               <div className="p-6 border-b border-[var(--bg-border)] bg-[var(--glass-subtle-bg)]">
                  <h3 className="font-mono font-bold text-[var(--text-primary)] flex items-center gap-2">
                     <ShieldCheck size={20} className="text-[var(--accent)]"/>
                     SOC 2 / ISO Control Mapping
                  </h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--glass-subtle-bg)] text-[var(--text-tertiary)] font-mono uppercase text-xs">
                       <tr>
                          <th className="px-6 py-4">Control Area</th>
                          <th className="px-6 py-4">Facinet Mechanism</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--bg-border)] text-[var(--text-secondary)] font-body">
                       {[
                         ["CC6.1 – Logical Access", "Facilitator keys controlled by institution"],
                         ["CC7.2 – Change Management", "Deterministic execution logic, no manual overrides"],
                         ["CC7.3 – Incident Response", "Automated fallback, no operator intervention"],
                         ["CC8.1 – Audit Logging", "Immutable execution logs on Facinet Chain"],
                         ["A.9 – Access Control (ISO)", "Role-based facilitator permissions"],
                         ["A.12 – Operational Security", "SLA-based failure handling"],
                         ["A.14 – System Integrity", "On-chain verification & proofs"]
                       ].map(([control, mech], i) => (
                          <tr key={i} className="hover:bg-[var(--bg-raised)]">
                             <td className="px-6 py-4 font-mono font-bold text-[var(--text-primary)]">{control}</td>
                             <td className="px-6 py-4">{mech}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        <div className="my-12" />

        {/* 6. REGULATED USE CASES */}
        <div className="space-y-12">
           <SectionHeading
                title="Regulated Use Cases"
                description="Enterprise & Government Applications"
                icon={Building2}
                iconColor="text-[var(--accent)]"
           />
            <UseCasesGrid />
        </div>

        {/* 7. CTA / SUMMARY */}
        <div className="mt-20 p-8 md:p-16 rounded-3xl bg-gradient-to-b from-[var(--glass-subtle-bg)] to-[var(--bg-void)] border border-[var(--bg-border)] text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
            <div className="max-w-3xl mx-auto space-y-6 relative z-10">
               <h2 className="text-3xl md:text-5xl font-bold font-display text-[var(--text-primary)] uppercase tracking-tight">
                  <span className="text-[var(--text-tertiary)]">Control stays internal.</span><br/>
                  Execution is verifiable.<br/>
                  <span className="text-[var(--accent)]">Risk is bounded by code.</span>
               </h2>
               <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                  <button className="px-8 py-4 rounded-full bg-[var(--accent)] text-white font-bold font-mono uppercase hover:bg-white hover:text-[var(--bg-void)] transition-all duration-300">
                     Run Institutional Facilitator
                  </button>
                  <button className="px-8 py-4 rounded-full bg-transparent border border-[var(--bg-border)] text-[var(--text-secondary)] font-bold font-mono uppercase hover:bg-white hover:text-[var(--bg-void)] hover:border-white transition-all duration-300">
                     Request Compliance Brief
                  </button>
               </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent)]/20 blur-[120px] rounded-full pointer-events-none" />
        </div>

      </div>
    </div>
  )
}
