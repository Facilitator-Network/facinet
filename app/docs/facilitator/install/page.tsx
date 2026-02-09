import { Card } from "@/components/ui/card"
import { DocsPager } from "@/components/docs/docs-pager"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CodeWindow } from "@/components/ui/code-window"

export default function FacilitatorInstallPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Install a Facilitator</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Choose your preferred installation method to join the network.
      </p>

      <h2 className="text-2xl font-bold mb-6">1. Web Deployment (Recommended)</h2>

      <p className="text-muted-foreground mb-4">The easiest way to deploy a facilitator is through our browser UI.</p>

      <ol className="text-muted-foreground space-y-2 mb-6">
        <li>Connect your wallet</li>
        <li>Configure environment (RPC, stake amount)</li>
        <li>Upload credentials or auto-generate keys</li>
        <li>Deploy & monitor logs</li>
      </ol>

      <Alert className="mb-12 border-primary/20 bg-primary/5">
        <AlertDescription>This method packages everything into a managed container.</AlertDescription>
      </Alert>

      <h2 className="text-2xl font-bold mb-6">2. Docker Deployment</h2>

      <div className="mb-12">
        <CodeWindow title="Terminal">
{`docker run -d \\
  --name facinet-facilitator \\
  -e PRIVATE_KEY=$PRIVATE_KEY \\
  -e RPC_URL=$RPC_URL \\
  -e STAKE_AMOUNT=100 \\
  facinet/facilitator:latest`}
        </CodeWindow>
      </div>

      <h2 className="text-2xl font-bold mb-6">3. Node.js Deployment</h2>

      <div className="mb-12">
        <CodeWindow title="Terminal">
{`git clone https://github.com/facinet/facilitator
cd facilitator

cp .env.example .env
# Fill PRIVATE_KEY, RPC_URL, STAKE variables

npm install
npm run start`}
        </CodeWindow>
      </div>

      <h2 className="text-2xl font-bold mb-6">Verify Installation</h2>

      <p className="text-muted-foreground mb-4">Check logs:</p>

      <div className="mb-6">
        <CodeWindow title="Terminal">
          docker logs -f facinet-facilitator
        </CodeWindow>
      </div>

      <DocsPager 
        prev={{ title: "Overview", href: "/docs/facilitator/overview" }}
        next={{ title: "Configuration", href: "/docs/facilitator/config" }}
      />
    </div>
  )
}
