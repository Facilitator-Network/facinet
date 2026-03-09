"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"

interface Facilitator {
  id: string
  name: string
  facilitatorWallet: string
  paymentRecipient: string
  network: string
  status: string
  totalPayments: number
  createdAt?: string
}

export function FacilitatorTable() {
  const [facilitators, setFacilitators] = useState<Facilitator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch from real facilitator list API (Avalanche Fuji)
    fetch("/api/facilitator/list?network=avalanche-fuji")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.facilitators) {
          setFacilitators(data.facilitators)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-[var(--radius-lg)]">
        <div className="text-center text-[var(--text-secondary)] font-body">Loading facilitators...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-[var(--radius-lg)] overflow-hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight">Active Facilitators</h2>
        <p className="font-body text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mt-1">Real-time status of network nodes</p>
      </div>

      {facilitators.length === 0 ? (
        <div className="text-center text-[var(--text-secondary)] font-body py-8">No facilitators found</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--bg-border)] hover:bg-transparent">
                <TableHead className="font-body text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Name</TableHead>
                <TableHead className="font-body text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Wallet</TableHead>
                <TableHead className="font-body text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Network</TableHead>
                <TableHead className="font-body text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Payments</TableHead>
                <TableHead className="font-body text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilitators.map((facilitator, index) => (
                <TableRow
                  key={facilitator.id}
                  className="border-[var(--bg-border)] hover:bg-[var(--bg-raised)] transition-colors"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <TableCell className="font-body text-[0.875rem] font-medium text-[var(--text-primary)]">{facilitator.name}</TableCell>
                  <TableCell className="font-mono text-[0.8125rem] text-[var(--text-secondary)]">
                    {facilitator.facilitatorWallet
                      ? `${facilitator.facilitatorWallet.slice(0, 6)}...${facilitator.facilitatorWallet.slice(-4)}`
                      : '-'}
                  </TableCell>
                  <TableCell className="font-body text-[0.875rem] text-[var(--text-primary)]">{facilitator.network || 'avalanche-fuji'}</TableCell>
                  <TableCell className="font-body text-[0.875rem] text-[var(--accent)] font-medium">{facilitator.totalPayments || 0}</TableCell>
                  <TableCell>
                    <Badge
                      variant={facilitator.status === "active" ? "default" : "secondary"}
                      className={`capitalize font-mono text-[0.6875rem] ${
                        facilitator.status === "active"
                          ? "bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success-border)]"
                          : "bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--bg-border)]"
                      }`}
                    >
                      {facilitator.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
