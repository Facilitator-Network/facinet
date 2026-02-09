"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function DocsSearch() {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search documentation..." 
        className="pl-9 bg-black border-white/10 focus-visible:ring-primary/50 text-white placeholder:text-muted-foreground"
      />
    </div>
  )
}
