"use client"

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Menu, X, Wallet } from 'lucide-react'
import React from 'react'

interface HeroAsciiWrapperProps {
  children?: React.ReactNode
}

export default function HeroAsciiWrapper({ children }: HeroAsciiWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-transparent text-[var(--text-primary)] selection:bg-[var(--accent-muted)]">

      {/* Top Header — Glass Heavy */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-heavy" style={{ borderBottom: '1px solid var(--glass-heavy-border)' }}>
        <div className="container mx-auto px-4 lg:px-8 py-2 lg:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6">
            {/* Logo — terminal style */}
            <div className="flex items-center gap-2.5">
              <div className="font-mono text-[var(--text-primary)] text-xl lg:text-2xl font-bold tracking-widest uppercase">
                FACINET
              </div>
            </div>
            <div className="h-3 lg:h-4 w-px bg-[var(--bg-border)]"></div>
            <span className="text-[var(--text-tertiary)] text-[8px] lg:text-[9px] font-mono">EST. 2025</span>

            {/* Nav Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-6 ml-8">
              {['Home', 'API', 'Facilitator', 'Explorer', 'Chain', 'Institution', 'Docs'].map((item) => (
                <Link
                  key={item}
                  href={
                    item === 'Home' ? '/' :
                    item === 'API' ? '/api' :
                    item === 'Explorer' ? '/explorer' :
                    `/${item.toLowerCase()}`
                  }
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[11px] font-mono font-medium tracking-[0.08em] uppercase transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {/* Wallet Connect */}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const connected = mounted && account && chain;
                return (
                  <div>
                    {!connected ? (
                      <button
                        onClick={openConnectModal}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-subtle hover:bg-[var(--accent-subtle)] transition-all group cursor-pointer"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--error)] group-hover:bg-[var(--success)] transition-colors" />
                        <span className="text-xs font-mono font-bold tracking-wider text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">CONNECT WALLET</span>
                      </button>
                    ) : (
                      <button
                        onClick={openAccountModal}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-subtle hover:bg-[var(--accent-subtle)] transition-all group cursor-pointer"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                        <span className="text-xs font-mono font-bold tracking-wider text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                          {account.displayName}
                        </span>
                      </button>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>

            <div className="h-4 w-px bg-[var(--bg-border)]" />

            <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--text-tertiary)]">
              <span>NET: ACTIVE</span>
              <div className="w-1 h-1 bg-[var(--success)] rounded-full animate-pulse"></div>
              <span>TPS: 0</span>
            </div>
          </div>

          {/* Mobile: Hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col p-6 animate-in fade-in duration-200" style={{ background: 'var(--bg-void)', opacity: 0.98 }}>
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2.5">
              <div className="font-mono text-[var(--text-primary)] text-2xl font-bold tracking-widest uppercase">
                FACINET
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full glass-subtle text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-8">
            {/* Wallet Status Section */}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openConnectModal,
                mounted,
              }) => {
                const connected = mounted && account && chain;
                return (
                  <div className="p-6 rounded-2xl glass flex flex-col items-center justify-center gap-4 text-center">
                    <div className={`relative p-4 rounded-full border-2 ${connected ? 'border-[var(--success)]' : 'border-[var(--error)]'}`} style={{ background: connected ? 'var(--success-bg)' : 'var(--error-bg)' }}>
                      <Wallet className={`w-8 h-8 ${connected ? 'text-[var(--success)]' : 'text-[var(--error)]'}`} />
                      {connected && <div className="absolute top-0 right-0 w-3 h-3 bg-[var(--success)] rounded-full animate-pulse border-2 border-[var(--bg-void)]" />}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-bold font-display text-[var(--text-primary)] tracking-wide uppercase">
                        {connected ? 'WALLET CONNECTED' : 'NOT CONNECTED'}
                      </h3>
                      <p className="text-sm font-body text-[var(--text-secondary)]">
                        {connected ? account.displayName : 'Connect to access full features'}
                      </p>
                    </div>

                    <button
                      onClick={connected ? openAccountModal : openConnectModal}
                      className={`w-full py-3 rounded-lg font-display font-bold uppercase tracking-wider text-sm transition-all cursor-pointer ${
                        connected
                          ? 'glass-subtle text-[var(--text-primary)]'
                          : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                      }`}
                    >
                      {connected ? 'Manage Wallet' : 'Connect Now'}
                    </button>
                  </div>
                );
              }}
            </ConnectButton.Custom>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-4">
              {['Home', 'API', 'Facilitator', 'Explorer', 'Chain', 'Institution', 'Docs'].map((item) => (
                <Link
                  key={item}
                  href={
                    item === 'Home' ? '/' :
                    item === 'API' ? '/api' :
                    item === 'Explorer' ? '/explorer' :
                    `/${item.toLowerCase()}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-body font-light text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:pl-4 transition-all"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-[var(--bg-border)] pt-6">
            <div className="flex justify-between text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">
              <span>Net: Active</span>
              <span>v0.2.3</span>
            </div>
          </div>
        </div>
      )}

      {/* Corner Frame Accents (Fixed) */}
      <div className="fixed top-20 left-4 lg:top-24 lg:left-8 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-l-2 border-[var(--bg-border)] z-40 pointer-events-none"></div>
      <div className="fixed top-20 right-4 lg:top-24 lg:right-8 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-[var(--bg-border)] z-40 pointer-events-none"></div>
      <div className="fixed bottom-20 left-4 lg:bottom-12 lg:left-8 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-l-2 border-[var(--bg-border)] z-40 pointer-events-none"></div>
      <div className="fixed bottom-20 right-4 lg:bottom-12 lg:right-8 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-[var(--bg-border)] z-40 pointer-events-none"></div>

      {/* Main Content (Fixed Scrollable Viewport) */}
      <div className="fixed top-20 bottom-20 left-4 right-4 lg:top-24 lg:bottom-12 lg:left-8 lg:right-8 z-10 overflow-y-auto overflow-x-hidden scrollbar-none">
        {children}
      </div>

      {/* Bottom Footer (Fixed) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-heavy" style={{ borderTop: '1px solid var(--glass-heavy-border)' }}>
        <div className="container mx-auto px-4 lg:px-8 py-2 lg:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6 text-[8px] lg:text-[9px] font-mono text-[var(--text-tertiary)]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5 lg:h-2 lg:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 lg:h-2 lg:w-2 bg-[var(--success)]"></span>
              </span>
              <span className="font-bold tracking-widest text-[var(--text-primary)]">FACINET</span>
            </div>
            <div className="hidden lg:flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-1 bg-[var(--bg-border)]" style={{ height: `${[12, 8, 14, 6, 16, 10, 8, 12][i % 8]}px` }}></div>
              ))}
            </div>
            <span>V0.2.3</span>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 text-[8px] lg:text-[9px] font-mono text-[var(--text-tertiary)]">
            <span className="hidden lg:inline">RENDERING</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-[var(--text-secondary)] rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-[var(--text-tertiary)] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-[var(--bg-border)] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="hidden lg:inline">FRAME: INF</span>
          </div>
        </div>
      </div>
    </main>
  )
}
