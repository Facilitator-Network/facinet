import { Badge } from "@/components/ui/badge"
import { DocsPager } from "@/components/docs/docs-pager"
import { CodeWindow } from "@/components/ui/code-window"

export default function APIAgentsPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Agents API</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Manage agent lifecycle via standard REST endpoints.
      </p>

      <div className="space-y-12">
        <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-md px-2 py-1 font-mono">GET</Badge>
                <span className="font-mono text-xl">/agents</span>
            </h2>
            <p className="text-muted-foreground mb-4">Returns a list of all registered agents.</p>
            <CodeWindow title="Response">
{`[
  {
    "id": "agent_123",
    "name": "image-gen-v1",
    "capabilities": ["image-generation"],
    "version": "1.0.0"
  }
]`}
            </CodeWindow>
        </section>

        <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 rounded-md px-2 py-1 font-mono">POST</Badge>
                <span className="font-mono text-xl">/agents/register</span>
            </h2>
            <p className="text-muted-foreground mb-4">Registers a new agent with the network.</p>
            <CodeWindow title="Request Body">
{`{
  "name": "my-agent",
  "api": "https://api.my-agent.com",
  "capabilities": ["nlp"],
  "signature": "0xabc..."
}`}
            </CodeWindow>
        </section>

        <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 rounded-md px-2 py-1 font-mono">PATCH</Badge>
                <span className="font-mono text-xl">/agents/:id</span>
            </h2>
            <p className="text-muted-foreground mb-4">Updates agent metadata or version.</p>
        </section>
      </div>

      <DocsPager 
        next={{ title: "Facilitator API", href: "/docs/api/facilitator" }}
      />
    </div>
  )
}
