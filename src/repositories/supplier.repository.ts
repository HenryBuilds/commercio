import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { suppliers } from "../db/schema/suppliers";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { Supplier, SupplierId } from "../modules/supplier/supplier.model";
import { SupplierMapper } from "../db/mappers/supplier.mapper";

export class SupplierRepository {
  async create(supplier: Supplier): Promise<Supplier> {
    const created = await insertAndReturn(
      db,
      suppliers,
      SupplierMapper.toPersistence(supplier)
    );

    if (!created) {
      throw new Error("Failed to create supplier");
    }

    return SupplierMapper.toDomain(created);
  }

  async findById(id: SupplierId): Promise<Supplier | null> {
    const [result] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    return result ? SupplierMapper.toDomain(result) : null;
  }

  async findByName(name: string): Promise<Supplier | null> {
    const [result] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.name, name))
      .limit(1);

    return result ? SupplierMapper.toDomain(result) : null;
  }

  async findAll(): Promise<Supplier[]> {
    const results = await db.select().from(suppliers);
    return SupplierMapper.toDomainMany(results);
  }

  async findAllActive(): Promise<Supplier[]> {
    const results = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.isActive, true));
    return SupplierMapper.toDomainMany(results);
  }

  async update(supplier: Supplier): Promise<Supplier> {
    const updated = await updateAndReturn(
      db,
      suppliers,
      SupplierMapper.toPersistence(supplier),
      eq(suppliers.id, supplier.id)
    );

    if (!updated) {
      throw new Error("Failed to update supplier");
    }

    return SupplierMapper.toDomain(updated);
  }

  async deactivate(id: SupplierId): Promise<Supplier> {
    const supplier = await this.findById(id);
    if (!supplier) {
      throw new Error(`Supplier with ID "${id}" not found`);
    }

    supplier.isActive = false;
    supplier.updatedAt = new Date();
    return await this.update(supplier);
  }

  async activate(id: SupplierId): Promise<Supplier> {
    const supplier = await this.findById(id);
    if (!supplier) {
      throw new Error(`Supplier with ID "${id}" not found`);
    }

    supplier.isActive = true;
    supplier.updatedAt = new Date();
    return await this.update(supplier);
  }
}
