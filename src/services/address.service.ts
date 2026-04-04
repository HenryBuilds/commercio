import { AddressRepository } from "../repositories/address.repository";
import {
  Address,
  AddressId,
  AddressType,
} from "../modules/address/address.model";

/**
 * Service for Address business logic
 */
export class AddressService {
  constructor(
    private readonly addressRepository: AddressRepository
  ) {}

  /**
   * Creates a new address for a customer
   */
  async createAddress(
    customerId: string,
    type: AddressType,
    street: string,
    city: string,
    postalCode: string,
    country: string,
    options?: {
      label?: string;
      state?: string;
      isDefault?: boolean;
    }
  ): Promise<Address> {
    // If isDefault=true, unset any existing default of same type for this customer
    if (options?.isDefault) {
      await this.unsetDefaultForType(customerId, type);
    }

    const address = new Address(
      crypto.randomUUID(),
      customerId,
      type,
      options?.label ?? null,
      street,
      city,
      postalCode,
      country,
      options?.state ?? null,
      options?.isDefault ?? false
    );

    return await this.addressRepository.create(address);
  }

  /**
   * Gets an address by ID
   */
  async getAddressById(id: AddressId): Promise<Address> {
    const address = await this.addressRepository.findById(id);
    if (!address) {
      throw new Error(`Address with ID "${id}" not found`);
    }
    return address;
  }

  /**
   * Gets all addresses for a customer
   */
  async getAddressesByCustomer(customerId: string): Promise<Address[]> {
    return await this.addressRepository.findByCustomer(customerId);
  }

  /**
   * Gets addresses by type for a customer.
   * BOTH type matches both BILLING and SHIPPING queries.
   */
  async getAddressesByType(customerId: string, type: AddressType): Promise<Address[]> {
    const exactMatches = await this.addressRepository.findByCustomerAndType(customerId, type);

    // Also include addresses with type BOTH (they serve both BILLING and SHIPPING)
    if (type !== AddressType.BOTH) {
      const bothMatches = await this.addressRepository.findByCustomerAndType(customerId, AddressType.BOTH);
      return [...exactMatches, ...bothMatches];
    }

    return exactMatches;
  }

  /**
   * Gets the default address for a customer and type
   */
  async getDefaultAddress(customerId: string, type: AddressType): Promise<Address | null> {
    return await this.addressRepository.findDefault(customerId, type);
  }

  /**
   * Sets an address as the default for its type and customer.
   * Unsets other defaults of the same type for the same customer.
   */
  async setDefaultAddress(id: AddressId): Promise<Address> {
    const address = await this.getAddressById(id);

    // Unset existing defaults of the same type for this customer
    await this.unsetDefaultForType(address.customerId, address.type);

    address.isDefault = true;
    address.updatedAt = new Date();
    return await this.addressRepository.update(address);
  }

  /**
   * Updates an address
   */
  async updateAddress(
    id: AddressId,
    updates: Partial<{
      type: AddressType;
      label: string | null;
      street: string;
      city: string;
      postalCode: string;
      country: string;
      state: string | null;
      isDefault: boolean;
    }>
  ): Promise<Address> {
    const address = await this.getAddressById(id);

    if (updates.type !== undefined) address.type = updates.type;
    if (updates.label !== undefined) address.label = updates.label;
    if (updates.street !== undefined) address.street = updates.street;
    if (updates.city !== undefined) address.city = updates.city;
    if (updates.postalCode !== undefined) address.postalCode = updates.postalCode;
    if (updates.country !== undefined) address.country = updates.country;
    if (updates.state !== undefined) address.state = updates.state;

    if (updates.isDefault !== undefined) {
      if (updates.isDefault) {
        await this.unsetDefaultForType(address.customerId, address.type);
      }
      address.isDefault = updates.isDefault;
    }

    address.updatedAt = new Date();
    return await this.addressRepository.update(address);
  }

  /**
   * Deactivates an address
   */
  async deactivateAddress(id: AddressId): Promise<Address> {
    return await this.addressRepository.deactivate(id);
  }

  /**
   * Activates an address
   */
  async activateAddress(id: AddressId): Promise<Address> {
    return await this.addressRepository.activate(id);
  }

  /**
   * Unsets the default flag for all addresses of a given type for a customer
   */
  private async unsetDefaultForType(customerId: string, type: AddressType): Promise<void> {
    const existingDefault = await this.addressRepository.findDefault(customerId, type);
    if (existingDefault) {
      existingDefault.isDefault = false;
      existingDefault.updatedAt = new Date();
      await this.addressRepository.update(existingDefault);
    }
  }
}
