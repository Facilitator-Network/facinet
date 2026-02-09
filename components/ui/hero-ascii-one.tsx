"use client"

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Menu, X, Wallet } from 'lucide-react'
import React from 'react'

interface HeroAsciiWrapperProps {
  children?: React.ReactNode
}
// ... (rest is same)

export default function HeroAsciiWrapper({ children }: HeroAsciiWrapperProps) {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-transparent text-white selection:bg-white/20">
      {/* Stars background extracted to RootLayout */}

      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 lg:px-8 py-2 lg:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="font-mono text-white text-xl lg:text-2xl font-bold tracking-widest italic transform -skew-x-12">
              FACINET
            </div>
            <div className="h-3 lg:h-4 w-px bg-white/40"></div>
            <span className="text-white/60 text-[8px] lg:text-[9px] font-mono">EST. 2025</span>
            
            {/* Nav Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-6 ml-8">
               {['Home', 'Facilitator', 'Chain', 'Explorer', 'Institution', 'Docs'].map((item) => (
                 <Link 
                   key={item} 
                   href={
                     item === 'Home' ? '/' : 
                     `/${item.toLowerCase()}`
                   }
                   className="text-white/70 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors"
                 >
                   {item}
                 </Link>
               ))}
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
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
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all group"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 group-hover:bg-green-400 transition-colors" />
                        <span className="text-xs font-mono font-bold tracking-wider text-white/80 group-hover:text-white">CONNECT WALLET</span>
                      </button>
                    ) : (
                      <button
                        onClick={openAccountModal}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all group"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-mono font-bold tracking-wider text-white/80 group-hover:text-white">
                          {account.displayName}
                        </span>
                      </button>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-3 text-[10px] font-mono text-white/60">
              <span>NET: ACTIVE</span>
              <div className="w-1 h-1 bg-green-500/80 rounded-full animate-pulse"></div>
              <span>TPS: 0</span>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="lg:hidden p-2 text-white/80 hover:text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-12">
            <div className="font-mono text-white text-2xl font-bold tracking-widest italic transform -skew-x-12">
              FACINET
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-8">
             {/* Wallet Status Section (Prominent) */}
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
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 text-center">
                    <div className={`relative p-4 rounded-full border-2 ${connected ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                      <Wallet className={`w-8 h-8 ${connected ? 'text-green-400' : 'text-red-400'}`} />
                      {connected && <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-black" />}
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold font-mono text-white tracking-wide">
                        {connected ? 'WALLET CONNECTED' : 'NOT CONNECTED'}
                      </h3>
                      <p className="text-sm font-mono text-white/50">
                        {connected ? account.displayName : 'Connect to access full features'}
                      </p>
                    </div>

                    <button
                      onClick={connected ? openAccountModal : openConnectModal}
                      className={`w-full py-3 rounded-lg font-mono font-bold uppercase tracking-wider text-sm transition-all ${
                        connected 
                          ? 'bg-white/10 text-white hover:bg-white/20' 
                          : 'bg-white text-black hover:bg-white/90'
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
              {['Home', 'Facilitator', 'Chain', 'Explorer', 'Institution', 'Docs'].map((item) => (
                <Link 
                  key={item} 
                  href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-mono font-light text-white/80 hover:text-white hover:pl-4 transition-all"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-white/10 pt-6">
            <div className="flex justify-between text-xs font-mono text-white/40 uppercase tracking-widest">
              <span>Net: Active</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      )}

      {/* Corner Frame Accents (Fixed) */}
      <div className="fixed top-20 left-4 lg:top-24 lg:left-8 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-l-2 border-white/10 z-40 pointer-events-none"></div>
      <div className="fixed top-20 right-4 lg:top-24 lg:right-8 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-white/10 z-40 pointer-events-none"></div>
      <div className="fixed bottom-20 left-4 lg:bottom-12 lg:left-8 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-l-2 border-white/10 z-40 pointer-events-none"></div>
      <div className="fixed bottom-20 right-4 lg:bottom-12 lg:right-8 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-white/10 z-40 pointer-events-none"></div>

      {/* Main Content (Fixed Scrollable Viewport) */}
      <div className="fixed top-20 bottom-20 left-4 right-4 lg:top-24 lg:bottom-12 lg:left-8 lg:right-8 z-10 overflow-y-auto overflow-x-hidden scrollbar-none">
        {children}
      </div>
      
      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Bottom Footer (Fixed) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 lg:px-8 py-2 lg:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6 text-[8px] lg:text-[9px] font-mono text-white/50">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5 lg:h-2 lg:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 lg:h-2 lg:w-2 bg-green-500"></span>
              </span>
              <span className="font-bold tracking-widest text-white/90">FACINET</span>
            </div>
            <div className="hidden lg:flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-1 h-3 bg-white/10" style={{ height: `${[12, 8, 14, 6, 16, 10, 8, 12][i % 8]}px` }}></div>
              ))}
            </div>
            <span>V1.0.0</span>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4 text-[8px] lg:text-[9px] font-mono text-white/50">
            <span className="hidden lg:inline">◐ RENDERING</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="hidden lg:inline">FRAME: ∞</span>
          </div>
        </div>
      </div>

    </main>
  )
}
