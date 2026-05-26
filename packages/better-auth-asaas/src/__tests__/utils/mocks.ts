import type { GenericEndpointContext, User } from "better-auth";
import { vi } from "vitest";
import type { AsaasApiClient, AsaasCustomer } from "../../types";

export const createMockAsaasClient = (): AsaasApiClient => ({
  request: vi.fn(),
});

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  emailVerified: false,
  ...overrides,
});

export const createMockAsaasCustomer = (overrides: Partial<AsaasCustomer> = {}): AsaasCustomer => ({
  id: "cus_abc123",
  name: "Test User",
  email: "test@example.com",
  cpfCnpj: "12345678901",
  dateCreated: "2026-05-02",
  ...overrides,
});

export const createMockEndpointContext = (): GenericEndpointContext => ({
  context: {
    logger: {
      error: vi.fn(),
    },
    internalAdapter: {
      updateUser: vi.fn().mockResolvedValue(undefined),
      findOne: vi.fn(),
    },
  },
  request: new Request("http://localhost:3000/test"),
} as unknown as GenericEndpointContext);
