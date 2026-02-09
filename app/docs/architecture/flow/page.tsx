import { Card } from "@/components/ui/card"
import { ArrowDown } from "lucide-react"
import { DocsPager } from "@/components/docs/docs-pager"

export default function ArchitectureFlowPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Request Lifecycle</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Understanding the step-by-step flow of a request through the Facinet network.
      </p>

      <div className="max-w-2xl mx-auto mb-16 not-prose">
        <div className="flex flex-col gap-2 relative">
           {/* Connecting Line */}
           <div className="absolute left-[8.5rem] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 to-transparent z-0 hidden md:block"></div>

          <div className="flex items-center gap-8 relative z-10">
            <div className="w-24 font-bold text-right text-primary hidden md:block">User</div>
            <div className="flex-1 p-6 bg-card/40 border border-primary/20 rounded-xl backdrop-blur-sm">
                <h3 className="font-bold text-sm text-primary mb-1 md:hidden">User</h3>
                <p className="text-sm font-medium">Submits task request</p>
                <p className="text-xs text-muted-foreground mt-1">Signs envelope with private key</p>
            </div>
          </div>

          <div className="flex justify-center md:justify-start md:pl-[8rem] py-2">
            <ArrowDown className="h-5 w-5 text-white/20" />
          </div>

          <div className="flex items-center gap-8 relative z-10">
            <div className="w-24 font-bold text-right text-primary hidden md:block">Facilitator</div>
             <div className="flex-1 p-6 bg-card/40 border border-primary/20 rounded-xl backdrop-blur-sm">
                <h3 className="font-bold text-sm text-primary mb-1 md:hidden">Facilitator</h3>
                 <p className="text-sm font-medium">Forwards signed envelope</p>
                 <p className="text-xs text-muted-foreground mt-1">Validates signature & stake</p>
            </div>
          </div>

          <div className="flex justify-center md:justify-start md:pl-[8rem] py-2">
            <ArrowDown className="h-5 w-5 text-white/20" />
          </div>

          <div className="flex items-center gap-8 relative z-10">
            <div className="w-24 font-bold text-right text-primary hidden md:block">Agent</div>
             <div className="flex-1 p-6 bg-card/40 border border-primary/20 rounded-xl backdrop-blur-sm">
                 <h3 className="font-bold text-sm text-primary mb-1 md:hidden">Agent</h3>
                 <p className="text-sm font-medium">Executes & posts receipt</p>
                 <p className="text-xs text-muted-foreground mt-1">Computes result & generates proof</p>
            </div>
          </div>

          <div className="flex justify-center md:justify-start md:pl-[8rem] py-2">
            <ArrowDown className="h-5 w-5 text-white/20" />
          </div>

           <div className="flex items-center gap-8 relative z-10">
            <div className="w-24 font-bold text-right text-primary hidden md:block">Chain</div>
             <div className="flex-1 p-6 bg-card/40 border border-primary/20 rounded-xl backdrop-blur-sm">
                 <h3 className="font-bold text-sm text-primary mb-1 md:hidden">Chain</h3>
                 <p className="text-sm font-medium">Confirmation</p>
                 <p className="text-xs text-muted-foreground mt-1">Verifies receipt on-chain</p>
            </div>
          </div>

           <div className="flex justify-center md:justify-start md:pl-[8rem] py-2">
            <ArrowDown className="h-5 w-5 text-white/20" />
          </div>

           <div className="flex items-center gap-8 relative z-10">
            <div className="w-24 font-bold text-right text-primary hidden md:block">User</div>
             <div className="flex-1 p-6 bg-card/40 border border-primary/20 rounded-xl backdrop-blur-sm">
                 <h3 className="font-bold text-sm text-primary mb-1 md:hidden">User</h3>
                 <p className="text-sm font-medium">Receives Final Response</p>
                 <p className="text-xs text-muted-foreground mt-1">Transaction complete</p>
            </div>
          </div>

        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Guarantees</h2>

      <ul className="text-muted-foreground space-y-2">
        <li><strong>Cryptographic Integrity:</strong> All envelopes are signed.</li>
        <li><strong>Verifiable Receipts:</strong> Execution is proved on-chain.</li>
        <li><strong>Deterministic Routing:</strong> Facilitator selection is fair and auditable.</li>
      </ul>

      <DocsPager 
        prev={{ title: "Network Architecture", href: "/docs/architecture/network" }}
      />
    </div>
  )
}
