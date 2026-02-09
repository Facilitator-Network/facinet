import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DocsPager } from "@/components/docs/docs-pager"
import { CodeWindow } from "@/components/ui/code-window"

export default function APIFacilitatorPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Facilitator API</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Interact with facilitator nodes to submit obligations.
      </p>

      <div className="space-y-12">
        <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 rounded-md px-2 py-1 font-mono">POST</Badge>
                <span className="font-mono text-xl">/task</span>
            </h2>
            <p className="text-muted-foreground mb-4">Submit a signed task envelope for routing.</p>
            
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-sm font-bold mb-2 uppercase tracking-widest text-muted-foreground">Request</h3>
                    <CodeWindow title="Body">
{`{
  "envelope": "0xabc123...",
  "payload": { 
    "type": "inference",
    "prompt": "Hello world" 
  }
}`}
                    </CodeWindow>
                </div>
                <div>
                     <h3 className="text-sm font-bold mb-2 uppercase tracking-widest text-muted-foreground">Response</h3>
                    <CodeWindow title="JSON">
{`{
  "taskId": "xyz-123",
  "status": "queued",
  "eta": 1200
}`}
                    </CodeWindow>
                </div>
            </div>
        </section>

        <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-md px-2 py-1 font-mono">GET</Badge>
                <span className="font-mono text-xl">/task/:id</span>
            </h2>
            <p className="text-muted-foreground mb-4">Poll for task status and results.</p>
        </section>

        <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-md px-2 py-1 font-mono">GET</Badge>
                <span className="font-mono text-xl">/facilitator/health</span>
            </h2>
            <p className="text-muted-foreground mb-4">Simple health check endpoint for monitoring uptime.</p>
        </section>
      </div>

      <DocsPager 
        prev={{ title: "Agents API", href: "/docs/api/agents" }}
        next={{ title: "Event Streams", href: "/docs/api/events" }}
      />
    </div>
  )
}
