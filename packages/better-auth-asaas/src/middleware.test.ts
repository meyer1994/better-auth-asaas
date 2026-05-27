import { APIError } from "better-auth/api";
import { describe, expect, it, vi } from "vitest";
import { requireAsaasCustomerId } from "./middleware";

const makeInput = (
  session: { user?: { email?: string; asaasCustomerId?: string } } | null
) => {
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
  return {
    input: { context: { session, logger } } as never,
    logger,
  };
};

describe("requireAsaasCustomerId", () => {
  it("throws UNAUTHORIZED when there is no session user", async () => {
    const { input } = makeInput(null);

    await expect(requireAsaasCustomerId(input)).rejects.toBeInstanceOf(APIError);
    await expect(requireAsaasCustomerId(input)).rejects.toMatchObject({
      message: "User not found",
    });
  });

  it("throws UNAUTHORIZED when the user lacks asaasCustomerId", async () => {
    const { input } = makeInput({ user: { email: "a@a.com" } });

    await expect(requireAsaasCustomerId(input)).rejects.toBeInstanceOf(APIError);
    await expect(requireAsaasCustomerId(input)).rejects.toMatchObject({
      message: expect.stringContaining("a@a.com"),
    });
  });

  it("passes when the user has an asaasCustomerId", async () => {
    const { input, logger } = makeInput({
      user: { email: "b@b.com", asaasCustomerId: "cus_1" },
    });

    await expect(requireAsaasCustomerId(input)).resolves.toBeUndefined();
    expect(logger.info).toHaveBeenCalledWith(
      "User has Asaas customer ID",
      { email: "b@b.com", asaasCustomerId: "cus_1" }
    );
  });
});
