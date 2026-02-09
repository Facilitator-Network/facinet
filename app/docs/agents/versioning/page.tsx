import { Card } from "@/components/ui/card"
import { DocsPager } from "@/components/docs/docs-pager"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GitBranch } from "lucide-react"

export default function AgentsVersioningPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Agent Versioning</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Maintaining version history ensures clients interact with compatible and up-to-date agents.
      </p>

      <h2 className="text-2xl font-bold mb-6">When to Update</h2>
      <p className="text-muted-foreground mb-4">You must increment your agent's version when:</p>

      <ul className="text-muted-foreground space-y-2 mb-12">
        <li>Underlying model or logic changes</li>
        <li>API request/response schema changes</li>
        <li>Capabilities are added or removed</li>
      </ul>

      <h2 className="text-2xl font-bold mb-6">Semantic Versioning</h2>

      <p className="text-muted-foreground mb-4">We follow standard SemVer (Major.Minor.Patch):</p>

      <Card className="p-8 bg-card/50 backdrop-blur border-primary/20 mb-8 flex flex-col items-center justify-center">
        <div className="font-mono text-3xl font-bold tracking-widest flex items-center gap-4">
            <span>1</span>
            <span className="text-muted-foreground/30">.</span>
            <span>0</span>
            <span className="text-muted-foreground/30">.</span>
            <span>0</span>
        </div>
        <div className="flex gap-12 mt-2 text-xs text-muted-foreground font-mono uppercase tracking-widest">
            <span>Major</span>
            <span>Minor</span>
            <span>Patch</span>
        </div>
      </Card>

      <Alert className="mb-8 border-primary/20 bg-primary/5">
        <GitBranch className="h-5 w-5" />
        <AlertDescription>
            Example: <code>1.0.0</code> → <code>1.1.0</code> (Added new capability)
        </AlertDescription>
      </Alert>

      <DocsPager 
        prev={{ title: "Agent Capabilities", href: "/docs/agents/capabilities" }}
      />
    </div>
  )
}
