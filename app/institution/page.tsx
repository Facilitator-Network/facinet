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
  <div className="relative w-full p-8 md:p-12 rounded-3xl bg-black/40 border border-white/10 overflow-hidden group">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
    
    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-center">
      {/* Institution Box */}
      <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative">
        <div className="absolute -top-3 left-6 px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-[10px] font-mono text-blue-300 uppercase tracking-widest">
          Institution Perimeter
        </div>
        <div className="flex flex-col gap-4 mt-2">
           <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <LayoutDashboard className="text-white/60" size={20} />
              <span className="text-sm font-mono text-white">Inst. Application</span>
           </div>
           <ArrowDown className="text-white/20 mx-auto" size={16} />
           <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-3 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Building2 className="text-blue-400" size={20} />
              <span className="text-sm font-mono text-white font-bold">Owned Facilitator</span>
           </div>
           <ArrowDown className="text-white/20 mx-auto" size={16} />
           <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-3">
              <Scale className="text-purple-400" size={20} />
              <div className="flex flex-col">
                <span className="text-sm font-mono text-white font-bold">Policy Engine</span>
                <span className="text-[10px] text-white/40">SLA Checks</span>
              </div>
           </div>
        </div>
      </div>

      {/* Connection Arrows */}
      <div className="flex md:flex-col gap-24 items-center justify-center">
         {/* Success Path */}
         <div className="flex items-center gap-2">
            <div className="h-0.5 w-8 md:w-16 bg-green-500/30" />
            <span className="text-[10px] font-mono text-green-400 uppercase bg-green-500/10 px-2 py-0.5 rounded">SLA Met</span>
            <ArrowRight className="text-green-500/50" size={16} />
         </div>
         
         {/* Fail Path */}
         <div className="flex items-center gap-2">
            <div className="h-0.5 w-8 md:w-16 bg-red-500/30" />
            <span className="text-[10px] font-mono text-red-400 uppercase bg-red-500/10 px-2 py-0.5 rounded">Fallback</span>
            <ArrowRight className="text-red-500/50" size={16} />
         </div>
      </div>

      {/* External/Facinet Box */}
      <div className="flex-1 flex flex-col gap-8">
         {/* Settlement */}
         <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Globe className="text-green-400" size={24} />
               <div className="flex flex-col">
                  <span className="text-sm font-mono text-white font-bold">Settlement Chain</span>
                  <span className="text-[10px] text-white/50">Funds Moved</span>
               </div>
            </div>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
         </div>

         {/* Distributed Facilitator */}
         <div className="p-6 rounded-2xl bg-white/5 border border-white/10 border-dashed relative">
             <div className="absolute -top-3 left-6 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-[10px] font-mono text-red-300 uppercase tracking-widest">
                Fallback Layer
             </div>
             <div className="flex items-center gap-3 mt-2">
               <Network className="text-white/60" size={24} />
               <div className="flex flex-col">
                  <span className="text-sm font-mono text-white">Distributed Network</span>
                  <span className="text-[10px] text-white/40">Public Facilitators</span>
               </div>
             </div>
             {/* Path to Settlement */}
             <div className="absolute -top-6 right-8 h-8 w-0.5 bg-white/10" />
             <ArrowDown className="absolute -top-[10px] right-[29px] text-white/20" size={12} />
         </div>
      </div>
    </div>
    
    {/* Bottom Layer: Facinet Chain */}
    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center">
       <div className="w-full max-w-2xl p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center gap-4 text-white/40">
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
        color: "text-blue-400"
      },
      { 
        title: "Separation of Duties", 
        desc: "Settlement chains move funds. Facilitators execute. Facinet verifies.",
        icon: Scale,
        color: "text-purple-400"
      },
      { 
        title: "Objective Accountability", 
        desc: "Slashing applies only to provable faults (invalid txs, false claims).",
        icon: ShieldCheck,
        color: "text-green-400"
      },
      { 
        title: "Immutable Audit Trail", 
        desc: "All executions and fallback events are logged on-chain.",
        icon: FileText,
        color: "text-yellow-400"
      }
   ];

   return (
      <div className="grid md:grid-cols-2 gap-4">
         {items.map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
               <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                     <item.icon size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold font-mono text-white uppercase tracking-tight mb-2">{item.title}</h3>
                     <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
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
            <div key={i} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all">
                <div className="mb-6 p-4 rounded-2xl bg-white/5 inline-block group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                   <c.icon size={32} />
                </div>
                <h3 className="text-xl font-bold font-mono text-white uppercase tracking-tight mb-6">{c.title}</h3>
                <ul className="space-y-3">
                   {c.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-white/60">
                         <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
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
    <div className="relative py-8 md:py-12 space-y-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. HERO HEADER */}
        {/* 1. HERO HEADER */}
        <div className="relative space-y-6 max-w-5xl">
          {/* Background Highlight */}
          <div className="absolute -top-24 -left-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
             <div className="flex items-center gap-3 text-primary mb-4">
                <div className="h-px w-12 bg-primary" />
                <span className="text-sm font-mono uppercase tracking-widest text-primary font-bold">Enterprise & Regulation</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-bold font-mono text-white uppercase tracking-tight">
               Institutional & <br className="hidden md:block"/> 
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">Regulated</span>{' '}
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Execution</span>
             </h1>
             <p className="text-xl text-white/50 max-w-3xl font-light leading-relaxed">
                Enterprise-grade facilitator execution with <span className="text-white">compliance</span>, <span className="text-white">verifiability</span>, and guaranteed <span className="text-white">decentralized fallback</span>.
             </p>
             
             {/* Hero Badges */}
             <div className="flex flex-wrap gap-3 mt-8">
                {['Audit-Ready Architecture', 'Compliance-First Design', 'Non-Custodial'].map((tag, i) => (
                   <div key={i} className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono uppercase tracking-wider text-white/70">
                      {tag}
                   </div>
                ))}
             </div>
          </div>
        </div>

        <div className="py-24 flex items-center justify-center">
           <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* 2. VALUE PROP & INTRODUCTION */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
               <h2 className="text-3xl font-bold font-mono text-white uppercase tracking-tight">
                  <span className="text-primary">Internal Control.</span> <br />
                  Decentralized Reliability.
               </h2>
               <p className="text-white/60 text-lg leading-relaxed">
                  Facinet enables banks, regulated AI platforms, and public institutions to run <strong>institution-owned facilitators</strong> for X402 and crypto payments, while retaining <strong>automatic, policy-driven fallback</strong> to a decentralized facilitator network.
               </p>
               <p className="text-white/60 text-lg leading-relaxed">
                  This model preserves <strong>control, auditability, and governance</strong>, without introducing custody risk or discretionary execution.
               </p>
            </div>
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
               <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-6">What This Enables</h3>
               <ul className="space-y-4">
                  {[
                     "Institution-owned facilitators by default",
                     "SLA-based automated fallback",
                     "No custody of funds",
                     "Objective, on-chain accountability",
                     "Full audit trail across all executions"
                  ].map((item, i) => (
                     <li key={i} className="flex items-center gap-3 text-white">
                        <CheckCircle2 className="text-primary" size={20} />
                        <span className="font-light">{item}</span>
                     </li>
                  ))}
               </ul>
            </div>
        </div>

        <div className="py-24 flex items-center justify-center">
           <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* 3. ARCHITECTURE DIAGRAM */}
        <div className="space-y-8">
           <SectionHeading 
                title="High-Level Architecture"
                description="Bank-Style Integration with Fallback"
                icon={Network}
                iconColor="text-primary"
           />
           <ArchitectureDiagram />
        </div>

        <div className="py-24 flex items-center justify-center">
           <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* 4. EXECUTION FLOW & POLICY */}
        <div className="grid lg:grid-cols-2 gap-12">
           {/* Policy Config */}
           <div className="space-y-8">
              <SectionHeading 
                   title="SLA & Policy"
                   description="Deterministic Configuration"
                   icon={FileText}
                   iconColor="text-yellow-500"
              />
              <p className="text-white/60 text-sm leading-relaxed">
                 Institutions define explicit execution policies. All fallback behavior is deterministic and auditable. Policies are enforced automatically—no manual overrides.
              </p>

              {/* SLA Table */}
              <div className="overflow-hidden rounded-2xl border border-white/10">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/40 font-mono uppercase text-xs">
                       <tr>
                          <th className="px-6 py-4">Policy Parameter</th>
                          <th className="px-6 py-4">Description</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/70">
                       {[
                         ["Execution Timeout", "Max time before fallback (e.g. 3s)"],
                         ["Gas Availability", "Minimum gas balance threshold"],
                         ["Chain Coverage", "Approved settlement chains"],
                         ["Facilitator Priority", "Private → Network"],
                         ["Fee Cap", "Max fallback fee per transaction"],
                         ["Retry Count", "Number of fallback attempts"]
                       ].map(([param, desc], i) => (
                          <tr key={i} className="hover:bg-white/[0.02]">
                             <td className="px-6 py-4 font-mono font-bold text-white">{param}</td>
                             <td className="px-6 py-4">{desc}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Logic Flow Visual */}
           <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-center space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
               
               <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest text-center mb-4">Execution Logic Path</h3>
               
               <div className="flex flex-col items-center gap-4 text-sm font-mono">
                  <div className="w-full max-w-xs p-3 text-center rounded-lg bg-white/10 border border-white/10 text-white">Payment Request</div>
                  <ArrowDown size={16} className="text-white/20" />
                  <div className="w-full max-w-xs p-3 text-center rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold">Institution Facilitator</div>
                  <ArrowDown size={16} className="text-white/20" />
                  
                  <div className="w-full max-w-xs p-4 text-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-white relative">
                      <div className="font-bold mb-1 text-purple-300">SLA Check</div>
                      <div className="text-[10px] text-white/50">Gas, Uptime, Latency</div>

                      {/* Branching */}
                      <div className="absolute top-full left-1/4 h-8 w-0.5 bg-green-500/30" />
                      <div className="absolute top-full right-1/4 h-8 w-0.5 bg-red-500/30" />
                  </div>

                  <div className="w-full max-w-xs flex justify-between gap-4 mt-4">
                     <div className="w-1/2 p-3 text-center rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                        <div className="font-bold">Pass</div>
                        Execute Internally
                     </div>
                     <div className="w-1/2 p-3 text-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        <div className="font-bold">Fail</div>
                        Trigger Fallback
                     </div>
                  </div>
                  
                  <ArrowDown size={16} className="text-white/20" />
                  <div className="w-full max-w-xs p-3 text-center rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs">
                     Facinet Verification & Log
                  </div>
               </div>
           </div>
        </div>

        <div className="py-24 flex items-center justify-center">
           <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* 5. COMPLIANCE & RISK */}
        <div className="space-y-12">
           <SectionHeading 
                title="Compliance & Risk Model"
                description="Facinet supports compliance by design"
                icon={ShieldCheck}
                iconColor="text-primary"
           />
           
           <ComplianceGrid />

           {/* SOC 2 / ISO Mapping Table */}
           <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
               <div className="p-6 border-b border-white/10 bg-white/5">
                  <h3 className="font-mono font-bold text-white flex items-center gap-2">
                     <ShieldCheck size={20} className="text-primary"/>
                     SOC 2 / ISO Control Mapping
                  </h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/40 font-mono uppercase text-xs">
                       <tr>
                          <th className="px-6 py-4">Control Area</th>
                          <th className="px-6 py-4">Facinet Mechanism</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/70">
                       {[
                         ["CC6.1 – Logical Access", "Facilitator keys controlled by institution"],
                         ["CC7.2 – Change Management", "Deterministic execution logic, no manual overrides"],
                         ["CC7.3 – Incident Response", "Automated fallback, no operator intervention"],
                         ["CC8.1 – Audit Logging", "Immutable execution logs on Facinet Chain"],
                         ["A.9 – Access Control (ISO)", "Role-based facilitator permissions"],
                         ["A.12 – Operational Security", "SLA-based failure handling"],
                         ["A.14 – System Integrity", "On-chain verification & proofs"]
                       ].map(([control, mech], i) => (
                          <tr key={i} className="hover:bg-white/[0.02]">
                             <td className="px-6 py-4 font-mono font-bold text-white/90">{control}</td>
                             <td className="px-6 py-4">{mech}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        <div className="py-24 flex items-center justify-center">
           <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* 6. REGULATED USE CASES */}
        <div className="space-y-12">
           <SectionHeading 
                title="Regulated Use Cases"
                description="Enterprise & Government Applications"
                icon={Building2}
                iconColor="text-primary"
           />
            <UseCasesGrid />
        </div>

        {/* 7. CTA / SUMMARY */}
        <div className="mt-20 p-8 md:p-16 rounded-3xl bg-gradient-to-b from-white/5 to-black border border-white/10 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="max-w-3xl mx-auto space-y-6 relative z-10">
               <h2 className="text-3xl md:text-5xl font-bold font-mono text-white uppercase tracking-tight">
                  <span className="text-white/40">Control stays internal.</span><br/>
                  Execution is verifiable.<br/>
                  <span className="text-primary">Risk is bounded by code.</span>
               </h2>
               <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                  <button className="px-8 py-4 rounded-full bg-white text-black font-bold font-mono uppercase hover:bg-white/90 transition-colors">
                     Run Institutional Facilitator
                  </button>
                  <button className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white font-bold font-mono uppercase hover:bg-white/10 transition-colors">
                     Request Compliance Brief
                  </button>
               </div>
            </div>
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        </div>

      </div>
    </div>
  )
}
