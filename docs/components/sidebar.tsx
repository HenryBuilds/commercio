"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { title: "Start", href: "/" },
  { title: "Installation", href: "/installation" },
  { title: "Quick Start", href: "/quick-start" },
  { separator: true, label: "Modules" },
  { title: "Categories", href: "/categories" },
  { title: "Products", href: "/products" },
  { title: "Product Variants", href: "/product-variants" },
  { title: "Customers", href: "/customers" },
  { title: "Addresses", href: "/addresses" },
  { title: "Warehouses", href: "/warehouses" },
  { title: "Inventory", href: "/inventory" },
  { title: "Orders", href: "/orders" },
  { title: "Invoices", href: "/invoices" },
  { title: "Payments", href: "/payments" },
  { title: "Shipping", href: "/shipping" },
  { title: "Pricing", href: "/pricing" },
  { title: "Tax", href: "/tax" },
  { title: "Suppliers", href: "/suppliers" },
  { title: "Promotions", href: "/promotions" },
  { separator: true, label: "Advanced" },
  { title: "Audit Log", href: "/audit-log" },
  { title: "Webhooks", href: "/webhooks" },
  { title: "Multi-Currency", href: "/currency" },
  { title: "Reorder Rules", href: "/reorder" },
  { title: "Cart Rules", href: "/cart-rules" },
  { title: "Reporting", href: "/reporting" },
  { title: "RMA / Returns", href: "/rma" },
  { title: "Batch Tracking", href: "/batch-tracking" },
  { title: "Plugin System", href: "/plugins" },
  { title: "Search", href: "/search" },
  { separator: true, label: "Reference" },
  { title: "API Reference", href: "/api" },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-56 flex-col border-r bg-card">
      <div className="flex h-14 items-center justify-between border-b px-5">
        <Link href="/" className="font-semibold text-sm tracking-tight">
          commercio
        </Link>
        <ThemeToggle />
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {navigation.map((item, i) => {
          if ("separator" in item) {
            return (
              <div key={i} className="mt-5 mb-1.5 px-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </span>
              </div>
            )
          }
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-2 py-1.5 text-[13px] transition-colors",
                isActive
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
