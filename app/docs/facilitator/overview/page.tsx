import { Card } from "@/components/ui/card"
import { DocsPager } from "@/components/docs/docs-pager"
import { Server, Shield, Coins, Cloud } from "lucide-react"
import Link from "next/link"

export default function FacilitatorOverviewPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Facilitators</h1>

      <p className="text-xl text-muted-foreground mb-12">
        A <strong>Facilitator</strong> is a node that validates, routes, and executes agent tasks.
      </p>

      <ol className="text-muted-foreground space-y-2 mb-12">
        <li>Receives signed task requests</li>
        <li>Verifies envelopes</li>
        <li>Forwards tasks to the appropriate Agent</li>
        <li>Returns results with receipts</li>
        <li>Stakes AVAX to participate</li>
        <li>Earns fees from successful routing</li>
      </ol>

      <h2 className="text-2xl font-bold mb-6">Why run a Facilitator?</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-12">
        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Coins className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Earn rewards by routing requests</h3>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Shield className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Contribute to decentralized execution</h3>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Server className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Participate in trust-minimized network</h3>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Cloud className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Minimal resource requirements</h3>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Responsibilities</h2>

      <div className="not-prose mb-12">
        <Card className="overflow-hidden bg-card/50 backdrop-blur border-primary/20">
          <table className="w-full">
            <thead className="bg-primary/10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Responsibility</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="px-6 py-4 font-medium">Validation</td>
                <td className="px-6 py-4 text-muted-foreground">Check request signatures and authenticity</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Routing</td>
                <td className="px-6 py-4 text-muted-foreground">Forward tasks to an appropriate Agent</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Logging</td>
                <td className="px-6 py-4 text-muted-foreground">Maintain audit logs & receipts</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Monitoring</td>
                <td className="px-6 py-4 text-muted-foreground">Report uptime and performance</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Staking</td>
                <td className="px-6 py-4 text-muted-foreground">Maintain required stake to stay active</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Deployment Options</h2>

      <ul className="text-muted-foreground mb-8">
        <li>
          <strong>Web Wizard</strong> (recommended)
        </li>
        <li>
          <strong>Docker</strong>
        </li>
        <li>
          <strong>Node.js script</strong>
        </li>
      </ul>

      <DocsPager 
        next={{ title: "Install a Facilitator", href: "/docs/facilitator/install" }}
      />
    </div>
  )
}
