import { describe, it, expect, beforeEach, vi } from "vitest";
import { AddressService } from "../../../src/services/address.service";
import { AddressRepository } from "../../../src/repositories/address.repository";
import { Address, AddressType } from "../../../src/modules/address/address.model";

function makeAddress(overrides: Partial<{
  id: string;
  customerId: string;
  type: AddressType;
  label: string | null;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  state: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}> = {}): Address {
  return new Address(
    overrides.id ?? crypto.randomUUID(),
    overrides.customerId ?? "customer-1",
    overrides.type ?? AddressType.BILLING,
    overrides.label ?? null,
    overrides.street ?? "123 Main St",
    overrides.city ?? "Berlin",
    overrides.postalCode ?? "10115",
    overrides.country ?? "Germany",
    overrides.state ?? null,
    overrides.isDefault ?? false,
    overrides.isActive ?? true,
    overrides.createdAt ?? new Date(),
    overrides.updatedAt ?? new Date()
  );
}

function createMockRepository() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByCustomer: vi.fn(),
    findByCustomerAndType: vi.fn(),
    findDefault: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    activate: vi.fn(),
  } as unknown as AddressRepository & {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByCustomer: ReturnType<typeof vi.fn>;
    findByCustomerAndType: ReturnType<typeof vi.fn>;
    findDefault: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
    activate: ReturnType<typeof vi.fn>;
  };
}

describe("AddressService", () => {
  let addressService: AddressService;
  let mockRepo: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    mockRepo = createMockRepository();
    addressService = new AddressService(mockRepo);
  });

  describe("createAddress", () => {
    it("should create an address successfully with all fields", async () => {
      const expectedAddress = makeAddress({
        customerId: "customer-1",
        type: AddressType.SHIPPING,
        label: "Office",
        street: "456 Oak Ave",
        city: "Munich",
        postalCode: "80331",
        country: "Germany",
        state: "Bavaria",
        isDefault: false,
      });

      mockRepo.create.mockResolvedValue(expectedAddress);
      mockRepo.findDefault.mockResolvedValue(null);

      const result = await addressService.createAddress(
        "customer-1",
        AddressType.SHIPPING,
        "456 Oak Ave",
        "Munich",
        "80331",
        "Germany",
        { label: "Office", state: "Bavaria" }
      );

      expect(result).toBe(expectedAddress);
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
      const createdAddress = mockRepo.create.mock.calls[0][0] as Address;
      expect(createdAddress.customerId).toBe("customer-1");
      expect(createdAddress.type).toBe(AddressType.SHIPPING);
      expect(createdAddress.street).toBe("456 Oak Ave");
      expect(createdAddress.city).toBe("Munich");
      expect(createdAddress.postalCode).toBe("80331");
      expect(createdAddress.country).toBe("Germany");
      expect(createdAddress.label).toBe("Office");
      expect(createdAddress.state).toBe("Bavaria");
    });

    it("should validate required fields via model constructor", () => {
      expect(() => {
        new Address(
          crypto.randomUUID(),
          "customer-1",
          AddressType.BILLING,
          null,
          "", // empty street
          "Berlin",
          "10115",
          "Germany"
        );
      }).toThrow("Address fields (street, city, postalCode, country) are required");
    });

    it("should unset existing default when creating with isDefault=true", async () => {
      const existingDefault = makeAddress({
        customerId: "customer-1",
        type: AddressType.BILLING,
        isDefault: true,
      });

      mockRepo.findDefault.mockResolvedValue(existingDefault);
      mockRepo.update.mockResolvedValue({ ...existingDefault, isDefault: false });
      mockRepo.create.mockResolvedValue(
        makeAddress({ customerId: "customer-1", type: AddressType.BILLING, isDefault: true })
      );

      await addressService.createAddress(
        "customer-1",
        AddressType.BILLING,
        "789 Elm St",
        "Hamburg",
        "20095",
        "Germany",
        { isDefault: true }
      );

      expect(mockRepo.findDefault).toHaveBeenCalledWith("customer-1", AddressType.BILLING);
      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAddressById", () => {
    it("should return address if found", async () => {
      const address = makeAddress({ id: "addr-1" });
      mockRepo.findById.mockResolvedValue(address);

      const result = await addressService.getAddressById("addr-1");

      expect(result).toBe(address);
      expect(mockRepo.findById).toHaveBeenCalledWith("addr-1");
    });

    it("should throw error if address not found", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        addressService.getAddressById("nonexistent")
      ).rejects.toThrow('Address with ID "nonexistent" not found');
    });
  });

  describe("getAddressesByCustomer", () => {
    it("should return all addresses for a customer", async () => {
      const addresses = [
        makeAddress({ customerId: "customer-1", type: AddressType.BILLING }),
        makeAddress({ customerId: "customer-1", type: AddressType.SHIPPING }),
      ];
      mockRepo.findByCustomer.mockResolvedValue(addresses);

      const result = await addressService.getAddressesByCustomer("customer-1");

      expect(result).toHaveLength(2);
      expect(mockRepo.findByCustomer).toHaveBeenCalledWith("customer-1");
    });
  });

  describe("getAddressesByType", () => {
    it("should return addresses filtered by type including BOTH", async () => {
      const billingAddresses = [
        makeAddress({ customerId: "customer-1", type: AddressType.BILLING }),
      ];
      const bothAddresses = [
        makeAddress({ customerId: "customer-1", type: AddressType.BOTH }),
      ];

      mockRepo.findByCustomerAndType
        .mockResolvedValueOnce(billingAddresses) // exact match for BILLING
        .mockResolvedValueOnce(bothAddresses);   // match for BOTH

      const result = await addressService.getAddressesByType("customer-1", AddressType.BILLING);

      expect(result).toHaveLength(2);
      expect(mockRepo.findByCustomerAndType).toHaveBeenCalledWith("customer-1", AddressType.BILLING);
      expect(mockRepo.findByCustomerAndType).toHaveBeenCalledWith("customer-1", AddressType.BOTH);
    });

    it("should return only exact matches when querying BOTH type", async () => {
      const bothAddresses = [
        makeAddress({ customerId: "customer-1", type: AddressType.BOTH }),
      ];

      mockRepo.findByCustomerAndType.mockResolvedValue(bothAddresses);

      const result = await addressService.getAddressesByType("customer-1", AddressType.BOTH);

      expect(result).toHaveLength(1);
      expect(mockRepo.findByCustomerAndType).toHaveBeenCalledTimes(1);
      expect(mockRepo.findByCustomerAndType).toHaveBeenCalledWith("customer-1", AddressType.BOTH);
    });
  });

  describe("setDefaultAddress", () => {
    it("should set address as default and unset previous default", async () => {
      const existingDefault = makeAddress({
        id: "addr-old",
        customerId: "customer-1",
        type: AddressType.BILLING,
        isDefault: true,
      });
      const targetAddress = makeAddress({
        id: "addr-new",
        customerId: "customer-1",
        type: AddressType.BILLING,
        isDefault: false,
      });

      mockRepo.findById.mockResolvedValue(targetAddress);
      mockRepo.findDefault.mockResolvedValue(existingDefault);
      mockRepo.update
        .mockResolvedValueOnce({ ...existingDefault, isDefault: false }) // unset old
        .mockResolvedValueOnce({ ...targetAddress, isDefault: true });   // set new

      const result = await addressService.setDefaultAddress("addr-new");

      expect(result.isDefault).toBe(true);
      expect(mockRepo.update).toHaveBeenCalledTimes(2);
      // First call should unset old default
      const firstUpdateArg = mockRepo.update.mock.calls[0][0] as Address;
      expect(firstUpdateArg.id).toBe("addr-old");
      expect(firstUpdateArg.isDefault).toBe(false);
      // Second call should set new default
      const secondUpdateArg = mockRepo.update.mock.calls[1][0] as Address;
      expect(secondUpdateArg.id).toBe("addr-new");
      expect(secondUpdateArg.isDefault).toBe(true);
    });

    it("should set default even when no previous default exists", async () => {
      const targetAddress = makeAddress({
        id: "addr-1",
        customerId: "customer-1",
        type: AddressType.SHIPPING,
        isDefault: false,
      });

      mockRepo.findById.mockResolvedValue(targetAddress);
      mockRepo.findDefault.mockResolvedValue(null);
      mockRepo.update.mockResolvedValue({ ...targetAddress, isDefault: true });

      const result = await addressService.setDefaultAddress("addr-1");

      expect(result.isDefault).toBe(true);
      expect(mockRepo.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateAddress", () => {
    it("should update address successfully", async () => {
      const address = makeAddress({
        id: "addr-1",
        street: "123 Main St",
        city: "Berlin",
      });

      const updatedAddress = makeAddress({
        id: "addr-1",
        street: "456 New St",
        city: "Munich",
      });

      mockRepo.findById.mockResolvedValue(address);
      mockRepo.update.mockResolvedValue(updatedAddress);

      const result = await addressService.updateAddress("addr-1", {
        street: "456 New St",
        city: "Munich",
      });

      expect(result.street).toBe("456 New St");
      expect(result.city).toBe("Munich");
      expect(mockRepo.update).toHaveBeenCalledTimes(1);
    });

    it("should throw error if address not found for update", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        addressService.updateAddress("nonexistent", { street: "New St" })
      ).rejects.toThrow('Address with ID "nonexistent" not found');
    });
  });

  describe("deactivateAddress", () => {
    it("should deactivate an address", async () => {
      const deactivated = makeAddress({ id: "addr-1", isActive: false });
      mockRepo.deactivate.mockResolvedValue(deactivated);

      const result = await addressService.deactivateAddress("addr-1");

      expect(result.isActive).toBe(false);
      expect(mockRepo.deactivate).toHaveBeenCalledWith("addr-1");
    });
  });

  describe("activateAddress", () => {
    it("should activate an address", async () => {
      const activated = makeAddress({ id: "addr-1", isActive: true });
      mockRepo.activate.mockResolvedValue(activated);

      const result = await addressService.activateAddress("addr-1");

      expect(result.isActive).toBe(true);
      expect(mockRepo.activate).toHaveBeenCalledWith("addr-1");
    });
  });
});
