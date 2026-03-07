"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => (prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]))
  }

  return (
    <div className="hidden lg:block w-64 flex-shrink-0 h-[calc(100vh-10rem)] sticky top-16 overflow-y-auto py-6 pr-4 font-mono text-sm">
        <nav className="space-y-6">
          {navigation.map((section) => {
            const isExpanded = expandedSections.includes(section.title)
            const isActive = section.href === pathname

            if (!section.items) {
               return (
                <Link key={section.title} href={section.href || "#"} className={cn("block hover:text-white transition-colors", isActive ? "text-primary font-bold" : "text-white/40")}>
                   <span className="mr-3">{isActive ? ">" : "#"}</span>
                   {section.title.toUpperCase()}
                </Link>
               )
            }

            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full text-left hover:text-white transition-colors mb-2 text-white/40 font-bold"
                >
                  <span className="mr-3 text-primary opacity-50">[{isExpanded ? "-" : "+"}]</span>
                  {section.title.toUpperCase()}
                </button>

                {isExpanded && (
                  <div className="ml-1 space-y-1 border-l border-white/5 pl-4">
                    {section.items.map((item) => {
                      const isItemActive = pathname === item.href
                      return (
                        <Link key={item.href + item.title} href={item.href} className={cn("block hover:text-white transition-colors py-1", isItemActive ? "text-primary" : "text-white/40")}>
                          <span className="mr-3 opacity-30">{isItemActive ? "*" : "-"}</span>
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
