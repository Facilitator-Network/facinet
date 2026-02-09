"use client"

import Link from "next/link"
import { Github, Twitter, Send, Mail, LucideIcon } from "lucide-react"

// Map icons
const ICON_MAP: Record<string, LucideIcon> = {
  Twitter,
  Github,
  Send,
  Mail
}

interface FooterProps {
  data: {
    copyright: string
    socials: Array<{ label: string; href: string; icon: string }>
    contact: { label: string; href: string; icon: string }
  }
}

export function Footer({ data }: FooterProps) {
  return (
    <footer className="relative pb-6 pt-0 px-4 flex justify-center">
      {/* Floating Glass Container - Wider, Rectangular with circular edges */}
      <div className="w-full max-w-7xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl py-6 px-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        
        {/* Left: Copyright at corner */}
        <div className="text-white/30 text-xs font-mono order-3 md:order-1">
          {data.copyright}
        </div>

        {/* Center: Social Icons */}
        <div className="flex items-center gap-6 order-1 md:order-2">
          {data.socials.map((social) => {
            const Icon = ICON_MAP[social.icon] || Github
            return (
              <Link 
                key={social.label} 
                href={social.href}
                className="text-white/60 hover:text-white hover:scale-110 transition-all duration-300"
                title={social.label}
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          })}
        </div>

        {/* Right: Contact Us */}
        <div className="order-2 md:order-3">
          <Link 
            href={data.contact.href}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
          >
            <Mail className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
            <span className="text-xs font-mono font-medium text-white/60 group-hover:text-white transition-colors">
              {data.contact.label}
            </span>
          </Link>
        </div>

      </div>
    </footer>
  )
}
