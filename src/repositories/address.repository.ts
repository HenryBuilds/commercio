import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { addresses } from "../db/schema/addresses";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { Address, AddressId } from "../modules/address/address.model";
import { AddressMapper } from "../db/mappers/address.mapper";

export class AddressRepository {
  async create(address: Address): Promise<Address> {
    const created = await insertAndReturn(db, addresses, AddressMapper.toPersistence(address));

    if (!created) {
      throw new Error("Failed to create address");
    }

    return AddressMapper.toDomain(created);
  }

  async findById(id: AddressId): Promise<Address | null> {
    const [result] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, id))
      .limit(1);

    return result ? AddressMapper.toDomain(result) : null;
  }

  async findByCustomer(customerId: string): Promise<Address[]> {
    const results = await db
      .select()
      .from(addresses)
      .where(eq(addresses.customerId, customerId));
    return AddressMapper.toDomainMany(results);
  }

  async findByCustomerAndType(customerId: string, type: string): Promise<Address[]> {
    const results = await db
      .select()
      .from(addresses)
      .where(
        and(
          eq(addresses.customerId, customerId),
          eq(addresses.type, type as any)
        )
      );
    return AddressMapper.toDomainMany(results);
  }

  async findDefault(customerId: string, type: string): Promise<Address | null> {
    const [result] = await db
      .select()
      .from(addresses)
      .where(
        and(
          eq(addresses.customerId, customerId),
          eq(addresses.type, type as any),
          eq(addresses.isDefault, true)
        )
      )
      .limit(1);

    return result ? AddressMapper.toDomain(result) : null;
  }

  async findAll(): Promise<Address[]> {
    const results = await db.select().from(addresses);
    return AddressMapper.toDomainMany(results);
  }

  async update(address: Address): Promise<Address> {
    const updated = await updateAndReturn(db, addresses, AddressMapper.toPersistence(address), eq(addresses.id, address.id));

    if (!updated) {
      throw new Error("Failed to update address");
    }

    return AddressMapper.toDomain(updated);
  }

  async deactivate(id: AddressId): Promise<Address> {
    const address = await this.findById(id);
    if (!address) {
      throw new Error(`Address with ID "${id}" not found`);
    }

    address.isActive = false;
    address.updatedAt = new Date();
    return await this.update(address);
  }

  async activate(id: AddressId): Promise<Address> {
    const address = await this.findById(id);
    if (!address) {
      throw new Error(`Address with ID "${id}" not found`);
    }

    address.isActive = true;
    address.updatedAt = new Date();
    return await this.update(address);
  }
}
