"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Star } from "lucide-react"

interface Agent {
  id: string
  name: string
  capabilities: string[]
  apiEndpoint: string
  reputation: number
  version: string
  category: string
  description: string
}

export function AgentsList() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => {
        setAgents(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">Loading agents...</div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Registered Agents</h2>
        <Badge variant="secondary" className="text-xs">
          {agents.length} Total
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {agents.map((agent, index) => (
          <Card
            key={agent.id}
            className="p-6 bg-card border-border/40 hover:border-primary/40 transition-all"
            style={{
              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
            }}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  v{agent.version}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < agent.reputation ? "fill-primary text-primary" : "text-muted"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{agent.reputation}.0</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((capability, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>

              <div className="pt-4 border-t border-border/40">
                <div className="text-xs text-muted-foreground mb-2">API Endpoint</div>
                <code className="text-xs bg-black/30 px-2 py-1 rounded text-primary/90 block overflow-x-auto">
                  {agent.apiEndpoint}
                </code>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                <Button size="sm" className="flex-1 bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90">
                  Connect
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
