import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { AlertCircle } from "lucide-react"

export default function ProductsPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Products</h1>
        <p className="text-lg text-muted-foreground">
          Manage your products with SKU support. Products must belong to a category.
        </p>
      </div>

      {/* Product Creation Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Product Creation Flow</CardTitle>
          <CardDescription>
            How products are created with category validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MermaidDiagram
            chart={`sequenceDiagram
    participant User
    participant ProductService
    participant CategoryService
    participant ProductRepository
    participant Database

    User->>CategoryService: createCategory(name, description)
    CategoryService->>Database: INSERT INTO categories
    Database-->>CategoryService: Category created
    CategoryService-->>User: Category (with ID)

    User->>ProductService: createProduct(name, sku, categoryId)
    ProductService->>ProductRepository: findBySku(sku)
    ProductRepository->>Database: SELECT * FROM products WHERE sku = ?
    Database-->>ProductRepository: No existing product
    ProductRepository-->>ProductService: null (SKU available)

    ProductService->>CategoryService: getCategoryById(categoryId)
    CategoryService->>Database: SELECT * FROM categories WHERE id = ?
    Database-->>CategoryService: Category found
    CategoryService-->>ProductService: Category exists

    ProductService->>ProductRepository: create(product)
    ProductRepository->>Database: INSERT INTO products (name, sku, category_id)
    Database-->>ProductRepository: Product created
    ProductRepository-->>ProductService: Product
    ProductService-->>User: Product created

    Note over User,Database: If category doesn't exist
    alt Category Not Found
        CategoryService-->>ProductService: Error: Category not found
        ProductService-->>User: Error: Invalid category
    end`}
            title="Product Creation Process"
          />
        </CardContent>
      </Card>

      {/* Important Note */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="flex items-start gap-2 pt-6">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100">Important</p>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
              Products must be assigned to a category. Create a category first before creating products.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create Product */}
      <Card>
        <CardHeader>
          <CardTitle>Create Product</CardTitle>
          <CardDescription>
            Create a new product with SKU and category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import { createProductService, createCategoryService } from "commercio";

const productService = createProductService();
const categoryService = createCategoryService();

// First, create a category
const category = await categoryService.createCategory("Electronics");

// Create product (categoryId is required)
const product = await productService.createProduct(
  "Laptop Dell XPS 15",
  "SKU-LAPTOP-001",
  category.id
);`}
          />
        </CardContent>
      </Card>

      {/* Product Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Product Operations</h2>
        <Tabs defaultValue="get" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="get">Get</TabsTrigger>
            <TabsTrigger value="update">Update</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="activate">Status</TabsTrigger>
          </TabsList>
          <TabsContent value="get" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Get Product</CardTitle>
                <CardDescription>
                  Retrieve products by ID or SKU
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`// Get by ID
const product = await productService.getProductById(productId);

// Get by SKU
const product = await productService.getProductBySku("SKU-LAPTOP-001");`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="update" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Product</CardTitle>
                <CardDescription>
                  Modify product details including category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`// Update product
const updated = await productService.updateProduct(productId, {
  name: "Laptop Dell XPS 15 (2024)",
  categoryId: newCategoryId, // Can change category
  isSellable: false,
});`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="category" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Get Products by Category</CardTitle>
                <CardDescription>
                  Retrieve all products in a specific category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`// Get products by category
const products = await productService.getProductsByCategory(categoryId);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="activate" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Activate / Deactivate</CardTitle>
                <CardDescription>
                  Control product visibility and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`// Deactivate product
await productService.deactivateProduct(productId);

// Activate product
await productService.activateProduct(productId);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
