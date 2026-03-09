"use client"

import { useEffect, useState } from "react"
import { Activity, Coins, Globe, TrendingUp } from "lucide-react"

export function FacilitatorStats() {
  const [stats, setStats] = useState([
    { icon: Activity, label: "Active Facilitators", value: "0" },
    { icon: Globe, label: "Networks Supported", value: "7" },
    { icon: Coins, label: "Total Payments Processed", value: "0" },
    { icon: TrendingUp, label: "Total Staked", value: "0 USDC" },
  ])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/network')
        const data = await response.json()
        if (data.success) {
          setStats([
            { icon: Activity, label: "Active Facilitators", value: String(data.stats.activeFacilitators) },
            { icon: Globe, label: "Networks Supported", value: "7" },
            { icon: Coins, label: "Total Payments Processed", value: String(data.stats.totalPayments) },
            { icon: TrendingUp, label: "Total Staked", value: data.stats.totalStakeAmount },
          ])
        }
      } catch (error) {
        console.error('Failed to fetch facilitator stats:', error)
        // On error, keep showing 0 values (not fake numbers)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="glass-subtle p-6 rounded-[var(--radius-xl)] hover:border-[var(--accent-muted)] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="glass-icon glass-icon-md">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="stat-number">{stat.value}</div>
                  <div className="stat-label mt-1">{stat.label}</div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
