import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { Package, Plus, Search, Edit, FolderTree, Power, AlertCircle } from "lucide-react"

export default function ProductsPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Products</h1>
            <p className="text-xl text-muted-foreground">
              Manage your products with SKU support. Products must belong to a category.
            </p>
          </div>
        </div>
      </div>

      {/* Product Creation Flow */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Product Creation Flow</CardTitle>
              <CardDescription>
                How products are created with category validation
              </CardDescription>
            </div>
          </div>
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
      <Card className="border-2 border-amber-500/20 bg-amber-500/5">
        <CardContent className="flex items-start gap-3 pt-6">
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
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Create Product</CardTitle>
              <CardDescription>
                Create a new product with SKU and category
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import { ProductService, ProductRepository, CategoryService, CategoryRepository } from "commercio";

const productService = new ProductService(new ProductRepository());
const categoryService = new CategoryService(new CategoryRepository());

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
            <TabsTrigger value="get" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Get</span>
            </TabsTrigger>
            <TabsTrigger value="update" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Update</span>
            </TabsTrigger>
            <TabsTrigger value="category" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              <span className="hidden sm:inline">By Category</span>
            </TabsTrigger>
            <TabsTrigger value="activate" className="flex items-center gap-2">
              <Power className="h-4 w-4" />
              <span className="hidden sm:inline">Status</span>
            </TabsTrigger>
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
