import { ProductRepository } from "../repositories/product.repository";
import { Product, ProductId } from "../modules/product/product.model";

/**
 * Service for Product business logic
 */
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Creates a new product
   */
  async createProduct(
    name: string,
    sku: string,
    isSellable: boolean = true,
    isActive: boolean = true
  ): Promise<Product> {
    // Check if SKU already exists
    const existingProduct = await this.productRepository.findBySku(sku);
    if (existingProduct) {
      throw new Error(`Product with SKU "${sku}" already exists`);
    }

    const product = new Product(
      crypto.randomUUID(),
      name,
      sku,
      isSellable,
      isActive
    );

    return await this.productRepository.create(product);
  }

  /**
   * Gets a product by ID
   */
  async getProductById(id: ProductId): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error(`Product with ID "${id}" not found`);
    }
    return product;
  }

  /**
   * Gets a product by SKU
   */
  async getProductBySku(sku: string): Promise<Product> {
    const product = await this.productRepository.findBySku(sku);
    if (!product) {
      throw new Error(`Product with SKU "${sku}" not found`);
    }
    return product;
  }

  /**
   * Lists all products
   */
  async listProducts(activeOnly: boolean = false): Promise<Product[]> {
    return await this.productRepository.findAll(activeOnly);
  }

  /**
   * Updates a product
   */
  async updateProduct(
    id: ProductId,
    updates: {
      name?: string;
      sku?: string;
      isSellable?: boolean;
      isActive?: boolean;
    }
  ): Promise<Product> {
    const product = await this.getProductById(id);

    // Check SKU uniqueness if SKU is being updated
    if (updates.sku && updates.sku !== product.sku) {
      const existingProduct = await this.productRepository.findBySku(updates.sku);
      if (existingProduct) {
        throw new Error(`Product with SKU "${updates.sku}" already exists`);
      }
    }

    // Apply updates
    if (updates.name !== undefined) product.name = updates.name;
    if (updates.sku !== undefined) product.sku = updates.sku;
    if (updates.isSellable !== undefined) product.isSellable = updates.isSellable;
    if (updates.isActive !== undefined) product.isActive = updates.isActive;

    return await this.productRepository.update(product);
  }

  /**
   * Deactivates a product (soft delete)
   */
  async deactivateProduct(id: ProductId): Promise<Product> {
    return await this.updateProduct(id, { isActive: false });
  }

  /**
   * Activates a product
   */
  async activateProduct(id: ProductId): Promise<Product> {
    return await this.updateProduct(id, { isActive: true });
  }

  /**
   * Deletes a product permanently
   */
  async deleteProduct(id: ProductId): Promise<void> {
    const product = await this.getProductById(id);
    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      throw new Error(`Failed to delete product with ID "${id}"`);
    }
  }
}

