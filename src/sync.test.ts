import { describe, expect, it, vi } from "vitest";
import type { Payment, Subscription } from "./types";
import { upsertPayment, upsertSubscription } from "./sync";

const makePayment = (overrides: Partial<Payment> = {}): Payment =>
  ({
    object: "payment",
    id: "pay_123",
    dateCreated: "2026-06-05",
    customer: "cus_123",
    subscription: null,
    value: 49.9,
    netValue: 49.9,
    originalValue: null,
    billingType: "PIX",
    dueDate: "2026-06-12",
    paymentDate: null,
    clientPaymentDate: null,
    externalReference: "user_123",
    deleted: false,
    anticipated: false,
    anticipable: false,
    status: "PENDING",
    ...overrides,
  }) as Payment;

const makeSubscription = (overrides: Partial<Subscription> = {}): Subscription =>
  ({
    object: "subscription",
    id: "sub_123",
    dateCreated: "2026-06-05",
    customer: "cus_123",
    paymentLink: null,
    value: 49.9,
    nextDueDate: "2026-07-05",
    endDate: null,
    billingType: "PIX",
    cycle: "MONTHLY",
    status: "ACTIVE",
    deleted: false,
    externalReference: "user_123",
    ...overrides,
  }) as Subscription;

const makeCtx = () => {
  const adapter = {
    update: vi.fn(),
    create: vi.fn(),
  };
  const logger = {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  };
  return {
    context: { adapter, logger },
    adapter,
    logger,
  };
};

describe("upsertPayment", () => {
  it("updates an existing payment in a single query", async () => {
    const ctx = makeCtx();
    ctx.adapter.update.mockResolvedValue({ id: "local_pay_1" });

    await upsertPayment(ctx as never, makePayment({ status: "RECEIVED" }), {
      userId: "user_123",
    });

    expect(ctx.adapter.update).toHaveBeenCalledWith({
      model: "asaasPayment",
      where: [{ field: "asaasPaymentId", value: "pay_123" }],
      update: expect.objectContaining({
        userId: "user_123",
        status: "RECEIVED",
        value: "49.9",
        deleted: false,
      }),
    });
    expect(ctx.adapter.create).not.toHaveBeenCalled();
  });

  it("creates a payment when update matches no row", async () => {
    const ctx = makeCtx();
    ctx.adapter.update.mockResolvedValue(null);
    ctx.adapter.create.mockResolvedValue({ id: "local_pay_1" });

    await upsertPayment(ctx as never, makePayment(), { userId: "user_123" });

    expect(ctx.adapter.create).toHaveBeenCalledWith({
      model: "asaasPayment",
      data: expect.objectContaining({
        userId: "user_123",
        asaasPaymentId: "pay_123",
        status: "PENDING",
        createdAt: expect.any(Date),
      }),
    });
  });

  it("mirrors the Asaas deleted flag on upsert", async () => {
    const ctx = makeCtx();
    ctx.adapter.update.mockResolvedValue({ id: "local_pay_1" });

    await upsertPayment(ctx as never, makePayment({ deleted: true }), {
      userId: "user_123",
    });

    expect(ctx.adapter.update).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ deleted: true }),
      }),
    );
  });

  it("does not throw when the adapter fails", async () => {
    const ctx = makeCtx();
    ctx.adapter.update.mockRejectedValue(new Error("db down"));

    await expect(
      upsertPayment(ctx as never, makePayment(), { userId: "user_123" }),
    ).resolves.toBeUndefined();
    expect(ctx.logger.error).toHaveBeenCalled();
  });
});

describe("upsertSubscription", () => {
  it("updates an existing subscription in a single query", async () => {
    const ctx = makeCtx();
    ctx.adapter.update.mockResolvedValue({ id: "local_sub_1" });

    await upsertSubscription(
      ctx as never,
      makeSubscription({ status: "INACTIVE" }),
      { userId: "user_123" },
    );

    expect(ctx.adapter.update).toHaveBeenCalledWith({
      model: "asaasSubscription",
      where: [{ field: "asaasSubscriptionId", value: "sub_123" }],
      update: expect.objectContaining({
        userId: "user_123",
        status: "INACTIVE",
        cycle: "MONTHLY",
      }),
    });
    expect(ctx.adapter.create).not.toHaveBeenCalled();
  });

  it("creates a subscription when update matches no row", async () => {
    const ctx = makeCtx();
    ctx.adapter.update.mockResolvedValue(null);
    ctx.adapter.create.mockResolvedValue({ id: "local_sub_1" });

    await upsertSubscription(ctx as never, makeSubscription(), {
      userId: "user_123",
    });

    expect(ctx.adapter.create).toHaveBeenCalledWith({
      model: "asaasSubscription",
      data: expect.objectContaining({
        userId: "user_123",
        asaasSubscriptionId: "sub_123",
        createdAt: expect.any(Date),
      }),
    });
  });

  it("does not throw when the adapter fails", async () => {
    const ctx = makeCtx();
    ctx.adapter.update.mockRejectedValue(new Error("db down"));

    await expect(
      upsertSubscription(ctx as never, makeSubscription(), {
        userId: "user_123",
      }),
    ).resolves.toBeUndefined();
    expect(ctx.logger.error).toHaveBeenCalled();
  });
});
