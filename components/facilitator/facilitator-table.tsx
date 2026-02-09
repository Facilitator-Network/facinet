"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"

interface Facilitator {
  id: string
  name: string
  stake: string
  uptime: string
  lastSeen: string
  region: string
  rewards: string
  status: "active" | "inactive"
}

export function FacilitatorTable() {
  const [facilitators, setFacilitators] = useState<Facilitator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch from mock API
    fetch("/api/facilitators")
      .then((res) => res.json())
      .then((data) => {
        setFacilitators(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">Loading facilitators...</div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-card border-border/40 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Active Facilitators</h2>
        <p className="text-sm text-muted-foreground mt-1">Real-time status of network nodes</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Stake</TableHead>
              <TableHead className="text-muted-foreground">Uptime</TableHead>
              <TableHead className="text-muted-foreground">Last Seen</TableHead>
              <TableHead className="text-muted-foreground">Region</TableHead>
              <TableHead className="text-muted-foreground">Rewards</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facilitators.map((facilitator, index) => (
              <TableRow
                key={facilitator.id}
                className="border-border/40 hover:bg-muted/30 transition-colors"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <TableCell className="font-medium text-foreground">{facilitator.name}</TableCell>
                <TableCell className="text-muted-foreground">{facilitator.stake}</TableCell>
                <TableCell className="text-muted-foreground">{facilitator.uptime}</TableCell>
                <TableCell className="text-muted-foreground">{facilitator.lastSeen}</TableCell>
                <TableCell className="text-muted-foreground">{facilitator.region}</TableCell>
                <TableCell className="text-primary font-medium">{facilitator.rewards}</TableCell>
                <TableCell>
                  <Badge variant={facilitator.status === "active" ? "default" : "secondary"} className="capitalize">
                    {facilitator.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
