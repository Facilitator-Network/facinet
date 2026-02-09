"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, X, Shield, Zap, Database, Wallet, Server, Globe, Lock, User, FileText, Smartphone } from 'lucide-react'

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  ArrowRight, Check, X, Shield, Zap, Database, Wallet, Server, Globe, Lock, User, FileText, Smartphone
}

export interface FlowStep {
  id: string
  label: string
  subLabel?: string
  icon?: string // key for ICON_MAP
  description?: string // simpler text
  status?: 'active' | 'completed' | 'pending' | 'failed'
  type?: 'node' | 'decision' | 'start' | 'end'
}

export interface FlowEdge {
  from: string
  to: string
  label?: string
  animated?: boolean
}

export interface ArchitectureFlowProps {
  title?: string
  description?: string
  steps: FlowStep[]
  edges: FlowEdge[]
  direction?: 'vertical' | 'horizontal'
}

export function AnimatedArchitectureFlow({ 
  title, 
  description, 
  steps, 
  direction = 'horizontal' 
}: ArchitectureFlowProps) {

  return (
    <div className="p-8 rounded-3xl bg-black/40 border border-white/10 relative overflow-hidden group">
      {/* Circuit Board Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {title && (
        <div className="relative z-10 mb-8 md:mb-12 text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-bold font-mono text-white uppercase tracking-tight mb-2 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
             {title}
          </h3>
          {description && <p className="text-white/50 text-sm md:text-base max-w-2xl font-light font-mono">{description}</p>}
        </div>
      )}

      {/* Horizontal Schematic Flow */}
      <div className="relative z-10 w-full overflow-x-auto pb-4 scrollbar-none">
        <div className="min-w-max flex items-start gap-0 px-4">
          
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1
            const Icon = step.icon ? ICON_MAP[step.icon] : null

            return (
              <React.Fragment key={step.id}>
                {/* Node */}
                <div className="flex flex-col items-center gap-4 relative group/node w-32 md:w-40 shrink-0">
                   
                   {/* Icon Circle (Static) */}
                   <div 
                      className={`
                        w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center relative z-20 transition-all duration-500
                        ${step.type === 'start' ? 'bg-white/10 border-2 border-primary text-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]' : 
                          step.type === 'end' ? 'bg-white/10 border-2 border-green-500 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 
                          'bg-black/60 border border-white/20 text-white/70 hover:border-white/50 hover:text-white'}
                      `}
                   >
                      {Icon ? <Icon size={24} strokeWidth={1.5} /> : <div className="w-3 h-3 bg-current rounded-full" />}
                      
                      {/* Status Dot */}
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                          step.type === 'start' ? 'bg-primary' : step.type === 'end' ? 'bg-green-500' : 'bg-white/20'
                      }`} />
                   </div>

                   {/* Label (Static) */}
                   <div className="text-center space-y-1">
                      <div className="text-xs md:text-sm font-bold font-mono uppercase text-white tracking-wider">
                        {step.label}
                      </div>
                      {step.subLabel && (
                        <div className="text-[10px] font-mono text-primary/80 uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full inline-block">
                          {step.subLabel}
                        </div>
                      )}
                      {step.description && (
                        <p className="text-[10px] text-white/40 leading-tight max-w-[120px] mx-auto hidden md:block mt-2">
                          {step.description}
                        </p>
                      )}
                   </div>
                </div>

                {/* Connector Wire (Horizontal) */}
                {!isLast && (
                  <div className="flex-1 min-w-[40px] md:min-w-[80px] h-[64px] flex items-center justify-center relative -mx-4 z-10">
                    {/* The Wire */}
                    <div className="w-full h-[2px] bg-white/10 relative overflow-hidden rounded-full">
                       {/* Moving Particle Packet */}
                       <motion.div 
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2, 
                            ease: "linear",
                            delay: index * 0.5 // Stagger the flows
                          }}
                          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"
                       />
                    </div>
                    
                    {/* Arrow Head on wire center (optional, simplifies to just moving packet) */}
                    <div className="absolute right-0 text-white/10 transform translate-x-1/2">
                       <ArrowRight size={12} />
                    </div>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
