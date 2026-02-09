"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Terminal } from "lucide-react"

export function RunFacilitatorSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          <span className="text-gradient">Run</span> a Facilitator
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Follow these steps to deploy your own facilitator node and start earning rewards
        </p>
      </div>

      <Card className="p-6 bg-card border-border/40">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                1
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Install Dependencies</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Make sure you have Node.js 18+ and Docker installed on your system
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                2
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Clone Repository</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Get the facilitator node software from our GitHub repository
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                3
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Configure & Stake</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set up your configuration file and stake the minimum required tokens
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                4
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Deploy & Monitor</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start your node and monitor its performance through the dashboard
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="bash" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="bash">Bash</TabsTrigger>
              <TabsTrigger value="docker">Docker</TabsTrigger>
              <TabsTrigger value="nodejs">Node.js</TabsTrigger>
            </TabsList>

            <TabsContent value="bash" className="space-y-4">
              <Card className="p-4 bg-black/50 border-border/40">
                <div className="flex items-start gap-3">
                  <Terminal className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <pre className="text-sm text-primary/90 font-mono overflow-x-auto">
                    <code>{`# Clone the repository
git clone https://github.com/facinet/facilitator-node.git
cd facilitator-node

# Install dependencies
npm install

# Configure your node
cp .env.example .env
nano .env

# Start the facilitator
npm run start`}</code>
                  </pre>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="docker" className="space-y-4">
              <Card className="p-4 bg-black/50 border-border/40">
                <div className="flex items-start gap-3">
                  <Terminal className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <pre className="text-sm text-primary/90 font-mono overflow-x-auto">
                    <code>{`# Pull the Docker image
docker pull facinet/facilitator:latest

# Run the container
docker run -d \\
  --name facinet-facilitator \\
  -p 8080:8080 \\
  -e STAKE_AMOUNT=10000 \\
  -e NETWORK_ID=mainnet \\
  facinet/facilitator:latest`}</code>
                  </pre>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="nodejs" className="space-y-4">
              <Card className="p-4 bg-black/50 border-border/40">
                <div className="flex items-start gap-3">
                  <Terminal className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <pre className="text-sm text-primary/90 font-mono overflow-x-auto">
                    <code>{`// index.js
const { Facilitator } = require('@facinet/sdk');

const facilitator = new Facilitator({
  networkId: 'mainnet',
  stakeAmount: 10000,
  region: 'us-east-1',
  port: 8080
});

await facilitator.initialize();
await facilitator.start();

console.log('Facilitator running!');`}</code>
                  </pre>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}
