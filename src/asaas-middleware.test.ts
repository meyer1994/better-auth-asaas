import { describe, expect, it, vi } from "vitest";
import { requireAsaasCustomerId } from "./asaas-middleware";

const makeCtx = (user?: { email: string; asaasCustomerId?: string }) => ({
  context: {
    session: user ? { user } : null,
    logger: {
      debug: vi.fn(),
    },
  },
});

describe("requireAsaasCustomerId", () => {
  it("throws when the user is not found", async () => {
    await expect(requireAsaasCustomerId(makeCtx() as never)).rejects.toMatchObject({
      status: "UNAUTHORIZED",
      body: { message: "User not found" },
    });
  });

  it("throws when the user does not have an Asaas customer id", async () => {
    await expect(
      requireAsaasCustomerId(makeCtx({ email: "joao@example.com" }) as never)
    ).rejects.toMatchObject({
      status: "UNAUTHORIZED",
      body: { message: "joao@example.com does not have assaasCustomerId" },
    });
  });

  it("logs and passes when the user has an Asaas customer id", async () => {
    const ctx = makeCtx({
      email: "joao@example.com",
      asaasCustomerId: "cus_123",
    });

    const result = await requireAsaasCustomerId(ctx as never);

    expect(result).toBeUndefined();
    expect(ctx.context.logger.debug).toHaveBeenCalledWith(
      "User has Asaas customer ID",
      { email: "joao@example.com", asaasCustomerId: "cus_123" }
    );
  });
});
