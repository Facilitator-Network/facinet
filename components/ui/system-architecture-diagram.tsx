"use client"

import React from 'react'
import { motion } from 'framer-motion'

// System Architecture Diagram Component
// Background-only version as requested.

export function SystemArchitectureDiagram() {
  return (
    <div className="w-full h-[400px] sm:h-[500px] flex items-center justify-center bg-black/40 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative group">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent opacity-50" />
      
    </div>
  )
}
