import { DocsPager } from "@/components/docs/docs-pager"
import { CodeWindow } from "@/components/ui/code-window"

export default function CLIUsagePage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">CLI Usage</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Command line reference for managing your Facinet identity and tasks.
      </p>

      <h2 className="text-2xl font-bold mb-6">Initial Setup</h2>
      <p className="text-muted-foreground mb-4">Initialize your configuration and generate a new wallet:</p>
      
      <div className="mb-12">
        <CodeWindow title="Terminal">
          facinet init
        </CodeWindow>
      </div>

      <h2 className="text-2xl font-bold mb-6">Wallet Management</h2>
      <p className="text-muted-foreground mb-4">Check your balance or export your private key:</p>
      
      <div className="mb-6">
        <CodeWindow title="Terminal">
          facinet wallet balance
        </CodeWindow>
      </div>
      
      <div className="mb-12">
        <CodeWindow title="Terminal">
          facinet wallet export --secure
        </CodeWindow>
      </div>

      <h2 className="text-2xl font-bold mb-6">Sending Tasks</h2>
      <p className="text-muted-foreground mb-4">Submit a task to the network. The CLI handles signing and routing automatically.</p>

      <div className="mb-12">
        <CodeWindow title="Terminal">
          {`facinet run --agent "gpt-4-summarizer" --input "file.txt"`}
        </CodeWindow>
      </div>

      <h2 className="text-2xl font-bold mb-6">Network Info</h2>
      <p className="text-muted-foreground mb-4">Query network stats and active facilitators:</p>

      <div className="mb-6">
        <CodeWindow title="Terminal">
          facinet network status
        </CodeWindow>
      </div>

      <DocsPager 
        prev={{ title: "Installation", href: "/docs/client/installation" }}
        next={{ title: "SDK Usage", href: "/docs/client/sdk" }}
      />
    </div>
  )
}
