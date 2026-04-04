export type AddressId = string;

export enum AddressType {
  BILLING = "BILLING",
  SHIPPING = "SHIPPING",
  BOTH = "BOTH",
}

export class Address {
  constructor(
    public readonly id: AddressId,
    public customerId: string, // CustomerId
    public type: AddressType,
    public label: string | null = null, // e.g. "Home", "Office"
    public street: string,
    public city: string,
    public postalCode: string,
    public country: string,
    public state: string | null = null,
    public isDefault: boolean = false,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!street || !city || !postalCode || !country) {
      throw new Error("Address fields (street, city, postalCode, country) are required");
    }
  }

  static fromDb(data: {
    id: AddressId; customerId: string; type: AddressType;
    label: string | null; street: string; city: string;
    postalCode: string; country: string; state: string | null;
    isDefault: boolean; isActive: boolean;
    createdAt: Date; updatedAt: Date;
  }): Address {
    return new Address(data.id, data.customerId, data.type, data.label,
      data.street, data.city, data.postalCode, data.country, data.state,
      data.isDefault, data.isActive, data.createdAt, data.updatedAt);
  }
}
