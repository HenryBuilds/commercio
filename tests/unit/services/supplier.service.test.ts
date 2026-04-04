import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../../src/services/factory";
import { SupplierService } from "../../../src/services/supplier.service";
import {
  Supplier,
  PurchaseOrder,
  PurchaseOrderStatus,
} from "../../../src/modules/supplier/supplier.model";
import { TestDbHelper } from "../../helpers/db";

describe("SupplierService", () => {
  let supplierService: SupplierService;
  let categoryService: any;
  let productService: any;

  beforeEach(async () => {
    await TestDbHelper.clearAllTables();
    const services = createServices();
    supplierService = services.supplierService;
    categoryService = services.categoryService;
    productService = services.productService;
  });

  describe("createSupplier", () => {
    it("should create a supplier successfully", async () => {
      const supplier = await supplierService.createSupplier(
        "Acme Supplies",
        {
          contactName: "John Smith",
          email: "john@acme.com",
          phone: "+49 30 12345678",
          street: "123 Industrial Ave",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        }
      );

      expect(supplier).toBeInstanceOf(Supplier);
      expect(supplier.name).toBe("Acme Supplies");
      expect(supplier.contactName).toBe("John Smith");
      expect(supplier.email).toBe("john@acme.com");
      expect(supplier.phone).toBe("+49 30 12345678");
      expect(supplier.street).toBe("123 Industrial Ave");
      expect(supplier.city).toBe("Berlin");
      expect(supplier.postalCode).toBe("10115");
      expect(supplier.country).toBe("Germany");
      expect(supplier.isActive).toBe(true);
    });

    it("should throw error if name is empty", async () => {
      await expect(
        supplierService.createSupplier("")
      ).rejects.toThrow("Supplier name must not be empty");
    });

    it("should throw error if name already exists", async () => {
      const name = `Supplier-${Date.now()}`;
      await supplierService.createSupplier(name);

      await expect(
        supplierService.createSupplier(name)
      ).rejects.toThrow("already exists");
    });
  });

  describe("getSupplierById", () => {
    it("should return supplier if exists", async () => {
      const created = await supplierService.createSupplier(
        `Supplier-${Date.now()}`
      );

      const supplier = await supplierService.getSupplierById(created.id);

      expect(supplier).toBeInstanceOf(Supplier);
      expect(supplier.id).toBe(created.id);
    });

    it("should throw error if supplier not found", async () => {
      const nonExistentId = crypto.randomUUID();
      await expect(
        supplierService.getSupplierById(nonExistentId)
      ).rejects.toThrow("not found");
    });
  });

  describe("getSupplierByName", () => {
    it("should return supplier by name", async () => {
      const name = `Supplier-${Date.now()}`;
      await supplierService.createSupplier(name);

      const supplier = await supplierService.getSupplierByName(name);

      expect(supplier).toBeInstanceOf(Supplier);
      expect(supplier.name).toBe(name);
    });

    it("should throw error if name not found", async () => {
      await expect(
        supplierService.getSupplierByName("NonExistent Supplier")
      ).rejects.toThrow("not found");
    });
  });

  describe("getAllSuppliers", () => {
    it("should return all suppliers", async () => {
      await supplierService.createSupplier(`Supplier-A-${Date.now()}`);
      await supplierService.createSupplier(`Supplier-B-${Date.now()}`);

      const suppliers = await supplierService.getAllSuppliers();

      expect(suppliers.length).toBeGreaterThanOrEqual(2);
    });

    it("should return only active suppliers when activeOnly is true", async () => {
      const active = await supplierService.createSupplier(
        `Active-${Date.now()}`
      );
      const inactive = await supplierService.createSupplier(
        `Inactive-${Date.now()}`
      );
      await supplierService.deactivateSupplier(inactive.id);

      const suppliers = await supplierService.getAllSuppliers(true);

      expect(suppliers.some((s) => s.id === active.id)).toBe(true);
      expect(suppliers.some((s) => s.id === inactive.id)).toBe(false);
    });
  });

  describe("updateSupplier", () => {
    it("should update supplier successfully", async () => {
      const created = await supplierService.createSupplier(
        `Original-${Date.now()}`,
        { city: "Berlin" }
      );

      const updated = await supplierService.updateSupplier(created.id, {
        name: `Updated-${Date.now()}`,
        city: "Munich",
        email: "updated@example.com",
      });

      expect(updated.city).toBe("Munich");
      expect(updated.email).toBe("updated@example.com");
    });
  });

  describe("deactivateSupplier", () => {
    it("should deactivate a supplier", async () => {
      const created = await supplierService.createSupplier(
        `Supplier-${Date.now()}`
      );

      const deactivated = await supplierService.deactivateSupplier(created.id);

      expect(deactivated.isActive).toBe(false);
    });
  });

  describe("activateSupplier", () => {
    it("should activate a deactivated supplier", async () => {
      const created = await supplierService.createSupplier(
        `Supplier-${Date.now()}`
      );
      await supplierService.deactivateSupplier(created.id);

      const activated = await supplierService.activateSupplier(created.id);

      expect(activated.isActive).toBe(true);
    });
  });

  describe("createPurchaseOrder", () => {
    it("should create a purchase order successfully", async () => {
      const supplier = await supplierService.createSupplier(
        `Supplier-${Date.now()}`
      );
      const category = await categoryService.createCategory(
        `Category-${Date.now()}`
      );
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const po = await supplierService.createPurchaseOrder(
        supplier.id,
        [{ productId: product.id, quantity: 10, unitCost: 5000 }],
        { notes: "Urgent order" }
      );

      expect(po).toBeInstanceOf(PurchaseOrder);
      expect(po.supplierId).toBe(supplier.id);
      expect(po.items.length).toBe(1);
      expect(po.items[0].quantity).toBe(10);
      expect(po.items[0].unitCost).toBe(5000);
      expect(po.totalCost).toBe(50000);
      expect(po.status).toBe(PurchaseOrderStatus.DRAFT);
      expect(po.notes).toBe("Urgent order");
    });

    it("should throw error if supplier does not exist", async () => {
      const fakeId = crypto.randomUUID();

      await expect(
        supplierService.createPurchaseOrder(fakeId, [
          { productId: crypto.randomUUID(), quantity: 1, unitCost: 100 },
        ])
      ).rejects.toThrow("not found");
    });

    it("should throw error if items array is empty", async () => {
      const supplier = await supplierService.createSupplier(
        `Supplier-${Date.now()}`
      );

      await expect(
        supplierService.createPurchaseOrder(supplier.id, [])
      ).rejects.toThrow("at least one item");
    });
  });

  describe("purchase order workflow", () => {
    let supplier: Supplier;
    let poId: string;

    beforeEach(async () => {
      supplier = await supplierService.createSupplier(
        `Supplier-${Date.now()}`
      );
      const category = await categoryService.createCategory(
        `Category-${Date.now()}`
      );
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const po = await supplierService.createPurchaseOrder(supplier.id, [
        { productId: product.id, quantity: 5, unitCost: 2000 },
      ]);
      poId = po.id;
    });

    it("should follow full workflow: DRAFT -> SUBMITTED -> CONFIRMED -> SHIPPED -> RECEIVED", async () => {
      let po = await supplierService.submitPurchaseOrder(poId);
      expect(po.status).toBe(PurchaseOrderStatus.SUBMITTED);

      po = await supplierService.confirmPurchaseOrder(poId);
      expect(po.status).toBe(PurchaseOrderStatus.CONFIRMED);

      po = await supplierService.shipPurchaseOrder(poId);
      expect(po.status).toBe(PurchaseOrderStatus.SHIPPED);

      po = await supplierService.receivePurchaseOrder(poId);
      expect(po.status).toBe(PurchaseOrderStatus.RECEIVED);
    });

    it("should not allow submitting a non-DRAFT order", async () => {
      await supplierService.submitPurchaseOrder(poId);

      await expect(
        supplierService.submitPurchaseOrder(poId)
      ).rejects.toThrow("Only DRAFT orders can be submitted");
    });

    it("should not allow confirming a non-SUBMITTED order", async () => {
      await expect(
        supplierService.confirmPurchaseOrder(poId)
      ).rejects.toThrow("Only SUBMITTED orders can be confirmed");
    });

    it("should not allow shipping a non-CONFIRMED order", async () => {
      await expect(
        supplierService.shipPurchaseOrder(poId)
      ).rejects.toThrow("Only CONFIRMED orders can be shipped");
    });

    it("should not allow receiving a non-SHIPPED order", async () => {
      await expect(
        supplierService.receivePurchaseOrder(poId)
      ).rejects.toThrow("Only SHIPPED orders can be received");
    });
  });

  describe("cancelPurchaseOrder", () => {
    it("should cancel a DRAFT purchase order", async () => {
      const supplier = await supplierService.createSupplier(
        `Supplier-${Date.now()}`
      );
      const category = await categoryService.createCategory(
        `Category-${Date.now()}`
      );
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const po = await supplierService.createPurchaseOrder(supplier.id, [
        { productId: product.id, quantity: 3, unitCost: 1000 },
      ]);

      const cancelled = await supplierService.cancelPurchaseOrder(po.id);

      expect(cancelled.status).toBe(PurchaseOrderStatus.CANCELLED);
    });

    it("should cancel a SUBMITTED purchase order", async () => {
      const supplier = await supplierService.createSupplier(
        `Supplier-${Date.now()}`
      );
      const category = await categoryService.createCategory(
        `Category-${Date.now()}`
      );
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const po = await supplierService.createPurchaseOrder(supplier.id, [
        { productId: product.id, quantity: 3, unitCost: 1000 },
      ]);
      await supplierService.submitPurchaseOrder(po.id);

      const cancelled = await supplierService.cancelPurchaseOrder(po.id);

      expect(cancelled.status).toBe(PurchaseOrderStatus.CANCELLED);
    });

    it("should not cancel a RECEIVED purchase order", async () => {
      const supplier = await supplierService.createSupplier(
        `Supplier-${Date.now()}`
      );
      const category = await categoryService.createCategory(
        `Category-${Date.now()}`
      );
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const po = await supplierService.createPurchaseOrder(supplier.id, [
        { productId: product.id, quantity: 3, unitCost: 1000 },
      ]);
      await supplierService.submitPurchaseOrder(po.id);
      await supplierService.confirmPurchaseOrder(po.id);
      await supplierService.shipPurchaseOrder(po.id);
      await supplierService.receivePurchaseOrder(po.id);

      await expect(
        supplierService.cancelPurchaseOrder(po.id)
      ).rejects.toThrow("Received orders cannot be cancelled");
    });
  });

  describe("getPurchaseOrdersBySupplier", () => {
    it("should return purchase orders for a supplier", async () => {
      const supplier = await supplierService.createSupplier(
        `Supplier-${Date.now()}`
      );
      const category = await categoryService.createCategory(
        `Category-${Date.now()}`
      );
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const po1 = await supplierService.createPurchaseOrder(supplier.id, [
        { productId: product.id, quantity: 5, unitCost: 2000 },
      ]);
      const po2 = await supplierService.createPurchaseOrder(supplier.id, [
        { productId: product.id, quantity: 10, unitCost: 3000 },
      ]);

      const pos = await supplierService.getPurchaseOrdersBySupplier(
        supplier.id
      );

      expect(pos.length).toBe(2);
      expect(pos.some((p) => p.id === po1.id)).toBe(true);
      expect(pos.some((p) => p.id === po2.id)).toBe(true);
    });

    it("should return empty array if supplier has no purchase orders", async () => {
      const supplier = await supplierService.createSupplier(
        `Supplier-${Date.now()}`
      );

      const pos = await supplierService.getPurchaseOrdersBySupplier(
        supplier.id
      );

      expect(pos).toEqual([]);
    });
  });

  describe("getPurchaseOrderById", () => {
    it("should return purchase order if exists", async () => {
      const supplier = await supplierService.createSupplier(
        `Supplier-${Date.now()}`
      );
      const category = await categoryService.createCategory(
        `Category-${Date.now()}`
      );
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const created = await supplierService.createPurchaseOrder(supplier.id, [
        { productId: product.id, quantity: 5, unitCost: 2000 },
      ]);

      const po = await supplierService.getPurchaseOrderById(created.id);

      expect(po).toBeInstanceOf(PurchaseOrder);
      expect(po.id).toBe(created.id);
      expect(po.items.length).toBe(1);
    });

    it("should throw error if purchase order not found", async () => {
      const nonExistentId = crypto.randomUUID();
      await expect(
        supplierService.getPurchaseOrderById(nonExistentId)
      ).rejects.toThrow("not found");
    });
  });
});
