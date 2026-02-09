"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface GlowingBorderBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function GlowingBorderBtn({ children, className, ...props }: GlowingBorderBtnProps) {
  return (
    <button
      className={cn(
        "relative rounded-full p-[1px] overflow-hidden group focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
        className
      )}
      {...props}
    >
      {/* Spinning Gradient Border */}
      <span className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0000_0%,#fff_50%,#0000_100%)]" />
      
      {/* Button Content Background (Mask) */}
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black/80 px-6 py-3 text-sm font-medium text-white backdrop-blur-3xl transition-colors hover:bg-black/70">
        {children}
      </span>
    </button>
  )
}
