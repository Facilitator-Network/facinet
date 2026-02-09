"use client"

/**
 * FacilitatorSection Component
 * 
 * Displays the role of Facilitators in the network.
 * 
 * JUNIOR DEV NOTE:
 * - We map over arrays (`data.responsibilities.items`) to render repetitive UI elements.
 *   This keeps the JSX clean and reduces code duplication.
 * - Dynamic icons are handled by `ICON_MAP` to avoid conditional logic in the render loop.
 */

import { ShieldCheck, Landmark, MessageSquareText, LucideIcon, Check } from "lucide-react"

// Mapping string names from data to actual React Components
// This allows the data file to store "ShieldCheck" as a string.
const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Landmark,
  MessageSquareText,
}

interface FacilitatorSectionProps {
  data: {
    title: string
    description: string
    responsibilities?: {
      title: string
      items: Array<{ title: string; description: string; icon: string }>
    }
    benefits?: {
      title: string
      items: Array<{ title: string; description: string }>
    }
  }
}

export function FacilitatorSection({ data }: FacilitatorSectionProps) {

  return (
    <section className="py-24 relative bg-transparent border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Top Section: Splitting Text and Graphic */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Infographic / Network Visual */}
          <div className="relative h-[250px] sm:h-[320px] w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden flex items-center justify-center">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />
            
            {/* Network Nodes Visualization - Scaled Down on Mobile */}
            <div className="relative z-10 flex items-center gap-4 md:gap-12 transform scale-[0.65] sm:scale-100 origin-center">
              
              {/* Node 1: Client */}
              <div className="flex flex-col items-center gap-3">
                 <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center relative">
                    <span className="text-xl">👤</span>
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-black" />
                 </div>
                 <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Client</span>
              </div>

              {/* Arrow 1 */}
              <div className="flex flex-col items-center gap-1">
                 <div className="h-0.5 w-8 md:w-12 bg-gradient-to-r from-white/10 to-white/50" />
                 <span className="text-[10px] font-mono text-white/30">REQ</span>
              </div>

              {/* Node 2: Facilitator (Center) */}
              <div className="flex flex-col items-center gap-3 relative">
                 <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                 <div className="h-16 w-16 rounded-2xl bg-black/80 border border-primary/50 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                 </div>
                 <span className="text-xs font-mono text-primary font-bold uppercase tracking-widest">Facilitator</span>
              </div>

              {/* Arrow 2 */}
              <div className="flex flex-col items-center gap-1">
                 <div className="h-0.5 w-8 md:w-12 bg-gradient-to-r from-white/50 to-white/10" />
                 <span className="text-[10px] font-mono text-white/30">SETTLE</span>
              </div>

              {/* Node 3: Blockchain */}
              <div className="flex flex-col items-center gap-3">
                 <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center">
                    <span className="text-xl">🔗</span>
                 </div>
                 <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Chain</span>
              </div>

            </div>
          </div>

          {/* Right: Text Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 uppercase tracking-tight font-mono">
              {data.title}
            </h2>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed font-light font-mono">
              {data.description}
            </p>
          </div>

        </div>

        {/* Bottom Section: Points in Glass Boxes */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Column 1: Responsibilities */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight font-mono border-b border-white/10 pb-4 inline-block">
              {data.responsibilities?.title}
            </h3>
            <div className="space-y-4">
              {data.responsibilities?.items.map((item, index) => {
                 const Icon = ICON_MAP[item.icon] || ShieldCheck
                 return (
                   <div key={index} className="flex gap-4 p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                     <div className="shrink-0 h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                       <Icon className="h-5 w-5 text-primary" />
                     </div>
                     <div>
                        <h4 className="text-base font-bold text-white mb-2 uppercase tracking-wide group-hover:text-primary transition-colors font-mono">{item.title}</h4>
                        <p className="text-sm text-white/60 leading-relaxed font-light">{item.description}</p>
                     </div>
                   </div>
                 )
              })}
            </div>
          </div>

          {/* Column 2: Benefits */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight font-mono border-b border-white/10 pb-4 inline-block">
              {data.benefits?.title}
            </h3>
            <div className="space-y-4">
              {data.benefits?.items.map((item, index) => (
                <div key={index} className="flex gap-4 p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                  <div className="shrink-0 h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/10 group-hover:border-green-500/50 transition-colors">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-2 uppercase tracking-wide group-hover:text-green-400 transition-colors font-mono">{item.title}</h4>
                    <p className="text-sm text-white/60 leading-relaxed font-light">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
