import { DocsPager } from "@/components/docs/docs-pager"
import { Badge } from "@/components/ui/badge"
import { CodeWindow } from "@/components/ui/code-window"

export default function APIEventsPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Event Streams</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Subscribe to real-time WebSocket events from facilitators.
      </p>

      <h2 className="text-2xl font-bold mb-6">Topic Examples</h2>

      <div className="flex flex-wrap gap-2 not-prose mb-12">
        <Badge variant="secondary" className="px-3 py-1 font-mono">task.received</Badge>
        <Badge variant="secondary" className="px-3 py-1 font-mono">task.forwarded</Badge>
        <Badge variant="secondary" className="px-3 py-1 font-mono">task.completed</Badge>
        <Badge variant="secondary" className="px-3 py-1 font-mono">agent.updated</Badge>
        <Badge variant="secondary" className="px-3 py-1 font-mono">stake.changed</Badge>
      </div>

      <h2 className="text-2xl font-bold mb-6">Subscription</h2>
      <p className="text-muted-foreground mb-4">Connect via WebSocket:</p>

      <div className="mb-12">
        <CodeWindow title="Terminal">
          wscat -c ws://localhost:8080/events
        </CodeWindow>
      </div>

      <DocsPager 
        prev={{ title: "Facilitator API", href: "/docs/api/facilitator" }}
      />
    </div>
  )
}
