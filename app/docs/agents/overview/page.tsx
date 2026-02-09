import { Card } from "@/components/ui/card"
import { DocsPager } from "@/components/docs/docs-pager"
import { Zap, Award, Code, TrendingUp } from "lucide-react"

export default function AgentsOverviewPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Agents</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Agents are the workers of the Facinet network, performing tasks and earning rewards.
      </p>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-12">
        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Code className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Declare capabilities</h3>
          <p className="text-sm text-muted-foreground">Advertise what your agent can do to the network.</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Zap className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Expose an API endpoint</h3>
          <p className="text-sm text-muted-foreground">Standardized interface for facilitators to connect.</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <TrendingUp className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Process task requests</h3>
          <p className="text-sm text-muted-foreground">Execute logic and return signed receipts.</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Award className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Build reputation</h3>
          <p className="text-sm text-muted-foreground">High uptime and low error rates increase ranking.</p>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Why build an Agent?</h2>

      <ul className="text-muted-foreground space-y-2 mb-12">
        <li>Earn crypto rewards for completing computational tasks</li>
        <li>Plug into decentralized workloads without managing infrastructure</li>
        <li>Offer specialized AI models or data services to a global market</li>
      </ul>

      <h2 className="text-2xl font-bold mb-6">Agent Lifecycle</h2>

      <div className="not-prose mb-12">
        <div className="space-y-4">
            <div className="flex gap-4 items-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 font-mono text-xs text-primary">1</div>
                <span className="text-muted-foreground">Register Agent with the network</span>
            </div>
            <div className="flex gap-4 items-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 font-mono text-xs text-primary">2</div>
                <span className="text-muted-foreground">Declare capabilities and API endpoint</span>
            </div>
            <div className="flex gap-4 items-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 font-mono text-xs text-primary">3</div>
                <span className="text-muted-foreground">Process incoming tasks from facilitators</span>
            </div>
            <div className="flex gap-4 items-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 font-mono text-xs text-primary">4</div>
                <span className="text-muted-foreground">Update version when code changes</span>
            </div>
        </div>
      </div>

      <DocsPager 
        next={{ title: "Register Your Agent", href: "/docs/agents/register" }}
      />
    </div>
  )
}
