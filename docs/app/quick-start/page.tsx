import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Separator } from "@/components/ui/separator"
import { MermaidDiagram } from "@/components/mermaid-diagram"

export default function QuickStartPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Quick Start</h1>
        <p className="text-xl text-muted-foreground">
          Get up and running with Commercio in minutes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import {
  initDatabase,
  createServices,
} from "commercio";

// Initialize database connection
await initDatabase({
  dialect: "postgresql", // or "mysql", "sqlite"
  connectionString: process.env.DATABASE_URL,
  runMigrations: true,
});

// Create all services at once - no need to manually inject repositories!
const {
  categoryService,
  productService,
  customerService,
  warehouseService,
  stockService,
  orderService,
  reservationService,
  inventoryTransactionService,
} = createServices();`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <MermaidDiagram
            chart={`flowchart TB
    subgraph row1[" "]
        direction LR
        A["Initialize Database"] --> B["Create Category"]
        B --> C["Create Product"]
        C --> D["Create Warehouse"]
        D --> E["Set Stock"]
    end

    subgraph row2[" "]
        direction LR
        F["Create Order"] --> G["Confirm Order"]
        G --> H["Mark as Paid"]
        H --> I["Ship Order"]
        I --> J["Complete Order"]
    end

    E --> F

    style row1 fill:transparent,stroke:none
    style row2 fill:transparent,stroke:none`}
            title="Setup Process"
          />
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              1
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Create a Category</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <CodeBlock
                code={`// Create a category
const category = await categoryService.createCategory(
  "Electronics",
  "Electronic devices and accessories"
);

console.log(\`Category created: \${category.id}\`);`}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              2
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Create a Product</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <CodeBlock
                code={`// Create a product (categoryId is required)
const product = await productService.createProduct(
  "Laptop Dell XPS 15",
  "SKU-LAPTOP-001",
  category.id
);

console.log(\`Product created: \${product.id}\`);`}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              3
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Create a Warehouse</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <CodeBlock
                code={`// Create a warehouse
const warehouse = await warehouseService.createWarehouse(
  "Main Warehouse Berlin"
);

console.log(\`Warehouse created: \${warehouse.id}\`);`}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              4
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Create a Customer</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <CodeBlock
                code={`// Create a customer (required for orders)
const customer = await customerService.createCustomer(
  "John Doe",
  {
    street: "123 Main St",
    city: "Berlin",
    postalCode: "10115",
    country: "Germany",
  },
  { email: "john.doe@example.com" }
);

console.log(\`Customer created: \${customer.id}\`);`}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              5
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Set Stock</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <CodeBlock
                code={`// Set initial stock
await stockService.setStock(product.id, warehouse.id, 100);

// Get stock
const stock = await stockService.getStock(product.id, warehouse.id);
console.log(\`Current stock: \${stock?.quantity}\`);`}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              6
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Create an Order</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <CodeBlock
                code={`// Create order (customerId is required)
const order = await orderService.createOrder(customer.id, [
  {
    productId: product.id,
    quantity: 5,
    unitPrice: 1999, // €19.99 in cents
  },
]);

console.log(\`Order created: \${order.id}\`);
console.log(\`Total amount: €\${(order.totalAmount / 100).toFixed(2)}\`);

// Confirm order (creates reservations)
const confirmedOrder = await orderService.confirmOrder(order.id, warehouse.id);

// Mark as paid
const paidOrder = await orderService.markOrderAsPaid(order.id);

// Ship order
const shippedOrder = await orderService.shipOrder(order.id, warehouse.id);

// Complete order
const completedOrder = await orderService.completeOrder(order.id);`}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
