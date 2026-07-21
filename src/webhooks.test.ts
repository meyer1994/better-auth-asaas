import { describe, expect, it, vi } from "vitest";
import { AsaasClient } from "./asaas";
import type { Event, Payment } from "./types";
import { webhook } from "./webhooks";

const TOKEN = "whsec_test_token_abcdefghijklmnopqrstuvwxyz";

const makePaymentEvent = (): Event<Payment, "PAYMENT_CREATED"> =>
  ({
    id: "evt_123",
    event: "PAYMENT_CREATED",
    dateCreated: "2026-06-05 12:00:00",
    payment: {
      object: "payment",
      id: "pay_123",
      dateCreated: "2026-06-05",
      customer: "cus_123",
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
    },
  }) as Event<Payment, "PAYMENT_CREATED">;

const makeContext = (headers?: Headers) => ({
  body: makePaymentEvent(),
  headers: headers ?? new Headers(),
  json: (value: unknown) => value,
});

describe("webhook", () => {
  const client = new AsaasClient({ apiKey: "secret", sandbox: true });

  it("rejects missing asaas-access-token header", async () => {
    const endpoint = webhook({
      client,
      webhookAccessToken: TOKEN,
    });

    await expect(endpoint(makeContext() as never)).rejects.toMatchObject({
      status: "UNAUTHORIZED",
    });
  });

  it("rejects wrong asaas-access-token header", async () => {
    const endpoint = webhook({
      client,
      webhookAccessToken: TOKEN,
    });

    await expect(
      endpoint(
        makeContext(new Headers({ "asaas-access-token": "wrong-token" })) as never
      )
    ).rejects.toMatchObject({
      status: "UNAUTHORIZED",
    });
  });

  it("accepts matching token and invokes handlers", async () => {
    const onWebhook = vi.fn();
    const onPaymentCreated = vi.fn();
    const endpoint = webhook({
      client,
      webhookAccessToken: TOKEN,
      onWebhook,
      onPaymentCreated,
    });

    const result = await endpoint(
      makeContext(new Headers({ "asaas-access-token": TOKEN })) as never
    );

    expect(result).toEqual({ success: true });
    expect(onWebhook).toHaveBeenCalledWith(makePaymentEvent());
    expect(onPaymentCreated).toHaveBeenCalledWith(makePaymentEvent());
  });
});
