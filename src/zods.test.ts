import { describe, expect, it } from "vitest";
import {
  createPaymentSchema,
  createPaymentWithCreditCardSchema,
  paymentBookQuerySchema,
  updateSubscriptionSchema,
} from "./zods";

describe("public Zod schemas", () => {
  it("exports the endpoint schemas as library-facing values", () => {
    expect(createPaymentSchema).toBeDefined();
    expect(createPaymentWithCreditCardSchema).toBeDefined();
    expect(updateSubscriptionSchema).toBeDefined();
    expect(paymentBookQuerySchema).toBeDefined();
  });

  it("accepts a valid payment creation input", () => {
    const result = createPaymentSchema.safeParse({
      billingType: "PIX",
      value: 49.9,
      dueDate: "2026-07-30",
      description: "Monthly plan",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a payment creation input with a non-positive value", () => {
    const result = createPaymentSchema.safeParse({
      billingType: "PIX",
      value: 0,
      dueDate: "2026-07-30",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid credit-card payment input with a token", () => {
    const result = createPaymentWithCreditCardSchema.safeParse({
      value: 49.9,
      dueDate: "2026-07-30",
      remoteIp: "127.0.0.1",
      creditCardToken: "token_123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a credit-card payment without a token or card details", () => {
    const result = createPaymentWithCreditCardSchema.safeParse({
      value: 49.9,
      dueDate: "2026-07-30",
      remoteIp: "127.0.0.1",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid subscription update input", () => {
    const result = updateSubscriptionSchema.safeParse({
      id: "sub_123",
      nextDueDate: "2026-08-30",
      updatePendingPayments: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a subscription update without a string id", () => {
    const result = updateSubscriptionSchema.safeParse({
      id: 123,
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid payment-book query", () => {
    const result = paymentBookQuerySchema.safeParse({ id: "sub_123" });

    expect(result.success).toBe(true);
  });

  it("rejects a payment-book query without a string id", () => {
    const result = paymentBookQuerySchema.safeParse({ id: 123 });

    expect(result.success).toBe(false);
  });
});
