import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { Separator } from "@/components/ui/separator"
import { Database, Plus, TrendingUp, List, ArrowUpDown, Lock } from "lucide-react"

export default function InventoryPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-xl text-muted-foreground">
              Manage stock levels and track inventory transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Set Stock */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Set Stock</CardTitle>
              <CardDescription>
                Set initial stock level for a product in a warehouse
              </CardDescription>
            </div>
          </div>
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

      {/* Stock Reservation Flow */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Stock Reservation Flow</CardTitle>
              <CardDescription>
                How stock reservations prevent overselling
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MermaidDiagram
            chart={`sequenceDiagram
    participant OrderService
    participant ReservationService
    participant StockService
    participant ReservationRepository
    participant Database

    Note over OrderService,Database: Order Confirmation
    OrderService->>ReservationService: createReservation(productId, warehouseId, qty, orderId)
    ReservationService->>StockService: getStock(productId, warehouseId)
    StockService-->>ReservationService: Stock (quantity: 100)
    ReservationService->>ReservationRepository: findActiveReservations(productId, warehouseId)
    ReservationRepository->>Database: SELECT SUM(quantity) FROM reservations
    Database-->>ReservationRepository: Reserved: 30
    ReservationRepository-->>ReservationService: Reserved quantity: 30
    ReservationService->>ReservationService: Calculate available: 100 - 30 = 70
    
    alt Sufficient Available Stock
        ReservationService->>ReservationRepository: create(reservation)
        ReservationRepository->>Database: INSERT INTO reservations
        Database-->>ReservationRepository: Reservation created
        ReservationRepository-->>ReservationService: Reservation
        ReservationService-->>OrderService: Reservation successful
        OrderService-->>OrderService: Order status: CONFIRMED
    else Insufficient Available Stock
        ReservationService-->>OrderService: Error: Insufficient available stock
    end
    
    Note over OrderService,Database: Order Shipment
    OrderService->>ReservationService: consumeReservation(reservationId)
    ReservationService->>ReservationRepository: findById(reservationId)
    ReservationRepository-->>ReservationService: Reservation (ACTIVE)
    ReservationService->>ReservationRepository: updateStatus(CONSUMED)
    ReservationRepository->>Database: UPDATE reservations SET status = CONSUMED
    Database-->>ReservationRepository: Updated
    ReservationService->>StockService: adjustStock(productId, warehouseId, -qty)
    StockService->>Database: UPDATE stock SET quantity = quantity - qty
    Database-->>StockService: Stock decreased
    ReservationService-->>OrderService: Reservation consumed`}
            title="Reservation Process"
          />
        </CardContent>
      </Card>

      {/* Inventory Transaction Flow */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ArrowUpDown className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Inventory Transaction Flow</CardTitle>
              <CardDescription>
                How inventory transactions update stock levels
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MermaidDiagram
            chart={`sequenceDiagram
    participant User
    participant TransactionService
    participant StockService
    participant Database

    Note over User,Database: Receipt Transaction
    User->>TransactionService: createTransaction(RECEIPT, qty: 100)
    TransactionService->>StockService: getStock(productId, warehouseId)
    StockService-->>TransactionService: currentStock (50)
    TransactionService->>StockService: setStock(productId, warehouseId, 150)
    StockService->>Database: UPDATE stock SET quantity = 150
    Database-->>StockService: updated
    StockService-->>TransactionService: Stock updated
    TransactionService->>Database: INSERT transaction record
    Database-->>TransactionService: Transaction saved
    TransactionService-->>User: Transaction created
    
    Note over User,Database: Shipment Transaction
    User->>TransactionService: createTransaction(SHIPMENT, qty: 30)
    TransactionService->>StockService: getStock(productId, warehouseId)
    StockService-->>TransactionService: currentStock (150)
    alt Sufficient Stock
        TransactionService->>StockService: adjustStock(productId, warehouseId, -30)
        StockService->>Database: UPDATE stock SET quantity = 120
        Database-->>StockService: updated
        TransactionService->>Database: INSERT transaction record
        TransactionService-->>User: Transaction created
    else Insufficient Stock
        TransactionService-->>User: Error: Insufficient stock
    end`}
            title="Transaction Flow"
          />
        </CardContent>
      </Card>

      {/* Stock Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Stock Operations</h2>
        <Tabs defaultValue="adjust" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="adjust" className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Adjust</span>
            </TabsTrigger>
            <TabsTrigger value="total" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Total</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="adjust" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Adjust Stock</CardTitle>
                <CardDescription>
                  Increase or decrease stock levels
                </CardDescription>
              </CardHeader>
              <CardContent>
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
          <TabsContent value="total" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Stock</CardTitle>
                <CardDescription>
                  Get stock information across warehouses
                </CardDescription>
              </CardHeader>
              <CardContent>
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
          <TabsContent value="transactions" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Transactions</CardTitle>
                <CardDescription>
                  Track all inventory movements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <MermaidDiagram
                  chart={`sequenceDiagram
    participant User
    participant TransactionService
    participant StockService
    participant Database

    Note over User,Database: Receipt Transaction
    User->>TransactionService: createTransaction(RECEIPT, qty: 100)
    TransactionService->>StockService: getStock(productId, warehouseId)
    StockService-->>TransactionService: currentStock (50)
    TransactionService->>StockService: setStock(productId, warehouseId, 150)
    StockService->>Database: UPDATE stock SET quantity = 150
    Database-->>StockService: updated
    StockService-->>TransactionService: Stock updated
    TransactionService->>Database: INSERT transaction record
    Database-->>TransactionService: Transaction saved
    TransactionService-->>User: Transaction created
    
    Note over User,Database: Shipment Transaction
    User->>TransactionService: createTransaction(SHIPMENT, qty: 30)
    TransactionService->>StockService: getStock(productId, warehouseId)
    StockService-->>TransactionService: currentStock (150)
    alt Sufficient Stock
        TransactionService->>StockService: adjustStock(productId, warehouseId, -30)
        StockService->>Database: UPDATE stock SET quantity = 120
        Database-->>StockService: updated
        TransactionService->>Database: INSERT transaction record
        TransactionService-->>User: Transaction created
    else Insufficient Stock
        TransactionService-->>User: Error: Insufficient stock
    end`}
                  title="Transaction Flow"
                />
                <Separator />
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
