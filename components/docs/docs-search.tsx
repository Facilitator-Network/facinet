"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDocsSearch } from "@/components/docs/docs-search-context"

export function DocsSearch() {
  const { query, setQuery } = useDocsSearch()

  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <Input
        placeholder="Search docs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-8 h-8 text-xs bg-[var(--bg-surface)] border-[var(--bg-border)] focus-visible:ring-[var(--accent)]/50 text-[var(--text-primary)] font-body placeholder:text-[var(--text-tertiary)]"
      />
    </div>
  )
}
