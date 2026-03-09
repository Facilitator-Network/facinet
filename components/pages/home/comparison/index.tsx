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
        <span className="flex items-center gap-2 text-[var(--success)]">
          <Check className="h-4 w-4 shrink-0" />
          <span>{text.replace("✅", "").trim()}</span>
        </span>
      )
    }
    if (text.startsWith("❌")) {
      return (
        <span className="flex items-center gap-2 text-[var(--error)]">
          <X className="h-4 w-4 shrink-0" />
          <span>{text.replace("❌", "").trim()}</span>
        </span>
      )
    }
    return <span className="text-[var(--text-secondary)]">{text}</span>
  }

  return (
    <section className="py-12 relative bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-mono text-[var(--text-primary)] mb-4 uppercase tracking-tight">
              {data.title}
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto font-light font-body">
              {data.description}
            </p>
          </div>

          {/* Table Container - Desktop & Tablet */}
          <div className="hidden md:block rounded-xl border border-[var(--bg-border)] overflow-hidden bg-[var(--glass-bg)] backdrop-blur-sm shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--bg-border)] bg-[var(--glass-bg)]">
                    {data.headers.map((header, i) => (
                      <th
                        key={i}
                        className={cn(
                          "py-3 px-6 font-mono font-bold uppercase tracking-wider text-left",
                          // Conditional width and styling based on column index
                          i === 0 && "text-[var(--text-tertiary)] text-xs w-[20%]",
                          i === 1 && "text-[var(--text-tertiary)] text-xs w-[40%]",
                          i === 2 && "text-[var(--accent)] text-sm w-[40%] bg-[var(--accent-subtle)] border-l border-[var(--accent-muted)] drop-shadow-[0_0_15px_rgba(0,255,163,0.3)]"
                        )}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--bg-border)]">
                  {data.rows.map((row, i) => (
                    <tr
                      key={i}
                      className="group transition-colors font-mono text-sm hover:bg-[var(--bg-raised)]"
                    >
                      <td className="py-3 px-6 font-medium text-[var(--text-secondary)] border-r border-[var(--bg-border)]">
                        {row.feature}
                      </td>
                      <td className="py-3 px-6 text-[var(--text-secondary)]">
                        {renderCell(row.current)}
                      </td>
                      <td className="py-3 px-6 font-bold text-[var(--text-primary)] bg-gradient-to-r from-[var(--accent-subtle)] to-transparent border-l border-[var(--accent-muted)] relative">
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
               <div key={i} className="p-4 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-subtle-bg)] backdrop-blur-sm space-y-4">
                  {/* Feature Title */}
                  <div className="text-xs font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest border-b border-[var(--bg-border)] pb-2">
                    {row.feature}
                  </div>

                  {/* Comparison Grid */}
                  <div className="grid grid-cols-2 gap-4">
                     {/* Current State */}
                     <div className="space-y-1">
                        <div className="text-[10px] text-[var(--text-tertiary)] font-mono uppercase">Current</div>
                        <div className="text-sm text-[var(--text-secondary)] font-mono">{renderCell(row.current)}</div>
                     </div>

                     {/* Facinet State */}
                     <div className="relative p-3 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-muted)]">
                        <div className="absolute top-0 right-0 w-2 h-2 bg-primary/50 rounded-bl-lg"></div>
                        <div className="text-[10px] text-primary/50 font-mono uppercase mb-1">Facinet</div>
                        <div className="text-sm font-bold text-[var(--text-primary)] font-mono">{renderCell(row.facinet)}</div>
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
