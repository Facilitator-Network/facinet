import { cn } from "@/lib/utils"

interface CodeWindowProps {
  title?: string
  children: React.ReactNode
  className?: string
  footer?: string
}

export function CodeWindow({ title = "terminal", children, className, footer }: CodeWindowProps) {
  return (
    <div className={cn("relative rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-code)] border border-[var(--bg-border)] shadow-[var(--glass-shadow)]", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-3 bg-[var(--bg-raised)] border-b border-[var(--bg-border)]">
        <div className="flex gap-1.5">
          <div className="w-[10px] h-[10px] rounded-full bg-[var(--error)]" />
          <div className="w-[10px] h-[10px] rounded-full bg-[var(--warning)]" />
          <div className="w-[10px] h-[10px] rounded-full bg-[var(--success)]" />
        </div>
        {title && <div className="text-xs text-[var(--text-tertiary)] font-mono uppercase tracking-[0.02em] select-none">{title}</div>}
      </div>

      {/* Code Content */}
      <div className="p-5 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {typeof children === 'string' ? (
          <pre className="font-mono text-sm leading-relaxed text-[var(--text-primary)]">
            <code>{children}</code>
          </pre>
        ) : (
          <div className="font-mono text-sm leading-[1.7]">
            {children}
          </div>
        )}
      </div>

      {/* Optional Footer */}
      {footer && (
        <div className="px-5 py-3 bg-[var(--bg-surface)] border-t border-[var(--bg-border)] text-xs text-[var(--text-secondary)] leading-relaxed font-body">
          {footer}
        </div>
      )}
    </div>
  )
}
