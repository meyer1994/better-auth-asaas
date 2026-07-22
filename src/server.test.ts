import { describe, expect, it } from "vitest";
import { getTestInstance } from "better-auth/test";
import type { Event, Payment } from "./types";
import { asaas } from "./server";

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

describe("asaas plugin", () => {
  const plugin = asaas({
    apiKey: "test_key",
    webhookAccessToken: TOKEN,
  });

  it("registers camelCase endpoint keys", () => {
    expect(Object.keys(plugin.endpoints).sort()).toEqual([
      "createPayment",
      "createPaymentWithCreditCard",
      "createSubscription",
      "createSubscriptionWithCreditCard",
      "deleteSubscription",
      "getPayment",
      "getPaymentBillingInfo",
      "getPaymentIdentificationField",
      "getPaymentQrCode",
      "getPaymentStatus",
      "getPaymentViewingInfo",
      "getSubscription",
      "getSubscriptionPaymentBook",
      "listPayments",
      "listSubscriptionPayments",
      "listSubscriptions",
      "payWithCard",
      "payWithCreditCard",
      "updateSubscription",
      "updateSubscriptionCreditCard",
      "webhook",
    ].sort());
  });

  it("declares payment, subscription, and webhook tables in the plugin schema", () => {
    expect(plugin.schema).toMatchObject({
      user: {
        fields: {
          asaasCustomerId: expect.any(Object),
          cpfCnpj: expect.any(Object),
        },
      },
      asaasPayment: {
        fields: {
          userId: expect.objectContaining({
            references: { model: "user", field: "id", onDelete: "cascade" },
          }),
          asaasPaymentId: expect.objectContaining({ unique: true }),
          status: expect.any(Object),
        },
      },
      asaasSubscription: {
        fields: {
          userId: expect.objectContaining({
            references: { model: "user", field: "id", onDelete: "cascade" },
          }),
          asaasSubscriptionId: expect.objectContaining({ unique: true }),
          status: expect.any(Object),
          cycle: expect.any(Object),
        },
      },
      asaasWebhook: {
        fields: {
          asaasEventId: expect.objectContaining({ unique: true }),
          event: expect.any(Object),
          dateCreated: expect.any(Object),
          accountId: expect.any(Object),
          ownerId: expect.any(Object),
          additionalInfo: expect.any(Object),
          rawPayload: expect.any(Object),
        },
      },
    });
  });

  it("defines default rate limits for webhook and asaas API routes", () => {
    expect(plugin.rateLimit).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          max: 100,
          window: 60,
        }),
        expect.objectContaining({
          max: 30,
          window: 60,
        }),
      ]),
    );

    const [webhookRule, apiRule] = plugin.rateLimit!;
    expect(webhookRule.pathMatcher("/asaas/webhook")).toBe(true);
    expect(webhookRule.pathMatcher("/asaas/payments/create")).toBe(false);
    expect(apiRule.pathMatcher("/asaas/payments/create")).toBe(true);
    expect(apiRule.pathMatcher("/asaas/subscriptions/list")).toBe(true);
    expect(apiRule.pathMatcher("/asaas/webhook")).toBe(false);
  });

  it("allows overriding rate limit windows via plugin options", () => {
    const custom = asaas({
      apiKey: "test_key",
      webhookAccessToken: TOKEN,
      rateLimit: {
        webhook: { max: 2, window: 30 },
        api: { max: 5, window: 15 },
      },
    });

    const [webhookRule, apiRule] = custom.rateLimit!;
    expect(webhookRule).toMatchObject({ max: 2, window: 30 });
    expect(apiRule).toMatchObject({ max: 5, window: 15 });
  });

  it("enforces the webhook rate limit on HTTP requests", async () => {
    const { customFetchImpl } = await getTestInstance(
      {
        rateLimit: { enabled: true },
        plugins: [
          asaas({
            apiKey: "test_key",
            webhookAccessToken: TOKEN,
            rateLimit: {
              webhook: { max: 2, window: 60 },
            },
          }),
        ],
      },
      { disableTestUser: true },
    );

    const postWebhook = () =>
      customFetchImpl("http://localhost:3000/api/auth/asaas/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "asaas-access-token": TOKEN,
          "x-forwarded-for": "203.0.113.10",
        },
        body: JSON.stringify(makePaymentEvent()),
      });

    expect((await postWebhook()).status).toBe(200);
    expect((await postWebhook()).status).toBe(200);

    const limited = await postWebhook();
    expect(limited.status).toBe(429);
    expect(limited.headers.get("X-Retry-After")).toBeTruthy();
  });
});
