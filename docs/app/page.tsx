import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Rocket, Package, Database, ShoppingCart, FolderTree, Warehouse } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Commercio</h1>
        <p className="text-xl text-muted-foreground">
          A modular ERP (Enterprise Resource Planning) system for Node.js with PostgreSQL and Drizzle ORM.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              <CardTitle>Category Management</CardTitle>
            </div>
            <CardDescription>
              Organize products with categories
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <CardTitle>Product Management</CardTitle>
            </div>
            <CardDescription>
              Products with SKU support (requires category)
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              <CardTitle>Warehouse Management</CardTitle>
            </div>
            <CardDescription>
              Multi-warehouse support
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <CardTitle>Order Management</CardTitle>
            </div>
            <CardDescription>
              Complete order workflow with status tracking
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Quick Example</h2>
        <CodeBlock
          code={`import { initDatabase, CategoryService, ProductService } from "commercio";

// Initialize database
initDatabase({
  connectionString: process.env.DATABASE_URL,
  runMigrations: true,
});

// Create services
const categoryService = new CategoryService(new CategoryRepository());
const productService = new ProductService(new ProductRepository());

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
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Features</h2>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Category management for product organization</li>
          <li>Product management with SKU support (requires category)</li>
          <li>Warehouse management (multi-warehouse)</li>
          <li>Inventory management with transaction history</li>
          <li>Order management with status workflow</li>
          <li>Stock reservation system</li>
          <li>TypeScript-first with full type safety</li>
          <li>Structured logging with Pino</li>
        </ul>
      </div>
    </div>
  )
}
