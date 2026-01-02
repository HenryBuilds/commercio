import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InventoryPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-xl text-muted-foreground">
          Manage stock levels and track inventory transactions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set Stock</CardTitle>
          <CardDescription>
            Set initial stock level for a product in a warehouse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import { StockService } from "commercio";

// Set stock
await stockService.setStock(product.id, warehouse.id, 100);

// Get stock
const stock = await stockService.getStock(product.id, warehouse.id);
console.log(\`Current stock: \${stock?.quantity}\`);`}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Stock Operations</h2>
        <Tabs defaultValue="adjust" className="w-full">
          <TabsList>
            <TabsTrigger value="adjust">Adjust Stock</TabsTrigger>
            <TabsTrigger value="total">Total Stock</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="adjust" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <CodeBlock
                  code={`// Increase stock
await stockService.adjustStock(product.id, warehouse.id, 50);

// Decrease stock
await stockService.adjustStock(product.id, warehouse.id, -25);

// Get total stock across all warehouses
const totalStock = await stockService.getTotalStock(product.id);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="total" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <CodeBlock
                  code={`// Get total stock across all warehouses
const totalStock = await stockService.getTotalStock(product.id);

// Get all stock entries for a product
const allStock = await stockService.getStockByProduct(product.id);

// Get all stock entries for a warehouse
const warehouseStock = await stockService.getStockByWarehouse(warehouse.id);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <CodeBlock
                  code={`import { InventoryTransactionType } from "commercio";

// Receipt
await transactionService.createTransaction(
  product.id,
  warehouse.id,
  100,
  InventoryTransactionType.RECEIPT,
  "supplier-order-123"
);

// Shipment
await transactionService.createTransaction(
  product.id,
  warehouse.id,
  50,
  InventoryTransactionType.SHIPMENT,
  "order-456"
);

// Return
await transactionService.createTransaction(
  product.id,
  warehouse.id,
  10,
  InventoryTransactionType.RETURN,
  "order-456"
);

// Get transactions
const transactions = await transactionService.getTransactionsByProduct(product.id);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

