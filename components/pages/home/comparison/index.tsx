"use client"

/**
 * ComparisonTableSection Component
 * 
 * Visualizes the difference between "Current Facilitators" and "Facinet".
 * 
 * JUNIOR DEV NOTE:
 * - We use a helper function `renderCell` inside the component to handle text parsing.
 *   Ideally, this logic should be in a utility file or the data should be structured better,
 *   but for small presentation logic, keeping it here is acceptable.
 * - `cn()` is a utility that merges Tailwind classes, allowing us to conditionally style columns.
 */

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComparisonTableSectionProps {
  data: {
    title: string
    description: string
    headers: string[]
    rows: Array<{
      feature: string
      current: string
      facinet: string
    }>
  }
}

export function ComparisonTableSection({ data }: ComparisonTableSectionProps) {
  
  // Helper to render cell content with icons
  // Takes string like "✅ Safe" and renders a Check icon + "Safe"
  const renderCell = (text: string) => {
    if (text.startsWith("✅")) {
      return (
        <span className="flex items-center gap-2 text-green-400">
          <Check className="h-4 w-4 shrink-0" />
          <span>{text.replace("✅", "").trim()}</span>
        </span>
      )
    }
    if (text.startsWith("❌")) {
      return (
        <span className="flex items-center gap-2 text-red-400/80">
          <X className="h-4 w-4 shrink-0" />
          <span>{text.replace("❌", "").trim()}</span>
        </span>
      )
    }
    return <span className="text-white/70">{text}</span>
  }

  return (
    <section className="py-12 relative bg-transparent border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-tight">
              {data.title}
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto font-light">
              {data.description}
            </p>
          </div>

          {/* Table Container - Desktop & Tablet */}
          <div className="hidden md:block rounded-xl border border-white/10 overflow-hidden bg-black/40 backdrop-blur-sm shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20">
                    {data.headers.map((header, i) => (
                      <th 
                        key={i} 
                        className={cn(
                          "py-3 px-6 font-mono font-bold uppercase tracking-wider text-left",
                          // Conditional width and styling based on column index
                          i === 0 && "text-white/40 text-xs w-[20%]",
                          i === 1 && "text-white/40 text-xs w-[40%]",
                          i === 2 && "text-primary text-sm w-[40%] bg-primary/5 border-l border-primary/20 drop-shadow-[0_0_15px_rgba(0,255,163,0.3)]"
                        )}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.rows.map((row, i) => (
                    <tr 
                      key={i} 
                      className="group transition-colors font-mono text-sm hover:bg-white/[0.02]"
                    >
                      <td className="py-3 px-6 font-medium text-white/50 border-r border-white/5">
                        {row.feature}
                      </td>
                      <td className="py-3 px-6 text-white/60">
                        {renderCell(row.current)}
                      </td>
                      <td className="py-3 px-6 font-bold text-white bg-gradient-to-r from-primary/10 to-transparent border-l border-primary/20 relative">
                        <div className="relative z-10">
                            {renderCell(row.facinet)}
                        </div>
                        {/* Status Light Strip for Facinet rows */}
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/50 shadow-[0_0_10px_rgba(0,255,163,0.5)]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards Container - Mobile Only */}
          <div className="md:hidden space-y-4">
             {data.rows.map((row, i) => (
               <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-4">
                  {/* Feature Title */}
                  <div className="text-xs font-mono font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                    {row.feature}
                  </div>
                  
                  {/* Comparison Grid */}
                  <div className="grid grid-cols-2 gap-4">
                     {/* Current State */}
                     <div className="space-y-1">
                        <div className="text-[10px] text-white/30 font-mono uppercase">Current</div>
                        <div className="text-sm text-white/60 font-mono">{renderCell(row.current)}</div>
                     </div>

                     {/* Facinet State */}
                     <div className="relative p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="absolute top-0 right-0 w-2 h-2 bg-primary/50 rounded-bl-lg"></div>
                        <div className="text-[10px] text-primary/50 font-mono uppercase mb-1">Facinet</div>
                        <div className="text-sm font-bold text-white font-mono">{renderCell(row.facinet)}</div>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </section>
  )
}
