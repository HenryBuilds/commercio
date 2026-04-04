import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { priceLists } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { PriceList, PriceListId } from "../modules/pricing/pricing.model";
import { PriceListMapper } from "../db/mappers/price-list.mapper";
import type { CustomerGroupId } from "../modules/customer/customer.model";

export class PriceListRepository {
  async create(priceList: PriceList): Promise<PriceList> {
    const created = await insertAndReturn(db, priceLists, PriceListMapper.toPersistence(priceList));
    if (!created) {
      throw new Error("Failed to create price list");
    }
    return PriceListMapper.toDomain(created);
  }

  async findById(id: PriceListId): Promise<PriceList | null> {
    const [result] = await db
      .select()
      .from(priceLists)
      .where(eq(priceLists.id, id))
      .limit(1);
    return result ? PriceListMapper.toDomain(result) : null;
  }

  async findByName(name: string): Promise<PriceList | null> {
    const [result] = await db
      .select()
      .from(priceLists)
      .where(eq(priceLists.name, name))
      .limit(1);
    return result ? PriceListMapper.toDomain(result) : null;
  }

  async findAll(): Promise<PriceList[]> {
    const results = await db.select().from(priceLists);
    return PriceListMapper.toDomainMany(results);
  }

  async findAllActive(): Promise<PriceList[]> {
    const results = await db
      .select()
      .from(priceLists)
      .where(eq(priceLists.isActive, true));
    return PriceListMapper.toDomainMany(results);
  }

  async findByCustomerGroup(customerGroupId: CustomerGroupId): Promise<PriceList[]> {
    const results = await db
      .select()
      .from(priceLists)
      .where(eq(priceLists.customerGroupId, customerGroupId));
    return PriceListMapper.toDomainMany(results);
  }

  async update(priceList: PriceList): Promise<PriceList> {
    const updated = await updateAndReturn(
      db,
      priceLists,
      PriceListMapper.toPersistence(priceList),
      eq(priceLists.id, priceList.id)
    );
    if (!updated) {
      throw new Error("Failed to update price list");
    }
    return PriceListMapper.toDomain(updated);
  }

  async deactivate(id: PriceListId): Promise<PriceList> {
    const priceList = await this.findById(id);
    if (!priceList) {
      throw new Error(`Price list with ID "${id}" not found`);
    }
    priceList.isActive = false;
    priceList.updatedAt = new Date();
    return await this.update(priceList);
  }

  async activate(id: PriceListId): Promise<PriceList> {
    const priceList = await this.findById(id);
    if (!priceList) {
      throw new Error(`Price list with ID "${id}" not found`);
    }
    priceList.isActive = true;
    priceList.updatedAt = new Date();
    return await this.update(priceList);
  }
}
