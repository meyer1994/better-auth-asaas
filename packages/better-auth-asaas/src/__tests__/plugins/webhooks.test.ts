import { beforeEach, describe, expect, it, vi } from "vitest";
import { webhooks } from "../../plugins/webhooks";
import type { AsaasPayment, AsaasWebhookPayload } from "../../types";
import { createMockAsaasClient, createMockUser } from "../utils/mocks";

vi.mock("better-auth/api", () => ({
  APIError: class APIError extends Error {
    constructor(public code: string, public data?: { message: string }) {
      super(data?.message ?? code);
    }
  },
  createAuthEndpoint: vi.fn((path: string, _config: unknown, handler: Function) => ({
    path,
    handler,
  })),
}));

import { APIError } from "better-auth/api";

const mockPayment: AsaasPayment = {
  id: "pay_1",
  customer: "cus_abc",
  value: 99.9,
  netValue: 99.9,
  billingType: "PIX",
  status: "RECEIVED",
  dueDate: "2026-05-10",
  dateCreated: "2026-05-02",
};

const makeEnvelope = (event: string, payment: AsaasPayment): AsaasWebhookPayload =>
  ({
    id: "evt_test",
    event,
    dateCreated: "2026-05-02 10:00:00",
    account: { id: "acc_test", ownerId: null },
    payment,
  }) as AsaasWebhookPayload;

const makeCtx = (
  body: AsaasWebhookPayload,
  token: string,
  internalAdapter = { findOne: vi.fn() }
) => ({
  request: new Request("http://localhost/api/auth/asaas/webhook", {
    method: "POST",
    headers: { "asaas-access-token": token },
    body: JSON.stringify(body),
  }),
  context: {
    logger: { error: vi.fn(), debug: vi.fn() },
    internalAdapter,
  },
  json: vi.fn((data: unknown) => data),
});

describe("webhooks plugin", () => {
  let mockClient: ReturnType<typeof createMockAsaasClient>;
  const validToken = "webhook-secret";

  beforeEach(() => {
    mockClient = createMockAsaasClient();
    vi.clearAllMocks();
  });

  it("registers asaasWebhooks endpoint", () => {
    const plugin = webhooks({ accessToken: validToken });
    const endpoints = plugin(mockClient);
    expect(endpoints).toHaveProperty("asaasWebhooks");
  });

  it("throws UNAUTHORIZED when token does not match", async () => {
    const plugin = webhooks({ accessToken: validToken });
    const endpoints = plugin(mockClient) as any;

    const ctx = makeCtx(makeEnvelope("PAYMENT_RECEIVED", mockPayment), "wrong-token");

    await expect(endpoints.asaasWebhooks.handler(ctx)).rejects.toThrow(APIError);
  });

  it("calls onPaymentReceived with payment and resolved user", async () => {
    const user = createMockUser();
    const onPaymentReceived = vi.fn().mockResolvedValue(undefined);
    const findOne = vi.fn().mockResolvedValue(user);

    const plugin = webhooks({ accessToken: validToken, onPaymentReceived });
    const endpoints = plugin(mockClient) as any;
    const ctx = makeCtx(makeEnvelope("PAYMENT_RECEIVED", mockPayment), validToken, {
      findOne,
    });

    await endpoints.asaasWebhooks.handler(ctx);

    expect(findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "user",
        where: expect.arrayContaining([{ field: "asaasCustomerId", value: mockPayment.customer }]),
      })
    );
    expect(onPaymentReceived).toHaveBeenCalledWith({ payment: mockPayment, user });
    expect(ctx.json).toHaveBeenCalledWith({ received: true });
  });

  it("calls onPaymentOverdue for PAYMENT_OVERDUE event", async () => {
    const onPaymentOverdue = vi.fn().mockResolvedValue(undefined);
    const plugin = webhooks({ accessToken: validToken, onPaymentOverdue });
    const endpoints = plugin(mockClient) as any;
    const ctx = makeCtx(makeEnvelope("PAYMENT_OVERDUE", mockPayment), validToken, {
      findOne: vi.fn().mockResolvedValue(null),
    });

    await endpoints.asaasWebhooks.handler(ctx);

    expect(onPaymentOverdue).toHaveBeenCalledWith({ payment: mockPayment, user: null });
  });

  it("calls onPaymentDeleted for PAYMENT_DELETED event", async () => {
    const onPaymentDeleted = vi.fn().mockResolvedValue(undefined);
    const plugin = webhooks({ accessToken: validToken, onPaymentDeleted });
    const endpoints = plugin(mockClient) as any;
    const ctx = makeCtx(makeEnvelope("PAYMENT_DELETED", mockPayment), validToken, {
      findOne: vi.fn().mockResolvedValue(null),
    });

    await endpoints.asaasWebhooks.handler(ctx);

    expect(onPaymentDeleted).toHaveBeenCalledWith({ payment: mockPayment, user: null });
  });

  it("silently ignores unrecognized events", async () => {
    const onPaymentReceived = vi.fn();
    const plugin = webhooks({ accessToken: validToken, onPaymentReceived });
    const endpoints = plugin(mockClient) as any;
    const ctx = makeCtx(makeEnvelope("UNKNOWN_EVENT", mockPayment), validToken, {
      findOne: vi.fn(),
    });

    await expect(endpoints.asaasWebhooks.handler(ctx)).resolves.not.toThrow();
    expect(onPaymentReceived).not.toHaveBeenCalled();
  });
});
