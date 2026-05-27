import { describe, expect, it, vi } from "vitest";
import { Client } from "./asaas";
import {
  createChargeHandler,
  listPaymentsHandler,
  webhookHandler,
} from "./endpoints";

describe("createChargeHandler", () => {
  it("POSTs to /payments using the session user's Asaas customer id", async () => {
    const client = new Client({ apiKey: "k" });
    const request = vi
      .spyOn(client, "request")
      .mockResolvedValue({ id: "pay_1", status: "PENDING" });

    const result = await createChargeHandler(client, {
      body: {
        customer: "ignored",
        billingType: "PIX",
        value: 250,
        dueDate: "2026-06-15",
        description: "Subscription",
        externalReference: "order_99",
      },
      context: { session: { user: { asaasCustomerId: "cus_42" } } },
    });

    expect(request).toHaveBeenCalledWith("/payments", {
      method: "POST",
      body: JSON.stringify({
        customer: "cus_42",
        billingType: "PIX",
        value: 250,
        dueDate: "2026-06-15",
        description: "Subscription",
        externalReference: "order_99",
      }),
    });
    expect(result).toMatchObject({ id: "pay_1" });
  });

  it("propagates errors from the Asaas API", async () => {
    const client = new Client({ apiKey: "k" });
    vi.spyOn(client, "request").mockRejectedValue(new Error("boom"));

    await expect(
      createChargeHandler(client, {
        body: {
          customer: "ignored",
          billingType: "PIX",
          value: 1,
          dueDate: "2026-06-01",
        },
        context: { session: { user: { asaasCustomerId: "cus_1" } } },
      })
    ).rejects.toThrow("boom");
  });
});

describe("listPaymentsHandler", () => {
  it("GETs /payments and returns the response", async () => {
    const client = new Client({ apiKey: "k" });
    const listResponse = {
      object: "list" as const,
      hasMore: false,
      totalCount: 0,
      limit: 10,
      offset: 0,
      data: [],
    };
    const request = vi.spyOn(client, "request").mockResolvedValue(listResponse);

    const result = await listPaymentsHandler(client);

    expect(request).toHaveBeenCalledWith("/payments", { method: "GET" });
    expect(result).toEqual(listResponse);
  });
});

describe("webhookHandler", () => {
  it("invokes onPaymentCreated for PAYMENT_CREATED events", async () => {
    const onPaymentCreated = vi.fn();
    const payment = { id: "pay_1" };

    const result = await webhookHandler(
      { onPaymentCreated },
      { event: "PAYMENT_CREATED", payment }
    );

    expect(onPaymentCreated).toHaveBeenCalledWith(payment);
    expect(result).toEqual({ received: true });
  });

  it("ignores events without a registered handler", async () => {
    const result = await webhookHandler(
      {},
      { event: "PAYMENT_OVERDUE", payment: { id: "pay_2" } }
    );

    expect(result).toEqual({ received: true });
  });

  it("does not call onPaymentCreated for other event types", async () => {
    const onPaymentCreated = vi.fn();

    await webhookHandler(
      { onPaymentCreated },
      { event: "PAYMENT_RECEIVED", payment: { id: "pay_3" } }
    );

    expect(onPaymentCreated).not.toHaveBeenCalled();
  });
});
