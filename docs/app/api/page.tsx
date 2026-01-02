import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code2, FolderTree, Package, Warehouse, Database, ShoppingCart } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function ApiPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Code2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">API Reference</h1>
            <p className="text-xl text-muted-foreground">
              Complete API documentation for all services.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="category" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="category" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            <span className="hidden sm:inline">Category</span>
          </TabsTrigger>
          <TabsTrigger value="product" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Product</span>
          </TabsTrigger>
          <TabsTrigger value="warehouse" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            <span className="hidden sm:inline">Warehouse</span>
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Stock</span>
          </TabsTrigger>
          <TabsTrigger value="order" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Order</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="space-y-4 mt-6">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>CategoryService</CardTitle>
                  <CardDescription>
                    Manage product categories
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-2 font-semibold">createCategory(name, description?)</p>
                <CodeBlock code="createCategory(name: string, description?: string): Promise<Category>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">getCategoryById(id)</p>
                <CodeBlock code="getCategoryById(id: CategoryId): Promise<Category>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">getCategoryByName(name)</p>
                <CodeBlock code="getCategoryByName(name: string): Promise<Category>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">getAllCategories(activeOnly?)</p>
                <CodeBlock code="getAllCategories(activeOnly?: boolean): Promise<Category[]>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">updateCategory(id, updates)</p>
                <CodeBlock code="updateCategory(id: CategoryId, updates: Partial<{ name: string; description: string | null }>): Promise<Category>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">deactivateCategory(id)</p>
                <CodeBlock code="deactivateCategory(id: CategoryId): Promise<Category>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">activateCategory(id)</p>
                <CodeBlock code="activateCategory(id: CategoryId): Promise<Category>" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product" className="space-y-4 mt-6">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>ProductService</CardTitle>
                  <CardDescription>
                    Manage products with SKU support
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-2 font-semibold">createProduct(name, sku, categoryId)</p>
                <CodeBlock code="createProduct(name: string, sku: string, categoryId: CategoryId): Promise<Product>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">getProductById(id)</p>
                <CodeBlock code="getProductById(id: ProductId): Promise<Product>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">getProductBySku(sku)</p>
                <CodeBlock code="getProductBySku(sku: string): Promise<Product>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">getProductsByCategory(categoryId)</p>
                <CodeBlock code="getProductsByCategory(categoryId: CategoryId): Promise<Product[]>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">updateProduct(id, updates)</p>
                <CodeBlock code="updateProduct(id: ProductId, updates: Partial<{ name: string; sku: string; categoryId: CategoryId; isSellable: boolean; isActive: boolean }>): Promise<Product>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">deactivateProduct(id)</p>
                <CodeBlock code="deactivateProduct(id: ProductId): Promise<Product>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">activateProduct(id)</p>
                <CodeBlock code="activateProduct(id: ProductId): Promise<Product>" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouse" className="space-y-4 mt-6">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Warehouse className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>WarehouseService</CardTitle>
                  <CardDescription>
                    Manage warehouse locations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-2 font-semibold">createWarehouse(name)</p>
                <CodeBlock code="createWarehouse(name: string): Promise<Warehouse>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">getWarehouseById(id)</p>
                <CodeBlock code="getWarehouseById(id: WarehouseId): Promise<Warehouse>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">updateWarehouse(id, updates)</p>
                <CodeBlock code="updateWarehouse(id: WarehouseId, updates: Partial<Warehouse>): Promise<Warehouse>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">deactivateWarehouse(id)</p>
                <CodeBlock code="deactivateWarehouse(id: WarehouseId): Promise<Warehouse>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">activateWarehouse(id)</p>
                <CodeBlock code="activateWarehouse(id: WarehouseId): Promise<Warehouse>" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4 mt-6">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>StockService</CardTitle>
                  <CardDescription>
                    Manage inventory stock levels
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-2 font-semibold">setStock(productId, warehouseId, quantity)</p>
                <CodeBlock code="setStock(productId: ProductId, warehouseId: WarehouseId, quantity: number): Promise<Stock>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">getStock(productId, warehouseId)</p>
                <CodeBlock code="getStock(productId: ProductId, warehouseId: WarehouseId): Promise<Stock | null>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">adjustStock(productId, warehouseId, adjustment)</p>
                <CodeBlock code="adjustStock(productId: ProductId, warehouseId: WarehouseId, adjustment: number): Promise<Stock>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">getTotalStock(productId)</p>
                <CodeBlock code="getTotalStock(productId: ProductId): Promise<number>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">getStockByProduct(productId)</p>
                <CodeBlock code="getStockByProduct(productId: ProductId): Promise<Stock[]>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">getStockByWarehouse(warehouseId)</p>
                <CodeBlock code="getStockByWarehouse(warehouseId: WarehouseId): Promise<Stock[]>" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order" className="space-y-4 mt-6">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>OrderService</CardTitle>
                  <CardDescription>
                    Manage orders and order workflow
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-2 font-semibold">createOrder(customerId, items)</p>
                <CodeBlock code="createOrder(customerId: string, items: OrderItemInput[]): Promise<Order>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">getOrderById(id)</p>
                <CodeBlock code="getOrderById(id: OrderId): Promise<Order>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">getOrdersByCustomer(customerId)</p>
                <CodeBlock code="getOrdersByCustomer(customerId: string): Promise<Order[]>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">confirmOrder(id, warehouseId)</p>
                <CodeBlock code="confirmOrder(id: OrderId, warehouseId: WarehouseId): Promise<Order>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">markOrderAsPaid(id)</p>
                <CodeBlock code="markOrderAsPaid(id: OrderId): Promise<Order>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">shipOrder(id, warehouseId)</p>
                <CodeBlock code="shipOrder(id: OrderId, warehouseId: WarehouseId): Promise<Order>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">completeOrder(id)</p>
                <CodeBlock code="completeOrder(id: OrderId): Promise<Order>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">cancelOrder(id)</p>
                <CodeBlock code="cancelOrder(id: OrderId): Promise<Order>" />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-semibold">returnOrderItems(id, items, warehouseId)</p>
                <CodeBlock code="returnOrderItems(id: OrderId, items: ReturnItemInput[], warehouseId: WarehouseId): Promise<Order>" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
