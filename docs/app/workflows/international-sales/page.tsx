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

export default function InternationalSalesPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          Workflow
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Multi-Currency International Sales
        </h1>
        <p className="text-xl text-muted-foreground">
          Sell internationally with multiple currencies, localized tax rates,
          customer-group pricing, and automatic currency conversion for invoicing and payments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Process Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            {[
              "Set Up Currencies",
              "Localized Pricing",
              "Tax per Country",
              "Customer Places Order (USD)",
              "Convert to Base (EUR)",
              "Invoice in Customer Currency",
              "Accept Payment (USD)",
              "Record in Base Currency",
            ].map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  {i + 1}
                </span>
                <span>{step}</span>
                {i < 7 && (
                  <span className="text-muted-foreground">&rarr;</span>
                )}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete International Sales Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-2 font-semibold">Step 1: Set up exchange rates and localized pricing</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const services = createServices();

// ── Exchange rates ─────────────────────────────────────
// Base currency is EUR
await services.currencyService.createExchangeRate(
  "EUR", "USD", 1.08,
  new Date("2026-01-01"), new Date("2026-12-31")
);
await services.currencyService.createExchangeRate(
  "EUR", "GBP", 0.86,
  new Date("2026-01-01"), new Date("2026-12-31")
);
await services.currencyService.createExchangeRate(
  "EUR", "CHF", 0.97,
  new Date("2026-01-01"), new Date("2026-12-31")
);

// Check supported currencies
const currencies = await services.currencyService.getSupportedCurrencies();
console.log("Supported currencies:", currencies); // ["CHF", "EUR", "GBP", "USD"]

// ── Localized price lists ──────────────────────────────
const eurPrices = await services.pricingService.createPriceList(
  "EU Standard", { currency: "EUR", priority: 1 }
);
const usdPrices = await services.pricingService.createPriceList(
  "US Standard", { currency: "USD", priority: 1 }
);
const gbpPrices = await services.pricingService.createPriceList(
  "UK Standard", { currency: "GBP", priority: 1 }
);

// Set prices per currency (already converted at list level)
await services.pricingService.setPrice(eurPrices.id, laptopId, 129900); // 1299.00 EUR
await services.pricingService.setPrice(usdPrices.id, laptopId, 139900); // 1399.00 USD
await services.pricingService.setPrice(gbpPrices.id, laptopId, 114900); // 1149.00 GBP

// ── Tax rates per country ──────────────────────────────
const vatDE  = await services.taxService.createTaxRate("VAT DE", 19, "DE", { isDefault: true });
const vatUK  = await services.taxService.createTaxRate("VAT UK", 20, "GB", { isDefault: true });
const taxUS  = await services.taxService.createTaxRate("Sales Tax CA", 7.25, "US", { state: "CA" });
const vatCH  = await services.taxService.createTaxRate("VAT CH", 8.1, "CH", { isDefault: true });`}
            />
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Step 2: US customer places an order</p>
            <CodeBlock
              code={`// US customer onboarding
const usCustomer = await services.customerService.createCustomer(
  "TechCorp Inc.",
  { street: "500 Market St", city: "San Francisco", postalCode: "94105", country: "US", state: "CA" },
  { email: "orders@techcorp.us", phone: "+1 415 555 0100" },
);

// Get prices in USD for the US customer
const usdLaptopPrice = await services.pricingService.getEffectivePrice(laptopId, {});
// Would return 139900 (from USD price list based on priority/matching)

// Place order with USD prices
const order = await services.orderService.createOrder(usCustomer.id, [
  { productId: laptopId, quantity: 5, unitPrice: 139900 }, // USD
]);

console.log(\`Order total: $\${(order.totalAmount / 100).toFixed(2)}\`); // $6,995.00`}
            />
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Step 3: Convert for internal accounting</p>
            <CodeBlock
              code={`// Convert order total from USD to base currency (EUR) for internal records
const conversion = await services.currencyService.convert(
  order.totalAmount, "USD", "EUR"
);

console.log(\`Customer pays: $\${(order.totalAmount / 100).toFixed(2)} USD\`);
console.log(\`Internal value: \${(conversion.amount / 100).toFixed(2)} EUR\`);
console.log(\`Exchange rate: \${conversion.rate}\`);

// Also works with inverse rates (no direct USD->EUR needed)
const inverseConversion = await services.currencyService.convertWithInverse(
  order.totalAmount, "USD", "EUR"
);
console.log(\`Via inverse: \${(inverseConversion.amount / 100).toFixed(2)} EUR\`);`}
            />
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Step 4: Calculate tax &amp; create invoice in customer currency</p>
            <CodeBlock
              code={`// Calculate US sales tax (California)
const tax = await services.taxService.calculateTax(taxUS.id, order.totalAmount);
console.log(\`Net: $\${(tax.netAmount / 100).toFixed(2)}\`);
console.log(\`Tax (7.25%): $\${(tax.taxAmount / 100).toFixed(2)}\`);
console.log(\`Gross: $\${(tax.grossAmount / 100).toFixed(2)}\`);

// Create invoice in USD
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + 30);

const invoice = await services.invoiceService.createInvoice(
  usCustomer.id,
  order.items.map(item => ({
    description: "ThinkPad X1 Carbon",
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxRateId: taxUS.id,
    taxRate: 7.25,
  })),
  dueDate,
  { orderId: order.id, notes: "Currency: USD. California sales tax applied." }
);

await services.invoiceService.sendInvoice(invoice.id);
console.log(\`Invoice \${invoice.invoiceNumber} sent (USD)\`);`}
            />
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Step 5: Accept payment and record in base currency</p>
            <CodeBlock
              code={`// Customer pays in USD via credit card
const payment = await services.paymentService.createPayment(
  order.id, usCustomer.id,
  tax.grossAmount, // pay gross amount including tax
  "CREDIT_CARD",
  { referenceNumber: "STRIPE-pi_3abc123", notes: "Paid in USD" }
);
await services.paymentService.completePayment(payment.id);
await services.invoiceService.recordPayment(invoice.id, tax.grossAmount);

// Convert payment to EUR for accounting
const paymentInEur = await services.currencyService.convert(
  tax.grossAmount, "USD", "EUR"
);

console.log(\`Payment received: $\${(tax.grossAmount / 100).toFixed(2)} USD\`);
console.log(\`Booked as: \${(paymentInEur.amount / 100).toFixed(2)} EUR\`);

// Audit with currency metadata
await services.auditLogService.log("Payment", payment.id, "CREATE", {
  actor: "payment-gateway",
  newValues: {
    amountUSD: tax.grossAmount,
    amountEUR: paymentInEur.amount,
    exchangeRate: paymentInEur.rate,
  },
  metadata: { gateway: "stripe", currency: "USD" },
});

// ── Compare revenue across currencies ──────────────────
const revenue = await services.reportingService.getRevenueReport();
console.log(\`\\nTotal revenue (all orders, base currency): \${revenue.totalRevenue} cents\`);
console.log(\`Total orders: \${revenue.orderCount}\`);
console.log(\`Average order value: \${revenue.averageOrderValue} cents\`);`}
            />
          </div>
        </CardContent>
      </Card>

      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle>Services Used</AlertTitle>
        <AlertDescription>
          <span className="text-xs">
            CurrencyService, PricingService, TaxService, CustomerService,
            OrderService, InvoiceService, PaymentService, AuditLogService,
            ReportingService
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
}
