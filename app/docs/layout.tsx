import type React from "react"
import { DocsSidebar } from "@/components/docs/docs-sidebar"
import { DocsHeader } from "@/components/docs/docs-header"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-black">
      
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
  )
}
