"use client"

import { useEffect, useState } from "react"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { ArrowRight, Play, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, LucideIcon> = {
  ArrowRight,
  Play,
}

interface HeroSectionProps {
  data: {
    badge: string
    title: string
    subtitle: string
    description: string
    ctaPrimary: {
      text: string
      icon: string
    }
    ctaSecondary: {
      text: string
      icon: string
    }
    stats: Array<{
      value: string
      label: string
    }>
  }
  onGetDemoClick?: () => void
}

export function HeroSection({ data, onGetDemoClick }: HeroSectionProps) {
  const [isAutoExpanded, setIsAutoExpanded] = useState(false)
  const [activeOption, setActiveOption] = useState<'get' | 'watch'>('get')
  const [hoveredOption, setHoveredOption] = useState<'get' | 'watch' | null>(null)

  const displayOption = hoveredOption || activeOption

  useEffect(() => {
    const expandTimer = setTimeout(() => setIsAutoExpanded(true), 500)
    const collapseTimer = setTimeout(() => setIsAutoExpanded(false), 2500)

    return () => {
      clearTimeout(expandTimer)
      clearTimeout(collapseTimer)
    }
  }, [])

  const PrimaryIcon = ICON_MAP[data.ctaPrimary.icon] || ArrowRight
  const SecondaryIcon = ICON_MAP[data.ctaSecondary.icon] || Play

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <WebGLShader />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-12 sm:mt-20">
        <div className="relative w-full mx-auto max-w-3xl z-10 flex flex-col items-center text-center">

          {/* Badge */}
          {data.badge && (
            <div className="mb-6 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
              </span>
              <p className="text-[10px] md:text-xs text-[var(--accent)] uppercase tracking-[0.2em] font-mono font-medium">
                {data.badge}
              </p>
            </div>
          )}

          {/* Title */}
          <h1
            className="mb-6 text-[var(--text-primary)] text-5xl md:text-7xl font-display tracking-[-0.03em] uppercase leading-[0.9] select-none"
            style={{ fontWeight: 900 }}
          >
            {data.title === "FACINET" ? (
              <span className="group relative inline-flex items-center justify-center cursor-default">
                <span className={cn(
                  "transition-all duration-300",
                  isAutoExpanded
                    ? "text-[var(--text-primary)] drop-shadow-[0_0_10px_var(--text-primary)]"
                    : "group-hover:text-[var(--text-primary)] group-hover:drop-shadow-[0_0_10px_var(--text-primary)]"
                )}>
                  FACI
                </span>

                <span className={cn(
                  "overflow-hidden whitespace-pre text-[var(--accent)] origin-left transition-[max-width] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
                  isAutoExpanded
                    ? "max-w-[4.5em] drop-shadow-[0_0_15px_var(--accent)]"
                    : "max-w-0 group-hover:max-w-[4.5em] group-hover:drop-shadow-[0_0_15px_var(--accent)]"
                )}>
                  LITATOR&nbsp;
                </span>

                <span className={cn(
                  "transition-all duration-300",
                  isAutoExpanded
                    ? "text-[var(--text-primary)] drop-shadow-[0_0_10px_var(--text-primary)]"
                    : "group-hover:text-[var(--text-primary)] group-hover:drop-shadow-[0_0_10px_var(--text-primary)]"
                )}>
                  NET
                </span>

                <span className={cn(
                  "overflow-hidden text-[var(--accent)] origin-left transition-[max-width] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
                  isAutoExpanded
                    ? "max-w-[3.5em] drop-shadow-[0_0_15px_var(--accent)]"
                    : "max-w-0 group-hover:max-w-[3.5em] group-hover:drop-shadow-[0_0_15px_var(--accent)]"
                )}>
                  WORK
                </span>
              </span>
            ) : (
              <span className="inline-block transition-all duration-300 hover:drop-shadow-[0_0_35px_var(--text-primary)] cursor-default">
                {data.title}
              </span>
            )}
          </h1>

          {/* Description */}
          <p className="mb-10 font-body text-lg md:text-xl text-[var(--text-secondary)] max-w-[55ch] leading-relaxed">
            {data.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-12">
            <div
              className="flex items-center p-1 rounded-full"
              style={{
                background: 'var(--glass-heavy-bg)',
                backdropFilter: 'var(--glass-heavy-blur)',
                WebkitBackdropFilter: 'var(--glass-heavy-blur)',
                border: '1px solid var(--bg-border)',
              }}
            >
              <button
                onMouseEnter={() => setHoveredOption('get')}
                onMouseLeave={() => setHoveredOption(null)}
                onClick={() => {
                  setActiveOption('get')
                  onGetDemoClick?.()
                }}
                className={cn(
                  "px-5 sm:px-6 h-10 rounded-full font-mono text-xs font-bold tracking-[0.06em] uppercase transition-all duration-300 flex items-center gap-2 whitespace-nowrap",
                  displayOption === 'get'
                    ? "text-[var(--text-primary)] bg-[var(--accent-muted)] shadow-[0_0_12px_var(--accent-muted)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                <PrimaryIcon className="w-3.5 h-3.5" />
                {data.ctaPrimary.text}
              </button>

              <button
                onMouseEnter={() => setHoveredOption('watch')}
                onMouseLeave={() => setHoveredOption(null)}
                onClick={() => setActiveOption('watch')}
                className={cn(
                  "px-5 sm:px-6 h-10 rounded-full font-mono text-xs font-bold tracking-[0.06em] uppercase transition-all duration-300 flex items-center gap-2 whitespace-nowrap",
                  displayOption === 'watch'
                    ? "text-[var(--text-primary)] bg-[var(--accent-muted)] shadow-[0_0_12px_var(--accent-muted)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                <SecondaryIcon className="w-3.5 h-3.5" />
                {data.ctaSecondary.text}
              </button>
            </div>

            <button
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-10 px-6 rounded-full font-mono text-xs font-bold tracking-[0.06em] uppercase transition-all duration-300 flex items-center gap-2 whitespace-nowrap bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:shadow-[0_0_24px_var(--accent-muted)]"
            >
              Apply for Whitelisting
            </button>
          </div>

          {/* Stats */}
          <div
            className="flex items-center divide-x divide-[var(--bg-border)] rounded-2xl px-2 py-4"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid var(--glass-border)',
            }}
          >
            {data.stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center gap-0.5 px-6 sm:px-10">
                <div className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-[var(--text-primary)]">{stat.value}</div>
                <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
