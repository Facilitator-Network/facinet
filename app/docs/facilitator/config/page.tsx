import { Card } from "@/components/ui/card"
import { DocsPager } from "@/components/docs/docs-pager"
import { CodeWindow } from "@/components/ui/code-window"

export default function FacilitatorConfigPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Facilitator Configuration</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Configure your node using environment variables.
      </p>

      <h2 className="text-2xl font-bold mb-6">Required Variables</h2>

      <div className="mb-12">
        <CodeWindow title=".env">
{`PRIVATE_KEY="your-private-key"
RPC_URL="https://api.avax.network/ext/bc/C/rpc"
STAKE_AMOUNT=100`}
        </CodeWindow>
      </div>

      <h2 className="text-2xl font-bold mb-6">Optional Variables</h2>

      <div className="not-prose mb-12">
        <Card className="overflow-hidden bg-card/50 backdrop-blur border-primary/20">
          <table className="w-full">
            <thead className="bg-primary/10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Variable</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="px-6 py-4 font-mono text-sm">LOG_LEVEL</td>
                <td className="px-6 py-4 text-muted-foreground">debug, info, error</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-sm">REGION</td>
                <td className="px-6 py-4 text-muted-foreground">displayed publicly in the registry</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-sm">HEARTBEAT_INTERVAL</td>
                <td className="px-6 py-4 text-muted-foreground">default: 10s</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Updating Configuration</h2>

      <p className="text-muted-foreground mb-4">After changes, restart your node:</p>

      <div className="mb-6">
        <CodeWindow title="Terminal">
          docker restart facinet-facilitator
        </CodeWindow>
      </div>

      <DocsPager 
        prev={{ title: "Installation", href: "/docs/facilitator/install" }}
        next={{ title: "Staking & Rewards", href: "/docs/facilitator/staking" }}
      />
    </div>
  )
}
