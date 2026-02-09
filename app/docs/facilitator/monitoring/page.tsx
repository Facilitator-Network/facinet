import { Card } from "@/components/ui/card"
import { DocsPager } from "@/components/docs/docs-pager"
import { Activity, BarChart3, Server } from "lucide-react"

export default function FacilitatorMonitoringPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Monitoring Your Facilitator</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Keep track of your facilitator's performance, uptime, and rewards.
      </p>

      <h2 className="text-2xl font-bold mb-6">Key Metrics</h2>

      <div className="grid md:grid-cols-3 gap-4 not-prose mb-12">
        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Activity className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Uptime</h3>
          <p className="text-muted-foreground text-sm">Monitor your node availability</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <BarChart3 className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Tasks Routed</h3>
          <p className="text-muted-foreground text-sm">Track successful task routing</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Server className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Rewards Earned</h3>
          <p className="text-muted-foreground text-sm">View accumulated earnings</p>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Monitoring Dashboard</h2>

      <p className="text-muted-foreground mb-6">
        Access your facilitator dashboard at the Facilitators page to view real-time statistics and performance metrics.
      </p>

      <h2 className="text-2xl font-bold mb-6">Health Checks</h2>

      <p className="text-muted-foreground mb-4">Your facilitator exposes health endpoints for monitoring:</p>

      <ul className="text-muted-foreground">
        <li>
          <code>/health</code> - Basic health status
        </li>
        <li>
          <code>/metrics</code> - Detailed performance metrics (Prometheus)
        </li>
        <li>
          <code>/status</code> - Current operational status
        </li>
      </ul>

      <DocsPager 
        prev={{ title: "Staking & Rewards", href: "/docs/facilitator/staking" }}
      />
    </div>
  )
}
