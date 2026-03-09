"use client"

import { useState, useRef, useEffect } from "react"
import { DocsSearch } from "@/components/docs/docs-search"
import { Copy, Check, FileText, Eye, X } from "lucide-react"

function htmlToMarkdown(el: Element): string {
  const lines: string[] = []
  const visited = new WeakSet<Node>()

  function walk(node: Node) {
    if (visited.has(node)) return
    visited.add(node)

    // Skip hidden elements, scripts, styles, svgs
    if (node instanceof HTMLElement) {
      const tag = node.tagName.toLowerCase()
      if (tag === "script" || tag === "style" || tag === "svg" || tag === "nav" || tag === "header" || tag === "footer") return
      if (node.getAttribute("aria-hidden") === "true" || node.hidden) return

      const text = node.textContent?.trim() || ""
      if (!text) return

      // Block-level elements we handle directly (skip children walk)
      if (tag === "h1") { lines.push(`\n# ${text}\n`); return }
      if (tag === "h2") { lines.push(`\n## ${text}\n`); return }
      if (tag === "h3") { lines.push(`\n### ${text}\n`); return }
      if (tag === "h4") { lines.push(`\n#### ${text}\n`); return }
      if (tag === "pre") { lines.push(`\n\`\`\`\n${text}\n\`\`\`\n`); return }
      if (tag === "li") { lines.push(`- ${text}`); return }
      if (tag === "th") { lines.push(`| **${text}** `); return }
      if (tag === "td") { lines.push(`| ${text} `); return }
      if (tag === "tr") {
        // Process children first, then add row ending
        node.childNodes.forEach(walk)
        lines.push("|")
        return
      }
      if (tag === "p") { lines.push(`\n${text}\n`); return }
      if (tag === "blockquote") { lines.push(`\n> ${text}\n`); return }
      if (tag === "a" && node.getAttribute("href")) {
        lines.push(`[${text}](${node.getAttribute("href")})`)
        return
      }
      // For inline code not inside pre
      if (tag === "code" && node.parentElement?.tagName.toLowerCase() !== "pre") {
        lines.push(`\`${text}\``)
        return
      }
      if (tag === "strong" || tag === "b") { lines.push(`**${text}**`); return }
      if (tag === "em" || tag === "i") { lines.push(`*${text}*`); return }
      if (tag === "hr") { lines.push("\n---\n"); return }
      if (tag === "br") { lines.push("\n"); return }
      if (tag === "table") {
        // Walk table children normally
        node.childNodes.forEach(walk)
        return
      }
    }

    // For text nodes directly
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) lines.push(text)
      return
    }

    // Recurse into children for container elements
    node.childNodes.forEach(walk)
  }

  walk(el)

  // Clean up: remove consecutive blank lines, trim
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function DocsHeader() {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [mdContent, setMdContent] = useState("")
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showMenu])

  const getMd = () => {
    const main = document.querySelector("main")
    if (!main) return ""
    return htmlToMarkdown(main)
  }

  const handleCopy = () => {
    const md = getMd()
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true)
      setShowMenu(false)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleView = () => {
    setMdContent(getMd())
    setViewOpen(true)
    setShowMenu(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full pt-4 pb-0 bg-gradient-to-b from-[var(--bg-void)]/80 to-transparent pointer-events-none">
        <div className="container px-4 sm:px-6 lg:px-8 flex justify-end items-center gap-2">
          <div className="w-full max-w-xs pointer-events-auto">
            <DocsSearch />
          </div>

          {/* Markdown button with dropdown */}
          <div className="relative pointer-events-auto" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-1.5 px-3 h-8 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border border-[var(--bg-border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-muted)] transition-colors whitespace-nowrap"
            >
              {copied ? <Check className="h-3 w-3 text-[var(--success)]" /> : <FileText className="h-3 w-3" />}
              {copied ? "Copied" : "Markdown"}
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-[var(--bg-border)] bg-[var(--bg-surface)] shadow-md-2 overflow-hidden z-50">
                <button
                  onClick={handleView}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  View
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Markdown viewer modal */}
      {viewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[80vh] mx-4 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface)] shadow-md-4 flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--bg-border)]">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">Markdown Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(mdContent).then(() => {
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    })
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] border border-[var(--bg-border)] transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-[var(--success)]" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => setViewOpen(false)}
                  className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* Markdown content */}
            <pre className="flex-1 overflow-auto p-4 text-[13px] font-mono leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap break-words">
              {mdContent}
            </pre>
          </div>
        </div>
      )}
    </>
  )
}
