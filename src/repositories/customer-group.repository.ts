import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { customerGroups } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { CustomerGroup, CustomerGroupId } from "../modules/customer/customer.model";
import { CustomerGroupMapper } from "../db/mappers/customer-group.mapper";

export class CustomerGroupRepository {
  async create(group: CustomerGroup): Promise<CustomerGroup> {
    const created = await insertAndReturn(db, customerGroups, CustomerGroupMapper.toPersistence(group));

    if (!created) {
      throw new Error("Failed to create customer group");
    }

    return CustomerGroupMapper.toDomain(created);
  }

  async findById(id: CustomerGroupId): Promise<CustomerGroup | null> {
    const [result] = await db
      .select()
      .from(customerGroups)
      .where(eq(customerGroups.id, id))
      .limit(1);

    return result ? CustomerGroupMapper.toDomain(result) : null;
  }

  async findByName(name: string): Promise<CustomerGroup | null> {
    const [result] = await db
      .select()
      .from(customerGroups)
      .where(eq(customerGroups.name, name))
      .limit(1);

    return result ? CustomerGroupMapper.toDomain(result) : null;
  }

  async findAll(): Promise<CustomerGroup[]> {
    const results = await db.select().from(customerGroups);
    return CustomerGroupMapper.toDomainMany(results);
  }

  async findAllActive(): Promise<CustomerGroup[]> {
    const results = await db
      .select()
      .from(customerGroups)
      .where(eq(customerGroups.isActive, true));
    return CustomerGroupMapper.toDomainMany(results);
  }

  async update(group: CustomerGroup): Promise<CustomerGroup> {
    const updated = await updateAndReturn(db, customerGroups, CustomerGroupMapper.toPersistence(group), eq(customerGroups.id, group.id));

    if (!updated) {
      throw new Error("Failed to update customer group");
    }

    return CustomerGroupMapper.toDomain(updated);
  }

  async deactivate(id: CustomerGroupId): Promise<CustomerGroup> {
    const group = await this.findById(id);
    if (!group) {
      throw new Error(`Customer group with ID "${id}" not found`);
    }

    group.isActive = false;
    group.updatedAt = new Date();
    return await this.update(group);
  }

  async activate(id: CustomerGroupId): Promise<CustomerGroup> {
    const group = await this.findById(id);
    if (!group) {
      throw new Error(`Customer group with ID "${id}" not found`);
    }

    group.isActive = true;
    group.updatedAt = new Date();
    return await this.update(group);
  }
}

