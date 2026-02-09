"use client"

import { Card } from "@/components/ui/card"
import { ArrowDown, Database, Server, Smartphone, Monitor } from "lucide-react"

function Layer({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={`border border-white/20 rounded-lg p-6 relative bg-white/5 ${className}`}>
      <div className="absolute -top-3 left-4 bg-black px-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
        {title}
      </div>
      {children}
    </div>
  )
}

function Node({ label, icon: Icon, desc }: { label: string, icon?: any, desc?: string }) {
  return (
    <div className="bg-card border border-white/10 rounded p-3 text-center flex flex-col items-center justify-center min-w-[120px] shadow-sm">
      {Icon && <Icon className="h-5 w-5 mb-2 text-primary" />}
      <span className="font-semibold text-sm">{label}</span>
      {desc && <span className="text-[10px] text-muted-foreground mt-1">{desc}</span>}
    </div>
  )
}

function Arrow() {
  return <ArrowDown className="h-4 w-4 text-primary/50 my-1 mx-auto" />
}

export function DetailedArchitectureDiagram() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 font-sans select-none my-12">
      
      {/* Client Layer */}
      <Layer title="Client Layer">
        <div className="flex justify-center gap-4 flex-wrap">
          <Node label="Node.js App" icon={Server} />
          <Node label="CLI Tool" icon={Monitor} />
          <Node label="Web Browser / dApp" icon={Smartphone} />
        </div>
      </Layer>

      <Arrow />

      {/* SDK Layer */}
      <Layer title="SDK Layer (npm install facinet)">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded text-green-300 font-mono text-sm">
            Facinet SDK
          </div>
          <div className="flex gap-8 text-xs text-muted-foreground">
            <div className="text-center p-2 border border-white/10 rounded">
              Node.js Bundle<br/>(Private Key Signing)
            </div>
            <div className="text-center p-2 border border-white/10 rounded">
              Browser Bundle<br/>(MetaMask Integration)
            </div>
          </div>
        </div>
      </Layer>

      <Arrow />

      {/* API Layer */}
      <Layer title="API Layer (Vercel)">
        <div className="flex flex-col items-center gap-4">
            <Node label="Next.js API Routes" icon={Server} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-2 bg-white/5 rounded border border-dashed border-white/20">/api/x402/settle</div>
                <div className="p-2 bg-white/5 rounded border border-dashed border-white/20">/api/facilitator/list</div>
                <div className="p-2 bg-white/5 rounded border border-dashed border-white/20">/api/payment/status</div>
            </div>
        </div>
      </Layer>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {/* Facilitator Network */}
        <Layer title="Facilitator Network" className="h-full">
            <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Node key={i} label={`Facilitator ${i}`} desc="Gas Provider" />
                ))}
            </div>
        </Layer>

        {/* Storage Layer */}
        <Layer title="Storage Layer" className="h-full flex items-center justify-around">
            <Node label="Generic Redis" desc="Facilitator Storage" icon={Database} />
            <Node label="PGVector" desc="Payment Records" icon={Database} />
        </Layer>
      </div>

      <Arrow />

      {/* Blockchain */}
      <Layer title="Blockchain - Avalanche Fuji">
        <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-300 font-bold">
                USDC Contract (ERC-3009)
            </div>
            <div className="text-xs text-muted-foreground p-2 border rounded">
                Avalanche Testnet (Chain ID: 43113)
            </div>
        </div>
      </Layer>

    </div>
  )
}

export function HighLevelArchitectureDiagram() {
    return (
        <div className="w-full max-w-4xl mx-auto my-12 p-8 border border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                
                {/* Client */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                        <Smartphone className="h-8 w-8 text-blue-400" />
                    </div>
                    <span className="font-bold text-lg">Client</span>
                    <span className="text-xs text-muted-foreground">Signs Request</span>
                </div>

                {/* Arrow */}
                <div className="flex-1 h-[2px] w-full bg-gradient-to-r from-blue-500 to-primary relative hidden md:block">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-2 text-xs text-muted-foreground whitespace-nowrap">
                        Generic SDK
                     </div>
                </div>
                <ArrowDown className="md:hidden text-muted-foreground" />

                {/* Facilitator Network */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-xl bg-primary/20 border-2 border-primary flex items-center justify-center flex-col animate-pulse">
                        <Server className="h-8 w-8 text-primary mb-1" />
                        <span className="text-[10px] font-mono uppercase">Network</span>
                    </div>
                    <span className="font-bold text-lg">Facilitator Mesh</span>
                    <span className="text-xs text-muted-foreground">Validates & Pays Gas</span>
                </div>

                {/* Arrow */}
                 <div className="flex-1 h-[2px] w-full bg-gradient-to-r from-primary to-yellow-500 relative hidden md:block">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-2 text-xs text-muted-foreground whitespace-nowrap">
                        0-Gas Txs
                     </div>
                 </div>
                 <ArrowDown className="md:hidden text-muted-foreground" />

                {/* Blockchain */}
                <div className="flex flex-col items-center gap-2">
                     <div className="w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                        <Database className="h-8 w-8 text-yellow-400" />
                    </div>
                    <span className="font-bold text-lg">Blockchain</span>
                    <span className="text-xs text-muted-foreground">Settlement</span>
                </div>

            </div>
            
            {/* Background decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/30 blur-[100px] rounded-full -z-10" />
        </div>
    )
}
