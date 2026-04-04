import { SupplierRepository } from "../repositories/supplier.repository";
import { PurchaseOrderRepository } from "../repositories/purchase-order.repository";
import {
  Supplier,
  SupplierId,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderId,
  PurchaseOrderStatus,
} from "../modules/supplier/supplier.model";

/**
 * Service for Supplier business logic
 */
export class SupplierService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository
  ) {}

  /**
   * Creates a new supplier
   */
  async createSupplier(
    name: string,
    options?: {
      contactName?: string;
      email?: string;
      phone?: string;
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    }
  ): Promise<Supplier> {
    const trimmedName = name.trim();

    // Check if supplier name already exists
    const existing = await this.supplierRepository.findByName(trimmedName);
    if (existing) {
      throw new Error(`Supplier with name "${trimmedName}" already exists`);
    }

    const supplier = new Supplier(
      crypto.randomUUID(),
      trimmedName,
      options?.contactName ?? null,
      options?.email ?? null,
      options?.phone ?? null,
      options?.street ?? null,
      options?.city ?? null,
      options?.postalCode ?? null,
      options?.country ?? null
    );

    return await this.supplierRepository.create(supplier);
  }

  /**
   * Gets a supplier by ID
   */
  async getSupplierById(id: SupplierId): Promise<Supplier> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new Error(`Supplier with ID "${id}" not found`);
    }
    return supplier;
  }

  /**
   * Gets a supplier by name
   */
  async getSupplierByName(name: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findByName(name);
    if (!supplier) {
      throw new Error(`Supplier with name "${name}" not found`);
    }
    return supplier;
  }

  /**
   * Gets all suppliers
   */
  async getAllSuppliers(activeOnly: boolean = false): Promise<Supplier[]> {
    if (activeOnly) {
      return await this.supplierRepository.findAllActive();
    }
    return await this.supplierRepository.findAll();
  }

  /**
   * Updates a supplier
   */
  async updateSupplier(
    id: SupplierId,
    updates: Partial<{
      name: string;
      contactName: string | null;
      email: string | null;
      phone: string | null;
      street: string | null;
      city: string | null;
      postalCode: string | null;
      country: string | null;
    }>
  ): Promise<Supplier> {
    const supplier = await this.getSupplierById(id);

    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      const existing = await this.supplierRepository.findByName(trimmedName);
      if (existing && existing.id !== id) {
        throw new Error(`Supplier with name "${trimmedName}" already exists`);
      }
      supplier.name = trimmedName;
    }

    if (updates.contactName !== undefined) supplier.contactName = updates.contactName;
    if (updates.email !== undefined) supplier.email = updates.email;
    if (updates.phone !== undefined) supplier.phone = updates.phone;
    if (updates.street !== undefined) supplier.street = updates.street;
    if (updates.city !== undefined) supplier.city = updates.city;
    if (updates.postalCode !== undefined) supplier.postalCode = updates.postalCode;
    if (updates.country !== undefined) supplier.country = updates.country;

    supplier.updatedAt = new Date();
    return await this.supplierRepository.update(supplier);
  }

  /**
   * Deactivates a supplier
   */
  async deactivateSupplier(id: SupplierId): Promise<Supplier> {
    return await this.supplierRepository.deactivate(id);
  }

  /**
   * Activates a supplier
   */
  async activateSupplier(id: SupplierId): Promise<Supplier> {
    return await this.supplierRepository.activate(id);
  }

  /**
   * Creates a new purchase order
   */
  async createPurchaseOrder(
    supplierId: SupplierId,
    items: Array<{
      productId: string;
      quantity: number;
      unitCost: number;
    }>,
    options?: {
      expectedDelivery?: Date;
      notes?: string;
    }
  ): Promise<PurchaseOrder> {
    // Validate supplier exists
    await this.getSupplierById(supplierId);

    if (items.length === 0) {
      throw new Error("Purchase order must contain at least one item");
    }

    const poItems = items.map(
      (item) =>
        new PurchaseOrderItem(
          crypto.randomUUID(),
          item.productId,
          item.quantity,
          item.unitCost
        )
    );

    const po = new PurchaseOrder(
      crypto.randomUUID(),
      supplierId,
      poItems,
      PurchaseOrderStatus.DRAFT,
      options?.expectedDelivery ?? null,
      options?.notes ?? null
    );

    return await this.purchaseOrderRepository.create(po);
  }

  /**
   * Gets a purchase order by ID
   */
  async getPurchaseOrderById(id: PurchaseOrderId): Promise<PurchaseOrder> {
    const po = await this.purchaseOrderRepository.findById(id);
    if (!po) {
      throw new Error(`Purchase order with ID "${id}" not found`);
    }
    return po;
  }

  /**
   * Gets purchase orders by supplier
   */
  async getPurchaseOrdersBySupplier(
    supplierId: SupplierId
  ): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderRepository.findBySupplier(supplierId);
  }

  /**
   * Submits a purchase order (DRAFT -> SUBMITTED)
   */
  async submitPurchaseOrder(id: PurchaseOrderId): Promise<PurchaseOrder> {
    const po = await this.getPurchaseOrderById(id);

    if (po.status !== PurchaseOrderStatus.DRAFT) {
      throw new Error(
        `Cannot submit purchase order with status "${po.status}". Only DRAFT orders can be submitted.`
      );
    }

    return await this.purchaseOrderRepository.updateStatus(
      id,
      PurchaseOrderStatus.SUBMITTED
    );
  }

  /**
   * Confirms a purchase order (SUBMITTED -> CONFIRMED)
   */
  async confirmPurchaseOrder(id: PurchaseOrderId): Promise<PurchaseOrder> {
    const po = await this.getPurchaseOrderById(id);

    if (po.status !== PurchaseOrderStatus.SUBMITTED) {
      throw new Error(
        `Cannot confirm purchase order with status "${po.status}". Only SUBMITTED orders can be confirmed.`
      );
    }

    return await this.purchaseOrderRepository.updateStatus(
      id,
      PurchaseOrderStatus.CONFIRMED
    );
  }

  /**
   * Ships a purchase order (CONFIRMED -> SHIPPED)
   */
  async shipPurchaseOrder(id: PurchaseOrderId): Promise<PurchaseOrder> {
    const po = await this.getPurchaseOrderById(id);

    if (po.status !== PurchaseOrderStatus.CONFIRMED) {
      throw new Error(
        `Cannot ship purchase order with status "${po.status}". Only CONFIRMED orders can be shipped.`
      );
    }

    return await this.purchaseOrderRepository.updateStatus(
      id,
      PurchaseOrderStatus.SHIPPED
    );
  }

  /**
   * Receives a purchase order (SHIPPED -> RECEIVED)
   */
  async receivePurchaseOrder(id: PurchaseOrderId): Promise<PurchaseOrder> {
    const po = await this.getPurchaseOrderById(id);

    if (po.status !== PurchaseOrderStatus.SHIPPED) {
      throw new Error(
        `Cannot receive purchase order with status "${po.status}". Only SHIPPED orders can be received.`
      );
    }

    return await this.purchaseOrderRepository.updateStatus(
      id,
      PurchaseOrderStatus.RECEIVED
    );
  }

  /**
   * Cancels a purchase order (any status except RECEIVED -> CANCELLED)
   */
  async cancelPurchaseOrder(id: PurchaseOrderId): Promise<PurchaseOrder> {
    const po = await this.getPurchaseOrderById(id);

    if (po.status === PurchaseOrderStatus.RECEIVED) {
      throw new Error(
        `Cannot cancel purchase order with status "${po.status}". Received orders cannot be cancelled.`
      );
    }

    if (po.status === PurchaseOrderStatus.CANCELLED) {
      throw new Error(
        `Cannot cancel purchase order with status "${po.status}". Order is already cancelled.`
      );
    }

    return await this.purchaseOrderRepository.updateStatus(
      id,
      PurchaseOrderStatus.CANCELLED
    );
  }
}
