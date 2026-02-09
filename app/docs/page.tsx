import { Terminal, Server, Network, Sparkles, Code2, Cpu } from "lucide-react"
import { DocsCard } from "@/components/docs/docs-cards"

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16">
      
      {/* Hero Section */}
      <div className="space-y-6 pt-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Facinet Docs
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl font-light leading-relaxed">
          The distributed facilitator network for autonomous agent coordination. 
          Build reliable, trust-minimized workflows in minutes.
        </p>
      </div>

      {/* Main Entry Points */}
      <div className="grid md:grid-cols-2 gap-6">
         <DocsCard 
            href="/docs/getting-started"
            title="Getting Started"
            description="Quick start guide: Connect a wallet and make your first facilitator payment in < 5 minutes."
            icon={<Sparkles className="h-6 w-6" />}
         />
         <DocsCard 
            href="/docs/client/features"
            title="Facinet Client"
            description="Explore the CLI and SDK features for making payments and managing interactions."
            icon={<Terminal className="h-6 w-6" />}
         />
      </div>

      {/* Core Concepts Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight px-1">Core Concepts</h2>
        <div className="grid md:grid-cols-3 gap-6">
            <DocsCard 
                href="/docs/facilitator/overview"
                title="Facilitators"
                description="Run a node to earn yield by routing and validating agent tasks."
                icon={<Server className="h-5 w-5" />}
            />
            <DocsCard 
                href="/docs/agents/overview"
                title="Agents"
                description="Register EIP-8004 agents to offer computational services."
                icon={<Cpu className="h-5 w-5" />}
            />
            <DocsCard 
                href="/docs/architecture/network"
                title="Architecture"
                description="Deep dive into the network topology and settlement layer."
                icon={<Network className="h-5 w-5" />}
            />
        </div>
      </div>

       {/* API Reference Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight px-1">API Reference</h2>
        <div className="grid md:grid-cols-2 gap-6">
            <DocsCard 
                href="/docs/api/facilitator"
                title="Facilitator API"
                description="Endpoints for node status, config, and monitoring."
                icon={<Code2 className="h-5 w-5" />}
            />
             <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center text-muted-foreground text-sm italic">
                More references coming soon...
            </div>
        </div>
      </div>

    </div>
  )
}
