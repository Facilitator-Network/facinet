"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, ArrowRight, Users, Zap, Globe, RefreshCw, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"

// ── Interfaces ──────────────────────────────────────────────────────────────

interface NetworkStats {
  totalFacilitators: number
  activeFacilitators: number
  totalPaymentsProcessed: number
  networksSupported: number
  totalGasSaved: string
  lastUpdated: string
}

interface FacilitatorInfo {
  id: string
  name: string
  facilitatorWallet: string
  paymentRecipient: string
  createdBy: string
  status: "needs_funding" | "active" | "inactive"
  totalPayments: number
  lastUsed: number
  network: string
  chainId: number
}

interface ExplorerLog {
  id: string
  timestamp: number
  eventType: string
  facilitatorId?: string
  facilitatorName?: string
  txHash?: string
  chainName?: string
  amount?: string
  status: 'success' | 'failed' | 'pending'
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function truncateAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function relativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  return `${days} day${days !== 1 ? "s" : ""} ago`
}

function getEventBadgeStyle(eventType: string): string {
  switch (eventType) {
    case "facilitator_added":
      return "text-blue-400 bg-blue-500/10 border-blue-500/20"
    case "facilitator_activated":
      return "text-green-400 bg-green-500/10 border-green-500/20"
    case "transaction":
      return "text-purple-400 bg-purple-500/10 border-purple-500/20"
    case "status_changed":
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
    case "contract_execution":
      return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
    default:
      return "text-white/40 bg-white/5 border-white/10"
  }
}

function getEventLabel(eventType: string): string {
  switch (eventType) {
    case "facilitator_added":
      return "ADDED"
    case "facilitator_activated":
      return "ACTIVATED"
    case "transaction":
      return "TRANSACTION"
    case "status_changed":
      return "STATUS CHANGE"
    case "contract_execution":
      return "API EXECUTION"
    default:
      return eventType.replace(/_/g, " ").toUpperCase()
  }
}

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// ── Skeleton Components ─────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 animate-pulse">
      <div className="h-4 w-20 bg-white/10 rounded mb-4" />
      <div className="h-10 w-24 bg-white/10 rounded mb-2" />
      <div className="h-3 w-32 bg-white/5 rounded" />
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <div className="px-4 py-4 rounded-lg border border-white/5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 bg-white/10 rounded-full" />
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-4 w-24 bg-white/5 rounded ml-auto" />
      </div>
    </div>
  )
}

// ── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  sublabel,
  accentColor,
  index,
}: {
  icon: React.ElementType
  value: string
  label: string
  sublabel?: string
  accentColor: string
  index: number
}) {
  const colorMap: Record<string, string> = {
    green: "text-green-400 bg-green-500/10 border-green-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  }
  const colors = colorMap[accentColor] || colorMap.green

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 hover:border-white/20 transition-colors"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg border ${colors}`}>
          <Icon size={16} />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">{label}</span>
      </div>
      <div className="text-3xl md:text-4xl font-bold font-mono text-white tracking-tight">{value}</div>
      {sublabel && (
        <p className="text-xs font-mono text-white/30 mt-2 uppercase tracking-wider">{sublabel}</p>
      )}
    </motion.div>
  )
}

// ── Main Explorer Page (Dashboard + Explorer merged) ────────────────────────

export default function ExplorerPage() {
  const [stats, setStats] = useState<NetworkStats | null>(null)
  const [facilitators, setFacilitators] = useState<FacilitatorInfo[]>([])
  const [logs, setLogs] = useState<ExplorerLog[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [facilitatorsLoading, setFacilitatorsLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [facilitatorsError, setFacilitatorsError] = useState<string | null>(null)
  const [logsError, setLogsError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  // ── Data Fetching ───────────────────────────────────────────────────────

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      setStatsError(null)
      const response = await fetch("/api/stats/network")
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      } else {
        setStatsError(data.error || "Failed to load network stats")
      }
    } catch (err: unknown) {
      setStatsError(err instanceof Error ? err.message : "Failed to fetch network stats")
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchFacilitators = async () => {
    try {
      setFacilitatorsLoading(true)
      setFacilitatorsError(null)
      const response = await fetch("/api/facilitator/list?network=avalanche-fuji")
      const data = await response.json()
      if (data.success) {
        setFacilitators(data.facilitators || [])
      } else {
        setFacilitatorsError(data.error || "Failed to load facilitators")
      }
    } catch (err: unknown) {
      setFacilitatorsError(err instanceof Error ? err.message : "Failed to fetch facilitators")
    } finally {
      setFacilitatorsLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      setLogsLoading(true)
      setLogsError(null)
      const response = await fetch("/api/explorer/logs?limit=200")
      const data = await response.json()
      if (data.success) {
        setLogs(data.logs || [])
      } else {
        setLogsError(data.error || "Failed to load activity logs")
      }
    } catch (err: unknown) {
      setLogsError(err instanceof Error ? err.message : "Failed to fetch activity logs")
    } finally {
      setLogsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchFacilitators()
    fetchLogs()
  }, [])

  // Filter logs
  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.eventType === filter)

  return (
    <div className="relative py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 mb-16"
        >
          <div className="flex items-center gap-3 text-primary mb-4">
            <div className="h-px w-12 bg-primary" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-bold font-mono text-green-400 uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              LIVE
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-white uppercase tracking-tight">
            Network Dashboard
          </h1>
          <p className="text-xl text-white/50 max-w-none font-light leading-relaxed">
            Real-time network statistics, facilitator leaderboard, and transaction explorer
          </p>
        </motion.div>

        <div className="border-t border-white/5 mb-12" />

        {/* ── Stats Grid ───────────────────────────────────────────────── */}
        {statsError ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl p-8 text-center mb-12">
            <p className="text-red-400 font-mono text-sm mb-4">{statsError}</p>
            <button
              onClick={fetchStats}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs uppercase tracking-wider hover:bg-red-500/20 transition-colors"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[0, 1, 2, 3].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <StatCard
              icon={Users}
              value={String(stats.activeFacilitators)}
              label="Active Facilitators"
              sublabel="on Avalanche Fuji"
              accentColor="green"
              index={0}
            />
            <StatCard
              icon={Activity}
              value={String(stats.totalPaymentsProcessed)}
              label="Payments Processed"
              accentColor="blue"
              index={1}
            />
            <StatCard
              icon={Zap}
              value={`${stats.totalGasSaved} AVAX`}
              label="Gas Saved for Users"
              sublabel="Users paid zero gas"
              accentColor="purple"
              index={2}
            />
            <StatCard
              icon={Globe}
              value={String(stats.networksSupported)}
              label="Chains Supported"
              sublabel="via Facinet SDK"
              accentColor="cyan"
              index={3}
            />
          </div>
        ) : null}

        {/* ── Facilitator Leaderboard ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary" />
              <h2 className="text-lg font-bold font-mono text-white uppercase tracking-wider">
                Facilitator Leaderboard
              </h2>
            </div>
            <button
              onClick={fetchFacilitators}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 font-mono text-[10px] uppercase tracking-wider hover:bg-white/10 hover:text-white/60 transition-colors"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>

          {facilitatorsError ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl p-8 text-center">
              <p className="text-red-400 font-mono text-sm mb-4">{facilitatorsError}</p>
              <button
                onClick={fetchFacilitators}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs uppercase tracking-wider hover:bg-red-500/20 transition-colors"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : facilitatorsLoading ? (
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 rounded-t-lg border border-white/10 font-mono text-xs text-white/40 uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Wallet</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Payments</div>
                <div className="col-span-1">Network</div>
              </div>
              {[0, 1, 2].map((i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          ) : facilitators.length > 0 ? (
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 rounded-t-lg border border-white/10 font-mono text-xs text-white/40 uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Wallet</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Payments</div>
                <div className="col-span-1">Network</div>
              </div>

              {facilitators.map((facilitator, index) => (
                <React.Fragment key={facilitator.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                    className="hidden md:grid grid-cols-12 gap-4 px-4 py-4 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-colors items-center"
                  >
                    <div className="col-span-1 font-mono text-sm text-white/60">#{index + 1}</div>
                    <div className="col-span-3 font-mono text-sm text-white/90 truncate">{facilitator.name}</div>
                    <div className="col-span-3 font-mono text-xs text-white/40">{truncateAddress(facilitator.facilitatorWallet)}</div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border ${
                        facilitator.status === "active"
                          ? "text-green-400 bg-green-500/10 border-green-500/20"
                          : "text-white/30 bg-white/5 border-white/10"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${facilitator.status === "active" ? "bg-green-500" : "bg-white/20"}`} />
                        {facilitator.status}
                      </span>
                    </div>
                    <div className="col-span-2 font-mono text-sm text-white/70">{facilitator.totalPayments}</div>
                    <div className="col-span-1 font-mono text-[10px] text-white/30 uppercase">
                      {facilitator.network?.replace("avalanche-", "").replace("ethereum-", "").replace("base-", "").replace("polygon-", "") || "fuji"}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                    className="md:hidden p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white/40">#{index + 1}</span>
                        <span className="font-mono text-sm text-white/90">{facilitator.name}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border ${
                        facilitator.status === "active"
                          ? "text-green-400 bg-green-500/10 border-green-500/20"
                          : "text-white/30 bg-white/5 border-white/10"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${facilitator.status === "active" ? "bg-green-500" : "bg-white/20"}`} />
                        {facilitator.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Wallet</div>
                      <div className="text-xs text-white/50 font-mono">{truncateAddress(facilitator.facilitatorWallet)}</div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="text-xs text-white/50 font-mono">{facilitator.totalPayments} payments</div>
                      <div className="text-[10px] text-white/30 font-mono uppercase">{facilitator.network || "avalanche-fuji"}</div>
                    </div>
                  </motion.div>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-12 text-center">
              <Users size={32} className="mx-auto text-white/20 mb-4" />
              <p className="text-white/40 font-mono text-sm mb-2">No facilitators registered yet. Be the first.</p>
              <Link
                href="/facilitator"
                className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono text-xs uppercase tracking-wider hover:bg-primary/20 transition-colors"
              >
                Deploy a Facilitator
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </motion.div>

        {/* ── Recent Activity (from dashboard) ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary" />
              <h2 className="text-lg font-bold font-mono text-white uppercase tracking-wider">
                Recent Activity
              </h2>
            </div>
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 font-mono text-[10px] uppercase tracking-wider hover:bg-white/10 hover:text-white/60 transition-colors"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>

          {logsError ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl p-8 text-center">
              <p className="text-red-400 font-mono text-sm mb-4">{logsError}</p>
              <button
                onClick={fetchLogs}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs uppercase tracking-wider hover:bg-red-500/20 transition-colors"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : logsLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-2">
              {logs.slice(0, 10).map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.04, duration: 0.3 }}
                  className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 px-4 py-3 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2 md:w-32 shrink-0">
                    <Clock size={12} className="text-white/20" />
                    <span className="text-xs text-white/40 font-mono">{relativeTime(log.timestamp)}</span>
                  </div>
                  <div className="md:w-36 shrink-0">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border ${getEventBadgeStyle(log.eventType)}`}>
                      {getEventLabel(log.eventType)}
                    </span>
                  </div>
                  <div className="flex-1 font-mono text-sm text-white/70 truncate">
                    {log.facilitatorName || log.facilitatorId?.slice(0, 16) || "Network"}
                  </div>
                  <div className="shrink-0">
                    {log.txHash ? (
                      <a
                        href={`https://testnet.snowtrace.io/tx/${log.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-mono transition-colors"
                      >
                        {truncateAddress(log.txHash)}
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-xs text-white/20 font-mono">--</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-12 text-center">
              <Activity size={32} className="mx-auto text-white/20 mb-4" />
              <p className="text-white/40 font-mono text-sm">No activity yet. Network is waiting for its first transaction.</p>
            </div>
          )}
        </motion.div>

        {/* ── Network Info ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 md:p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-primary" />
            <h2 className="text-lg font-bold font-mono text-white uppercase tracking-wider">
              Network Info
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Settlement Chain</div>
              <div className="text-sm font-mono text-white/80">Avalanche Fuji (Chain ID: 43113)</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">USDC Contract</div>
              <div className="text-xs font-mono text-white/60 break-all">0x5425890298aed601595a70AB815c96711a31Bc65</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Protocol</div>
              <div className="text-sm font-mono text-white/80">x402 (HTTP 402 Payment Required)</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">SDK</div>
              <div className="text-sm font-mono text-white/80">
                <code className="px-2 py-1 rounded bg-white/5 border border-white/10 text-primary text-xs">
                  npm install facinet-sdk
                </code>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="border-t border-white/5 mb-12" />

        {/* ── Full Explorer Logs ────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-primary" />
            <h2 className="text-lg font-bold font-mono text-white uppercase tracking-wider">
              Explorer Logs
            </h2>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {['all', 'facilitator_added', 'facilitator_activated', 'status_changed', 'contract_execution'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider whitespace-nowrap transition-colors ${
                  filter === filterType
                    ? 'bg-primary text-black'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {filterType === 'all' ? 'All Events' : getEventLabel(filterType)}
              </button>
            ))}
          </div>

          {/* Logs Table */}
          <div className="space-y-4">
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 rounded-t-lg border border-white/10 font-mono text-xs text-white/40 uppercase tracking-wider">
              <div className="col-span-2">Time</div>
              <div className="col-span-3">Event Type</div>
              <div className="col-span-3">Facilitator</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Details</div>
            </div>

            <div className="space-y-2">
              {logsLoading ? (
                <div className="text-center py-12 text-white/40">Loading logs...</div>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    {/* Desktop Row */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-4 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-colors items-center">
                      <div className="col-span-2 text-xs text-white/60 font-mono">
                        {formatTimestamp(log.timestamp)}
                      </div>
                      <div className="col-span-3">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border ${getEventBadgeStyle(log.eventType)}`}>
                          {getEventLabel(log.eventType)}
                        </span>
                      </div>
                      <div className="col-span-3 text-sm text-white/80 font-mono truncate">
                        {log.facilitatorName || log.facilitatorId?.slice(0, 12) || 'Network'}
                      </div>
                      <div className="col-span-2">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                          log.status === 'success'
                            ? 'text-green-400 bg-green-500/10'
                            : log.status === 'failed'
                            ? 'text-red-400 bg-red-500/10'
                            : 'text-yellow-400 bg-yellow-500/10'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        {log.txHash && (
                          <a
                            href={`https://testnet.snowtrace.io/tx/${log.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 justify-end"
                          >
                            View TX <ArrowRight size={12} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Mobile Card */}
                    <div className="md:hidden p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-3">
                       <div className="flex items-center justify-between">
                          <span className={`inline-flex px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border ${getEventBadgeStyle(log.eventType)}`}>
                            {getEventLabel(log.eventType)}
                          </span>
                          <span className="text-[10px] text-white/40 font-mono">{formatTimestamp(log.timestamp)}</span>
                       </div>

                       <div className="space-y-1">
                          <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Facilitator</div>
                          <div className="text-sm text-white/80 font-mono truncate">
                             {log.facilitatorName || log.facilitatorId?.slice(0, 12) || 'Network'}
                          </div>
                       </div>

                       <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2">
                             <div className="text-[10px] text-white/30 font-mono uppercase">Status</div>
                             <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                log.status === 'success'
                                  ? 'text-green-400 bg-green-500/10'
                                  : log.status === 'failed'
                                  ? 'text-red-400 bg-red-500/10'
                                  : 'text-yellow-400 bg-yellow-500/10'
                             }`}>
                               {log.status}
                             </span>
                          </div>
                          {log.txHash && (
                            <a
                              href={`https://testnet.snowtrace.io/tx/${log.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
                            >
                              TX <ArrowRight size={10} />
                            </a>
                          )}
                       </div>
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <div className="text-center py-12 text-white/40">
                  No logs found
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
