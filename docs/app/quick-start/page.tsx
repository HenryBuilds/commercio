import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Separator } from "@/components/ui/separator"

export default function QuickStartPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Quick Start</h1>
        <p className="text-xl text-muted-foreground">
          Get up and running with Commercio in minutes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Setup</CardTitle>
          <CardDescription>
            Initialize services and start using Commercio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import {
  initDatabase,
  CategoryService,
  ProductService,
  WarehouseService,
  StockService,
  OrderService,
  CategoryRepository,
  ProductRepository,
  WarehouseRepository,
  StockRepository,
  OrderRepository,
  ReservationRepository,
  ReservationService,
  InventoryTransactionService,
  InventoryTransactionRepository,
} from "commercio";

// Initialize database connection
initDatabase({
  connectionString: process.env.DATABASE_URL,
  runMigrations: true,
});

// Create repositories
const categoryRepo = new CategoryRepository();
const productRepo = new ProductRepository();
const warehouseRepo = new WarehouseRepository();
const stockRepo = new StockRepository();
const orderRepo = new OrderRepository();
const reservationRepo = new ReservationRepository();
const transactionRepo = new InventoryTransactionRepository();

// Create services
const categoryService = new CategoryService(categoryRepo);
const productService = new ProductService(productRepo);
const warehouseService = new WarehouseService(warehouseRepo);
const stockService = new StockService(stockRepo, productRepo, warehouseRepo);
const reservationService = new ReservationService(reservationRepo, stockRepo);
const transactionService = new InventoryTransactionService(
  transactionRepo,
  stockRepo
);
const orderService = new OrderService(
  orderRepo,
  reservationService,
  transactionService
);`}
          />
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Step 1: Create a Category</h2>
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
          <h2 className="text-2xl font-semibold tracking-tight">Step 2: Create a Product</h2>
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
          <h2 className="text-2xl font-semibold tracking-tight">Step 3: Create a Warehouse</h2>
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
          <h2 className="text-2xl font-semibold tracking-tight">Step 4: Set Stock</h2>
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
          <h2 className="text-2xl font-semibold tracking-tight">Step 5: Create an Order</h2>
          <Card>
            <CardContent className="pt-6">
              <CodeBlock
                code={`// Create order
const order = await orderService.createOrder("customer-123", [
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

