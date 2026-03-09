"use client"

import { useState } from "react"
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
        <h2 className="text-3xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight mb-2">
          <span className="text-gradient">Deploy</span> in One Click
        </h2>
        <p className="text-[var(--text-secondary)] font-body leading-relaxed">
          Use our deployment wizard to quickly launch a facilitator node (placeholder UI)
        </p>
      </div>

      <div className="p-8 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-[var(--radius-xl)] max-w-2xl">
        {!deployed ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="node-name" className="font-body text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Node Name</Label>
              <Input id="node-name" placeholder="my-facilitator-node" className="bg-[var(--bg-void)] border-[var(--bg-border)] text-[var(--text-primary)] font-mono" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="font-body text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Region</Label>
              <Select defaultValue="us-east">
                <SelectTrigger id="region" className="bg-[var(--bg-void)] border-[var(--bg-border)] text-[var(--text-primary)] font-body">
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
              <Label htmlFor="stake" className="font-body text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Stake Amount (FSC)</Label>
              <Input id="stake" type="number" placeholder="10000" className="bg-[var(--bg-void)] border-[var(--bg-border)] text-[var(--text-primary)] font-mono" />
              <p className="text-xs text-[var(--text-tertiary)] font-body">Minimum stake: 10,000 FSC</p>
            </div>

            <Button
              onClick={handleDeploy}
              disabled={loading}
              className="w-full bg-[var(--accent)] text-[var(--bg-void)] hover:bg-[var(--accent-hover)] font-mono font-bold uppercase tracking-wider"
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
              <div className="glass-icon glass-icon-xl rounded-full bg-[var(--success-bg)] border-[var(--success-border)]">
                <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight">Deployment Successful!</h3>
              <p className="text-[var(--text-secondary)] font-body leading-relaxed">
                Your facilitator node is now running and will appear in the network list shortly.
              </p>
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => setDeployed(false)}
                className="bg-transparent border-[var(--bg-border)] text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)] font-mono uppercase tracking-wider"
              >
                Deploy Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
