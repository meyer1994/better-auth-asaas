import type { GenericEndpointContext, User } from "better-auth";
import { describe, expect, it, vi } from "vitest";
import { Client } from "./asaas";
import { hookAfterCreateUser } from "./server";

const makeCtx = () => {
  const updateUser = vi.fn().mockResolvedValue(undefined);
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
  return {
    ctx: {
      context: { logger, internalAdapter: { updateUser } },
    } as unknown as GenericEndpointContext,
    updateUser,
    logger,
  };
};

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: "user_1",
    name: "Joao",
    email: "joao@example.com",
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    cpfCnpj: "12345678900",
    ...overrides,
  }) as User;

describe("hookAfterCreateUser", () => {
  it("skips when cpfCnpj is missing", async () => {
    const client = new Client({ apiKey: "k" });
    const request = vi.spyOn(client, "request");
    const { ctx, updateUser, logger } = makeCtx();

    await hookAfterCreateUser(client, makeUser({ cpfCnpj: undefined }), ctx);

    expect(request).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("creates an Asaas customer and persists asaasCustomerId", async () => {
    const client = new Client({ apiKey: "k" });
    const request = vi
      .spyOn(client, "request")
      .mockResolvedValue({ id: "cus_42" });
    const { ctx, updateUser } = makeCtx();

    await hookAfterCreateUser(client, makeUser(), ctx);

    expect(request).toHaveBeenCalledWith("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: "Joao",
        email: "joao@example.com",
        cpfCnpj: "12345678900",
        externalReference: "user_1",
      }),
    });
    expect(updateUser).toHaveBeenCalledWith("user_1", {
      asaasCustomerId: "cus_42",
    });
  });

  it("propagates errors from the Asaas API", async () => {
    const client = new Client({ apiKey: "k" });
    vi.spyOn(client, "request").mockRejectedValue(new Error("boom"));
    const { ctx, updateUser } = makeCtx();

    await expect(hookAfterCreateUser(client, makeUser(), ctx)).rejects.toThrow(
      "boom"
    );
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("tolerates a missing ctx (logging is best-effort)", async () => {
    const client = new Client({ apiKey: "k" });
    vi.spyOn(client, "request").mockResolvedValue({ id: "cus_x" });

    await expect(
      hookAfterCreateUser(client, makeUser(), undefined)
    ).resolves.toBeUndefined();
  });
});
