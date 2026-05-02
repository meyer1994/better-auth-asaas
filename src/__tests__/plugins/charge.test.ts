import { beforeEach, describe, expect, it, vi } from "vitest";
import { charge } from "../../plugins/charge";
import type { AsaasPluginContext } from "../../types";
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
  getSessionFromCtx: vi.fn(),
}));

import { APIError, createAuthEndpoint, getSessionFromCtx } from "better-auth/api";

const mockContext: AsaasPluginContext = { chargeHooks: {} };

const createMockCtx = (user: ReturnType<typeof createMockUser> & { asaasCustomerId?: string }) => ({
  body: {},
  params: {},
  query: {},
  request: new Request("http://localhost/"),
  context: {
    logger: { error: vi.fn() },
    internalAdapter: { findOne: vi.fn() },
  },
  json: vi.fn((data: unknown) => data),
});

describe("charge plugin", () => {
  let mockClient: ReturnType<typeof createMockAsaasClient>;

  beforeEach(() => {
    mockClient = createMockAsaasClient();
    vi.clearAllMocks();
  });

  it("registers createCharge, listCharges, getCharge, getChargePixQrCode endpoints", () => {
    const plugin = charge();
    const endpoints = plugin(mockClient, mockContext);

    expect(endpoints).toHaveProperty("createCharge");
    expect(endpoints).toHaveProperty("listCharges");
    expect(endpoints).toHaveProperty("getCharge");
    expect(endpoints).toHaveProperty("getChargePixQrCode");
  });

  describe("createCharge handler", () => {
    it("creates a PIX payment and returns QR code data", async () => {
      const user = createMockUser() as ReturnType<typeof createMockUser> & { asaasCustomerId: string };
      user.asaasCustomerId = "cus_abc";

      vi.mocked(getSessionFromCtx).mockResolvedValueOnce({ user, session: {} as any });

      const payment = {
        id: "pay_1",
        customer: "cus_abc",
        value: 99.9,
        billingType: "PIX" as const,
        status: "PENDING" as const,
        dueDate: "2026-05-10",
        netValue: 99.9,
        dateCreated: "2026-05-02",
      };
      const pixQr = {
        encodedImage: "base64img",
        payload: "00020101...",
        expirationDate: "2026-05-10T23:59:59",
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(payment)
        .mockResolvedValueOnce(pixQr);

      const plugin = charge();
      const endpoints = plugin(mockClient, mockContext) as any;
      const ctx = {
        ...createMockCtx(user),
        body: { value: 99.9, dueDate: "2026-05-10", description: "Pro plan" },
      };

      await endpoints.createCharge.handler(ctx);

      expect(mockClient.request).toHaveBeenNthCalledWith(
        1,
        "/payments",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"billingType":"PIX"'),
        })
      );
      expect(mockClient.request).toHaveBeenNthCalledWith(
        2,
        `/payments/${payment.id}/pixQrCode`
      );
      expect(ctx.json).toHaveBeenCalledWith(
        expect.objectContaining({ pixQrCode: "base64img", pixCopiaECola: "00020101..." })
      );
    });

    it("throws BAD_REQUEST when user has no asaasCustomerId", async () => {
      const user = createMockUser();
      vi.mocked(getSessionFromCtx).mockResolvedValueOnce({ user, session: {} as any });

      const plugin = charge();
      const endpoints = plugin(mockClient, mockContext) as any;
      const ctx = {
        ...createMockCtx(user),
        body: { value: 99.9, dueDate: "2026-05-10" },
      };

      await expect(endpoints.createCharge.handler(ctx)).rejects.toThrow(APIError);
    });

    it("throws UNAUTHORIZED when there is no session", async () => {
      vi.mocked(getSessionFromCtx).mockResolvedValueOnce(null);

      const plugin = charge();
      const endpoints = plugin(mockClient, mockContext) as any;
      const ctx = { ...createMockCtx(createMockUser()), body: { value: 99.9, dueDate: "2026-05-10" } };

      await expect(endpoints.createCharge.handler(ctx)).rejects.toThrow(APIError);
    });
  });

  describe("listCharges handler", () => {
    it("returns payments for the current user's asaasCustomerId", async () => {
      const user = { ...createMockUser(), asaasCustomerId: "cus_abc" };
      vi.mocked(getSessionFromCtx).mockResolvedValueOnce({ user, session: {} as any });

      const paymentList = { data: [], hasMore: false, totalCount: 0, limit: 10, offset: 0, object: "list" };
      vi.mocked(mockClient.request).mockResolvedValueOnce(paymentList);

      const plugin = charge();
      const endpoints = plugin(mockClient, mockContext) as any;
      const ctx = createMockCtx(user);

      await endpoints.listCharges.handler(ctx);

      expect(mockClient.request).toHaveBeenCalledWith("/payments?customer=cus_abc");
      expect(ctx.json).toHaveBeenCalledWith(paymentList);
    });
  });

  describe("getCharge handler", () => {
    it("returns a single payment by ID", async () => {
      const user = { ...createMockUser(), asaasCustomerId: "cus_abc" };
      vi.mocked(getSessionFromCtx).mockResolvedValueOnce({ user, session: {} as any });

      const payment = { id: "pay_1", customer: "cus_abc", value: 50, billingType: "PIX" as const, status: "RECEIVED" as const, dueDate: "2026-05-01", netValue: 50, dateCreated: "2026-05-01" };
      vi.mocked(mockClient.request).mockResolvedValueOnce(payment);

      const plugin = charge();
      const endpoints = plugin(mockClient, mockContext) as any;
      const ctx = { ...createMockCtx(user), params: { id: "pay_1" } };

      await endpoints.getCharge.handler(ctx);

      expect(mockClient.request).toHaveBeenCalledWith("/payments/pay_1");
      expect(ctx.json).toHaveBeenCalledWith(payment);
    });
  });

  describe("getChargePixQrCode handler", () => {
    it("returns PIX QR code for a payment", async () => {
      const user = { ...createMockUser(), asaasCustomerId: "cus_abc" };
      vi.mocked(getSessionFromCtx).mockResolvedValueOnce({ user, session: {} as any });

      const pix = { encodedImage: "base64", payload: "pix_key", expirationDate: "2026-05-10T23:59:59" };
      vi.mocked(mockClient.request).mockResolvedValueOnce(pix);

      const plugin = charge();
      const endpoints = plugin(mockClient, mockContext) as any;
      const ctx = { ...createMockCtx(user), params: { id: "pay_1" } };

      await endpoints.getChargePixQrCode.handler(ctx);

      expect(mockClient.request).toHaveBeenCalledWith("/payments/pay_1/pixQrCode");
      expect(ctx.json).toHaveBeenCalledWith(pix);
    });
  });
});
