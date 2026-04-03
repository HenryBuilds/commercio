import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"

export default function WarehousesPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Warehouses</h1>
        <p className="text-xl text-muted-foreground">
          Manage multiple warehouses for your inventory.
        </p>
      </div>

      {/* Create Warehouse */}
      <Card>
        <CardHeader>
          <CardTitle>Create Warehouse</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import { createWarehouseService } from "commercio";

const warehouseService = createWarehouseService();

// Create warehouse
const warehouse = await warehouseService.createWarehouse(
  "Main Warehouse Berlin"
);`}
          />
        </CardContent>
      </Card>

      {/* Warehouse Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Warehouse Operations</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Get Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`const warehouse = await warehouseService.getWarehouseById(warehouseId);`}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Update Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`const updated = await warehouseService.updateWarehouse(
  warehouseId,
  {
    name: "Main Warehouse Berlin - Location 2",
  }
);`}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Deactivate Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`await warehouseService.deactivateWarehouse(warehouseId);`}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activate Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`await warehouseService.activateWarehouse(warehouseId);`}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
