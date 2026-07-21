import { describe, expect, it, vi } from "vitest";
import { userAfterCreate } from "./hooks";

const makeOpts = () => ({
  user: {
    id: "user_123",
    name: "Joao",
    email: "joao@example.com",
    cpfCnpj: "12345678901",
  },
  client: {
    request: vi.fn().mockResolvedValue({ id: "cus_123" }),
  },
  ctx: {
    context: {
      logger: {
        warn: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
      },
      internalAdapter: {
        updateUser: vi.fn(),
      },
    },
  },
});

describe("userAfterCreate", () => {
  it("creates an Asaas customer and stores the customer id on the user", async () => {
    const opts = makeOpts();

    await userAfterCreate(opts as never);

    expect(opts.client.request).toHaveBeenCalledWith("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: "Joao",
        email: "joao@example.com",
        cpfCnpj: "12345678901",
        externalReference: "user_123",
      }),
    });
    expect(opts.ctx.context.internalAdapter.updateUser).toHaveBeenCalledWith(
      "user_123",
      { asaasCustomerId: "cus_123" }
    );
    expect(opts.ctx.context.logger.debug).toHaveBeenCalledWith(
      "Asaas customer creation started",
      {
        id: "user_123",
        email: "joao@example.com",
        cpfCnpj: "12345678901",
      }
    );
    expect(opts.ctx.context.logger.info).toHaveBeenCalledWith(
      "Asaas customer updated",
      {
        id: "user_123",
        email: "joao@example.com",
        asaasCustomerId: "cus_123",
      }
    );
  });

  it("does nothing when ctx is null", async () => {
    const opts = makeOpts();

    await userAfterCreate({ ...opts, ctx: null } as never);

    expect(opts.client.request).not.toHaveBeenCalled();
  });

  it("warns and skips customer creation when cpfCnpj is missing", async () => {
    const opts = makeOpts();
    opts.user.cpfCnpj = undefined as never;

    await userAfterCreate(opts as never);

    expect(opts.client.request).not.toHaveBeenCalled();
    expect(opts.ctx.context.internalAdapter.updateUser).not.toHaveBeenCalled();
    expect(opts.ctx.context.logger.warn).toHaveBeenCalledWith(
      "Asaas customer without cpfCnpj",
      {
        id: "user_123",
        email: "joao@example.com",
        cpfCnpj: undefined,
      }
    );
  });
});
