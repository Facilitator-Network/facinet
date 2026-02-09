"use client"

/**
 * ProductsSection Component
 * 
 * Showcases the main product offerings (Cloud, CLI, SDK).
 * 
 * JUNIOR DEV NOTE:
 * - We use `group` on the parent container and `group-hover:` on children to trigger 
 *   child animations when the parent is hovered. This is a powerful Tailwind feature.
 * - `grid-cols-1 md:grid-cols-3` creates a responsive grid: 1 column on mobile, 3 on desktop.
 */

import { 
  Cloud, 
  Terminal, 
  Code,
  ArrowRight,
  LucideIcon
} from "lucide-react"
import Link from "next/link"

const ICON_MAP: Record<string, LucideIcon> = {
  Cloud,
  Terminal,
  Code
}

interface ProductsSectionProps {
  data: {
    title: string
    description: string
    items: Array<{
      title: string
      description: string
      icon: string
      href: string
    }>
  }
}

export function ProductsSection({ data }: ProductsSectionProps) {
  return (
    <section className="py-16 relative bg-transparent border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-tight">
              {data.title}
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto font-light">
              {data.description}
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.items.map((item, index) => {
              const Icon = ICON_MAP[item.icon] || Code
              return (
                <div 
                  key={index} 
                  // 'group' class allows children to react to this element's hover state
                  className="group relative p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden hover:border-primary/50 transition-colors duration-300"
                >
                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 flex h-full gap-5">
                    {/* Icon Container */}
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/10">
                        <Icon className="h-6 w-6 text-white/80 group-hover:text-primary transition-colors" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col space-y-2 flex-grow min-w-0">
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-white/50 text-sm leading-relaxed">
                        {item.description}
                      </p>
                      
                      {/* Link with Arrow Animation */}
                      <div className="pt-2 mt-auto">
                        <Link 
                          href={item.href}
                          className="inline-flex items-center space-x-2 text-sm font-mono text-white/60 hover:text-white transition-colors group/link"
                        >
                          <span>Learn more</span>
                          <ArrowRight className="h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
