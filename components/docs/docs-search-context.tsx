"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

const DocsSearchContext = createContext<{
  query: string
  setQuery: (q: string) => void
}>({ query: "", setQuery: () => {} })

export function DocsSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("")
  return (
    <DocsSearchContext.Provider value={{ query, setQuery }}>
      {children}
    </DocsSearchContext.Provider>
  )
}

export function useDocsSearch() {
  return useContext(DocsSearchContext)
}
