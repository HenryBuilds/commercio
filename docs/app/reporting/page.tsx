import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";

export default function ReportingPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Reporting & Analytics
        </h1>
        <p className="text-xl text-muted-foreground">
          Revenue reports, top products, customer lifetime value, inventory
          snapshots, and overdue invoice tracking. All reports accept date
          ranges and return structured data ready for dashboards.
        </p>
      </div>

      {/* Report Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`// ReportingService provides these report methods:
//
// getRevenueReport(from, to)        - Total revenue, order count, average order value
// getTopProducts(from, to, limit)   - Best-selling products by revenue
// getCustomerLifetimeValues()       - CLV for every customer
// getInventoryReport()              - Current stock levels and valuation
// getOverdueInvoices()              - Unpaid invoices past their due date`}
          />
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">Revenue report:</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const { reportingService } = createServices();

// Get revenue for Q1 2026
const revenue = await reportingService.getRevenueReport(
  new Date("2026-01-01"),
  new Date("2026-03-31"),
);

console.log(revenue.totalRevenue);      // Total in cents
console.log(revenue.orderCount);        // Number of orders
console.log(revenue.averageOrderValue); // Average in cents`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Top products:</p>
            <CodeBlock
              code={`// Get top 5 products by revenue this month
const topProducts = await reportingService.getTopProducts(
  new Date("2026-04-01"),
  new Date("2026-04-30"),
  5,  // limit
);

topProducts.forEach((p, i) => {
  console.log(\`#\${i + 1} \${p.productName}: $\${p.totalRevenue / 100} (\${p.unitsSold} sold)\`);
});`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Customer lifetime value:</p>
            <CodeBlock
              code={`// Get lifetime value for all customers
const clvs = await reportingService.getCustomerLifetimeValues();

clvs.forEach(c => {
  console.log(
    \`\${c.customerName}: $\${c.lifetimeValue / 100} over \${c.orderCount} orders\`
  );
});`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Inventory report:</p>
            <CodeBlock
              code={`// Snapshot of current inventory
const inventory = await reportingService.getInventoryReport();

inventory.forEach(item => {
  console.log(
    \`\${item.productName}: \${item.currentStock} units, \` +
    \`valued at $\${item.stockValue / 100}\`
  );
});`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Overdue invoices:</p>
            <CodeBlock
              code={`// Get all invoices past their due date
const overdue = await reportingService.getOverdueInvoices();

overdue.forEach(inv => {
  console.log(
    \`Invoice \${inv.invoiceNumber}: $\${inv.amountDue / 100} \` +
    \`due \${inv.dueDate} (\${inv.daysOverdue} days overdue)\`
  );
});`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
