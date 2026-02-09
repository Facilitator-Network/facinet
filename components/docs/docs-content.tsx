"use client"

import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Terminal, Info, AlertCircle } from "lucide-react"

export function DocsContent() {
  return (
    <div className="flex-1 max-w-4xl">
      <Card className="p-8 bg-card border-border/40 space-y-8">
        {/* Introduction */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-foreground">Getting Started</h1>
            <Badge variant="outline" className="text-xs">
              v1.0.0
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Welcome to the Facinet documentation. This guide will help you understand how to interact with the
            Distributed Facilitator Network and integrate your agents.
          </p>
        </div>

        {/* What is Facinet */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">What is Facinet?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Facinet is a distributed network of facilitators that enables autonomous agents to coordinate, transact,
            and exchange value in a trustless manner. Built on the EIP-8004 standard, Facinet provides the
            infrastructure layer for the agent economy.
          </p>

          <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm text-foreground">
              <strong>EIP-8004</strong> defines a standard interface for autonomous agents to interact with
              facilitators, ensuring interoperability across the network.
            </AlertDescription>
          </Alert>
        </div>

        {/* Key Features */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Key Features</h2>
          <ul className="space-y-3">
            <li className="flex gap-3 text-muted-foreground leading-relaxed">
              <span className="text-primary mt-1">•</span>
              <span>
                <strong className="text-foreground">Decentralized Coordination:</strong> No single point of failure or
                trusted intermediary
              </span>
            </li>
            <li className="flex gap-3 text-muted-foreground leading-relaxed">
              <span className="text-primary mt-1">•</span>
              <span>
                <strong className="text-foreground">Stake-based Security:</strong> Facilitators stake tokens to
                participate, ensuring network reliability
              </span>
            </li>
            <li className="flex gap-3 text-muted-foreground leading-relaxed">
              <span className="text-primary mt-1">•</span>
              <span>
                <strong className="text-foreground">Cryptographic Guarantees:</strong> All transactions are verified
                with zero-knowledge proofs
              </span>
            </li>
            <li className="flex gap-3 text-muted-foreground leading-relaxed">
              <span className="text-primary mt-1">•</span>
              <span>
                <strong className="text-foreground">Reward Mechanism:</strong> Facilitators earn rewards for maintaining
                uptime and security
              </span>
            </li>
          </ul>
        </div>

        {/* Quick Start */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Quick Start</h2>
          <p className="text-muted-foreground leading-relaxed">Get started with Facinet in three simple steps:</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">1. Install the SDK</h3>
              <Card className="p-4 bg-black/30 border-border/40">
                <div className="flex items-start gap-3">
                  <Terminal className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <pre className="text-sm text-primary/90 font-mono overflow-x-auto">
                    <code>npm install @fascinet/sdk</code>
                  </pre>
                </div>
              </Card>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">2. Initialize the Client</h3>
              <Card className="p-4 bg-black/30 border-border/40">
                <pre className="text-sm text-primary/90 font-mono overflow-x-auto leading-relaxed">
                  <code>{`import { FacinetClient } from '@fascinet/sdk';

const client = new FacinetClient({
  networkId: 'mainnet',
  apiKey: process.env.FASCINET_API_KEY
});

await client.connect();`}</code>
                </pre>
              </Card>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">3. Register Your Agent</h3>
              <Card className="p-4 bg-black/30 border-border/40">
                <pre className="text-sm text-primary/90 font-mono overflow-x-auto leading-relaxed">
                  <code>{`const agent = await client.registerAgent({
  name: 'my-trading-agent',
  capabilities: ['trading', 'arbitrage'],
  version: '1.0.0'
});

console.log('Agent registered:', agent.id);`}</code>
                </pre>
              </Card>
            </div>
          </div>
        </div>

        {/* System Requirements */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">System Requirements</h2>
          <p className="text-muted-foreground leading-relaxed">
            To run a facilitator node, your system should meet the following requirements:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 bg-card/50 border-border/40">
              <h3 className="text-sm font-semibold text-foreground mb-2">Minimum Requirements</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 4 CPU cores</li>
                <li>• 8 GB RAM</li>
                <li>• 100 GB SSD storage</li>
                <li>• 100 Mbps network</li>
              </ul>
            </Card>

            <Card className="p-4 bg-card/50 border-border/40">
              <h3 className="text-sm font-semibold text-foreground mb-2">Recommended Requirements</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 8 CPU cores</li>
                <li>• 16 GB RAM</li>
                <li>• 500 GB NVMe SSD</li>
                <li>• 1 Gbps network</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Important Notes */}
        <Alert className="bg-destructive/5 border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm text-foreground">
            <strong>Important:</strong> Always keep your private keys secure and never share them. Facilitators must
            maintain a minimum stake of 10,000 FSC to participate in the network.
          </AlertDescription>
        </Alert>

        {/* Next Steps */}
        <div className="space-y-4 pt-4 border-t border-border/40">
          <h2 className="text-2xl font-bold text-foreground">Next Steps</h2>
          <p className="text-muted-foreground leading-relaxed">Now that you have an overview, explore these topics:</p>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 bg-primary/5 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
              <h3 className="text-sm font-semibold text-foreground mb-1">Facilitator Setup</h3>
              <p className="text-xs text-muted-foreground">Learn how to deploy and configure your node</p>
            </Card>

            <Card className="p-4 bg-primary/5 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
              <h3 className="text-sm font-semibold text-foreground mb-1">Agent Registration</h3>
              <p className="text-xs text-muted-foreground">Implement EIP-8004 and register your agent</p>
            </Card>

            <Card className="p-4 bg-primary/5 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
              <h3 className="text-sm font-semibold text-foreground mb-1">API Reference</h3>
              <p className="text-xs text-muted-foreground">Complete API documentation and examples</p>
            </Card>

            <Card className="p-4 bg-primary/5 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
              <h3 className="text-sm font-semibold text-foreground mb-1">Architecture</h3>
              <p className="text-xs text-muted-foreground">Understand the system design and protocols</p>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
}
