import { Card, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="space-y-4 pt-8">
        <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Open Source</p>
        <h1 className="text-4xl font-bold tracking-tight">
          Commercio
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
          ERP module for Node.js. Categories, products, variants, warehouses, inventory, customers, orders &mdash; all through a TypeScript API with PostgreSQL and Drizzle ORM.
        </p>
        <div className="flex gap-3 pt-2">
          <Button asChild size="sm">
            <Link href="/quick-start">Quick Start</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/api">API Reference</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Installation</h2>
        <CodeBlock code="npm install commercio" language="bash" />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Example</h2>
        <CodeBlock
          code={`import { initDatabase, createServices } from "commercio";

await initDatabase({
  dialect: "postgresql", // or "mysql", "sqlite"
  connectionString: process.env.DATABASE_URL,
  runMigrations: true,
});

const { categoryService, productService, orderService } = createServices();

// Create a category and product
const category = await categoryService.createCategory("Electronics");
const product = await productService.createProduct(
  "Dell XPS 15",
  "SKU-LAPTOP-001",
  category.id
);`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Documentation</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/installation" className="block">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium">Installation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Setup, database connection, migrations
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/quick-start" className="block">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium">Quick Start</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Full workflow from category to order
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/categories" className="block">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium">Categories</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Organize products, activate/deactivate
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/products" className="block">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium">Products & Variants</p>
                <p className="text-sm text-muted-foreground mt-1">
                  SKU management, variants with attributes
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/customers" className="block">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium">Customers</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Customer management, payment terms, order history
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/warehouses" className="block">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium">Warehouses & Inventory</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Multi-warehouse, reservations, transactions
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/orders" className="block">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium">Orders</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Order workflow: create, confirm, ship
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/api" className="block">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium">API Reference</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All services and methods at a glance
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Business Workflows</h2>
        <p className="text-sm text-muted-foreground">
          End-to-end examples showing how multiple services work together for real business processes.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/workflows/order-to-cash" className="block">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium">B2B Order-to-Cash</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Customer onboarding, catalog, pricing, order, fulfillment, invoice, payment
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/workflows/procurement" className="block">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium">Supplier Procurement</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Low-stock detection, purchase orders, batch tracking, inventory receipt
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/workflows/returns" className="block">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium">Returns &amp; Refund</p>
                <p className="text-sm text-muted-foreground mt-1">
                  RMA workflow, serial number tracking, refund processing
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/workflows/international-sales" className="block">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium">International Sales</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Multi-currency pricing, tax per country, cross-border invoicing
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/workflows/inventory-management" className="block sm:col-span-2">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent className="pt-5 pb-5">
                <p className="font-medium">Inventory &amp; Replenishment</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Multi-warehouse stock, reorder rules, batch expiry, plugin-driven alerts
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <section className="border-t pt-8 pb-4">
        <div className="text-sm text-muted-foreground space-y-1">
          <p>TypeScript &middot; PostgreSQL &middot; Drizzle ORM &middot; Pino Logging</p>
          <p>Node.js 18+ &middot; MIT License</p>
        </div>
      </section>
    </div>
  )
}
