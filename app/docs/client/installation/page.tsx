import { DocsPager } from "@/components/docs/docs-pager"
import { CodeWindow } from "@/components/ui/code-window"

export default function InstallationPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Installation</h1>
      
      <p className="text-xl text-muted-foreground mb-12">
        You can install Facinet as a global CLI tool or as a library for your Node.js projects.
      </p>

      <h2 className="text-2xl font-bold mb-6">Global CLI Tool</h2>
      <p className="text-muted-foreground mb-4">Install globally to utilize the <code>facinet</code> command line interface:</p>
      
      <div className="mb-12">
        <CodeWindow title="Terminal">
          npm install -g facinet
        </CodeWindow>
      </div>

      <h2 className="text-2xl font-bold mb-6">Library (SDK)</h2>
      <p className="text-muted-foreground mb-4">Install locally to use the SDK in your application:</p>
      
      <div className="mb-12">
        <CodeWindow title="Terminal">
          npm install facinet
        </CodeWindow>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mt-8">
        <h4 className="font-bold text-primary mb-4 text-lg">Prerequisites</h4>
        <ul className="mb-0 space-y-2 text-muted-foreground">
          <li>Node.js version 18 or higher</li>
          <li>npm or yarn package manager</li>
          <li>Basic understanding of async/await</li>
        </ul>
      </div>

      <DocsPager 
        prev={{ title: "Features", href: "/docs/client/features" }}
        next={{ title: "CLI Usage", href: "/docs/client/cli" }}
      />
    </div>
  )
}
