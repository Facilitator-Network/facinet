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
        "relative rounded-full p-[1px] overflow-hidden group focus:outline-none",
        className
      )}
      {...props}
    >
      {/* Spinning Gradient Border */}
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,#cbd5e1_50%,#fff_100%)] opacity-60" />
      
      {/* Button Content Background (Mask) */}
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950/90 px-8 py-3 text-sm font-medium text-white backdrop-blur-xl transition-all hover:bg-slate-950/70 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
        {children}
      </span>
    </button>
  )
}
