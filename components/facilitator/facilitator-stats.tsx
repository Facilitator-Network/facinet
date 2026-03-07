"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Activity, Coins, Globe, TrendingUp } from "lucide-react"

// COMMENTED: Hardcoded fake stats data removed
// const stats = [
//   {
//     icon: Activity,
//     label: "Active Facilitators",
//     value: "1,247",
//     change: "+12%",
//     trend: "up",
//   },
//   {
//     icon: Globe,
//     label: "Network Regions",
//     value: "42",
//     change: "+3",
//     trend: "up",
//   },
//   {
//     icon: Coins,
//     label: "Total Staked",
//     value: "12.5M",
//     change: "+8%",
//     trend: "up",
//   },
//   {
//     icon: TrendingUp,
//     label: "Avg. Rewards/Day",
//     value: "450",
//     change: "+15%",
//     trend: "up",
//   },
// ]

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
          <Card key={index} className="p-6 bg-card border-border/40 hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
