import { Card } from "@/components/ui/card"
import { DetailedArchitectureDiagram, HighLevelArchitectureDiagram } from "@/components/docs/architecture-diagrams"
import { DocsPager } from "@/components/docs/docs-pager"
import { Server, Grid, Workflow, Database, Link as LinkIcon } from "lucide-react"

export default function ArchitectureNetworkPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Network Architecture</h1>

      <p className="text-xl text-muted-foreground mb-12">
        The Facinet network topology consists of five key stakeholders working in unison.
      </p>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-16">
        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Grid className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Clients</h3>
          <p className="text-muted-foreground text-sm">Submit signed tasks and pay fees.</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Workflow className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Facilitators</h3>
          <p className="text-muted-foreground text-sm">Validate envelopes, route tasks, and return results.</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Server className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Agents</h3>
          <p className="text-muted-foreground text-sm">Execute computational workloads and generate proofs.</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Database className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Registry</h3>
          <p className="text-muted-foreground text-sm">Stores agent discovery metadata.</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <LinkIcon className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Chain</h3>
          <p className="text-muted-foreground text-sm">Verifies receipts and handles staking / settlements.</p>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">High-Level Flow</h2>
      <HighLevelArchitectureDiagram />

      <h2 className="text-2xl font-bold mb-6 mt-12">Detailed Architecture</h2>
      <p className="text-muted-foreground mb-8">
        A deep dive into the interactions between Client SDK, API layers, and the Blockchain.
      </p>
      <DetailedArchitectureDiagram />

      <h2 className="text-2xl font-bold mb-6 mt-12">Data Flow Summary</h2>

      <ol className="text-muted-foreground space-y-2 mb-12">
        <li>Client signs request envelope</li>
        <li>Facilitator validates & forwards envelope</li>
        <li>Agent executes logic</li>
        <li>Chain confirms execution receipt</li>
        <li>Facilitator sends proof back to Client</li>
      </ol>
      
      <DocsPager 
        next={{ title: "Request Lifecycle", href: "/docs/architecture/flow" }}
      />
    </div>
  )
}
