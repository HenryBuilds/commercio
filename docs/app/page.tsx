"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Button } from "@/components/ui/button"
import { Rocket, Package, Database, ShoppingCart, FolderTree, Warehouse, CheckCircle2, Zap, Shield, Code2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { AnimatedBackground } from "@/components/animated-background"

export default function Home() {
  return (
    <div className="relative space-y-16">
      <AnimatedBackground />
      {/* Hero Section */}
      <section className="relative space-y-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="h-3.5 w-3.5 text-primary" />
          </motion.div>
          <span className="text-muted-foreground">Enterprise-ready ERP System</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl font-bold tracking-tight sm:text-6xl"
        >
          Build powerful{" "}
          <motion.span
            className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            commerce systems
          </motion.span>{" "}
          with ease
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-2xl text-xl text-muted-foreground"
        >
          A modular ERP system for Node.js with PostgreSQL and Drizzle ORM. 
          TypeScript-first, production-ready, and fully featured.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild size="lg" className="text-base">
              <Link href="/quick-start">
                <Rocket className="mr-2 h-4 w-4" />
                Get Started
              </Link>
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="/installation">
                <Code2 className="mr-2 h-4 w-4" />
                Installation
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Complete ERP functionality out of the box
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <Link href="/categories" className="h-full block">
              <motion.div
                whileHover={{ y: -5, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-full"
              >
                <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg flex flex-col">
                  <CardHeader className="flex flex-col">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      <FolderTree className="h-6 w-6" />
                    </div>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>
                      Organize products with flexible category management
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
          >
            <Link href="/products" className="h-full block">
              <motion.div
                whileHover={{ y: -5, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-full"
              >
                <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg flex flex-col">
                  <CardHeader className="flex flex-col">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      <Package className="h-6 w-6" />
                    </div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>
                      Full product management with SKU support
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full"
          >
            <Link href="/warehouses" className="h-full block">
              <motion.div
                whileHover={{ y: -5, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-full"
              >
                <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg flex flex-col">
                  <CardHeader className="flex flex-col">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      <Warehouse className="h-6 w-6" />
                    </div>
                    <CardTitle>Warehouses</CardTitle>
                    <CardDescription>
                      Multi-warehouse inventory management
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full"
          >
            <Link href="/orders" className="h-full block">
              <motion.div
                whileHover={{ y: -5, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-full"
              >
                <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg flex flex-col">
                  <CardHeader className="flex flex-col">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <CardTitle>Orders</CardTitle>
                    <CardDescription>
                      Complete order workflow with status tracking
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Example */}
      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight">Get started in minutes</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Simple API, powerful features
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="border-2">
          <CardHeader>
            <CardTitle>Quick Example</CardTitle>
            <CardDescription>
              Create categories and products in just a few lines of code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`import { initDatabase, createServices } from "commercio";

// Initialize database
initDatabase({
  connectionString: process.env.DATABASE_URL,
  runMigrations: true,
});

// Create all services at once - no need to manually inject repositories!
const { categoryService, productService } = createServices();

// Create a category
const category = await categoryService.createCategory(
  "Electronics",
  "Electronic devices and accessories"
);

// Create a product
const product = await productService.createProduct(
  "Laptop Dell XPS 15",
  "SKU-LAPTOP-001",
  category.id
);`}
            />
          </CardContent>
        </Card>
        </motion.div>
      </section>

      {/* Key Features */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Why Commercio?</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Built for modern development workflows
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/categories">
            <Card className="group transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Category Management</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Organize products with flexible categories
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/products">
            <Card className="group transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Product Management</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Full SKU support with category requirements
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/warehouses">
            <Card className="group transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Warehouse className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Warehouse Management</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Multi-warehouse inventory tracking
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/inventory">
            <Card className="group transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Database className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Inventory Management</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Complete transaction history and tracking
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/orders">
            <Card className="group transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Order Management</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Complete workflow with status tracking
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/inventory">
            <Card className="group transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Stock Reservation</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reserve stock for orders and prevent overselling
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Built with modern tools</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            TypeScript-first with full type safety
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Code2 className="h-5 w-5" />
              </div>
              <CardTitle>TypeScript</CardTitle>
              <CardDescription>
                Full type safety with TypeScript 5+
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Database className="h-5 w-5" />
              </div>
              <CardTitle>PostgreSQL</CardTitle>
              <CardDescription>
                Robust database with Drizzle ORM
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <CardTitle>Pino Logging</CardTitle>
              <CardDescription>
                Structured logging for production
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <div className="relative z-10">
          <motion.h2
            className="text-3xl font-bold tracking-tight"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundImage: "linear-gradient(90deg, hsl(var(--foreground)), hsl(var(--primary)), hsl(var(--foreground)))",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Ready to get started?
          </motion.h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Start building your commerce system today
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="text-base">
                <Link href="/quick-start">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                  </motion.div>
                  Quick Start Guide
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href="/api">
                  <Code2 className="mr-2 h-4 w-4" />
                  View API Reference
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
