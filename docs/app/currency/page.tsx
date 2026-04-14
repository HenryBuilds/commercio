import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";

export default function CurrencyPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Multi-Currency</h1>
        <p className="text-xl text-muted-foreground">
          Exchange rates and automatic currency conversion. Store rates with
          effective dates and convert amounts between any supported currencies.
        </p>
      </div>

      {/* Currency Model */}
      <Card>
        <CardHeader>
          <CardTitle>Exchange Rate Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class ExchangeRate {
  id: string;              // Unique UUID identifier
  baseCurrency: string;    // Base currency code (e.g. "USD")
  targetCurrency: string;  // Target currency code (e.g. "EUR")
  rate: number;            // Conversion rate (e.g. 0.92)
  effectiveDate: Date;     // Date this rate takes effect
}

class ConversionResult {
  fromCurrency: string;    // Source currency code
  toCurrency: string;      // Target currency code
  originalAmount: number;  // Amount in source currency (cents)
  convertedAmount: number; // Amount in target currency (cents)
  rateUsed: number;        // Exchange rate applied
  effectiveDate: Date;     // Rate date used
}`}
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
            <p className="mb-2 font-semibold">Create exchange rates:</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const { currencyService } = createServices();

// Create a USD to EUR rate
const rate = await currencyService.createRate({
  baseCurrency: "USD",
  targetCurrency: "EUR",
  rate: 0.92,
  effectiveDate: new Date("2026-04-14"),
});

console.log(rate.id);             // UUID
console.log(rate.rate);           // 0.92
console.log(rate.effectiveDate);  // 2026-04-14

// Create a USD to GBP rate
await currencyService.createRate({
  baseCurrency: "USD",
  targetCurrency: "GBP",
  rate: 0.79,
  effectiveDate: new Date("2026-04-14"),
});`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Convert amounts:</p>
            <CodeBlock
              code={`// Convert $100.00 USD to EUR
const result = await currencyService.convert({
  fromCurrency: "USD",
  toCurrency: "EUR",
  amount: 10000,  // $100.00 in cents
});

console.log(result.convertedAmount); // 9200 (EUR 92.00)
console.log(result.rateUsed);        // 0.92
console.log(result.effectiveDate);   // Date of rate used`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Look up effective rates:</p>
            <CodeBlock
              code={`// Get the effective rate for a specific date
const rate = await currencyService.getEffectiveRate(
  "USD",
  "EUR",
  new Date("2026-04-10"),
);

console.log(rate.rate);          // Rate effective on that date
console.log(rate.effectiveDate); // Closest effective date <= query date

// List all rates for a currency pair
const history = await currencyService.getRates("USD", "EUR");

history.forEach(r => {
  console.log(\`\${r.effectiveDate}: \${r.rate}\`);
});`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
