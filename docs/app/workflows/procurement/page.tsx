import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function ProcurementPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          Workflow
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Supplier Procurement
        </h1>
        <p className="text-xl text-muted-foreground">
          Detect low stock, automatically generate purchase orders, receive goods with batch tracking,
          and update inventory. Connects reorder rules, suppliers, batches, and stock.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Process Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            {[
              "Low Stock Alert",
              "Select Supplier",
              "Create PO",
              "Submit & Confirm PO",
              "Receive Goods",
              "Register Batches",
              "Register Serials",
              "Update Inventory",
              "Audit & Report",
            ].map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  {i + 1}
                </span>
                <span>{step}</span>
                {i < 8 && (
                  <span className="text-muted-foreground">&rarr;</span>
                )}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Procurement Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-2 font-semibold">Step 1: Detect low stock via reorder alerts</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const services = createServices();

// Check all active reorder rules against current stock
const alerts = await services.reorderService.checkReorderAlerts();

console.log(\`Found \${alerts.length} products below reorder point:\\n\`);
for (const alert of alerts) {
  console.log(\`  Product: \${alert.rule.productId}\`);
  console.log(\`  Warehouse: \${alert.rule.warehouseId}\`);
  console.log(\`  Current stock: \${alert.currentStock}\`);
  console.log(\`  Reorder point: \${alert.rule.reorderPoint}\`);
  console.log(\`  Suggested order qty: \${alert.suggestedQuantity}\`);
  console.log(\`  Preferred supplier: \${alert.rule.preferredSupplierId ?? "none"}\\n\`);
}`}
            />
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Step 2: Create and submit a purchase order</p>
            <CodeBlock
              code={`// Get or create a supplier
const supplier = await services.supplierService.createSupplier("Lenovo Direct", {
  contactName: "Sales Team",
  email: "b2b@lenovo.com",
  phone: "+49 711 123 4567",
  street: "Lenovo Allee 1",
  city: "Stuttgart",
  postalCode: "70173",
  country: "Germany",
});

// Create purchase order based on alerts
const poItems = alerts.map(alert => ({
  productId: alert.rule.productId,
  quantity: alert.suggestedQuantity,
  unitCost: 85000, // 850.00 EUR wholesale cost
}));

const purchaseOrder = await services.supplierService.createPurchaseOrder(
  supplier.id, poItems,
  {
    expectedDelivery: new Date("2026-05-01"),
    notes: "Auto-generated from reorder alerts",
  }
);

console.log(\`PO \${purchaseOrder.id} created (status: \${purchaseOrder.status})\`); // DRAFT

// Submit the PO to the supplier
const submitted = await services.supplierService.submitPurchaseOrder(purchaseOrder.id);
console.log(\`PO submitted (status: \${submitted.status})\`); // SUBMITTED

// Supplier confirms
const confirmed = await services.supplierService.confirmPurchaseOrder(purchaseOrder.id);
console.log(\`PO confirmed (status: \${confirmed.status})\`); // CONFIRMED

// Audit the PO creation
await services.auditLogService.log("PurchaseOrder", purchaseOrder.id, "CREATE", {
  actor: "procurement-bot",
  newValues: {
    supplierId: supplier.id,
    itemCount: poItems.length,
    totalCost: poItems.reduce((s, i) => s + i.quantity * i.unitCost, 0),
  },
});`}
            />
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Step 3: Receive goods, register batches &amp; serial numbers</p>
            <CodeBlock
              code={`// Supplier ships the PO
await services.supplierService.shipPurchaseOrder(purchaseOrder.id);

// ── Goods arrive at warehouse ──────────────────────────

// Mark PO as received
const received = await services.supplierService.receivePurchaseOrder(purchaseOrder.id);
console.log(\`PO received (status: \${received.status})\`); // RECEIVED

// Register incoming batch
const batch = await services.batchTrackingService.createBatch(
  alerts[0].rule.productId,
  \`BATCH-LENOVO-\${Date.now()}\`,
  alerts[0].rule.warehouseId,
  alerts[0].suggestedQuantity,
  {
    manufacturingDate: new Date("2026-03-15"),
    expiryDate: new Date("2031-03-15"), // 5 year warranty
    supplierId: supplier.id,
  }
);
console.log(\`Batch \${batch.batchNumber} registered (\${batch.quantity} units)\`);

// Register individual serial numbers
const serialNumbers = Array.from(
  { length: alerts[0].suggestedQuantity },
  (_, i) => \`SN-X1C-\${batch.batchNumber}-\${String(i + 1).padStart(4, "0")}\`
);

const serials = await services.batchTrackingService.registerSerialNumbers(
  alerts[0].rule.productId,
  serialNumbers,
  alerts[0].rule.warehouseId,
  { batchId: batch.id }
);
console.log(\`\${serials.length} serial numbers registered\`);`}
            />
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Step 4: Update inventory &amp; verify</p>
            <CodeBlock
              code={`// Record the receipt as an inventory transaction
for (const alert of alerts) {
  await services.inventoryTransactionService.createTransaction(
    alert.rule.productId,
    alert.rule.warehouseId,
    alert.suggestedQuantity,
    "RECEIPT",
    purchaseOrder.id
  );
}

// Verify stock levels are restored
for (const alert of alerts) {
  const stock = await services.stockService.getStock(
    alert.rule.productId, alert.rule.warehouseId
  );
  console.log(\`Product \${alert.rule.productId}: \${stock?.quantity} units in stock\`);
}

// Verify reorder alerts are cleared
const remainingAlerts = await services.reorderService.checkReorderAlerts();
console.log(\`Remaining alerts: \${remainingAlerts.length}\`); // 0

// ── Reporting ──────────────────────────────────────────
const inventory = await services.reportingService.getInventoryReport();
inventory.forEach(item => {
  console.log(\`\${item.productName}: \${item.totalStock} total\`);
  item.warehouseBreakdown.forEach(w => {
    console.log(\`  Warehouse \${w.warehouseId}: \${w.quantity}\`);
  });
});

// Check near-expiry batches
const expiringSoon = await services.batchTrackingService.getNearExpiryBatches(365);
console.log(\`\\n\${expiringSoon.length} batches expiring within 1 year\`);`}
            />
          </div>
        </CardContent>
      </Card>

      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle>Services Used</AlertTitle>
        <AlertDescription>
          <span className="text-xs">
            ReorderService, SupplierService, BatchTrackingService,
            StockService, InventoryTransactionService, AuditLogService,
            ReportingService
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
}
