"use client"

import React from 'react'
import {
  User,
  Server,
  Code2,
  ShieldCheck,
  Coins,
  Activity,
  Zap,
  Network,
  PenTool,
  ChevronDown,
  BookOpen,
  Star,
  AlertTriangle,
  Wallet,
  FileCheck,
  ArrowDown,
} from 'lucide-react'

/* ---- Icon node ---- */
function Node({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ElementType
  label: string
  sub: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      <div className="w-10 h-10 rounded-full border border-white/15 bg-white/5 flex items-center justify-center">
        <Icon size={18} className="text-white/70" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/80">{label}</div>
        <div className="text-[8px] font-mono text-white/40 mt-0.5">{sub}</div>
      </div>
    </div>
  )
}

/* ---- Vertical connector ---- */
function Connector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-px h-6 bg-white/10" />
      <ChevronDown size={10} className="text-white/20 -mt-0.5" />
    </div>
  )
}

/* ---- Phase header ---- */
function Phase({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 mb-4">
      <div className="h-px flex-1 bg-white/5" />
      <div className="w-5 h-5 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[9px] font-mono font-bold text-white/60">
        {n}
      </div>
      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-white/50">{label}</span>
      <div className="h-px flex-1 bg-white/5" />
    </div>
  )
}

export function SystemArchitectureDiagram() {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="p-6 md:p-8 space-y-1">

        {/* ── STEP 1: REQUEST ── */}
        <Phase n={1} label="Request" />
        <div className="flex items-start justify-center gap-6 sm:gap-10">
          <Node icon={User} label="User" sub="Initiates request" />
          <Node icon={Code2} label="Vendor" sub="Returns 402" />
          <Node icon={PenTool} label="Sign" sub="ERC-3009 auth" />
        </div>

        <Connector />

        {/* ── STEP 2: SELECT ── */}
        <Phase n={2} label="Selection" />
        <div className="flex items-start justify-center gap-6 sm:gap-10">
          <Node icon={Network} label="SDK" sub="Selection API" />
          <Node icon={ShieldCheck} label="Engine" sub="Stake + reputation" />
          <Node icon={Server} label="Primary" sub="Executes settle" />
          <Node icon={Server} label="Backup" sub="Failover only" />
        </div>

        <Connector />

        {/* ── STEP 3: SETTLE ── */}
        <Phase n={3} label="Settlement" />
        <div className="flex items-start justify-center gap-6 sm:gap-10">
          <Node icon={Coins} label="C-Chain" sub="Payment settled" />
          <Node icon={Wallet} label="Vendor Fee" sub="Preferred chain" />
          <Node icon={Zap} label="Gas" sub="Reimburse failover" />
        </div>

        <Connector />

        {/* ── STEP 4: LEDGER ── */}
        <Phase n={4} label="Ledger" />
        <div className="flex items-start justify-center gap-6 sm:gap-10">
          <Node icon={FileCheck} label="Record" sub="Hash + proof" />
          <Node icon={Activity} label="Track" sub="Monitor activity" />
          <Node icon={Star} label="Reputation" sub="Score updates" />
          <Node icon={AlertTriangle} label="Slash" sub="Objective faults" />
        </div>

      </div>
    </div>
  )
}
