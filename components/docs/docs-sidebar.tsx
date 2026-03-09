"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useDocsSearch } from "@/components/docs/docs-search-context"

interface NavSubItem {
  title: string
  href: string
}

interface NavItem {
  title: string
  href?: string
  items?: NavSubItem[]
}

export function DocsSidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(["Facinet SDK", "Paywall", "Gasless API", "Facilitator", "Core Standards", "API Reference"])

  const navigation: NavItem[] = [
    { title: "Facinet SDK", href: "/docs" },
    {
      title: "Paywall",
      items: [
        { title: "Express.js Middleware", href: "/docs#paywall-middleware" },
        { title: "Next.js API Routes", href: "/docs#paywall-middleware" },
      ],
    },
    {
      title: "Gasless API",
      items: [
        { title: "Get API Key", href: "/docs#gasless-api" },
        { title: "Usage & Limits", href: "/docs#gasless-api" },
      ],
    },
    {
      title: "Facilitator",
      items: [
        { title: "Overview", href: "/docs/facilitator/overview" },
        { title: "Run a Facilitator", href: "/docs#run-a-facilitator" },
        { title: "Configuration", href: "/docs/facilitator/config" },
        { title: "Staking & Rewards", href: "/docs/facilitator/staking" },
      ],
    },
    {
      title: "Core Standards",
      items: [
        { title: "x402 Protocol", href: "/docs#x402-protocol" },
        { title: "ERC-3009", href: "/docs#core-standards" },
        { title: "ERC-8004", href: "/docs#core-standards" },
      ],
    },
    {
      title: "API Reference",
      items: [
        { title: "Endpoints", href: "/docs#api-endpoints" },
        { title: "SDK Methods", href: "/docs#sdk-reference" },
        { title: "CLI Commands", href: "/docs#cli-commands" },
        { title: "Supported Networks", href: "/docs#supported-networks" },
      ],
    },
    {
      title: "Architecture",
      items: [
        { title: "Network", href: "/docs/architecture/network" },
        { title: "Request Flow", href: "/docs/architecture/flow" },
      ],
    },
  ]

  const { query } = useDocsSearch()

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => (prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]))
  }

  const filteredNavigation = useMemo(() => {
    if (!query.trim()) return navigation
    const q = query.toLowerCase()
    return navigation
      .map((section) => {
        const sectionMatches = section.title.toLowerCase().includes(q)
        if (!section.items) return sectionMatches ? section : null
        const matchedItems = section.items.filter(
          (item) => item.title.toLowerCase().includes(q)
        )
        if (sectionMatches || matchedItems.length > 0) {
          return { ...section, items: sectionMatches ? section.items : matchedItems }
        }
        return null
      })
      .filter(Boolean) as NavItem[]
  }, [query, navigation])

  const isSearching = query.trim().length > 0

  return (
    <div className="hidden lg:block w-64 flex-shrink-0 h-[calc(100vh-10rem)] sticky top-16 overflow-y-auto py-6 pr-4 text-sm">
        <nav className="space-y-6">
          {filteredNavigation.length === 0 && (
            <p className="text-xs text-[var(--text-tertiary)] font-mono px-1">No results for &quot;{query}&quot;</p>
          )}
          {filteredNavigation.map((section) => {
            const isExpanded = isSearching || expandedSections.includes(section.title)
            const isActive = section.href === pathname

            if (!section.items) {
               return (
                <Link key={section.title} href={section.href || "#"} className={cn("block font-body text-[0.875rem] hover:text-[var(--text-primary)] transition-colors", isActive ? "text-[var(--accent)] font-medium" : "text-[var(--text-secondary)] font-normal")}>
                   <span className="mr-3 font-mono">{isActive ? ">" : "#"}</span>
                   {section.title.toUpperCase()}
                </Link>
               )
            }

            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full text-left hover:text-[var(--text-primary)] transition-colors mb-2 text-[var(--text-tertiary)] font-body text-[0.75rem] font-semibold tracking-[0.06em] uppercase"
                >
                  <span className="mr-3 text-[var(--accent)] opacity-50 font-mono">[{isExpanded ? "-" : "+"}]</span>
                  {section.title.toUpperCase()}
                </button>

                {isExpanded && (
                  <div className="ml-1 space-y-1 border-l border-[var(--bg-border)] pl-4">
                    {section.items.map((item) => {
                      const isItemActive = pathname === item.href
                      return (
                        <Link key={item.href + item.title} href={item.href} className={cn("block font-body text-[0.875rem] hover:text-[var(--text-primary)] transition-colors py-1", isItemActive ? "text-[var(--accent)] font-medium" : "text-[var(--text-secondary)] font-normal")}>
                          <span className="mr-3 opacity-30 font-mono">{isItemActive ? "*" : "-"}</span>
                          {item.title}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
    </div>
  )
}
