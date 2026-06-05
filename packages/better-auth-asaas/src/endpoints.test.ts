import { describe, expect, it, vi } from "vitest";
import { createPayment, getQrCode, listPayments } from "./endpoints";
import type { Page, Payment, PixQrCode } from "./types";
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

const makeSessionContext = () => ({
  context: {
    session: {
      session: {
        id: "session_123",
      },
      user: {
        id: "user_123",
        asaasCustomerId: "cus_123",
      },
    },
  },
});

const mockClient = (response: unknown = makePayment()): AsaasClient => {
  const client = new AsaasClient({ apiKey: "secret", sandbox: true });
  vi.spyOn(client, "request").mockImplementation(async () => response);
  return client;
};

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
  it("lists payments for the authenticated user", async () => {
    const client = mockClient(makePaymentPage());
    const endpoint = listPayments(client);

    const result = await endpoint(makeSessionContext());

    expect(result).toEqual(makePaymentPage());
    expect(client.request).toHaveBeenCalledWith("/payments");
  });
});

describe("getQrCode", () => {
  it("gets the PIX QR code for a payment", async () => {
    const client = mockClient(makePixQrCode());
    const endpoint = getQrCode(client);

    const result = await endpoint({
      query: {
        id: "pay_123",
      },
      ...makeSessionContext(),
    });

    expect(result).toEqual(makePixQrCode());
    expect(client.request).toHaveBeenCalledWith("/payments/pay_123/pixQrCode");
  });
});
