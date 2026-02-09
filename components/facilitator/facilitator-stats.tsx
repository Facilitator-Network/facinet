"use client"

import { Card } from "@/components/ui/card"
import { Activity, Coins, Globe, TrendingUp } from "lucide-react"

export function FacilitatorStats() {
  const stats = [
    {
      icon: Activity,
      label: "Active Facilitators",
      value: "1,247",
      change: "+12%",
      trend: "up",
    },
    {
      icon: Globe,
      label: "Network Regions",
      value: "42",
      change: "+3",
      trend: "up",
    },
    {
      icon: Coins,
      label: "Total Staked",
      value: "12.5M",
      change: "+8%",
      trend: "up",
    },
    {
      icon: TrendingUp,
      label: "Avg. Rewards/Day",
      value: "450",
      change: "+15%",
      trend: "up",
    },
  ]

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
              <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">{stat.change}</div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
