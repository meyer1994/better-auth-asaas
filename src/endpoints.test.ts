import { describe, expect, it, vi } from "vitest";
import {
  createPayment,
  createPaymentWithCreditCard,
  createSubscription,
  createSubscriptionWithCreditCard,
  deleteSubscription,
  getPayment,
  getPaymentBillingInfo,
  getPaymentIdentificationField,
  getPaymentStatus,
  getPaymentViewingInfo,
  getQrCode,
  getSubscription,
  getSubscriptionPaymentBook,
  listPayments,
  listSubscriptionPayments,
  listSubscriptions,
  payWithCard,
  payWithCreditCard,
  updateSubscription,
  updateSubscriptionCreditCard,
} from "./endpoints";
import { requireAsaasCustomerId } from "./asaas-middleware";
import type { Page, Payment, PixQrCode, Subscription } from "./types";
import { AsaasClient } from "./asaas";

const makePayment = () => ({
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

describe("createPaymentWithCreditCard", () => {
  it("creates a credit card payment for the authenticated user's Asaas customer", async () => {
    const client = mockClient();
    const endpoint = createPaymentWithCreditCard(client);

    const result = await endpoint({
      body: {
        value: 49.9,
        dueDate: "2026-06-12",
        remoteIp: "127.0.0.1",
        creditCardToken: "tok_123",
      },
      ...makeSessionContext(),
    });

    expect(result).toEqual(makePayment());
    expect(client.request).toHaveBeenCalledWith("/payments/", {
      method: "POST",
      body: JSON.stringify({
        value: 49.9,
        dueDate: "2026-06-12",
        creditCardToken: "tok_123",
        remoteIp: "127.0.0.1",
        billingType: "CREDIT_CARD",
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

describe("getPayment", () => {
  it("gets a payment owned by the authenticated user's Asaas customer", async () => {
    const client = mockClient();
    const endpoint = getPayment(client);

    const result = await endpoint({
      query: { id: "pay_123" },
      ...makeSessionContext(),
    });

    expect(result).toEqual(makePayment());
    expect(client.request).toHaveBeenCalledTimes(1);
    expect(client.request).toHaveBeenCalledWith("/payments/pay_123");
  });

  it("rejects payment access for payments owned by another Asaas customer", async () => {
    const client = mockClient({
      ...makePayment(),
      customer: "cus_other",
    });
    const endpoint = getPayment(client);

    await expect(
      endpoint({
        query: { id: "pay_123" },
        ...makeSessionContext(),
      })
    ).rejects.toMatchObject({
      status: "UNAUTHORIZED",
    });

    expect(client.request).toHaveBeenCalledTimes(1);
    expect(client.request).toHaveBeenCalledWith("/payments/pay_123");
  });
});

describe("getPaymentStatus", () => {
  it("gets the status for a payment owned by the authenticated user's Asaas customer", async () => {
    const statusResponse = { status: "PENDING" as const };
    const client = new AsaasClient({ apiKey: "secret", sandbox: true });
    vi.spyOn(client, "request")
      .mockResolvedValueOnce(makePayment())
      .mockResolvedValueOnce(statusResponse);
    const endpoint = getPaymentStatus(client);

    const result = await endpoint({
      query: { id: "pay_123" },
      ...makeSessionContext(),
    });

    expect(result).toEqual(statusResponse);
    expect(client.request).toHaveBeenNthCalledWith(1, "/payments/pay_123");
    expect(client.request).toHaveBeenNthCalledWith(2, "/payments/pay_123/status");
  });

  it("rejects status access for payments owned by another Asaas customer", async () => {
    const client = mockClient({
      ...makePayment(),
      customer: "cus_other",
    });
    const endpoint = getPaymentStatus(client);

    await expect(
      endpoint({
        query: { id: "pay_123" },
        ...makeSessionContext(),
      })
    ).rejects.toMatchObject({
      status: "UNAUTHORIZED",
    });

    expect(client.request).toHaveBeenCalledTimes(1);
    expect(client.request).toHaveBeenCalledWith("/payments/pay_123");
  });
});

describe("getPaymentIdentificationField", () => {
  it("gets the identification field for a payment owned by the authenticated user's Asaas customer", async () => {
    const identificationField = {
      identificationField: "23793.38128 60000.000003 00000.000400 1 84340000010000",
      nossoNumero: "0000000004",
      barCode: "23791843400000100003381286000000000000000040",
    };
    const client = new AsaasClient({ apiKey: "secret", sandbox: true });
    vi.spyOn(client, "request")
      .mockResolvedValueOnce(makePayment())
      .mockResolvedValueOnce(identificationField);
    const endpoint = getPaymentIdentificationField(client);

    const result = await endpoint({
      query: { id: "pay_123" },
      ...makeSessionContext(),
    });

    expect(result).toEqual(identificationField);
    expect(client.request).toHaveBeenNthCalledWith(1, "/payments/pay_123");
    expect(client.request).toHaveBeenNthCalledWith(2, "/payments/pay_123/identificationField");
  });

  it("rejects identification field access for payments owned by another Asaas customer", async () => {
    const client = mockClient({
      ...makePayment(),
      customer: "cus_other",
    });
    const endpoint = getPaymentIdentificationField(client);

    await expect(
      endpoint({
        query: { id: "pay_123" },
        ...makeSessionContext(),
      })
    ).rejects.toMatchObject({
      status: "UNAUTHORIZED",
    });

    expect(client.request).toHaveBeenCalledTimes(1);
    expect(client.request).toHaveBeenCalledWith("/payments/pay_123");
  });
});

describe("getPaymentBillingInfo", () => {
  it("gets billing info for a payment owned by the authenticated user's Asaas customer", async () => {
    const billingInfo = {
      pix: {
        encodedImage: "base64-image",
        payload: "pix-payload",
        expirationDate: "2026-06-12",
        description: "Monthly plan",
      },
    };
    const client = new AsaasClient({ apiKey: "secret", sandbox: true });
    vi.spyOn(client, "request")
      .mockResolvedValueOnce(makePayment())
      .mockResolvedValueOnce(billingInfo);
    const endpoint = getPaymentBillingInfo(client);

    const result = await endpoint({
      query: { id: "pay_123" },
      ...makeSessionContext(),
    });

    expect(result).toEqual(billingInfo);
    expect(client.request).toHaveBeenNthCalledWith(1, "/payments/pay_123");
    expect(client.request).toHaveBeenNthCalledWith(2, "/payments/pay_123/billingInfo");
  });

  it("rejects billing info access for payments owned by another Asaas customer", async () => {
    const client = mockClient({
      ...makePayment(),
      customer: "cus_other",
    });
    const endpoint = getPaymentBillingInfo(client);

    await expect(
      endpoint({
        query: { id: "pay_123" },
        ...makeSessionContext(),
      })
    ).rejects.toMatchObject({
      status: "UNAUTHORIZED",
    });

    expect(client.request).toHaveBeenCalledTimes(1);
    expect(client.request).toHaveBeenCalledWith("/payments/pay_123");
  });
});

describe("getPaymentViewingInfo", () => {
  it("gets viewing info for a payment owned by the authenticated user's Asaas customer", async () => {
    const viewingInfo = {
      invoiceViewedDate: "2026-06-10",
      boletoViewedDate: "2026-06-11",
    };
    const client = new AsaasClient({ apiKey: "secret", sandbox: true });
    vi.spyOn(client, "request")
      .mockResolvedValueOnce(makePayment())
      .mockResolvedValueOnce(viewingInfo);
    const endpoint = getPaymentViewingInfo(client);

    const result = await endpoint({
      query: { id: "pay_123" },
      ...makeSessionContext(),
    });

    expect(result).toEqual(viewingInfo);
    expect(client.request).toHaveBeenNthCalledWith(1, "/payments/pay_123");
    expect(client.request).toHaveBeenNthCalledWith(2, "/payments/pay_123/viewingInfo");
  });

  it("rejects viewing info access for payments owned by another Asaas customer", async () => {
    const client = mockClient({
      ...makePayment(),
      customer: "cus_other",
    });
    const endpoint = getPaymentViewingInfo(client);

    await expect(
      endpoint({
        query: { id: "pay_123" },
        ...makeSessionContext(),
      })
    ).rejects.toMatchObject({
      status: "UNAUTHORIZED",
    });

    expect(client.request).toHaveBeenCalledTimes(1);
    expect(client.request).toHaveBeenCalledWith("/payments/pay_123");
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
      query: { id: "pay_123" },
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

    await expect(
      endpoint({
        query: { id: "pay_123" },
        ...makeSessionContext(),
      })
    ).rejects.toMatchObject({
      status: "UNAUTHORIZED",
    });

    expect(client.request).toHaveBeenCalledTimes(1);
    expect(client.request).toHaveBeenCalledWith("/payments/pay_123");
  });
});

describe("payWithCard", () => {
  it("pays a payment owned by the authenticated user's Asaas customer with a card token", async () => {
    const client = new AsaasClient({ apiKey: "secret", sandbox: true });
    vi.spyOn(client, "request")
      .mockResolvedValueOnce(makePayment())
      .mockResolvedValueOnce(makePayment());
    const endpoint = payWithCard(client);

    const result = await endpoint({
      body: {
        id: "pay_123",
        cardType: "CREDIT",
        cardToken: "tok_123",
      },
      ...makeSessionContext(),
    });

    expect(result).toEqual(makePayment());
    expect(client.request).toHaveBeenNthCalledWith(1, "/payments/pay_123");
    expect(client.request).toHaveBeenNthCalledWith(2, "/payments/pay_123/payWithCard", {
      method: "POST",
      body: JSON.stringify({
        cardType: "CREDIT",
        cardToken: "tok_123",
      }),
    });
  });

  it("rejects card payment for payments owned by another Asaas customer", async () => {
    const client = mockClient({
      ...makePayment(),
      customer: "cus_other",
    });
    const endpoint = payWithCard(client);

    await expect(
      endpoint({
        body: {
          id: "pay_123",
          cardType: "CREDIT",
          cardToken: "tok_123",
        },
        ...makeSessionContext(),
      })
    ).rejects.toMatchObject({
      status: "UNAUTHORIZED",
    });

    expect(client.request).toHaveBeenCalledTimes(1);
    expect(client.request).toHaveBeenCalledWith("/payments/pay_123");
  });
});

describe("payWithCreditCard", () => {
  it("pays a payment owned by the authenticated user's Asaas customer with a credit card token", async () => {
    const client = new AsaasClient({ apiKey: "secret", sandbox: true });
    vi.spyOn(client, "request")
      .mockResolvedValueOnce(makePayment())
      .mockResolvedValueOnce(makePayment());
    const endpoint = payWithCreditCard(client);

    const result = await endpoint({
      body: {
        id: "pay_123",
        creditCardToken: "tok_123",
      },
      ...makeSessionContext(),
    });

    expect(result).toEqual(makePayment());
    expect(client.request).toHaveBeenNthCalledWith(1, "/payments/pay_123");
    expect(client.request).toHaveBeenNthCalledWith(2, "/payments/pay_123/payWithCreditCard", {
      method: "POST",
      body: JSON.stringify({
        creditCardToken: "tok_123",
      }),
    });
  });

  it("rejects credit card payment for payments owned by another Asaas customer", async () => {
    const client = mockClient({
      ...makePayment(),
      customer: "cus_other",
    });
    const endpoint = payWithCreditCard(client);

    await expect(
      endpoint({
        body: {
          id: "pay_123",
          creditCardToken: "tok_123",
        },
        ...makeSessionContext(),
      })
    ).rejects.toMatchObject({
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

describe("createSubscriptionWithCreditCard", () => {
  it("creates a credit card subscription for the authenticated user's Asaas customer", async () => {
    const subscription = {
      ...makeSubscription(),
      billingType: "CREDIT_CARD" as const,
    };
    const client = mockClient(subscription);
    const endpoint = createSubscriptionWithCreditCard(client);

    const result = await endpoint({
      body: {
        value: 49.9,
        nextDueDate: "2026-07-05",
        cycle: "MONTHLY",
        description: "Monthly plan",
        creditCardToken: "token_123",
        remoteIp: "127.0.0.1",
      },
      ...makeSessionContext(),
    });

    expect(result).toEqual(subscription);
    expect(client.request).toHaveBeenCalledWith("/subscriptions/", {
      method: "POST",
      body: JSON.stringify({
        value: 49.9,
        nextDueDate: "2026-07-05",
        cycle: "MONTHLY",
        description: "Monthly plan",
        externalReference: "user_123",
        creditCardToken: "token_123",
        remoteIp: "127.0.0.1",
        billingType: "CREDIT_CARD",
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

describe("getSubscription", () => {
  it("gets a subscription owned by the authenticated user's Asaas customer", async () => {
    const client = mockClient(makeSubscription());
    const endpoint = getSubscription(client);

    const result = await endpoint({
      query: { id: "sub_123" },
      ...makeSessionContext(),
    });

    expect(result).toEqual(makeSubscription());
    expect(client.request).toHaveBeenCalledWith("/subscriptions/sub_123");
  });

  it("rejects access for subscriptions owned by another Asaas customer", async () => {
    const client = mockClient({
      ...makeSubscription(),
      customer: "cus_other",
    });
    const endpoint = getSubscription(client);

    await expect(
      endpoint({
        query: { id: "sub_123" },
        ...makeSessionContext(),
      })
    ).rejects.toMatchObject({
      status: "UNAUTHORIZED",
    });

    expect(client.request).toHaveBeenCalledTimes(1);
    expect(client.request).toHaveBeenCalledWith("/subscriptions/sub_123");
  });
});

describe("updateSubscription", () => {
  it("updates a subscription owned by the authenticated user's Asaas customer", async () => {
    const updated = {
      ...makeSubscription(),
      description: "Updated plan",
    };
    const client = new AsaasClient({ apiKey: "secret", sandbox: true });
    vi.spyOn(client, "request")
      .mockResolvedValueOnce(makeSubscription())
      .mockResolvedValueOnce(updated);
    const endpoint = updateSubscription(client);

    const result = await endpoint({
      body: {
        id: "sub_123",
        description: "Updated plan",
      },
      ...makeSessionContext(),
    });

    expect(result).toEqual(updated);
    expect(client.request).toHaveBeenNthCalledWith(1, "/subscriptions/sub_123");
    expect(client.request).toHaveBeenNthCalledWith(2, "/subscriptions/sub_123", {
      method: "PUT",
      body: JSON.stringify({
        description: "Updated plan",
      }),
    });
  });
});

describe("updateSubscriptionCreditCard", () => {
  it("updates the credit card for an owned subscription", async () => {
    const client = new AsaasClient({ apiKey: "secret", sandbox: true });
    vi.spyOn(client, "request")
      .mockResolvedValueOnce(makeSubscription())
      .mockResolvedValueOnce(makeSubscription());
    const endpoint = updateSubscriptionCreditCard(client);

    const result = await endpoint({
      body: {
        id: "sub_123",
        remoteIp: "127.0.0.1",
        creditCardToken: "token_123",
      },
      ...makeSessionContext(),
    });

    expect(result).toEqual(makeSubscription());
    expect(client.request).toHaveBeenNthCalledWith(1, "/subscriptions/sub_123");
    expect(client.request).toHaveBeenNthCalledWith(2, "/subscriptions/sub_123/creditCard", {
      method: "PUT",
      body: JSON.stringify({
        creditCardToken: "token_123",
        remoteIp: "127.0.0.1",
      }),
    });
  });
});

describe("deleteSubscription", () => {
  it("deletes a subscription owned by the authenticated user's Asaas customer", async () => {
    const deleted = { deleted: true, id: "sub_123" };
    const client = new AsaasClient({ apiKey: "secret", sandbox: true });
    vi.spyOn(client, "request")
      .mockResolvedValueOnce(makeSubscription())
      .mockResolvedValueOnce(deleted);
    const endpoint = deleteSubscription(client);

    const result = await endpoint({
      body: { id: "sub_123" },
      ...makeSessionContext(),
    });

    expect(result).toEqual(deleted);
    expect(client.request).toHaveBeenNthCalledWith(1, "/subscriptions/sub_123");
    expect(client.request).toHaveBeenNthCalledWith(2, "/subscriptions/sub_123", {
      method: "DELETE",
    });
  });
});

describe("listSubscriptionPayments", () => {
  it("lists payments for an owned subscription", async () => {
    const client = new AsaasClient({ apiKey: "secret", sandbox: true });
    vi.spyOn(client, "request")
      .mockResolvedValueOnce(makeSubscription())
      .mockResolvedValueOnce(makePaymentPage());
    const endpoint = listSubscriptionPayments(client);

    const result = await endpoint({
      query: { id: "sub_123" },
      ...makeSessionContext(),
    });

    expect(result).toEqual(makePaymentPage());
    expect(client.request).toHaveBeenNthCalledWith(1, "/subscriptions/sub_123");
    expect(client.request).toHaveBeenNthCalledWith(2, "/subscriptions/sub_123/payments");
  });

  it("lists payments filtered by status for an owned subscription", async () => {
    const client = new AsaasClient({ apiKey: "secret", sandbox: true });
    vi.spyOn(client, "request")
      .mockResolvedValueOnce(makeSubscription())
      .mockResolvedValueOnce(makePaymentPage());
    const endpoint = listSubscriptionPayments(client);

    const result = await endpoint({
      query: {
        id: "sub_123",
        status: "PENDING",
      },
      ...makeSessionContext(),
    });

    expect(result).toEqual(makePaymentPage());
    expect(client.request).toHaveBeenNthCalledWith(1, "/subscriptions/sub_123");
    expect(client.request).toHaveBeenNthCalledWith(
      2,
      "/subscriptions/sub_123/payments?status=PENDING",
    );
  });
});

describe("getSubscriptionPaymentBook", () => {
  it("returns the PDF payment book for an owned subscription", async () => {
    const client = new AsaasClient({ apiKey: "secret", sandbox: true });
    vi.spyOn(client, "request").mockResolvedValueOnce(makeSubscription());
    vi.spyOn(client, "requestBinary").mockResolvedValueOnce({
      contentType: "application/pdf",
      data: "base64pdf",
    });
    const endpoint = getSubscriptionPaymentBook(client);

    const result = await endpoint({
      query: { id: "sub_123" },
      ...makeSessionContext(),
    });

    expect(result).toEqual({
      contentType: "application/pdf",
      data: "base64pdf",
    });
    expect(client.request).toHaveBeenCalledWith("/subscriptions/sub_123");
    expect(client.requestBinary).toHaveBeenCalledWith(
      expect.stringContaining("/subscriptions/sub_123/paymentBook"),
    );
  });
});
