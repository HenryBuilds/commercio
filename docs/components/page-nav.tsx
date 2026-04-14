"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const pages = [
  { href: "/", title: "Home" },
  { href: "/installation", title: "Installation" },
  { href: "/quick-start", title: "Quick Start" },
  { href: "/categories", title: "Categories" },
  { href: "/products", title: "Products" },
  { href: "/product-variants", title: "Product Variants" },
  { href: "/customers", title: "Customers" },
  { href: "/addresses", title: "Addresses" },
  { href: "/warehouses", title: "Warehouses" },
  { href: "/inventory", title: "Inventory" },
  { href: "/orders", title: "Orders" },
  { href: "/invoices", title: "Invoices" },
  { href: "/payments", title: "Payments" },
  { href: "/shipping", title: "Shipping" },
  { href: "/pricing", title: "Pricing" },
  { href: "/tax", title: "Tax" },
  { href: "/suppliers", title: "Suppliers" },
  { href: "/promotions", title: "Promotions" },
  { href: "/audit-log", title: "Audit Log" },
  { href: "/webhooks", title: "Webhooks" },
  { href: "/currency", title: "Multi-Currency" },
  { href: "/reorder", title: "Reorder Rules" },
  { href: "/cart-rules", title: "Cart Rules" },
  { href: "/reporting", title: "Reporting" },
  { href: "/rma", title: "RMA / Returns" },
  { href: "/batch-tracking", title: "Batch Tracking" },
  { href: "/plugins", title: "Plugin System" },
  { href: "/search", title: "Search" },
  { href: "/workflows/order-to-cash", title: "Workflow: Order-to-Cash" },
  { href: "/workflows/procurement", title: "Workflow: Procurement" },
  { href: "/workflows/returns", title: "Workflow: Returns" },
  { href: "/workflows/international-sales", title: "Workflow: International Sales" },
  { href: "/workflows/inventory-management", title: "Workflow: Inventory" },
  { href: "/api", title: "API Reference" },
]

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
