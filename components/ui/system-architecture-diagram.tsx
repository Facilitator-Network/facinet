"use client"

import React from 'react'
import {
  User,
  Server,
  Code2,
  ShieldCheck,
  ArrowDown,
  Repeat,
  FileCheck,
  Coins,
  Activity,
  AlertTriangle,
  Zap,
  Network,
  PenTool,
  ChevronDown,
} from 'lucide-react'

/* ---- Animated dot that travels along a line ---- */
function AnimDot({ color, vertical = false, delay = 0 }: { color: string; vertical?: boolean; delay?: number }) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        width: 5,
        height: 5,
        backgroundColor: color,
        boxShadow: `0 0 8px 2px ${color}`,
        animation: `${vertical ? 'dotDown' : 'dotRight'} 2.4s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  )
}

/* ---- Horizontal connector with animated dot ---- */
function HLine({ color = 'var(--accent)', delay = 0 }: { color?: string; delay?: number }) {
  return (
    <div className="relative w-10 h-px shrink-0 hidden sm:block" style={{ backgroundColor: `color-mix(in oklch, ${color} 25%, transparent)` }}>
      <AnimDot color={color} delay={delay} />
    </div>
  )
}

/* ---- Vertical connector with animated dot + chevron ---- */
function VLine({ color = 'var(--accent)', delay = 0 }: { color?: string; delay?: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-px h-8 overflow-hidden" style={{ backgroundColor: `color-mix(in oklch, ${color} 25%, transparent)` }}>
        <AnimDot color={color} vertical delay={delay} />
      </div>
      <ChevronDown size={12} style={{ color }} className="opacity-50 -mt-0.5" />
    </div>
  )
}

/* ---- Step badge ---- */
function Step({ n, color = 'var(--accent)' }: { n: number; color?: string }) {
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold text-white shrink-0"
      style={{ backgroundColor: color }}
    >
      {n}
    </div>
  )
}

/* ---- Compact node chip ---- */
function Chip({
  icon: Icon,
  label,
  sub,
  color = 'var(--accent)',
  bg = 'var(--accent-subtle)',
  border = 'var(--accent-muted)',
  pulse = false,
  dashed = false,
}: {
  icon: React.ElementType
  label: string
  sub?: string
  color?: string
  bg?: string
  border?: string
  pulse?: boolean
  dashed?: boolean
}) {
  return (
    <div
      className={`relative flex items-center gap-2 px-3 py-2 rounded-lg ${dashed ? 'border-dashed' : ''} border transition-all duration-200 hover:brightness-110`}
      style={{ backgroundColor: bg, borderColor: border }}
    >
      {pulse && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
        </span>
      )}
      <Icon size={14} style={{ color }} className="shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] font-mono font-semibold uppercase tracking-wider truncate" style={{ color }}>{label}</div>
        {sub && <div className="text-[8px] font-mono text-[var(--text-tertiary)] truncate">{sub}</div>}
      </div>
    </div>
  )
}

/* ---- Phase label ---- */
function PhaseLabel({ step, text, color = 'var(--accent)' }: { step: number; text: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <Step n={step} color={color} />
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color }}>{text}</span>
      <div className="flex-1 h-px bg-[var(--bg-border)] opacity-30" />
    </div>
  )
}

/* ---- Tag pill (for accountability section) ---- */
function Tag({ icon: Icon, label, color = 'var(--accent)' }: { icon: React.ElementType; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)]">
      <Icon size={10} style={{ color }} />
      <span className="text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">{label}</span>
    </div>
  )
}

export function SystemArchitectureDiagram() {
  return (
    <div className="w-full rounded-2xl bg-[var(--glass-bg)] border border-[var(--bg-border)] overflow-hidden relative">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* CSS keyframes */}
      <style jsx>{`
        @keyframes dotRight {
          0% { left: -3px; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: calc(100% - 2px); opacity: 0; }
        }
        @keyframes dotDown {
          0% { top: -3px; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: calc(100% - 2px); opacity: 0; }
        }
      `}</style>

      <div className="relative z-10 p-5 md:p-7 space-y-4">

        {/* ── STEP 1: REQUEST ── */}
        <div>
          <PhaseLabel step={1} text="Request" />
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Chip icon={User} label="User / Agent" sub="Initiates request" color="var(--text-secondary)" bg="var(--glass-subtle-bg)" border="var(--bg-border)" />
            <HLine />
            <Chip icon={Code2} label="Vendor" sub="Returns X402 payload" color="var(--accent)" bg="var(--accent-subtle)" border="var(--accent-muted)" />
            <HLine color="var(--warning)" delay={0.3} />
            <Chip icon={PenTool} label="Sign Approval" sub="Off-chain ERC-3009" color="var(--warning)" bg="var(--warning-bg)" border="var(--warning-border)" />
          </div>
        </div>

        <VLine />

        {/* ── STEP 2: SELECT ── */}
        <div>
          <PhaseLabel step={2} text="Facilitator Selection" />
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Chip icon={Network} label="Facinet SDK" sub="Calls Selection API" color="var(--accent)" bg="var(--accent-subtle)" border="var(--accent-muted)" pulse />
            <HLine delay={0.5} />
            <Chip icon={ShieldCheck} label="Selection Engine" sub="Stake + Reputation" color="var(--accent)" bg="var(--accent-subtle)" border="var(--accent-muted)" dashed />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2 max-w-lg">
            <div className="flex flex-col items-center">
              <VLine color="var(--success)" delay={0.2} />
              <Chip icon={Server} label="Primary" sub="Executes settlement" color="var(--success)" bg="var(--success-bg)" border="var(--success-border)" pulse />
            </div>
            <div className="flex flex-col items-center">
              <VLine color="var(--warning)" delay={0.6} />
              <Chip icon={Server} label="Backup" sub="Failover only" color="var(--warning)" bg="var(--warning-bg)" border="var(--warning-border)" dashed />
            </div>
          </div>
        </div>

        <VLine color="var(--success)" delay={0.4} />

        {/* ── STEP 3: SETTLE ── */}
        <div>
          <PhaseLabel step={3} text="Settlement" color="var(--success)" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Chip icon={Coins} label="Avalanche C-Chain" sub="Payment settled" color="var(--success)" bg="var(--success-bg)" border="var(--success-border)" pulse />
            <Chip icon={Coins} label="Vendor Fee" sub="Preferred chain" color="var(--accent)" bg="var(--accent-subtle)" border="var(--accent-muted)" />
            <Chip icon={Zap} label="Gas Contract" sub="Reimburse on failover" color="var(--warning)" bg="var(--warning-bg)" border="var(--warning-border)" />
          </div>
        </div>

        <VLine delay={0.8} />

        {/* ── STEP 4: LEDGER ── */}
        <div>
          <PhaseLabel step={4} text="Ledger" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-muted)]">
            <div className="flex items-center gap-2.5">
              <FileCheck size={16} className="text-[var(--accent)] shrink-0" />
              <div>
                <div className="text-[11px] font-mono font-bold text-[var(--accent)] uppercase tracking-wider">Facinet Chain</div>
                <div className="text-[8px] text-[var(--text-tertiary)] font-mono">txHash &middot; amount &middot; fee &middot; chain &middot; proof</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag icon={Activity} label="Track" color="var(--accent)" />
              <Tag icon={Repeat} label="Reputation" color="var(--success)" />
              <Tag icon={AlertTriangle} label="Slash" color="var(--error)" />
            </div>
          </div>
          <div className="text-center mt-1.5">
            <span className="text-[8px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest opacity-60">Objective faults only</span>
          </div>
        </div>

      </div>
    </div>
  )
}
