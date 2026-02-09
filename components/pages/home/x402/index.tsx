"use client"

/**
 * X402Section Component
 * 
 * Explains the core concept of the "402 Payment Required" error code reborn.
 * 
 * JUNIOR DEV NOTE:
 * - This component follows a "Presentational" pattern where it mostly handles UI rendering.
 * - It receives `data` as a prop, making it reusable and easy to test with different content.
 * - We use `CodeWindow` which is a shared UI component to ensure consistent code block styling.
 */

import { CodeWindow } from "@/components/ui/code-window"

interface X402SectionProps {
  data: {
    title: string
    description: string
    codeSection: {
      title: string
      code: string
      description: string
    }
  }
}

export function X402Section({ data }: X402SectionProps) {

  return (
    <section className="py-24 relative bg-transparent border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text */}
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 uppercase tracking-tight font-mono">
              {data.title}
            </h2>
            <p className="text-xl text-white/60 leading-relaxed font-light font-mono">
              {data.description}
            </p>
          </div>

          {/* Right Column: Code Card */}
          <div className="relative">
            {/* Glow Effect - Negative margin expands the glow slightly beyond the container */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur-2xl opacity-50" />
            
            <div className="relative">
               <h3 className="text-xl font-semibold text-white/90 mb-6">
                {data.codeSection.title}
              </h3>
              
               {/* 
                  CodeWindow is a custom UI component. 
                  Check components/ui/code-window.tsx to see how it works.
               */}
               <CodeWindow title="server.js" footer={data.codeSection.description} className="bg-card/50 backdrop-blur-xl border-white/10">
                    <pre className="font-mono text-sm leading-relaxed">
                      {/* 
                          We construct the code block manually with spans for syntax highlighting.
                          In a larger app, we might use a library like `prismjs` or `shiki`.
                      */}
                      <span className="text-blue-400">app</span><span className="text-white">.</span><span className="text-yellow-300">use</span><span className="text-white">(</span>{"\n"}
                      <span className="text-white">  </span><span className="text-purple-400">paymentMiddleware</span><span className="text-white">(</span>{"\n"}
                      <span className="text-white">    {`{`}</span>{"\n"}
                      <span className="text-white">      </span><span className="text-green-400">"GET /weather"</span><span className="text-white">: {`{`}</span>{"\n"}
                      <span className="text-white">        </span><span className="text-blue-400">accepts</span><span className="text-white">: [...], </span><span className="text-gray-500">// As many networks / schemes as...</span>{"\n"}
                      <span className="text-white">        </span><span className="text-blue-400">description</span><span className="text-white">: </span><span className="text-green-400">"Weather data"</span><span className="text-white">,</span>{"\n"}
                      <span className="text-white">      {`}`},</span>{"\n"}
                      <span className="text-white">    {`}`},</span>{"\n"}
                      <span className="text-white">  )</span>{"\n"}
                      <span className="text-white">);</span>
                    </pre>
               </CodeWindow>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
