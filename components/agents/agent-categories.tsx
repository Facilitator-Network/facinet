"use client"

import { Card } from "@/components/ui/card"
import { Bot, Coins, Database, Globe, Lock, Zap } from "lucide-react"

export function AgentCategories() {
  const categories = [
    {
      icon: Zap,
      name: "Trading",
      count: 45,
      color: "text-neon-blue",
    },
    {
      icon: Database,
      name: "Data",
      count: 32,
      color: "text-neon-purple",
    },
    {
      icon: Globe,
      name: "Oracle",
      count: 28,
      color: "text-neon-pink",
    },
    {
      icon: Lock,
      name: "Security",
      count: 19,
      color: "text-neon-blue",
    },
    {
      icon: Coins,
      name: "DeFi",
      count: 54,
      color: "text-neon-purple",
    },
    {
      icon: Bot,
      name: "Utility",
      count: 38,
      color: "text-neon-pink",
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Browse by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => {
          const Icon = category.icon
          return (
            <Card
              key={index}
              className="p-4 bg-card border-border/40 hover:border-primary/40 transition-all cursor-pointer hover:scale-105"
            >
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="p-3 rounded-lg bg-card-foreground/5">
                    <Icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{category.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{category.count} agents</div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
