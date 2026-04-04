import { TaxRateRepository } from "../repositories/tax-rate.repository";
import { TaxGroupRepository } from "../repositories/tax-group.repository";
import {
  TaxRate,
  TaxRateId,
  TaxGroup,
  TaxGroupId,
} from "../modules/tax/tax.model";

/**
 * Service for Tax business logic
 */
export class TaxService {
  constructor(
    private readonly taxRateRepository: TaxRateRepository,
    private readonly taxGroupRepository: TaxGroupRepository
  ) {}

  // --- Tax Rate operations ---

  async createTaxRate(
    name: string,
    rate: number,
    country: string,
    options?: {
      state?: string;
      isDefault?: boolean;
    }
  ): Promise<TaxRate> {
    const trimmedName = name.trim();

    const existing = await this.taxRateRepository.findByName(trimmedName);
    if (existing) {
      throw new Error(`Tax rate with name "${trimmedName}" already exists`);
    }

    const taxRate = new TaxRate(
      crypto.randomUUID(),
      trimmedName,
      rate,
      country,
      options?.state ?? null,
      options?.isDefault ?? false
    );

    return await this.taxRateRepository.create(taxRate);
  }

  async getTaxRateById(id: TaxRateId): Promise<TaxRate> {
    const taxRate = await this.taxRateRepository.findById(id);
    if (!taxRate) {
      throw new Error(`Tax rate with ID "${id}" not found`);
    }
    return taxRate;
  }

  async getTaxRateByName(name: string): Promise<TaxRate> {
    const taxRate = await this.taxRateRepository.findByName(name);
    if (!taxRate) {
      throw new Error(`Tax rate with name "${name}" not found`);
    }
    return taxRate;
  }

  async getAllTaxRates(activeOnly: boolean = false): Promise<TaxRate[]> {
    if (activeOnly) {
      return await this.taxRateRepository.findAllActive();
    }
    return await this.taxRateRepository.findAll();
  }

  async getTaxRatesByCountry(country: string): Promise<TaxRate[]> {
    return await this.taxRateRepository.findByCountry(country);
  }

  async getDefaultTaxRate(country: string): Promise<TaxRate | null> {
    return await this.taxRateRepository.findDefault(country);
  }

  async updateTaxRate(
    id: TaxRateId,
    updates: Partial<{
      name: string;
      rate: number;
      country: string;
      state: string | null;
      isDefault: boolean;
    }>
  ): Promise<TaxRate> {
    const taxRate = await this.getTaxRateById(id);

    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      const existing = await this.taxRateRepository.findByName(trimmedName);
      if (existing && existing.id !== id) {
        throw new Error(`Tax rate with name "${trimmedName}" already exists`);
      }
      taxRate.name = trimmedName;
    }

    if (updates.rate !== undefined) {
      if (updates.rate < 0 || updates.rate > 100) {
        throw new Error("Tax rate must be between 0 and 100");
      }
      taxRate.rate = updates.rate;
    }

    if (updates.country !== undefined) taxRate.country = updates.country;
    if (updates.state !== undefined) taxRate.state = updates.state;
    if (updates.isDefault !== undefined) taxRate.isDefault = updates.isDefault;

    taxRate.updatedAt = new Date();
    return await this.taxRateRepository.update(taxRate);
  }

  async deactivateTaxRate(id: TaxRateId): Promise<TaxRate> {
    return await this.taxRateRepository.deactivate(id);
  }

  async activateTaxRate(id: TaxRateId): Promise<TaxRate> {
    return await this.taxRateRepository.activate(id);
  }

  /**
   * Calculates tax for a given amount using a specific tax rate
   */
  async calculateTax(
    taxRateId: TaxRateId,
    netAmount: number
  ): Promise<{ netAmount: number; taxAmount: number; grossAmount: number; rate: number }> {
    const taxRate = await this.getTaxRateById(taxRateId);
    const taxAmount = taxRate.calculateTax(netAmount);
    return {
      netAmount,
      taxAmount,
      grossAmount: netAmount + taxAmount,
      rate: taxRate.rate,
    };
  }

  // --- Tax Group operations ---

  async createTaxGroup(name: string, description?: string): Promise<TaxGroup> {
    const trimmedName = name.trim();

    const existing = await this.taxGroupRepository.findByName(trimmedName);
    if (existing) {
      throw new Error(`Tax group with name "${trimmedName}" already exists`);
    }

    const taxGroup = new TaxGroup(
      crypto.randomUUID(),
      trimmedName,
      description ?? null
    );

    return await this.taxGroupRepository.create(taxGroup);
  }

  async getTaxGroupById(id: TaxGroupId): Promise<TaxGroup> {
    const taxGroup = await this.taxGroupRepository.findById(id);
    if (!taxGroup) {
      throw new Error(`Tax group with ID "${id}" not found`);
    }
    return taxGroup;
  }

  async getTaxGroupByName(name: string): Promise<TaxGroup> {
    const taxGroup = await this.taxGroupRepository.findByName(name);
    if (!taxGroup) {
      throw new Error(`Tax group with name "${name}" not found`);
    }
    return taxGroup;
  }

  async getAllTaxGroups(activeOnly: boolean = false): Promise<TaxGroup[]> {
    if (activeOnly) {
      return await this.taxGroupRepository.findAllActive();
    }
    return await this.taxGroupRepository.findAll();
  }

  async updateTaxGroup(
    id: TaxGroupId,
    updates: Partial<{
      name: string;
      description: string | null;
    }>
  ): Promise<TaxGroup> {
    const taxGroup = await this.getTaxGroupById(id);

    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      const existing = await this.taxGroupRepository.findByName(trimmedName);
      if (existing && existing.id !== id) {
        throw new Error(`Tax group with name "${trimmedName}" already exists`);
      }
      taxGroup.name = trimmedName;
    }

    if (updates.description !== undefined) {
      taxGroup.description = updates.description;
    }

    taxGroup.updatedAt = new Date();
    return await this.taxGroupRepository.update(taxGroup);
  }

  async deactivateTaxGroup(id: TaxGroupId): Promise<TaxGroup> {
    return await this.taxGroupRepository.deactivate(id);
  }

  async activateTaxGroup(id: TaxGroupId): Promise<TaxGroup> {
    return await this.taxGroupRepository.activate(id);
  }
}
