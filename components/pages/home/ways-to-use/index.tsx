"use client"

/**
 * WaysToUseSection Component
 * 
 * Displays specific use cases alongside a rich visual representation (Bento Box).
 * 
 * JUNIOR DEV NOTE:
 * - This component combines a standard text list (left) with a complex visual layout (right).
 * - The "Bento Box" visual uses a hardcoded grid structure to achieve a specific aesthetic.
 * - We use `backdrop-blur` heavily here to blend the UI cards with the background effects.
 */

import { 
  Cpu, 
  Code, 
  Image, 
  Store, 
  Network,
  LucideIcon,
  CheckCircle2
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Cpu,
  Code,
  Image,
  Store,
  Network
}

interface WaysToUseSectionProps {
  data: {
    title: string
    description: string
    items: Array<{
      title: string
      description: string
      icon: string
    }>
  }
}

export function WaysToUseSection({ data }: WaysToUseSectionProps) {
  return (
    <section className="pt-24 pb-12 relative bg-transparent border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Text Content List */}
          <div className="space-y-8 w-full">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight">
                {data.title}
              </h2>
              <p className="text-white/50 max-w-xl font-light">
                {data.description}
              </p>
            </div>

            <div className="space-y-6">
              {data.items.map((item, index) => {
                const Icon = ICON_MAP[item.icon] || Code
                return (
                  <div key={index} className="flex gap-4 group">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-white/50 text-sm mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Visual/Graphic - Bento Box Style */}
          <div className="relative h-full min-h-[500px] rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
             {/* Background Effects (Grid lines + Blur blob) */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
             
             {/* Bento Grid Container */}
             <div className="relative z-10 grid grid-cols-2 gap-4 h-full">
               
               {/* 1. Autonomous Resources (CPU) */}
               <div className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col justify-between group hover:bg-white/10 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                    <Cpu className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="h-2 w-24 bg-white/10 rounded mb-2" />
                    <div className="space-y-1.5 opacity-50">
                      <div className="h-1.5 w-full bg-white/20 rounded" />
                      <div className="h-1.5 w-2/3 bg-white/20 rounded" />
                    </div>
                  </div>
               </div>

               {/* 2. APIs (Code) */}
               <div className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col justify-between group hover:bg-white/10 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="h-2 w-20 bg-white/10 rounded mb-2" />
                    <div className="space-y-1.5 opacity-50">
                      <div className="h-1.5 w-full bg-white/20 rounded" />
                      <div className="h-1.5 w-3/4 bg-white/20 rounded" />
                    </div>
                  </div>
               </div>

               {/* 3. Cross-Chain (Network) - Wide Span (col-span-2) */}
               <div className="col-span-2 p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between group hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                      <Network className="h-6 w-6 text-pink-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 w-32 bg-white/10 rounded" />
                      <div className="h-2 w-48 bg-white/5 rounded" />
                    </div>
                  </div>
                  {/* Decorative status indicators */}
                  <div className="hidden sm:flex gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <div className="h-2 w-2 rounded-full bg-white/20" />
                    <div className="h-2 w-2 rounded-full bg-white/20" />
                  </div>
               </div>

               {/* 4. Micropayments (Image) */}
               <div className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col justify-between group hover:bg-white/10 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                    <Image className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="h-2 w-24 bg-white/10 rounded mb-2" />
                    <div className="space-y-1.5 opacity-50">
                      <div className="h-1.5 w-full bg-white/20 rounded" />
                      <div className="h-1.5 w-1/2 bg-white/20 rounded" />
                    </div>
                  </div>
               </div>

               {/* 5. Marketplaces (Store) */}
               <div className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col justify-between group hover:bg-white/10 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <Store className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="h-2 w-20 bg-white/10 rounded mb-2" />
                    <div className="space-y-1.5 opacity-50">
                      <div className="h-1.5 w-full bg-white/20 rounded" />
                      <div className="h-1.5 w-2/3 bg-white/20 rounded" />
                    </div>
                  </div>
               </div>

             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
