import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { customers } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { Customer, CustomerId } from "../modules/customer/customer.model";
import { CustomerMapper } from "../db/mappers/customer.mapper";

export class CustomerRepository {
  async create(customer: Customer): Promise<Customer> {
    const created = await insertAndReturn(db, customers, CustomerMapper.toPersistence(customer));

    if (!created) {
      throw new Error("Failed to create customer");
    }

    return CustomerMapper.toDomain(created);
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const [result] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    return result ? CustomerMapper.toDomain(result) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const [result] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    return result ? CustomerMapper.toDomain(result) : null;
  }

  async findAll(): Promise<Customer[]> {
    const results = await db.select().from(customers);
    return CustomerMapper.toDomainMany(results);
  }

  async findAllActive(): Promise<Customer[]> {
    const results = await db
      .select()
      .from(customers)
      .where(eq(customers.isActive, true));
    return CustomerMapper.toDomainMany(results);
  }

  async findByGroup(customerGroupId: string): Promise<Customer[]> {
    const results = await db
      .select()
      .from(customers)
      .where(eq(customers.customerGroupId, customerGroupId));
    return CustomerMapper.toDomainMany(results);
  }

  async update(customer: Customer): Promise<Customer> {
    const updated = await updateAndReturn(db, customers, CustomerMapper.toPersistence(customer), eq(customers.id, customer.id));

    if (!updated) {
      throw new Error("Failed to update customer");
    }

    return CustomerMapper.toDomain(updated);
  }

  async deactivate(id: CustomerId): Promise<Customer> {
    const customer = await this.findById(id);
    if (!customer) {
      throw new Error(`Customer with ID "${id}" not found`);
    }

    customer.isActive = false;
    customer.updatedAt = new Date();
    return await this.update(customer);
  }

  async activate(id: CustomerId): Promise<Customer> {
    const customer = await this.findById(id);
    if (!customer) {
      throw new Error(`Customer with ID "${id}" not found`);
    }

    customer.isActive = true;
    customer.updatedAt = new Date();
    return await this.update(customer);
  }
}

