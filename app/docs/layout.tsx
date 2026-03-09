import type React from "react"
import { DocsSidebar } from "@/components/docs/docs-sidebar"
import { DocsHeader } from "@/components/docs/docs-header"
import { DocsSearchProvider } from "@/components/docs/docs-search-context"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DocsSearchProvider>
      <div className="relative min-h-screen bg-[var(--bg-void)]">

        <div className="relative z-10">
          <DocsHeader />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-12">
              <DocsSidebar />
              <main className="flex-1 min-w-0 py-12">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </DocsSearchProvider>
  )
}
