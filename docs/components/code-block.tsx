"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language = "typescript", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("relative group", className)}>
      <div className="absolute right-2 top-2 z-10">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={copyToClipboard}
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
        <code className={cn("font-mono", `language-${language}`)}>{code}</code>
      </pre>
    </div>
  )
}

