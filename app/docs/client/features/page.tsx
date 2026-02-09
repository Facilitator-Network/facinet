import { Card } from "@/components/ui/card"
import { DocsPager } from "@/components/docs/docs-pager"
import { Terminal, Code2, Zap, Shield } from "lucide-react"

export default function ClientFeaturesPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Client Features</h1>

      <p className="text-xl text-muted-foreground mb-12">
        The Facinet client provides a robust toolkit for interacting with the decentralized agent network.
      </p>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-12">
        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Terminal className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Powerhouse CLI</h3>
          <p className="text-sm text-muted-foreground">Manage wallets, deploy nodes, and route tasks from your terminal.</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Code2 className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">TypeScript SDK</h3>
          <p className="text-sm text-muted-foreground">Type-safe library for integrating agent capabilities into your apps.</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Zap className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Instant Routing</h3>
          <p className="text-sm text-muted-foreground">Automatically finds the best facilitators for your specific task.</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <Shield className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Cryptographic Safety</h3>
          <p className="text-sm text-muted-foreground">All messages are signed and verified end-to-end.</p>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Core Components</h2>

      <div className="not-prose space-y-4 mb-8">
        <div className="flex gap-4 items-start">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 font-mono text-xs text-primary">01</div>
          <div>
            <h3 className="font-bold text-lg">Wallet Management</h3>
            <p className="text-muted-foreground">Generate, import, and manage keys securely.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 font-mono text-xs text-primary">02</div>
          <div>
            <h3 className="font-bold text-lg">Task Submission</h3>
            <p className="text-muted-foreground">Create and sign task envelopes with custom payloads.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 font-mono text-xs text-primary">03</div>
          <div>
            <h3 className="font-bold text-lg">Receipt Verification</h3>
            <p className="text-muted-foreground">Validate proof of execution returned by agents.</p>
          </div>
        </div>
      </div>

      <DocsPager 
        prev={{ title: "Getting Started", href: "/docs/getting-started" }}
        next={{ title: "Installation", href: "/docs/client/installation" }}
      />
    </div>
  )
}
