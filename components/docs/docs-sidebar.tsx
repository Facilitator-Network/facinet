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
  const [expandedSections, setExpandedSections] = useState<string[]>(["Facinet Client", "Facilitator", "Agents", "Architecture", "API Reference"])

  const navigation: NavItem[] = [
    { title: "Getting Started", href: "/docs/getting-started" },
    {
      title: "Facinet Client",
      items: [
        { title: "Features", href: "/docs/client/features" },
        { title: "Installation", href: "/docs/client/installation" },
        { title: "CLI Usage", href: "/docs/client/cli" },
        { title: "SDK Usage", href: "/docs/client/sdk" },
      ],
    },
    {
      title: "Facilitator",
      items: [
        { title: "Overview", href: "/docs/facilitator/overview" },
        { title: "Install", href: "/docs/facilitator/install" },
        { title: "Configuration", href: "/docs/facilitator/config" },
        { title: "Staking & Rewards", href: "/docs/facilitator/staking" },
        { title: "Monitoring", href: "/docs/facilitator/monitoring" },
      ],
    },
    {
      title: "Agents",
      items: [
        { title: "Overview", href: "/docs/agents/overview" },
        { title: "Register Agent", href: "/docs/agents/register" },
        { title: "Capabilities", href: "/docs/agents/capabilities" },
        { title: "Versioning", href: "/docs/agents/versioning" },
      ],
    },
    {
      title: "Architecture",
      items: [
        { title: "Network", href: "/docs/architecture/network" },
        { title: "Request Flow", href: "/docs/architecture/flow" },
      ],
    },
    {
      title: "API Reference",
      items: [
        { title: "Facilitator API", href: "/docs/api/facilitator" },
        { title: "Agents API", href: "/docs/api/agents" },
        { title: "Event Streams", href: "/docs/api/events" },
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
                        <Link key={item.href} href={item.href} className={cn("block hover:text-white transition-colors py-1", isItemActive ? "text-primary" : "text-white/40")}>
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
