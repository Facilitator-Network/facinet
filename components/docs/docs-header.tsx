"use client"

import Link from "next/link"
import { DocsSearch } from "@/components/docs/docs-search"
import { Menu } from "lucide-react"

export function DocsHeader() {
  return (
    <header className="sticky top-0 z-40 w-full pt-4 pb-0 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
      <div className="container px-4 sm:px-6 lg:px-8 flex justify-end">
        <div className="w-full max-w-md pointer-events-auto">
             <DocsSearch />
        </div>
      </div>
    </header>
  )
}
