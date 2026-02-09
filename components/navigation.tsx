"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()
  
  // Hide on docs pages or home page (since Home uses HeroAsciiWrapper with its own nav)
  if (pathname?.startsWith("/docs") || pathname === "/") {
    return null
  }

  const { theme, setTheme } = useTheme()
  const [isVisible, setIsVisible] = React.useState(true)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    const handleScroll = () => {
      // If at the very top, always show
      if (window.scrollY < 20) {
        setIsVisible(true)
        return
      }

      // Hide while scrolling
      setIsVisible(false)

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Show after scroll stops
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
    { href: "/facilitator", label: "Facilitators" },
    { href: "/agents", label: "Agents" },
    { href: "/docs", label: "Docs" },
  ]

  return (
    <nav
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out",
        "w-[95%] max-w-4xl rounded-2xl border border-border/40 bg-background/60 backdrop-blur-xl shadow-lg supports-[backdrop-filter]:bg-background/60",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"
      )}
    >
      <div className="px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink glow-effect flex-shrink-0" />
            <span className="text-xl font-bold text-gradient hidden sm:inline-block">Facinet</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-xl transition-all hover:bg-primary/10 hover:text-primary",
                  pathname === link.href ? "text-foreground bg-primary/5" : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent rounded-full h-8 border-primary/20 hover:border-primary/50">
              Get Demo
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full w-8 h-8"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

