import { beforeEach, describe, expect, it, vi } from "vitest";
import { asaas } from "../server";
import {
  createMockAsaasClient,
  createMockAsaasCustomer,
  createMockEndpointContext,
  createMockUser,
} from "./utils/mocks";

vi.mock("../asaas-client", () => ({
  createAsaasClient: vi.fn(() => createMockAsaasClient()),
}));

import { createAsaasClient } from "../asaas-client";

describe("asaas() plugin", () => {
  it("returns a plugin with id 'asaas'", () => {
    const plugin = asaas({ apiKey: "key", use: [] });
    expect(plugin.id).toBe("asaas");
  });

  it("extends user schema with asaasCustomerId field", () => {
    const plugin = asaas({ apiKey: "key", use: [] });
    expect(plugin.schema?.user?.fields).toHaveProperty("asaasCustomerId");
    expect(plugin.schema?.user?.fields?.asaasCustomerId?.type).toBe("string");
  });

  it("returns database hooks from init()", () => {
    const plugin = asaas({ apiKey: "key", use: [] });
    const init = plugin.init?.();
    expect(init?.options?.databaseHooks?.user?.create?.after).toBeDefined();
  });

  it("passes sandbox flag to createAsaasClient", () => {
    asaas({ apiKey: "my-key", sandbox: true, use: [] });
    expect(createAsaasClient).toHaveBeenCalledWith("my-key", true);
  });

  it("defaults sandbox to false", () => {
    asaas({ apiKey: "my-key", use: [] });
    expect(createAsaasClient).toHaveBeenCalledWith("my-key", false);
  });
});

describe("onAfterUserCreate hook", () => {
  let mockClient: ReturnType<typeof createMockAsaasClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = createMockAsaasClient();
    vi.mocked(createAsaasClient).mockReturnValue(mockClient);
  });

  it("creates Asaas customer and saves ID when createCustomerOnSignUp is true", async () => {
    const asaasCustomer = createMockAsaasCustomer();
    vi.mocked(mockClient.request).mockResolvedValueOnce(asaasCustomer);

    const plugin = asaas({
      apiKey: "key",
      createCustomerOnSignUp: true,
      getCustomerCreateParams: async () => ({ cpfCnpj: "12345678901" }),
      use: [],
    });

    const user = createMockUser();
    const ctx = createMockEndpointContext();
    const hook = plugin.init?.()?.options?.databaseHooks?.user?.create?.after;

    expect(hook).toBeDefined();
    await hook!(user, ctx);

    expect(mockClient.request).toHaveBeenCalledWith(
      "/customers",
      expect.objectContaining({ method: "POST" })
    );
    expect(ctx.context.internalAdapter.updateUser).toHaveBeenCalledWith(
      user.id,
      { asaasCustomerId: asaasCustomer.id }
    );
  });

  it("calls onCustomerCreate callback after customer is created", async () => {
    const asaasCustomer = createMockAsaasCustomer();
    vi.mocked(mockClient.request).mockResolvedValueOnce(asaasCustomer);
    const onCustomerCreate = vi.fn().mockResolvedValue(undefined);

    const plugin = asaas({
      apiKey: "key",
      createCustomerOnSignUp: true,
      getCustomerCreateParams: async () => ({ cpfCnpj: "12345678901" }),
      onCustomerCreate,
      use: [],
    });

    const user = createMockUser();
    const ctx = createMockEndpointContext();
    const hook = plugin.init?.()?.options?.databaseHooks?.user?.create?.after;

    expect(hook).toBeDefined();
    await hook!(user, ctx);

    expect(onCustomerCreate).toHaveBeenCalledWith({ asaasCustomer, user });
  });

  it("does nothing when createCustomerOnSignUp is false", async () => {
    const plugin = asaas({ apiKey: "key", createCustomerOnSignUp: false, use: [] });
    const ctx = createMockEndpointContext();
    const hook = plugin.init?.()?.options?.databaseHooks?.user?.create?.after;

    expect(hook).toBeDefined();
    await hook!(createMockUser(), ctx);

    expect(mockClient.request).not.toHaveBeenCalled();
  });

  it("logs error but does not throw when Asaas API fails", async () => {
    vi.mocked(mockClient.request).mockRejectedValueOnce(new Error("network error"));

    const plugin = asaas({
      apiKey: "key",
      createCustomerOnSignUp: true,
      getCustomerCreateParams: async () => ({ cpfCnpj: "12345678901" }),
      use: [],
    });

    const ctx = createMockEndpointContext();
    const hook = plugin.init?.()?.options?.databaseHooks?.user?.create?.after;

    expect(hook).toBeDefined();
    await expect(hook!(createMockUser(), ctx)).resolves.not.toThrow();
    expect(ctx.context.logger.error).toHaveBeenCalled();
  });
});
