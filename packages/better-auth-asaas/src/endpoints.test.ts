import { describe, expect, it, vi } from "vitest";
import { createPayment } from "./endpoints";
import type { Payment } from "./types";
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


const mockClient = (): AsaasClient => {
  const client = new AsaasClient({ apiKey: "secret", sandbox: true });
  vi.spyOn(client, "request").mockImplementation(async () => makePayment());
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
