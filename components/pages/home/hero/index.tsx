"use client"

/**
 * HeroSection Component
 * 
 * This is the first section users see on the homepage.
 * It uses GSAP (GreenSock Animation Platform) for high-performance entrance animations.
 * 
 * JUNIOR DEV NOTE:
 * - We use `useRef` to target DOM elements for animation without triggering re-renders.
 * - `gsap.context` is crucial in React to strictly scope animations and clean them up
 *   automatically when the component unmounts, preventing memory leaks or double-animations.
 */

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { GlowingBorderBtn } from "@/components/ui/glowing-border-btn"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { ArrowRight, Play, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Map string keys to actual Icon components to allow dynamic data loading
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
  // State for auto-expansion animation
  const [isAutoExpanded, setIsAutoExpanded] = useState(false)

  useEffect(() => {
    // Sequence: Wait 500ms -> Expand -> Wait 2s -> Collapse
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
      {/* Background Shader Effect - Keeps the main thread free by using WebGL */}
      <WebGLShader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-12 sm:mt-20">
        <div className="relative border border-[#27272a] p-2 w-full mx-auto max-w-[52rem] z-10 bg-black/40 backdrop-blur-sm rounded-xl">
          <main className="relative border border-[#27272a] py-8 md:py-12 overflow-hidden rounded-lg flex flex-col items-center text-center">
            
            {/* Animated Badge */}
            {data.badge && (
              <div className="my-8 flex items-center justify-center gap-2 mb-8">
                  <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-blue opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-blue"></span>
                  </span>
                  <p className="text-xs md:text-sm text-neon-blue font-mono uppercase tracking-wider">{data.badge}</p>
              </div>
            )}

            {/* Main Title with Hover Effect */}
            <h1 className="mb-4 text-white text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none select-none">
              {data.title === "FACINET" ? (
                <span className="group relative inline-flex items-center justify-center cursor-default">
                  {/* F A C I */}
                  <span className={cn(
                    "transition-all duration-300",
                    isAutoExpanded 
                      ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                      : "group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  )}>
                    FACI
                  </span>
                  
                  {/* LITATOR */}
                  <span className={cn(
                    "overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] whitespace-pre text-blue-400 origin-left",
                    isAutoExpanded 
                      ? "max-w-full md:max-w-[4.5em] opacity-100 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" 
                      : "max-w-0 opacity-0 group-hover:max-w-full md:group-hover:max-w-[4.5em] group-hover:opacity-100 group-hover:drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]"
                  )}>
                    LITATOR&nbsp;
                  </span>

                  {/* N E T */}
                  <span className={cn(
                    "transition-all duration-300",
                    isAutoExpanded 
                      ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                      : "group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  )}>
                    NET
                  </span>

                  {/* WORK */}
                  <span className={cn(
                    "overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] text-blue-400 origin-left",
                    isAutoExpanded 
                      ? "max-w-full md:max-w-[3.5em] opacity-100 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" 
                      : "max-w-0 opacity-0 group-hover:max-w-full md:group-hover:max-w-[3.5em] group-hover:opacity-100 group-hover:drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]"
                  )}>
                    WORK
                  </span>
                </span>
              ) : (
                <span className="inline-block transition-all duration-300 hover:drop-shadow-[0_0_35px_rgba(255,255,255,0.8)] cursor-default">
                  {data.title}
                </span>
              )}
            </h1>

            <p className="mb-8 text-lg font-light text-white/60 md:text-xl max-w-2xl mx-auto font-sans leading-relaxed">
              {data.description}
            </p>
            
            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full z-20 pointer-events-auto">
                <GlowingBorderBtn onClick={onGetDemoClick}>
                  {data.ctaPrimary.text}
                </GlowingBorderBtn>

                <Button variant="ghost" className="rounded-full bg-white/5 backdrop-blur-sm border border-white/10 gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 h-auto py-3 px-6 text-sm font-medium">
                  <SecondaryIcon className="w-4 h-4" />
                  {data.ctaSecondary.text}
                </Button>
            </div> 

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-8 pt-8 w-full max-w-lg mx-auto border-t border-white/5 mt-8 px-2 sm:px-0">
              {data.stats.map((stat, index) => (
                <div key={index} className="space-y-0.5">
                  <div className="text-sm sm:text-lg md:text-xl font-bold text-white/90">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-wider text-white/40 font-mono break-words">{stat.label}</div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}
