"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  // Hide on docs pages or home page (since Home uses HeroAsciiWrapper with its own nav)
  if (pathname?.startsWith("/docs") || pathname === "/") {
    return null
  }

  const [isVisible, setIsVisible] = React.useState(true)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 20) {
        setIsVisible(true)
        return
      }
      setIsVisible(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const links = [
    { href: "/", label: "Home" },
    { href: "/api", label: "API" },
    { href: "/facilitator", label: "Facilitators" },
    { href: "/explorer", label: "Explorer" },
    { href: "/docs", label: "Docs" },
  ]

  return (
    <nav
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out",
        "w-[95%] max-w-4xl rounded-2xl glass-heavy shadow-[var(--glass-shadow)]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"
      )}
    >
      <div className="px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-mono font-bold tracking-widest uppercase text-[var(--text-primary)]">FACINET</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-[0.8125rem] font-mono font-medium tracking-[0.06em] uppercase rounded-xl transition-all hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]",
                  pathname === link.href ? "text-[var(--text-primary)] bg-[var(--accent-subtle)]" : "text-[var(--text-secondary)]",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent rounded-full h-8 border-[var(--accent-muted)] hover:border-[var(--accent)] font-display text-xs uppercase tracking-wider">
              Get Demo
            </Button>

          </div>
        </div>
      </div>
    </nav>
  )
}
