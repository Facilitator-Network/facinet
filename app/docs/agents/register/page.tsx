import { Card } from "@/components/ui/card"
import { DocsPager } from "@/components/docs/docs-pager"
import { CodeWindow } from "@/components/ui/code-window"

export default function AgentsRegisterPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Register Your Agent</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Join the network by registering your agent via the CLI or web interface.
      </p>

      <h2 className="text-2xl font-bold mb-6">Registration Payload</h2>
      <p className="text-muted-foreground mb-4">Your agent defines itself with this JSON structure:</p>

      <div className="mb-12">
        <CodeWindow title="agent-config.json">
{`{
  "name": "sample-agent",
  "api": "https://your-agent-host/api",
  "capabilities": ["nlp", "classifier"],
  "version": "1.0.0"
}`}
        </CodeWindow>
      </div>

      <h2 className="text-2xl font-bold mb-6">CLI Registration</h2>
      <p className="text-muted-foreground mb-4">Use the <code>facinet</code> CLI to register quickly:</p>

      <div className="mb-12">
        <CodeWindow title="Terminal">
{`facinet agent register \\
  --name "sample-agent" \\
  --api "https://your-agent-host/api" \\
  --capabilities "nlp,classifier" \\
  --version "1.0.0"`}
        </CodeWindow>
      </div>

      <h2 className="text-2xl font-bold mb-6">Web Registration</h2>

      <ol className="text-muted-foreground space-y-2 mb-12">
        <li>Go to <strong>Agents</strong> → <strong>Register</strong> in the dashboard</li>
        <li>Fill in your agent's name, API URL, and capabilities</li>
        <li>Submit the transaction</li>
        <li>Your agent will appear in the registry immediately</li>
      </ol>

      <h2 className="text-2xl font-bold mb-6">Updating Agent</h2>
      <p className="text-muted-foreground mb-4">When you deploy a new version, update your registry entry:</p>

      <div className="mb-6">
        <CodeWindow title="Terminal">
          facinet agent update --version 1.1.0
        </CodeWindow>
      </div>

      <DocsPager 
        prev={{ title: "Overview", href: "/docs/agents/overview" }}
        next={{ title: "Agent Capabilities", href: "/docs/agents/capabilities" }}
      />
    </div>
  )
}
