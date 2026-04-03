import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { categories } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { Category, CategoryId } from "../modules/category/category.model";
import { CategoryMapper } from "../db/mappers/category.mapper";

export class CategoryRepository {
  async create(category: Category): Promise<Category> {
    const created = await insertAndReturn(db, categories, CategoryMapper.toPersistence(category));

    if (!created) {
      throw new Error("Failed to create category");
    }

    return CategoryMapper.toDomain(created);
  }

  async findById(id: CategoryId): Promise<Category | null> {
    const [result] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return result ? CategoryMapper.toDomain(result) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const [result] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);

    return result ? CategoryMapper.toDomain(result) : null;
  }

  async findAll(): Promise<Category[]> {
    const results = await db.select().from(categories);
    return CategoryMapper.toDomainMany(results);
  }

  async findAllActive(): Promise<Category[]> {
    const results = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true));
    return CategoryMapper.toDomainMany(results);
  }

  async update(category: Category): Promise<Category> {
    const updated = await updateAndReturn(db, categories, CategoryMapper.toPersistence(category), eq(categories.id, category.id));

    if (!updated) {
      throw new Error("Failed to update category");
    }

    return CategoryMapper.toDomain(updated);
  }

  async deactivate(id: CategoryId): Promise<Category> {
    const category = await this.findById(id);
    if (!category) {
      throw new Error(`Category with ID "${id}" not found`);
    }

    category.isActive = false;
    return await this.update(category);
  }

  async activate(id: CategoryId): Promise<Category> {
    const category = await this.findById(id);
    if (!category) {
      throw new Error(`Category with ID "${id}" not found`);
    }

    category.isActive = true;
    return await this.update(category);
  }
}

