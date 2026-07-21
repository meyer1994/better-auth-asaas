import { describe, expect, it, vi } from "vitest";
import { AsaasClient } from "./asaas";
import type { Event, Payment, Subscription } from "./types";
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

const makePaymentDeletedEvent = (): Event<Payment, "PAYMENT_DELETED"> =>
  ({
    ...makePaymentEvent(),
    event: "PAYMENT_DELETED",
    payment: {
      ...makePaymentEvent().payment,
      status: "DELETED",
      deleted: false,
    },
  }) as Event<Payment, "PAYMENT_DELETED">;

const makeSubscriptionEvent = (): Event<Subscription, "SUBSCRIPTION_CREATED"> =>
  ({
    id: "evt_sub_123",
    event: "SUBSCRIPTION_CREATED",
    dateCreated: "2026-06-05 12:00:00",
    subscription: {
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
    },
  }) as Event<Subscription, "SUBSCRIPTION_CREATED">;

const makeContext = (body: unknown = makePaymentEvent(), headers?: Headers) => {
  const adapter = {
    update: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: "local_1" }),
  };
  return {
    body,
    headers: headers ?? new Headers(),
    json: (value: unknown) => value,
    context: {
      adapter,
      logger: {
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
      },
    },
  };
};

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
        makeContext(
          makePaymentEvent(),
          new Headers({ "asaas-access-token": "wrong-token" }),
        ) as never,
      ),
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

    const ctx = makeContext(
      makePaymentEvent(),
      new Headers({ "asaas-access-token": TOKEN }),
    );
    const result = await endpoint(ctx as never);

    expect(result).toEqual({ success: true });
    expect(onWebhook).toHaveBeenCalledWith(makePaymentEvent());
    expect(onPaymentCreated).toHaveBeenCalledWith(makePaymentEvent());
    expect(ctx.context.adapter.update).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "asaasPayment",
        where: [{ field: "asaasPaymentId", value: "pay_123" }],
      }),
    );
    expect(ctx.context.adapter.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "asaasPayment",
        data: expect.objectContaining({
          asaasPaymentId: "pay_123",
          userId: "user_123",
        }),
      }),
    );
  });

  it("syncs subscriptions from webhook payloads", async () => {
    const onSubscriptionCreated = vi.fn();
    const endpoint = webhook({
      client,
      webhookAccessToken: TOKEN,
      onSubscriptionCreated,
    });

    const ctx = makeContext(
      makeSubscriptionEvent(),
      new Headers({ "asaas-access-token": TOKEN }),
    );
    const result = await endpoint(ctx as never);

    expect(result).toEqual({ success: true });
    expect(onSubscriptionCreated).toHaveBeenCalledWith(makeSubscriptionEvent());
    expect(ctx.context.adapter.update).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "asaasSubscription",
        where: [{ field: "asaasSubscriptionId", value: "sub_123" }],
      }),
    );
  });

  it("upserts payment payloads from PAYMENT_DELETED without removing the row", async () => {
    const endpoint = webhook({
      client,
      webhookAccessToken: TOKEN,
    });

    const adapter = {
      update: vi.fn().mockResolvedValue({ id: "local_pay_1" }),
      create: vi.fn(),
    };

    const result = await endpoint({
      body: makePaymentDeletedEvent(),
      headers: new Headers({ "asaas-access-token": TOKEN }),
      json: (value: unknown) => value,
      context: {
        adapter,
        logger: {
          warn: vi.fn(),
          error: vi.fn(),
          debug: vi.fn(),
          info: vi.fn(),
        },
      },
    } as never);

    expect(result).toEqual({ success: true });
    expect(adapter.update).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "asaasPayment",
        where: [{ field: "asaasPaymentId", value: "pay_123" }],
        update: expect.objectContaining({
          deleted: false,
          status: "DELETED",
        }),
      }),
    );
    expect(adapter.create).not.toHaveBeenCalled();
  });

  it("still acknowledges the webhook when local sync fails", async () => {
    const onWebhook = vi.fn();
    const endpoint = webhook({
      client,
      webhookAccessToken: TOKEN,
      onWebhook,
    });

    const result = await endpoint({
      body: makePaymentEvent(),
      headers: new Headers({ "asaas-access-token": TOKEN }),
      json: (value: unknown) => value,
      context: {
        adapter: {
          update: vi.fn().mockRejectedValue(new Error("db down")),
          create: vi.fn(),
        },
        logger: {
          warn: vi.fn(),
          error: vi.fn(),
          debug: vi.fn(),
          info: vi.fn(),
        },
      },
    } as never);

    expect(result).toEqual({ success: true });
    expect(onWebhook).toHaveBeenCalled();
  });
});
