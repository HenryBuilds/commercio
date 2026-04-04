export type TaxRateId = string;
export type TaxGroupId = string;

export class TaxRate {
  constructor(
    public readonly id: TaxRateId,
    public name: string,
    public rate: number, // percentage, e.g. 19 for 19%
    public country: string,
    public state: string | null = null,
    public isDefault: boolean = false,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error("Tax rate name must not be empty");
    }
    if (rate < 0 || rate > 100) {
      throw new Error("Tax rate must be between 0 and 100");
    }
    if (!country || country.trim().length === 0) {
      throw new Error("Country must not be empty");
    }
  }

  /**
   * Calculates the tax amount for a given net amount (in cents)
   */
  calculateTax(netAmount: number): number {
    return Math.round(netAmount * this.rate / 100);
  }

  /**
   * Calculates the gross amount for a given net amount (in cents)
   */
  calculateGross(netAmount: number): number {
    return netAmount + this.calculateTax(netAmount);
  }

  /**
   * Extracts the net amount from a gross amount (in cents)
   */
  extractNet(grossAmount: number): number {
    return Math.round(grossAmount / (1 + this.rate / 100));
  }

  static fromDb(data: {
    id: TaxRateId;
    name: string;
    rate: number;
    country: string;
    state: string | null;
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): TaxRate {
    return new TaxRate(
      data.id,
      data.name,
      data.rate,
      data.country,
      data.state,
      data.isDefault,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }
}

export class TaxGroup {
  constructor(
    public readonly id: TaxGroupId,
    public name: string,
    public description: string | null = null,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error("Tax group name must not be empty");
    }
  }

  static fromDb(data: {
    id: TaxGroupId;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): TaxGroup {
    return new TaxGroup(
      data.id,
      data.name,
      data.description,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }
}
