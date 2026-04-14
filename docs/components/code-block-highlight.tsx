"use client"

import { useState, useEffect } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface CodeBlockHighlightProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlockHighlight({ code, language = "typescript", className }: CodeBlockHighlightProps) {
  const [copied, setCopied] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const highlight = async () => {
      try {
        const { codeToHtml } = await import('shiki')
        const currentTheme = resolvedTheme === 'dark' ? 'github-dark' : 'github-light'
        
        // Map env to properties (similar syntax for .env files)
        const lang = language === 'env' ? 'properties' : language
        
        const html = await codeToHtml(code, {
          lang: lang,
          theme: currentTheme,
        })
        setHighlightedCode(html)
      } catch (error) {
        console.error('Failed to highlight code:', error)
        // Fallback to plain code
        setHighlightedCode(`<pre class="shiki"><code>${code}</code></pre>`)
      }
    }

    highlight()
  }, [code, language, resolvedTheme, mounted])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!mounted) {
    return (
      <div className={cn("relative group", className)}>
        <div className="absolute right-2 top-2 z-10">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={copyToClipboard}
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
          <code className="font-mono">{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className={cn("relative group", className)}>
      <div className="absolute right-2 top-2 z-10">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={copyToClipboard}
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <div
        className="rounded-lg border bg-card [&_pre]:!m-0 [&_pre]:!p-4 [&_pre]:!bg-transparent [&_pre]:!text-sm [&_pre]:font-mono [&_code]:!text-sm [&_pre]:!overflow-x-auto [&_pre]:!whitespace-pre [&_code]:!whitespace-pre"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </div>
  )
}

