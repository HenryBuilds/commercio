import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { createCategoryService } from "../../../src/services/factory";
import { CategoryService } from "../../../src/services/category.service";
import { Category } from "../../../src/modules/category/category.model";
import { TestDbHelper } from "../../helpers/db";

describe("CategoryService", () => {
  let categoryService: CategoryService;

  beforeAll(async () => {
    // Clear database once before all tests in this file
    await TestDbHelper.clearAllTables();
  });

  beforeEach(() => {
    categoryService = createCategoryService();
  });

  describe("createCategory", () => {
    it("should create a category successfully", async () => {
      const name = `Category-TEST-${Date.now()}-001`;
      const category = await categoryService.createCategory(name, "Test description");

      expect(category).toBeInstanceOf(Category);
      expect(category.name).toBe(name);
      expect(category.description).toBe("Test description");
      expect(category.isActive).toBe(true);
    });

    it("should create category without description", async () => {
      const name = `Category-TEST-${Date.now()}-002`;
      const category = await categoryService.createCategory(name);

      expect(category).toBeInstanceOf(Category);
      expect(category.name).toBe(name);
      expect(category.description).toBeNull();
    });

    it("should throw error if category name already exists", async () => {
      const name = `Category-DUPLICATE-${Date.now()}`;
      await categoryService.createCategory(name);

      await expect(
        categoryService.createCategory(name)
      ).rejects.toThrow("already exists");
    });
  });

  describe("getCategoryById", () => {
    it("should return category if exists", async () => {
      const name = `Category-TEST-${Date.now()}-003`;
      const created = await categoryService.createCategory(name);

      const category = await categoryService.getCategoryById(created.id);

      expect(category).toBeInstanceOf(Category);
      expect(category.id).toBe(created.id);
    });

    it("should throw error if category not found", async () => {
      const nonExistentId = crypto.randomUUID();
      await expect(
        categoryService.getCategoryById(nonExistentId)
      ).rejects.toThrow("not found");
    });
  });

  describe("getCategoryByName", () => {
    it("should return category by name", async () => {
      const name = `Category-TEST-${Date.now()}-004`;
      await categoryService.createCategory(name);

      const category = await categoryService.getCategoryByName(name);

      expect(category).toBeInstanceOf(Category);
      expect(category.name).toBe(name);
    });

    it("should throw error if name not found", async () => {
      await expect(
        categoryService.getCategoryByName(`NON-EXISTENT-${Date.now()}`)
      ).rejects.toThrow("not found");
    });
  });

  describe("getAllCategories", () => {
    it("should return all categories", async () => {
      await categoryService.createCategory(`Category-TEST-${Date.now()}-005`);
      await categoryService.createCategory(`Category-TEST-${Date.now()}-006`);

      const categories = await categoryService.getAllCategories();

      expect(categories.length).toBeGreaterThanOrEqual(2);
    });

    it("should return only active categories when activeOnly is true", async () => {
      const activeName = `Category-ACTIVE-${Date.now()}`;
      const inactiveName = `Category-INACTIVE-${Date.now()}`;

      const activeCategory = await categoryService.createCategory(activeName);
      const inactiveCategory = await categoryService.createCategory(inactiveName);
      await categoryService.deactivateCategory(inactiveCategory.id);

      const categories = await categoryService.getAllCategories(true);

      expect(categories.some((c) => c.id === activeCategory.id)).toBe(true);
      expect(categories.some((c) => c.id === inactiveCategory.id)).toBe(false);
    });
  });

  describe("updateCategory", () => {
    it("should update category successfully", async () => {
      const name = `Category-TEST-${Date.now()}-007`;
      const created = await categoryService.createCategory(name, "Original description");

      const updated = await categoryService.updateCategory(created.id, {
        name: "Updated Name",
        description: "Updated description",
      });

      expect(updated.name).toBe("Updated Name");
      expect(updated.description).toBe("Updated description");
    });

    it("should throw error if new name already exists", async () => {
      const name1 = `Category-TEST-${Date.now()}-008`;
      const name2 = `Category-TEST-${Date.now()}-009`;
      await categoryService.createCategory(name1);
      const category2 = await categoryService.createCategory(name2);

      await expect(
        categoryService.updateCategory(category2.id, { name: name1 })
      ).rejects.toThrow("already exists");
    });
  });

  describe("deactivateCategory", () => {
    it("should deactivate category", async () => {
      const name = `Category-TEST-${Date.now()}-010`;
      const created = await categoryService.createCategory(name);

      const deactivated = await categoryService.deactivateCategory(created.id);

      expect(deactivated.isActive).toBe(false);
    });
  });

  describe("activateCategory", () => {
    it("should activate category", async () => {
      const name = `Category-TEST-${Date.now()}-011`;
      const created = await categoryService.createCategory(name);
      await categoryService.deactivateCategory(created.id);

      const activated = await categoryService.activateCategory(created.id);

      expect(activated.isActive).toBe(true);
    });
  });
});

