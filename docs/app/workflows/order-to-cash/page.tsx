import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProcessFlow } from "@/components/process-flow";
import { Info } from "lucide-react";

export default function OrderToCashPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          Workflow
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          B2B Order-to-Cash
        </h1>
        <p className="text-xl text-muted-foreground">
          Complete business workflow from customer onboarding through order
          placement, fulfillment, invoicing, and payment collection. Covers 12
          services working together.
        </p>
      </div>

      <ProcessFlow
        steps={[
          "Customer Setup",
          "Catalog Browse",
          "Cart & Pricing",
          "Order Placement",
          "Stock Reservation",
          "Invoice Generation",
          "Payment Processing",
          "Warehouse Picking",
          "Shipment & Tracking",
          "Order Completion",
          "Audit Trail",
        ]}
      />

      {/* Steps */}
      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">1. Setup</TabsTrigger>
          <TabsTrigger value="order">2. Order</TabsTrigger>
          <TabsTrigger value="fulfill">3. Fulfill</TabsTrigger>
          <TabsTrigger value="collect">4. Collect</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Bootstrap &mdash; Services, Catalog, Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`import { initDatabase, createServices } from "commercio";

await initDatabase({
  dialect: "postgresql",
  connectionString: process.env.DATABASE_URL,
  runMigrations: true,
});

const services = createServices();

// ── 1a. Build the catalog ──────────────────────────────
const electronics = await services.categoryService.createCategory("Electronics");
const accessories = await services.categoryService.createCategory("Accessories");

const laptop = await services.productService.createProduct(
  "ThinkPad X1 Carbon", "SKU-TP-X1C", electronics.id
);
const charger = await services.productService.createProduct(
  "USB-C Charger 65W", "SKU-CHG-65W", accessories.id
);

// ── 1b. Set up warehouses & stock ──────────────────────
const mainWarehouse = await services.warehouseService.createWarehouse("Berlin HQ");
const dropship    = await services.warehouseService.createWarehouse("Hamburg Fulfillment");

await services.stockService.setStock(laptop.id, mainWarehouse.id, 200);
await services.stockService.setStock(charger.id, mainWarehouse.id, 500);

// ── 1c. Pricing ────────────────────────────────────────
const defaultPrices = await services.pricingService.createPriceList(
  "B2B Standard", { currency: "EUR" }
);
await services.pricingService.setPrice(defaultPrices.id, laptop.id, 129900);  // 1299.00 EUR
await services.pricingService.setPrice(defaultPrices.id, charger.id, 4990);   //   49.90 EUR

// Volume pricing for the charger
await services.pricingService.setTieredPrice(defaultPrices.id, charger.id, [
  { minQuantity: 1,  unitPrice: 4990 },
  { minQuantity: 10, unitPrice: 3990 },
  { minQuantity: 50, unitPrice: 2990 },
]);

// ── 1d. Tax ────────────────────────────────────────────
const vatDE = await services.taxService.createTaxRate(
  "VAT Germany", 19, "DE", { isDefault: true }
);

// ── 1e. Customer onboarding ────────────────────────────
const vipGroup = await services.customerService.createCustomerGroup(
  "VIP Partners", "Enterprise partners", 5
);

const customer = await services.customerService.createCustomer(
  "Acme GmbH",
  { street: "Friedrichstr. 123", city: "Berlin", postalCode: "10117", country: "Germany" },
  { email: "procurement@acme.de", phone: "+49 30 555 0100" },
  { creditLimit: 5000000, paymentTerms: "NET_30", customerGroupId: vipGroup.id }
);

// Additional shipping address
await services.addressService.createAddress(
  customer.id, "SHIPPING",
  "Hafenstr. 42", "Hamburg", "20095", "Germany",
  { label: "Hamburg Office", isDefault: false }
);

// ── 1f. Reorder rules (auto-replenishment) ─────────────
await services.reorderService.createRule(laptop.id, mainWarehouse.id, 20, 100);
await services.reorderService.createRule(charger.id, mainWarehouse.id, 50, 200);

// ── 1g. Webhooks for external systems ──────────────────
await services.webhookService.registerWebhook(
  "https://erp.acme.de/webhooks/orders",
  ["ORDER_CREATED", "ORDER_SHIPPED", "PAYMENT_COMPLETED"],
  { secret: "whsec_acme_2026" }
);

console.log("Setup complete.");`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Search, Price, Cart Rules &amp; Place Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-2 font-semibold">2a. Customer searches the catalog</p>
                <CodeBlock
                  code={`// Customer searches for products
const results = await services.searchService.searchProducts({
  query: "ThinkPad",
  inStock: true,
  sortBy: "price",
  sortOrder: "asc",
  page: 1,
  pageSize: 20,
});

console.log(\`Found \${results.total} products\`);
results.products.forEach(p => console.log(\`  \${p.name} (\${p.sku})\`));`}
                />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">2b. Get effective price for this customer</p>
                <CodeBlock
                  code={`// Effective price considers customer group, tiered pricing, and priority
const laptopPrice = await services.pricingService.getEffectivePrice(
  laptop.id,
  { customerGroupId: vipGroup.id, quantity: 10 }
);

const chargerPrice = await services.pricingService.getEffectivePrice(
  charger.id,
  { customerGroupId: vipGroup.id, quantity: 25 }
);

console.log(\`Laptop: \${laptopPrice?.unitPrice} cents/unit\`);
console.log(\`Charger (qty 25): \${chargerPrice?.unitPrice} cents/unit\`); // tiered!`}
                />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">2c. Apply cart rules & promotions</p>
                <CodeBlock
                  code={`// Evaluate automatic cart rules
const cartItems = [
  { productId: laptop.id,  quantity: 10, unitPrice: laptopPrice!.unitPrice, categoryId: electronics.id },
  { productId: charger.id, quantity: 25, unitPrice: chargerPrice!.unitPrice, categoryId: accessories.id },
];

const discounts = await services.cartRulesService.evaluateCart(
  cartItems, vipGroup.id
);

discounts.forEach(d => {
  console.log(\`Rule "\${d.ruleName}": -\${d.discount} cents\`);
  if (d.freeShipping) console.log("  + Free Shipping!");
  if (d.freeItems) console.log("  + Free items:", d.freeItems);
});

// Also try a coupon
const couponResult = await services.promotionService.applyCoupon(
  "WELCOME10",
  cartItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
);

console.log(\`Coupon discount: \${couponResult.discount} cents\`);`}
                />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">2d. Place the order</p>
                <CodeBlock
                  code={`// Create the order
const order = await services.orderService.createOrder(customer.id, [
  { productId: laptop.id,  quantity: 10, unitPrice: laptopPrice!.unitPrice },
  { productId: charger.id, quantity: 25, unitPrice: chargerPrice!.unitPrice },
]);

console.log(\`Order \${order.id} created\`);
console.log(\`Status: \${order.status}\`);       // CREATED
console.log(\`Total: \${order.totalAmount} cents\`);

// Audit the order creation
await services.auditLogService.log("Order", order.id, "CREATE", {
  actor: "procurement@acme.de",
  newValues: { customerId: customer.id, total: order.totalAmount },
});

// Emit webhook event
await services.webhookService.emit("ORDER_CREATED", {
  orderId: order.id,
  customerId: customer.id,
  total: order.totalAmount,
});`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fulfill" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Confirm, Pick, Pack &amp; Ship</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-2 font-semibold">3a. Confirm order &amp; reserve stock</p>
                <CodeBlock
                  code={`// Confirm the order - this creates stock reservations
const confirmed = await services.orderService.confirmOrder(
  order.id, mainWarehouse.id
);
console.log(\`Status: \${confirmed.status}\`); // CONFIRMED

// Verify reservations were created
const reservations = await services.reservationService.getReservationsByReference(order.id);
console.log(\`\${reservations.length} reservations created\`);
reservations.forEach(r => {
  console.log(\`  Product \${r.productId}: \${r.quantity} units reserved\`);
});

// Audit
await services.auditLogService.log("Order", order.id, "STATUS_CHANGE", {
  actor: "warehouse-manager@company.de",
  oldValues: { status: "CREATED" },
  newValues: { status: "CONFIRMED" },
});`}
                />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">3b. Register serial numbers for tracked products</p>
                <CodeBlock
                  code={`// Register serial numbers for the 10 laptops being shipped
const serialNumbers = Array.from({ length: 10 }, (_, i) =>
  \`SN-X1C-2026-\${String(i + 1).padStart(4, "0")}\`
);

const registered = await services.batchTrackingService.registerSerialNumbers(
  laptop.id, serialNumbers, mainWarehouse.id
);

// Assign each serial number to this order
for (const sn of registered) {
  await services.batchTrackingService.assignToOrder(sn.id, order.id);
}

console.log(\`\${registered.length} serial numbers assigned to order\`);`}
                />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">3c. Mark as paid &amp; ship</p>
                <CodeBlock
                  code={`// Mark order as paid
await services.orderService.markOrderAsPaid(order.id);

// Create shipment with tracking
const shippingMethod = await services.shippingService.createShippingMethod(
  "DHL Express", "DHL", 1500, 2  // 15.00 EUR, 2 days
);

const shipment = await services.shippingService.createShipment(
  order.id, shippingMethod.id,
  { street: "Friedrichstr. 123", city: "Berlin", postalCode: "10117", country: "Germany" },
  { trackingNumber: "DHL-1Z999AA10123456784" }
);

// Ship the order (consumes reservations, creates inventory transactions)
const shipped = await services.orderService.shipOrder(order.id, mainWarehouse.id);
console.log(\`Status: \${shipped.status}\`); // SHIPPED

// Update shipment status
await services.shippingService.pickUpShipment(shipment.id);
await services.shippingService.transitShipment(shipment.id);

// Emit webhook
await services.webhookService.emit("ORDER_SHIPPED", {
  orderId: order.id,
  trackingNumber: "DHL-1Z999AA10123456784",
});

// Check if we need to reorder
const alerts = await services.reorderService.checkReorderAlerts();
if (alerts.length > 0) {
  console.log("\\nReorder alerts:");
  alerts.forEach(a => {
    console.log(\`  \${a.rule.productId}: \${a.currentStock} left (reorder point: \${a.rule.reorderPoint})\`);
  });
}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collect" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Invoice, Collect Payment &amp; Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-2 font-semibold">4a. Generate invoice with tax</p>
                <CodeBlock
                  code={`// Calculate tax
const taxCalc = await services.taxService.calculateTax(vatDE.id, order.totalAmount);

// Create invoice
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + 30); // NET_30

const invoice = await services.invoiceService.createInvoice(
  customer.id,
  order.items.map(item => ({
    description: \`\${item.productId} x\${item.quantity}\`,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxRateId: vatDE.id,
    taxRate: 19,
  })),
  dueDate,
  { orderId: order.id, notes: "Payment terms: NET 30" }
);

console.log(\`Invoice \${invoice.invoiceNumber} created\`);
console.log(\`  Subtotal: \${invoice.totalAmount} cents\`);

// Send invoice to customer
await services.invoiceService.sendInvoice(invoice.id);`}
                />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">4b. Record payment</p>
                <CodeBlock
                  code={`// Customer pays via bank transfer
const payment = await services.paymentService.createPayment(
  order.id, customer.id,
  invoice.totalAmount,
  "BANK_TRANSFER",
  { referenceNumber: "SEPA-2026-04-15-ACME", notes: "Invoice " + invoice.invoiceNumber }
);

// Mark payment as completed
await services.paymentService.completePayment(payment.id);

// Record payment on invoice
await services.invoiceService.recordPayment(invoice.id, invoice.totalAmount);
// Invoice status automatically moves to PAID

// Emit webhook
await services.webhookService.emit("PAYMENT_COMPLETED", {
  orderId: order.id,
  invoiceId: invoice.id,
  amount: invoice.totalAmount,
  method: "BANK_TRANSFER",
});`}
                />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">4c. Deliver &amp; complete</p>
                <CodeBlock
                  code={`// Shipment delivered
await services.shippingService.deliverShipment(shipment.id);

// Complete the order
const completed = await services.orderService.completeOrder(order.id);
console.log(\`Order \${completed.id} status: \${completed.status}\`); // COMPLETED

// Final audit entry
await services.auditLogService.log("Order", order.id, "STATUS_CHANGE", {
  actor: "system",
  oldValues: { status: "SHIPPED" },
  newValues: { status: "COMPLETED" },
  metadata: { completedAt: new Date().toISOString() },
});

// ── Reporting ──────────────────────────────────────────
const revenue = await services.reportingService.getRevenueReport(customer.id);
console.log(\`\\nCustomer revenue: \${revenue.totalRevenue} cents\`);
console.log(\`Orders: \${revenue.orderCount}\`);
console.log(\`Avg order value: \${revenue.averageOrderValue} cents\`);

const clv = await services.reportingService.getCustomerLifetimeValues(5);
console.log("\\nTop customers by lifetime value:");
clv.forEach(c => console.log(\`  \${c.customerName}: \${c.totalSpent} cents\`));`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle>Services Used in This Workflow</AlertTitle>
        <AlertDescription>
          <span className="text-xs leading-relaxed">
            CategoryService, ProductService, WarehouseService, StockService,
            PricingService, TaxService, CustomerService, AddressService,
            ReorderService, WebhookService, SearchService, CartRulesService,
            PromotionService, OrderService, ReservationService, AuditLogService,
            BatchTrackingService, ShippingService, InvoiceService,
            PaymentService, ReportingService
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
}
