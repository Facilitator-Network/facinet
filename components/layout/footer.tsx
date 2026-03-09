"use client"

import Link from "next/link"
import { Github, Twitter, Send, Mail, LucideIcon } from "lucide-react"

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
      <div className="w-full max-w-7xl glass rounded-xl py-6 px-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ boxShadow: 'var(--glass-shadow)' }}>

        {/* Left: Copyright */}
        <div className="text-[var(--text-tertiary)] text-xs font-body order-3 md:order-1">
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
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-110 transition-all duration-300"
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
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-subtle hover:bg-[var(--accent-subtle)] transition-all group"
          >
            <Mail className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
            <span className="text-xs font-body font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              {data.contact.label}
            </span>
          </Link>
        </div>

      </div>
    </footer>
  )
}
