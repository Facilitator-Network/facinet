import { cn } from "@/lib/utils"

interface CodeWindowProps {
  title?: string
  children: React.ReactNode
  className?: string
  footer?: string
}

export function CodeWindow({ title = "terminal", children, className, footer }: CodeWindowProps) {
  return (
    <div className={cn("relative rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/10 shadow-2xl", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-white/5 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        {title && <div className="text-xs text-white/40 font-mono select-none">{title}</div>}
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto">
         {/* If children is a string, wrap in pre/code. If it's ReactNode (like custom spans), render directly. */}
         {typeof children === 'string' ? (
             <pre className="font-mono text-sm leading-relaxed text-white/80">
                 <code>{children}</code>
             </pre>
         ) : (
             <div className="font-mono text-sm leading-relaxed">
                 {children}
             </div>
         )}
      </div>

      {/* Optional Footer */}
      {footer && (
        <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 text-xs text-white/50 leading-relaxed font-light">
            {footer}
        </div>
      )}
    </div>
  )
}
