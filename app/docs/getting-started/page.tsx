import { Card } from "@/components/ui/card"
import { DocsPager } from "@/components/docs/docs-pager"
import { CheckCircle, ArrowRight, Download, Terminal, Play } from "lucide-react"
import { CodeWindow } from "@/components/ui/code-window"

export default function GettingStartedPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Getting Started</h1>
      <p className="text-xl text-muted-foreground mb-12">
        Start interacting with the Facinet network in under 5 minutes.
      </p>

      {/* Step 1 */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/10 font-bold text-primary">
             1
           </div>
           <h2 className="text-2xl font-bold m-0 border-none">Install and Connect</h2>
        </div>
        <div className="pl-14">
            <p>Install the Facinet CLI globally to manage your wallet and node.</p>
            <CodeWindow title="Terminal" className="mb-6">
                npm install -g facinet
            </CodeWindow>
            <p>Then, initialize your configuration.</p>
            <CodeWindow title="Terminal">
                facinet connect
            </CodeWindow>
        </div>
      </div>

       {/* Step 2 */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 font-bold text-muted-foreground">
             2
           </div>
           <h2 className="text-2xl font-bold m-0 border-none">Make a Payment</h2>
        </div>
        <div className="pl-14">
             <p>Use the testnet faucet or existing funds to send a test payment.</p>
             <CodeWindow title="Terminal">
                facinet pay --to 0xRecipient --amount 1
             </CodeWindow>
            <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Success! You've just routed a payment through a random facilitator.</span>
            </div>
        </div>
      </div>

       {/* Step 3 */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 font-bold text-muted-foreground">
             3
           </div>
           <h2 className="text-2xl font-bold m-0 border-none">Next Steps</h2>
        </div>
        <div className="pl-14 grid md:grid-cols-2 gap-4 not-prose">
             <Card className="p-4 bg-card/30 border-white/5 hover:border-primary/40 transition-colors">
                <h3 className="font-bold flex items-center gap-2 mb-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    CLI Reference
                </h3>
                <p className="text-sm text-muted-foreground mb-0">Master the command line tools.</p>
             </Card>
             <Card className="p-4 bg-card/30 border-white/5 hover:border-primary/40 transition-colors">
                <h3 className="font-bold flex items-center gap-2 mb-2">
                    <Code2 className="h-4 w-4 text-primary" />
                    SDK Integration
                </h3>
                <p className="text-sm text-muted-foreground mb-0">Add Facinet to your app.</p>
             </Card>
        </div>
      </div>

      <DocsPager 
        next={{ title: "Facinet Client Features", href: "/docs/client/features" }}
      />
    </div>
  )
}

function Code2(props: any) {
    return (
        <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
    )
}
