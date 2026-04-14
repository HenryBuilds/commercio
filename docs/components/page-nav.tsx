"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { pages } from "@/lib/navigation"

export function PageNav() {
  const pathname = usePathname()
  const currentIndex = pages.findIndex((p) => p.href === pathname)

  if (currentIndex === -1) return null

  const prev = currentIndex > 0 ? pages[currentIndex - 1] : null
  const next = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null

  if (!prev && !next) return null

  return (
    <nav className="mt-16 flex items-center justify-between border-t pt-6">
      {prev ? (
        <Link
          href={prev.href}
          className="group text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="block text-xs text-muted-foreground/60 mb-0.5">Previous</span>
          <span className="group-hover:underline">&larr; {prev.title}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group text-sm text-right text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="block text-xs text-muted-foreground/60 mb-0.5">Next</span>
          <span className="group-hover:underline">{next.title} &rarr;</span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
