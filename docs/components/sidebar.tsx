"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  BookOpen, 
  Rocket, 
  Code, 
  Package, 
  ShoppingCart, 
  Warehouse,
  FolderTree,
  FileText
} from "lucide-react"

const navigation = [
  {
    title: "Getting Started",
    icon: Rocket,
    href: "/",
  },
  {
    title: "Installation",
    icon: Package,
    href: "/installation",
  },
  {
    title: "Quick Start",
    icon: Rocket,
    href: "/quick-start",
  },
  {
    title: "Categories",
    icon: FolderTree,
    href: "/categories",
  },
  {
    title: "Products",
    icon: Package,
    href: "/products",
  },
  {
    title: "Warehouses",
    icon: Warehouse,
    href: "/warehouses",
  },
  {
    title: "Inventory",
    icon: Warehouse,
    href: "/inventory",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/orders",
  },
  {
    title: "API Reference",
    icon: Code,
    href: "/api",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <BookOpen className="mr-2 h-5 w-5" />
        <span className="font-semibold">Commercio Docs</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

