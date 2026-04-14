import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProcessFlow } from "@/components/process-flow";
import { Info } from "lucide-react";

export default function InventoryManagementPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          Workflow
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Inventory &amp; Replenishment
        </h1>
        <p className="text-xl text-muted-foreground">
          Multi-warehouse inventory management with real-time stock tracking,
          batch expiry monitoring, automatic reorder alerts, low-stock reports,
          and a plugin-driven notification pipeline.
        </p>
      </div>

      <ProcessFlow
        steps={[
          "Warehouse Setup",
          "Stock Tracking",
          "Reorder Rules",
          "Periodic Checks",
          "Plugin Notifications",
          "Batch Expiry Watch",
          "Inventory Audit",
          "Reports & Dashboard",
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Complete Inventory Management Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-2 font-semibold">Step 1: Multi-warehouse setup with stock and reorder rules</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const services = createServices();

// ── Warehouses ─────────────────────────────────────────
const berlin  = await services.warehouseService.createWarehouse("Berlin Central");
const hamburg = await services.warehouseService.createWarehouse("Hamburg Port");
const munich  = await services.warehouseService.createWarehouse("Munich South");

// ── Products ───────────────────────────────────────────
const cat = await services.categoryService.createCategory("Pharma");
const aspirin  = await services.productService.createProduct("Aspirin 500mg", "PHARMA-ASP-500", cat.id);
const vitamins = await services.productService.createProduct("Vitamin D3", "PHARMA-VIT-D3", cat.id);

// ── Distribute stock across warehouses ─────────────────
await services.stockService.setStock(aspirin.id, berlin.id, 1000);
await services.stockService.setStock(aspirin.id, hamburg.id, 500);
await services.stockService.setStock(aspirin.id, munich.id, 300);

await services.stockService.setStock(vitamins.id, berlin.id, 2000);
await services.stockService.setStock(vitamins.id, hamburg.id, 800);

// ── Reorder rules per warehouse ────────────────────────
await services.reorderService.createRule(aspirin.id, berlin.id, 200, 500);
await services.reorderService.createRule(aspirin.id, hamburg.id, 100, 300);
await services.reorderService.createRule(vitamins.id, berlin.id, 500, 1000);

// ── Register batches with expiry tracking ──────────────
const aspirinBatch = await services.batchTrackingService.createBatch(
  aspirin.id, "BATCH-ASP-2026-001", berlin.id, 1000,
  {
    manufacturingDate: new Date("2026-01-15"),
    expiryDate: new Date("2028-01-15"),
    supplierId: null,
  }
);

const vitaminBatch = await services.batchTrackingService.createBatch(
  vitamins.id, "BATCH-VIT-2026-001", berlin.id, 2000,
  {
    manufacturingDate: new Date("2026-02-01"),
    expiryDate: new Date("2027-02-01"), // shorter shelf life
  }
);

console.log("Warehouse setup complete with batches and reorder rules.");`}
            />
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Step 2: Register a plugin for stock change notifications</p>
            <CodeBlock
              code={`// Register a plugin that reacts to stock changes
services.pluginService.register({
  name: "stock-alert-plugin",
  version: "1.0.0",
  hooks: {
    afterStockChange: async (context) => {
      const { productId, warehouseId, newQuantity } = context.data as any;

      // Check if this product has a reorder rule
      const alert = await services.reorderService.checkAlertForProduct(
        productId, warehouseId
      );

      if (alert) {
        console.log(\`[PLUGIN] LOW STOCK ALERT: \${productId}\`);
        console.log(\`  Current: \${alert.currentStock}, Reorder point: \${alert.rule.reorderPoint}\`);

        // Emit webhook for external systems
        await services.webhookService.emit("STOCK_LOW", {
          productId,
          warehouseId,
          currentStock: alert.currentStock,
          reorderPoint: alert.rule.reorderPoint,
          suggestedQuantity: alert.suggestedQuantity,
        });
      }

      return context;
    },
  },
});

// Register a second plugin for audit logging
services.pluginService.registerWithPriority({
  name: "stock-audit-plugin",
  version: "1.0.0",
  hooks: {
    afterStockChange: async (context) => {
      const { productId, warehouseId, oldQuantity, newQuantity } = context.data as any;
      await services.auditLogService.log("Stock", productId, "UPDATE", {
        actor: "inventory-system",
        oldValues: { quantity: oldQuantity, warehouseId },
        newValues: { quantity: newQuantity, warehouseId },
      });
      return context;
    },
  },
}, 10); // higher priority = runs first

console.log(\`Plugins registered: \${services.pluginService.getRegisteredPlugins().length}\`);
console.log(\`afterStockChange handlers: \${services.pluginService.getHookHandlerCount("afterStockChange")}\`);`}
            />
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Step 3: Simulate daily operations &mdash; orders deplete stock</p>
            <CodeBlock
              code={`// Simulate a day of orders depleting aspirin stock in Berlin
for (let i = 0; i < 8; i++) {
  await services.stockService.decreaseStock(aspirin.id, berlin.id, 100);

  // Trigger plugin hooks manually (in a real app, this would be in StockService)
  const currentStock = await services.stockService.getStock(aspirin.id, berlin.id);
  await services.pluginService.executeHook("afterStockChange", {
    data: {
      productId: aspirin.id,
      warehouseId: berlin.id,
      oldQuantity: currentStock!.quantity + 100,
      newQuantity: currentStock!.quantity,
    },
  });
}

// After 800 units sold, stock is at 200 = reorder point!
const stock = await services.stockService.getStock(aspirin.id, berlin.id);
console.log(\`Aspirin Berlin stock: \${stock?.quantity}\`); // 200

// Total stock across all warehouses
const totalAspirin = await services.stockService.getTotalStock(aspirin.id);
console.log(\`Aspirin total (all warehouses): \${totalAspirin}\`); // 200+500+300=1000`}
            />
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Step 4: Periodic health checks &mdash; expiry, low stock, reports</p>
            <CodeBlock
              code={`// ── Batch expiry monitoring ─────────────────────────────
const expired = await services.batchTrackingService.getExpiredBatches();
console.log(\`Expired batches: \${expired.length}\`);

const expiringSoon = await services.batchTrackingService.getNearExpiryBatches(180);
console.log(\`Batches expiring in 6 months: \${expiringSoon.length}\`);
expiringSoon.forEach(b => {
  console.log(\`  \${b.batchNumber}: expires \${b.expiryDate?.toISOString().split("T")[0]}\`);
});

// ── Reorder alerts ─────────────────────────────────────
const alerts = await services.reorderService.checkReorderAlerts();
console.log(\`\\nReorder alerts: \${alerts.length}\`);
alerts.forEach(a => {
  console.log(\`  \${a.rule.productId} @ \${a.rule.warehouseId}\`);
  console.log(\`    Stock: \${a.currentStock} / Reorder at: \${a.rule.reorderPoint}\`);
  console.log(\`    Suggested order: \${a.suggestedQuantity} units\`);
});

// ── Low stock report (threshold-based) ─────────────────
const lowStock = await services.reportingService.getLowStockReport(300);
console.log(\`\\nProducts below 300 units:\`);
lowStock.forEach(item => {
  console.log(\`  \${item.productName} @ \${item.warehouseId}: \${item.quantity}\`);
});

// ── Full inventory report ──────────────────────────────
const inventory = await services.reportingService.getInventoryReport();
console.log("\\nFull inventory report:");
inventory.forEach(item => {
  console.log(\`  \${item.productName}: \${item.totalStock} total\`);
  item.warehouseBreakdown.forEach(w => {
    console.log(\`    \${w.warehouseId}: \${w.quantity}\`);
  });
});

// ── Inventory transaction history ──────────────────────
const transactions = await services.inventoryTransactionService.getTransactionsByProduct(aspirin.id);
console.log(\`\\nAspirin transactions: \${transactions.length}\`);
transactions.slice(-3).forEach(t => {
  console.log(\`  \${t.type}: \${t.quantity} units (\${t.createdAt.toISOString()})\`);
});

// ── Audit trail ────────────────────────────────────────
const auditLogs = await services.auditLogService.getByEntityType("Stock");
console.log(\`\\nStock audit entries: \${auditLogs.length}\`);`}
            />
          </div>
        </CardContent>
      </Card>

      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle>Services Used</AlertTitle>
        <AlertDescription>
          <span className="text-xs">
            WarehouseService, StockService, ReorderService,
            BatchTrackingService, PluginService, WebhookService,
            AuditLogService, InventoryTransactionService, ReportingService
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
}
