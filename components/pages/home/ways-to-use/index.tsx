"use client"

import {
  Cpu,
  Code,
  Image,
  Store,
  Network,
  LucideIcon,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Cpu,
  Code,
  Image,
  Store,
  Network
}

interface WaysToUseSectionProps {
  data: {
    title: string
    description: string
    items: Array<{
      title: string
      description: string
      icon: string
    }>
  }
}

export function WaysToUseSection({ data }: WaysToUseSectionProps) {
  return (
    <section className="pt-24 pb-12 relative bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Column: Text Content List */}
          <div className="space-y-8 w-full">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] uppercase tracking-tight font-mono">
                {data.title}
              </h2>
              <p className="text-[var(--text-secondary)] max-w-xl font-body">
                {data.description}
              </p>
            </div>

            <div className="space-y-6">
              {data.items.map((item, index) => {
                const Icon = ICON_MAP[item.icon] || Code
                return (
                  <div key={index} className="flex gap-4 group">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 rounded bg-[var(--glass-subtle-bg)] flex items-center justify-center border border-[var(--glass-subtle-border)] group-hover:bg-[var(--glass-bg)] transition-colors">
                        <Icon className="h-4 w-4 text-[var(--accent)]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition-colors uppercase tracking-tight font-mono">
                        {item.title}
                      </h3>
                      <p className="text-[var(--text-secondary)] text-sm mt-1 font-body">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Dashboard Visual */}
          <div className="relative h-full min-h-[500px] rounded-2xl border border-[var(--bg-border)] bg-[var(--glass-bg)] backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--accent-muted)] rounded-full blur-[100px]" />

            <div className="relative z-10 flex flex-col gap-3 h-full">

              {/* Row 1: AI Agents + Pay-per-call */}
              <div className="flex gap-3 flex-1">
                {/* AI Agents — live metrics */}
                <div className="flex-1 p-4 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-subtle-bg)] backdrop-blur-md flex flex-col gap-3 hover:border-[var(--accent-muted)] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-[var(--glass-subtle-bg)] flex items-center justify-center border border-[var(--glass-subtle-border)]">
                      <Cpu className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <span className="text-[9px] font-mono text-[var(--success)] uppercase tracking-wider flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                      live
                    </span>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">AI Agents</div>
                    <div className="font-mono text-2xl font-bold text-[var(--text-primary)] tabular-nums">1,247</div>
                  </div>
                  <div className="flex gap-1 mt-auto">
                    {[40, 25, 55, 35, 65, 45, 70, 50, 60, 75, 55, 80].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-[var(--accent-muted)]" style={{ height: `${h}%`, minHeight: `${h * 0.4}px`, maxHeight: '32px' }} />
                    ))}
                  </div>
                </div>

                {/* API Calls — code snippet */}
                <div className="flex-1 p-4 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-subtle-bg)] backdrop-blur-md flex flex-col gap-3 hover:border-[var(--accent-muted)] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-[var(--glass-subtle-bg)] flex items-center justify-center border border-[var(--glass-subtle-border)]">
                      <Code className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">per-request</span>
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Pay-per-call</div>
                  <div className="bg-[var(--bg-code)] rounded-lg p-3 font-mono text-[10px] leading-relaxed flex-1 overflow-hidden">
                    <div><span className="text-[var(--syn-keyword)]">GET</span> <span className="text-[var(--text-secondary)]">/v1/weather</span></div>
                    <div className="text-[var(--syn-comment)]"># cost: 0.001 USDC</div>
                    <div className="mt-1.5"><span className="text-[var(--syn-keyword)]">200</span> <span className="text-[var(--success)]">OK</span></div>
                    <div className="text-[var(--text-tertiary)]">{"{"} temp: 72°F {"}"}</div>
                  </div>
                </div>
              </div>

              {/* Row 2: Cross-Chain full width */}
              <div className="p-4 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-subtle-bg)] backdrop-blur-md hover:border-[var(--accent-muted)] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[var(--glass-subtle-bg)] flex items-center justify-center border border-[var(--glass-subtle-border)]">
                      <Network className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <div className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Cross-chain settlement</div>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--accent)]">4 networks</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'ETH', latency: '12ms' },
                    { name: 'BASE', latency: '8ms' },
                    { name: 'AVAX', latency: '15ms' },
                    { name: 'POLY', latency: '11ms' },
                  ].map((chain) => (
                    <div key={chain.name} className="bg-[var(--bg-code)] rounded-lg px-3 py-2 flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-[var(--text-primary)]">{chain.name}</span>
                      <span className="font-mono text-[10px] text-[var(--success)] flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-[var(--success)]" />
                        {chain.latency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: Micropayments + Marketplace */}
              <div className="flex gap-3 flex-1">
                {/* Micropayments */}
                <div className="flex-1 p-4 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-subtle-bg)] backdrop-blur-md flex flex-col gap-3 hover:border-[var(--accent-muted)] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-[var(--glass-subtle-bg)] flex items-center justify-center border border-[var(--glass-subtle-border)]">
                      <Image className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">stream</span>
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Micropayments</div>
                  <div className="space-y-1.5 flex-1">
                    {['0.002 USDC → article', '0.005 USDC → image', '0.010 USDC → model'].map((tx, i) => (
                      <div key={i} className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-[var(--accent)]">$</span>
                        <span className="text-[var(--text-secondary)]">{tx}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marketplaces */}
                <div className="flex-1 p-4 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-subtle-bg)] backdrop-blur-md flex flex-col gap-3 hover:border-[var(--accent-muted)] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-[var(--glass-subtle-bg)] flex items-center justify-center border border-[var(--glass-subtle-border)]">
                      <Store className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">24/7</span>
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Marketplace</div>
                  <div className="space-y-2 flex-1">
                    {[
                      { label: 'Buyers', val: 312 },
                      { label: 'Sellers', val: 189 },
                      { label: 'Txns/hr', val: 847 },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-[var(--text-tertiary)]">{row.label}</span>
                        <span className="text-[var(--text-primary)] font-medium tabular-nums">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
