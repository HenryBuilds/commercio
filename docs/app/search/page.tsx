import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";

export default function SearchPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Search & Filter</h1>
        <p className="text-xl text-muted-foreground">
          Search products with query strings, category filters, price ranges,
          and stock availability. Results are paginated and sorted for
          storefront or admin use.
        </p>
      </div>

      {/* Search Model */}
      <Card>
        <CardHeader>
          <CardTitle>Search Interfaces</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`interface SearchFilters {
  query?: string;             // Full-text search on name and description
  categoryId?: string;        // Filter by category
  minPrice?: number;          // Minimum price in cents (inclusive)
  maxPrice?: number;          // Maximum price in cents (inclusive)
  inStock?: boolean;          // Only products currently in stock
  sortBy?: "name" | "price" | "createdAt"; // Sort field
  sortOrder?: "asc" | "desc"; // Sort direction (default: "asc")
  page?: number;              // Page number (default: 1)
  pageSize?: number;          // Results per page (default: 20)
}

interface SearchResult {
  items: Product[];           // Matched products
  total: number;              // Total matches across all pages
  page: number;               // Current page number
  pageSize: number;           // Results per page
  totalPages: number;         // Total number of pages
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
            <p className="mb-2 font-semibold">Basic search:</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const { searchService } = createServices();

// Search for products by name
const result = await searchService.search({
  query: "wireless headphones",
});

console.log(result.total);      // Total matches
console.log(result.totalPages); // Number of pages
result.items.forEach(p => {
  console.log(\`\${p.name}: $\${p.price / 100}\`);
});`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Filtered search:</p>
            <CodeBlock
              code={`// Search with multiple filters
const filtered = await searchService.search({
  query: "headphones",
  categoryId: electronicsCategory.id,
  minPrice: 2000,    // $20.00
  maxPrice: 10000,   // $100.00
  inStock: true,
  sortBy: "price",
  sortOrder: "asc",
});

console.log(\`\${filtered.total} products found\`);
filtered.items.forEach(p => {
  console.log(\`\${p.name}: $\${p.price / 100}\`);
});`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Pagination:</p>
            <CodeBlock
              code={`// First page with 10 results
const page1 = await searchService.search({
  query: "shirt",
  page: 1,
  pageSize: 10,
});

console.log(\`Page \${page1.page} of \${page1.totalPages}\`);
console.log(\`Showing \${page1.items.length} of \${page1.total} results\`);

// Next page
const page2 = await searchService.search({
  query: "shirt",
  page: 2,
  pageSize: 10,
});

console.log(\`Page \${page2.page} of \${page2.totalPages}\`);`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Browse by category:</p>
            <CodeBlock
              code={`// Browse all in-stock products in a category, sorted by newest
const browse = await searchService.search({
  categoryId: apparelCategory.id,
  inStock: true,
  sortBy: "createdAt",
  sortOrder: "desc",
  pageSize: 50,
});

browse.items.forEach(p => {
  console.log(\`\${p.name} - added \${p.createdAt}\`);
});`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
