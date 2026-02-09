import { Card } from "@/components/ui/card"
import { DocsPager } from "@/components/docs/docs-pager"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Coins, TrendingUp, AlertTriangle } from "lucide-react"

export default function FacilitatorStakingPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Staking & Rewards</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Facilitators must stake AVAX to participate in the network, ensuring security and honest behavior.
      </p>

      <div className="grid md:grid-cols-3 gap-4 not-prose mb-12">
        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <h3 className="font-semibold mb-2">Honest behavior</h3>
          <p className="text-sm text-muted-foreground">Slashing disincentivizes malicious acts</p>
        </Card>
        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <h3 className="font-semibold mb-2">Resistance to spam</h3>
          <p className="text-sm text-muted-foreground">Requires capital commitment</p>
        </Card>
        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <h3 className="font-semibold mb-2">Priority routing</h3>
          <p className="text-sm text-muted-foreground">Higher stake = more tasks</p>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Minimum Stake</h2>

      <Alert className="mb-12 border-primary/20 bg-primary/5">
        <Coins className="h-5 w-5" />
        <AlertDescription>
          Current testnet minimum: <strong>100 AVAX</strong>
        </AlertDescription>
      </Alert>

      <h2 className="text-2xl font-bold mb-6">Rewards</h2>

      <p className="text-muted-foreground mb-4">Facilitators earn:</p>

      <div className="not-prose space-y-3 mb-8">
        <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Task routing fees</span>
          </div>
        </Card>
        <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Capability matching bonuses</span>
          </div>
        </Card>
        <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Network uptime rewards</span>
          </div>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Slashing</h2>

      <Alert className="mb-6 border-destructive/20 bg-destructive/5">
        <AlertTriangle className="h-5 w-5" />
        <AlertDescription>
          <strong>Slashable Offenses:</strong>
        </AlertDescription>
      </Alert>

      <ul className="text-muted-foreground mb-6">
        <li>Invalid signatures</li>
        <li>Prolonged downtime while active</li>
        <li>Incorrect routing or spoofed receipts</li>
      </ul>

      <p className="text-muted-foreground">→ Verified slashing events result in partial or full stake loss.</p>

      <DocsPager 
        prev={{ title: "Configuration", href: "/docs/facilitator/config" }}
        next={{ title: "Monitoring", href: "/docs/facilitator/monitoring" }}
      />
    </div>
  )
}
