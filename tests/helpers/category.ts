import { createCategoryService } from "../../src/services/factory";
import { CategoryService } from "../../src/services/category.service";

let categoryServiceInstance: CategoryService | null = null;

/**
 * Helper function to get or create a test category
 * This ensures we have a category available for product creation in tests
 */
export async function getOrCreateTestCategory(name?: string): Promise<string> {
  if (!categoryServiceInstance) {
    categoryServiceInstance = createCategoryService();
  }

  const categoryName = name || `Test-Category-${Date.now()}`;
  
  try {
    const category = await categoryServiceInstance.getCategoryByName(categoryName);
    return category.id;
  } catch {
    // Category doesn't exist, create it
    const category = await categoryServiceInstance.createCategory(categoryName);
    return category.id;
  }
}

