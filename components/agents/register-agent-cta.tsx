"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileCode, Shield, Rocket } from "lucide-react"

export function RegisterAgentCTA() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">
        <span className="text-gradient">Register</span> Your Agent
      </h2>

      <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-primary/20">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Join the Network</h3>
              <p className="text-muted-foreground leading-relaxed">
                Register your EIP-8004 compliant agent to the Ffacinet network and start coordinating with facilitators
                and other agents.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-primary/10 h-fit">
                  <FileCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">EIP-8004 Compliant</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Ensure your agent implements the standard interface
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-primary/10 h-fit">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Security Audited</div>
                  <div className="text-xs text-muted-foreground mt-1">Submit your code for security review</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-primary/10 h-fit">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Go Live</div>
                  <div className="text-xs text-muted-foreground mt-1">Deploy and start earning from interactions</div>
                </div>
              </div>
            </div>

            <Button className="bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90 w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Register New Agent
            </Button>
          </div>

          <Card className="p-6 bg-black/30 border-border/40">
            <div className="space-y-4">
              <div className="text-sm font-semibold text-foreground">Example Agent Interface</div>
              <pre className="text-xs text-primary/90 font-mono overflow-x-auto leading-relaxed">
                <code>{`interface IAgent {
  // Agent metadata
  name: string;
  version: string;
  capabilities: string[];
  
  // EIP-8004 methods
  function register(
    address facilitator
  ) external returns (bool);
  
  function execute(
    bytes calldata data
  ) external returns (bytes);
  
  function getReputation() 
    external view returns (uint256);
}`}</code>
              </pre>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  )
}
