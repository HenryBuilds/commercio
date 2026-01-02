"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"

interface MermaidDiagramProps {
  chart: string
  title?: string
  className?: string
}

export function MermaidDiagram({ chart, title, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mermaidRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const renderKeyRef = useRef(0)
  const isRenderingRef = useRef(false)

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains("dark"))
  }, [])

  useEffect(() => {
    if (!mounted || !containerRef.current) return

    const renderDiagram = async () => {
      // Prevent concurrent renders
      if (isRenderingRef.current) return
      isRenderingRef.current = true

      try {
        const currentKey = ++renderKeyRef.current
        const container = containerRef.current

        // Create a new div for Mermaid (React won't manage this)
        if (mermaidRef.current && container && mermaidRef.current.parentNode === container) {
          // Remove old mermaid div safely
          try {
            container.removeChild(mermaidRef.current)
          } catch (e) {
            // Ignore if already removed
          }
        }

        // Check if we're still the current render
        if (currentKey !== renderKeyRef.current) {
          isRenderingRef.current = false
          return
        }

        // Create new mermaid container
        if (!container) {
          isRenderingRef.current = false
          return
        }
        
        const mermaidContainer = document.createElement('div')
        mermaidContainer.className = 'mermaid'
        mermaidContainer.textContent = chart
        mermaidContainer.id = `mermaid-${Math.random().toString(36).substring(7)}`
        
        container.appendChild(mermaidContainer)
        mermaidRef.current = mermaidContainer

        // Check again if we're still current
        if (currentKey !== renderKeyRef.current) {
          isRenderingRef.current = false
          return
        }

        await mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          themeVariables: {
            fontFamily: "var(--font-mono)",
            fontSize: "16px",
            // Neutral colors - no bright colors
            primaryColor: isDark ? "#6b7280" : "#6b7280",
            primaryTextColor: isDark ? "#e5e7eb" : "#374151",
            primaryBorderColor: isDark ? "#4b5563" : "#9ca3af",
            lineColor: isDark ? "#6b7280" : "#9ca3af",
            secondaryColor: isDark ? "#374151" : "#f3f4f6",
            tertiaryColor: isDark ? "#1f2937" : "#ffffff",
            // Flowchart specific
            mainBkgColor: isDark ? "#374151" : "#f9fafb",
            secondBkgColor: isDark ? "#4b5563" : "#f3f4f6",
            tertiaryBkgColor: isDark ? "#6b7280" : "#e5e7eb",
            secondaryBorderColor: isDark ? "#4b5563" : "#d1d5db",
            tertiaryBorderColor: isDark ? "#374151" : "#e5e7eb",
            secondaryTextColor: isDark ? "#d1d5db" : "#4b5563",
            tertiaryTextColor: isDark ? "#9ca3af" : "#6b7280",
            textColor: isDark ? "#e5e7eb" : "#374151",
            // Sequence diagram specific
            actorBorder: isDark ? "#6b7280" : "#9ca3af",
            actorBkg: isDark ? "#374151" : "#f9fafb",
            actorTextColor: isDark ? "#e5e7eb" : "#374151",
            actorLineColor: isDark ? "#6b7280" : "#9ca3af",
            signalColor: isDark ? "#9ca3af" : "#6b7280",
            signalTextColor: isDark ? "#e5e7eb" : "#374151",
            labelBoxBkgColor: isDark ? "#374151" : "#f9fafb",
            labelBoxBorderColor: isDark ? "#6b7280" : "#9ca3af",
            labelTextColor: isDark ? "#e5e7eb" : "#374151",
            noteBorderColor: isDark ? "#6b7280" : "#9ca3af",
            noteBkgColor: isDark ? "#374151" : "#f9fafb",
            noteTextColor: isDark ? "#e5e7eb" : "#374151",
            activationBorderColor: isDark ? "#6b7280" : "#9ca3af",
            activationBkgColor: isDark ? "#4b5563" : "#e5e7eb",
          },
          securityLevel: "loose",
        })

        // Wait a bit to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 10))
        
        // Final check if we're still current
        if (currentKey !== renderKeyRef.current || !mermaidRef.current) {
          isRenderingRef.current = false
          return
        }

        try {
          await mermaid.run({
            nodes: [mermaidRef.current],
            suppressErrors: true,
          })
        } catch (runError) {
          console.error("Mermaid run error:", runError)
          // Fallback: show code if rendering fails
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `<pre class="text-sm text-muted-foreground p-4">${chart}</pre>`
          }
        }
      } catch (error) {
        console.error("Mermaid rendering error:", error)
      } finally {
        isRenderingRef.current = false
      }
    }

    renderDiagram()

    // Cleanup function
    return () => {
      renderKeyRef.current++
      if (mermaidRef.current && mermaidRef.current.parentNode) {
        try {
          mermaidRef.current.parentNode.removeChild(mermaidRef.current)
        } catch (e) {
          // Ignore cleanup errors
        }
        mermaidRef.current = null
      }
    }
  }, [chart, mounted, isDark])

  // Listen for theme changes
  useEffect(() => {
    if (!mounted) return

    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark")
      if (dark !== isDark) {
        setIsDark(dark)
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [mounted, isDark])

  return (
    <div className={className}>
      {title && (
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      )}
      <div className="rounded-lg border bg-card p-6 overflow-x-auto">
        <div ref={containerRef} className="min-h-[500px] flex items-center justify-center">
          {!mounted && <div className="text-muted-foreground">Loading diagram...</div>}
        </div>
      </div>
    </div>
  )
}

