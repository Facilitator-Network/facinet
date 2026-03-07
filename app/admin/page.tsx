"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { CheckCircle2, XCircle, Clock, Users, ShieldCheck, RefreshCw, Mail } from "lucide-react"

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || ''

interface WhitelistApplication {
  name: string
  email: string
  wallet: string
  appliedAt: string
  approvedAt?: string
  approvedBy?: string
}

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const isAdmin = address?.toLowerCase() === ADMIN_WALLET.toLowerCase()

  const [pending, setPending] = useState<WhitelistApplication[]>([])
  const [approved, setApproved] = useState<WhitelistApplication[]>([])
  const [stats, setStats] = useState({ pendingCount: 0, approvedCount: 0 })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = async () => {
    if (!address || !isAdmin) return
    setLoading(true)
    try {
      const res = await fetch(`/api/whitelist/pending?admin=${address}`)
      const data = await res.json()
      if (data.success) {
        setPending(data.pending || [])
        setApproved(data.approved || [])
        setStats(data.stats || { pendingCount: 0, approvedCount: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch whitelist data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) fetchData()
  }, [address, isAdmin])

  const handleApprove = async (wallet: string) => {
    setActionLoading(wallet)
    try {
      const res = await fetch('/api/whitelist/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, admin: address }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchData()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      alert('Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (wallet: string) => {
    if (!confirm('Reject this application?')) return
    setActionLoading(wallet)
    try {
      const res = await fetch('/api/whitelist/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, admin: address }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchData()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      alert('Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <ShieldCheck className="w-16 h-16 text-white/20 mx-auto" />
          <h1 className="text-3xl font-bold font-mono text-white uppercase tracking-tight">Admin Access</h1>
          <p className="text-white/40 font-mono text-sm">Connect admin wallet to continue</p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="w-16 h-16 text-red-400/50 mx-auto" />
          <h1 className="text-3xl font-bold font-mono text-white uppercase tracking-tight">Unauthorized</h1>
          <p className="text-white/40 font-mono text-sm">This page is restricted to admin wallets only.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative py-8 md:py-12 space-y-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-primary mb-4">
            <div className="h-px w-12 bg-primary" />
            <span className="text-sm font-mono uppercase tracking-widest text-primary font-bold">Admin Panel</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl md:text-5xl font-bold font-mono text-white uppercase tracking-tight">
              Whitelist Manager
            </h1>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <div className="p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-yellow-400" size={20} />
              <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Pending</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400 font-mono">{stats.pendingCount}</div>
          </div>
          <div className="p-6 rounded-xl border border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="text-green-400" size={20} />
              <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Approved</span>
            </div>
            <div className="text-3xl font-bold text-green-400 font-mono">{stats.approvedCount}</div>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-white/60" size={20} />
              <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Total</span>
            </div>
            <div className="text-3xl font-bold text-white font-mono">{stats.pendingCount + stats.approvedCount}</div>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="space-y-6 mb-16">
          <h2 className="text-xl font-bold font-mono text-white uppercase tracking-tight flex items-center gap-2">
            <Clock size={18} className="text-yellow-400" />
            Pending Applications
          </h2>

          {loading ? (
            <div className="text-center py-12 text-white/40 font-mono">Loading...</div>
          ) : pending.length === 0 ? (
            <div className="p-8 rounded-xl border border-white/5 bg-white/[0.02] text-center">
              <p className="text-white/40 font-mono text-sm">No pending applications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((app) => (
                <div key={app.wallet} className="p-5 rounded-xl border border-yellow-500/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold font-mono">{app.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                          Pending
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-mono text-white/40">
                        <span className="flex items-center gap-1"><Mail size={12} /> {app.email}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="break-all">{app.wallet}</span>
                      </div>
                      <div className="text-[10px] font-mono text-white/20">
                        Applied: {new Date(app.appliedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(app.wallet)}
                        disabled={actionLoading === app.wallet}
                        className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-mono font-bold uppercase tracking-wider hover:bg-green-500/30 disabled:opacity-50 transition-colors"
                      >
                        {actionLoading === app.wallet ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(app.wallet)}
                        disabled={actionLoading === app.wallet}
                        className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold uppercase tracking-wider hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-mono text-white uppercase tracking-tight flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-400" />
            Approved Wallets
          </h2>

          {approved.length === 0 ? (
            <div className="p-8 rounded-xl border border-white/5 bg-white/[0.02] text-center">
              <p className="text-white/40 font-mono text-sm">No approved wallets yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {approved.map((app) => (
                <div key={app.wallet} className="p-4 rounded-xl border border-green-500/10 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold font-mono text-sm">{app.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-green-500/20 text-green-400 border border-green-500/20">
                        Approved
                      </span>
                    </div>
                    <div className="text-xs font-mono text-white/40">{app.email} · {app.wallet}</div>
                  </div>
                  <div className="text-[10px] font-mono text-white/20">
                    {app.approvedAt ? new Date(app.approvedAt).toLocaleString() : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
