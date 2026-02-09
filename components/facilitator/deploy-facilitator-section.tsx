"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Rocket, CheckCircle2 } from "lucide-react"

export function DeployFacilitatorSection() {
  const [deployed, setDeployed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDeploy = () => {
    setLoading(true)
    // Simulate deployment
    setTimeout(() => {
      setLoading(false)
      setDeployed(true)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          <span className="text-gradient">Deploy</span> in One Click
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Use our deployment wizard to quickly launch a facilitator node (placeholder UI)
        </p>
      </div>

      <Card className="p-8 bg-card border-border/40 max-w-2xl">
        {!deployed ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="node-name">Node Name</Label>
              <Input id="node-name" placeholder="my-facilitator-node" className="bg-background" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select defaultValue="us-east">
                <SelectTrigger id="region" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east">US East</SelectItem>
                  <SelectItem value="us-west">US West</SelectItem>
                  <SelectItem value="eu-central">EU Central</SelectItem>
                  <SelectItem value="ap-southeast">AP Southeast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stake">Stake Amount (FSC)</Label>
              <Input id="stake" type="number" placeholder="10000" className="bg-background" />
              <p className="text-xs text-muted-foreground">Minimum stake: 10,000 FSC</p>
            </div>

            <Button
              onClick={handleDeploy}
              disabled={loading}
              className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90"
            >
              {loading ? (
                "Deploying..."
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy Facilitator
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Deployment Successful!</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your facilitator node is now running and will appear in the network list shortly.
              </p>
            </div>

            <div className="pt-4">
              <Button variant="outline" onClick={() => setDeployed(false)} className="bg-transparent">
                Deploy Another
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
