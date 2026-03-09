import Link from "next/link"

interface DocsPagerProps {
  prev?: { title: string; href: string }
  next?: { title: string; href: string }
}

export function DocsPager({ prev, next }: DocsPagerProps) {
  return (
    <div className="flex flex-row items-center justify-between mt-16 pt-8 border-t border-[var(--bg-border)] font-mono text-sm">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col items-start gap-1 text-muted-foreground hover:text-[var(--accent)] transition-colors"
        >
          <span className="text-xs opacity-50 group-hover:opacity-100">&lt; PREV</span>
          <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] tracking-tight">
             [ {prev.title} ]
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col items-end gap-1 text-muted-foreground hover:text-[var(--accent)] transition-colors"
        >
          <span className="text-xs opacity-50 group-hover:opacity-100">NEXT &gt;</span>
          <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] tracking-tight">
             [ {next.title} ]
          </span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
