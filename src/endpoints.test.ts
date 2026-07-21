import { describe, expect, it, vi } from "vitest";
import {
  createPayment,
  createSubscription,
  getQrCode,
  listPayments,
  listSubscriptions,
} from "./endpoints";
import { requireAsaasCustomerId } from "./asaas-middleware";
import type { Page, Payment, PixQrCode, Subscription } from "./types";
import { AsaasClient } from "./asaas";

const makePayment = () => ( {
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
} as Payment);


const makePaymentPage = () => ({
  object: "list",
  hasMore: false,
  totalCount: 1,
  limit: 10,
  offset: 0,
  data: [makePayment()],
} as Page<Payment>);

const makePixQrCode = () => ({
  success: true,
  encodedImage: "base64-image",
  payload: "pix-payload",
  expirationDate: "2026-06-12",
} as PixQrCode);

const makeSubscription = () => ({
  object: "subscription",
  id: "sub_123",
  dateCreated: "2026-06-05",
  customer: "cus_123",
  paymentLink: null,
  value: 49.9,
  nextDueDate: "2026-07-05",
  endDate: "2026-12-05",
  billingType: "PIX",
  cycle: "MONTHLY",
  description: "Monthly plan",
  status: "ACTIVE",
  deleted: false,
  maxPayments: 6,
  externalReference: "subscription_123",
} as Subscription);

const makeSubscriptionPage = () => ({
  object: "list",
  hasMore: false,
  totalCount: 1,
  limit: 10,
  offset: 0,
  data: [makeSubscription()],
} as Page<Subscription>);

const makeSessionContext = () => ({
  context: {
    session: {
      session: {
        id: "session_123",
      },
      user: {
        id: "user_123",
        email: "joao@example.com",
        asaasCustomerId: "cus_123",
      },
    },
    logger: {
      debug: vi.fn(),
    },
  },
});

const makeSessionContextWithoutAsaasCustomerId = () => ({
  context: {
    session: {
      session: {
        id: "session_123",
      },
      user: {
        id: "user_123",
        email: "joao@example.com",
      },
    },
  },
});

const mockClient = (response: unknown = makePayment()): AsaasClient => {
  const client = new AsaasClient({ apiKey: "secret", sandbox: true });
  vi.spyOn(client, "request").mockImplementation(async () => response);
  return client;
};

describe("requireAsaasCustomerId", () => {
  it("rejects sessions without an Asaas customer id", async () => {
    await expect(
      requireAsaasCustomerId(makeSessionContextWithoutAsaasCustomerId() as never)
    ).rejects.toMatchObject({
      status: "UNAUTHORIZED",
    });
  });
});

describe("createPayment", () => {
  it("creates a PIX payment for the authenticated user's Asaas customer", async () => {
    const client = mockClient();
    const endpoint = createPayment(client);

    const result = await endpoint({
      body: {
        billingType: "PIX",
        value: 49.9,
        dueDate: "2026-06-12",
        description: "Monthly plan",
      },
      ...makeSessionContext(),
    });

    expect(result).toEqual(makePayment());
    expect(client.request).toHaveBeenCalledWith("/payments", {
      method: "POST",
      body: JSON.stringify({
        value: 49.9,
        dueDate: "2026-06-12",
        description: "Monthly plan",
        billingType: "PIX",
        externalReference: "user_123",
        customer: "cus_123",
      }),
    });
  });
});

describe("listPayments", () => {
  it("lists payments for the authenticated user's Asaas customer", async () => {
    const client = mockClient(makePaymentPage());
    const endpoint = listPayments(client);

    const result = await endpoint(makeSessionContext());

    expect(result).toEqual(makePaymentPage());
    expect(client.request).toHaveBeenCalledWith("/payments?customer=cus_123");
  });
});

describe("getQrCode", () => {
  it("gets the PIX QR code for a payment owned by the authenticated user's Asaas customer", async () => {
    const client = new AsaasClient({ apiKey: "secret", sandbox: true });
    vi.spyOn(client, "request")
      .mockResolvedValueOnce(makePayment())
      .mockResolvedValueOnce(makePixQrCode());
    const endpoint = getQrCode(client);

    const result = await endpoint({
      query: {
        id: "pay_123",
      },
      ...makeSessionContext(),
    });

    expect(result).toEqual(makePixQrCode());
    expect(client.request).toHaveBeenNthCalledWith(1, "/payments/pay_123");
    expect(client.request).toHaveBeenNthCalledWith(2, "/payments/pay_123/pixQrCode");
  });

  it("rejects PIX QR code access for payments owned by another Asaas customer", async () => {
    const client = mockClient({
      ...makePayment(),
      customer: "cus_other",
    });
    const endpoint = getQrCode(client);

    await expect(endpoint({
      query: {
        id: "pay_123",
      },
      ...makeSessionContext(),
    })).rejects.toMatchObject({
      status: "UNAUTHORIZED",
    });

    expect(client.request).toHaveBeenCalledTimes(1);
    expect(client.request).toHaveBeenCalledWith("/payments/pay_123");
  });
});

describe("createSubscription", () => {
  it("creates a subscription with an explicit external reference", async () => {
    const client = mockClient(makeSubscription());
    const endpoint = createSubscription(client);

    const result = await endpoint({
      body: {
        billingType: "PIX",
        value: 49.9,
        nextDueDate: "2026-07-05",
        cycle: "MONTHLY",
        description: "Monthly plan",
        endDate: "2026-12-05",
        maxPayments: 6,
        externalReference: "subscription_123",
      },
      ...makeSessionContext(),
    });

    expect(result).toEqual(makeSubscription());
    expect(client.request).toHaveBeenCalledWith("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        billingType: "PIX",
        value: 49.9,
        nextDueDate: "2026-07-05",
        cycle: "MONTHLY",
        description: "Monthly plan",
        endDate: "2026-12-05",
        maxPayments: 6,
        externalReference: "subscription_123",
        customer: "cus_123",
      }),
    });
  });

  it("defaults the external reference to the authenticated user id", async () => {
    const client = mockClient(makeSubscription());
    const endpoint = createSubscription(client);

    await endpoint({
      body: {
        billingType: "PIX",
        value: 49.9,
        nextDueDate: "2026-07-05",
        cycle: "MONTHLY",
      },
      ...makeSessionContext(),
    });

    expect(client.request).toHaveBeenCalledWith("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        billingType: "PIX",
        value: 49.9,
        nextDueDate: "2026-07-05",
        cycle: "MONTHLY",
        externalReference: "user_123",
        customer: "cus_123",
      }),
    });
  });
});

describe("listSubscriptions", () => {
  it("lists subscriptions for the authenticated user's Asaas customer", async () => {
    const client = mockClient(makeSubscriptionPage());
    const endpoint = listSubscriptions(client);

    const result = await endpoint(makeSessionContext());

    expect(result).toEqual(makeSubscriptionPage());
    expect(client.request).toHaveBeenCalledWith("/subscriptions?customer=cus_123");
  });
});
