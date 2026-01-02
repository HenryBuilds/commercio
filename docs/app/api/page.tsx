import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ApiPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">API Reference</h1>
        <p className="text-xl text-muted-foreground">
          Complete API documentation for all services.
        </p>
      </div>

      <Tabs defaultValue="category" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="product">Product</TabsTrigger>
          <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="order">Order</TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CategoryService</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 font-medium">createCategory(name, description?)</p>
                <CodeBlock code="createCategory(name: string, description?: string): Promise<Category>" />
              </div>
              <div>
                <p className="mb-2 font-medium">getCategoryById(id)</p>
                <CodeBlock code="getCategoryById(id: CategoryId): Promise<Category>" />
              </div>
              <div>
                <p className="mb-2 font-medium">getCategoryByName(name)</p>
                <CodeBlock code="getCategoryByName(name: string): Promise<Category>" />
              </div>
              <div>
                <p className="mb-2 font-medium">getAllCategories(activeOnly?)</p>
                <CodeBlock code="getAllCategories(activeOnly?: boolean): Promise<Category[]>" />
              </div>
              <div>
                <p className="mb-2 font-medium">updateCategory(id, updates)</p>
                <CodeBlock code="updateCategory(id: CategoryId, updates: Partial<{ name: string; description: string | null }>): Promise<Category>" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ProductService</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 font-medium">createProduct(name, sku, categoryId)</p>
                <CodeBlock code="createProduct(name: string, sku: string, categoryId: CategoryId): Promise<Product>" />
              </div>
              <div>
                <p className="mb-2 font-medium">getProductById(id)</p>
                <CodeBlock code="getProductById(id: ProductId): Promise<Product>" />
              </div>
              <div>
                <p className="mb-2 font-medium">getProductBySku(sku)</p>
                <CodeBlock code="getProductBySku(sku: string): Promise<Product>" />
              </div>
              <div>
                <p className="mb-2 font-medium">getProductsByCategory(categoryId)</p>
                <CodeBlock code="getProductsByCategory(categoryId: CategoryId): Promise<Product[]>" />
              </div>
              <div>
                <p className="mb-2 font-medium">updateProduct(id, updates)</p>
                <CodeBlock code="updateProduct(id: ProductId, updates: Partial<{ name: string; sku: string; categoryId: CategoryId; isSellable: boolean; isActive: boolean }>): Promise<Product>" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WarehouseService</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 font-medium">createWarehouse(name)</p>
                <CodeBlock code="createWarehouse(name: string): Promise<Warehouse>" />
              </div>
              <div>
                <p className="mb-2 font-medium">getWarehouseById(id)</p>
                <CodeBlock code="getWarehouseById(id: WarehouseId): Promise<Warehouse>" />
              </div>
              <div>
                <p className="mb-2 font-medium">updateWarehouse(id, updates)</p>
                <CodeBlock code="updateWarehouse(id: WarehouseId, updates: Partial<Warehouse>): Promise<Warehouse>" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>StockService</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 font-medium">setStock(productId, warehouseId, quantity)</p>
                <CodeBlock code="setStock(productId: ProductId, warehouseId: WarehouseId, quantity: number): Promise<Stock>" />
              </div>
              <div>
                <p className="mb-2 font-medium">getStock(productId, warehouseId)</p>
                <CodeBlock code="getStock(productId: ProductId, warehouseId: WarehouseId): Promise<Stock | null>" />
              </div>
              <div>
                <p className="mb-2 font-medium">adjustStock(productId, warehouseId, adjustment)</p>
                <CodeBlock code="adjustStock(productId: ProductId, warehouseId: WarehouseId, adjustment: number): Promise<Stock>" />
              </div>
              <div>
                <p className="mb-2 font-medium">getTotalStock(productId)</p>
                <CodeBlock code="getTotalStock(productId: ProductId): Promise<number>" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OrderService</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 font-medium">createOrder(customerId, items)</p>
                <CodeBlock code="createOrder(customerId: string, items: OrderItemInput[]): Promise<Order>" />
              </div>
              <div>
                <p className="mb-2 font-medium">getOrderById(id)</p>
                <CodeBlock code="getOrderById(id: OrderId): Promise<Order>" />
              </div>
              <div>
                <p className="mb-2 font-medium">confirmOrder(id, warehouseId)</p>
                <CodeBlock code="confirmOrder(id: OrderId, warehouseId: WarehouseId): Promise<Order>" />
              </div>
              <div>
                <p className="mb-2 font-medium">markOrderAsPaid(id)</p>
                <CodeBlock code="markOrderAsPaid(id: OrderId): Promise<Order>" />
              </div>
              <div>
                <p className="mb-2 font-medium">shipOrder(id, warehouseId)</p>
                <CodeBlock code="shipOrder(id: OrderId, warehouseId: WarehouseId): Promise<Order>" />
              </div>
              <div>
                <p className="mb-2 font-medium">completeOrder(id)</p>
                <CodeBlock code="completeOrder(id: OrderId): Promise<Order>" />
              </div>
              <div>
                <p className="mb-2 font-medium">cancelOrder(id)</p>
                <CodeBlock code="cancelOrder(id: OrderId): Promise<Order>" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

