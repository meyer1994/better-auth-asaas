import { APIError, createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import * as z from "zod";
import type { AsaasClient } from "./asaas";
import { requireAsaasCustomerId } from "./middleware";
import type { CreateSubscription, Page, Payment, PixQrCode, Subscription } from "./types";

export const createPayment = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/create" as const,
  {
    method: "POST" as const,
    body: z.object({
      billingType: z.enum(["PIX", /* "BOLETO", "CREDIT_CARD", "UNDEFINED" */]),
      value: z.number().positive(),
      dueDate: z.string(),
      description: z.string().max(256).optional(),
    }),
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Payment> => {
    const response = await client.request<Payment>("/payments", {
      method: "POST",
      body: JSON.stringify({
        value: ctx.body.value,
        dueDate: ctx.body.dueDate,
        description: ctx.body.description,
        billingType: ctx.body.billingType,
        externalReference: ctx.context.session.user.id,
        customer: ctx.context.session.user.asaasCustomerId,
      }),
    });
    return ctx.json(response);
  }
);

export const createSubscription = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/subscriptions/create" as const,
  {
    method: "POST" as const,
    body: z.object({
      billingType: z.enum(["UNDEFINED", "BOLETO", "CREDIT_CARD", "PIX"]),
      value: z.number().positive(),
      nextDueDate: z.string(),
      cycle: z.enum([
        "WEEKLY",
        "BIWEEKLY",
        "MONTHLY",
        "BIMONTHLY",
        "QUARTERLY",
        "SEMIANNUALLY",
        "YEARLY",
      ]),
      description: z.string().max(500).optional(),
      endDate: z.string().optional(),
      maxPayments: z.number().int().positive().optional(),
      externalReference: z.string().optional(),
    }),
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Subscription> => {
    const response = await client.request<Subscription>("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        billingType: ctx.body.billingType,
        value: ctx.body.value,
        nextDueDate: ctx.body.nextDueDate,
        cycle: ctx.body.cycle,
        description: ctx.body.description,
        endDate: ctx.body.endDate,
        maxPayments: ctx.body.maxPayments,
        externalReference: ctx.body.externalReference ?? ctx.context.session.user.id,
        customer: ctx.context.session.user.asaasCustomerId,
      } satisfies CreateSubscription),
    });
    return ctx.json(response);
  }
);

export const listPayments = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/list" as const,
  {
    method: "GET" as const,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Page<Payment>> => {
    const customer = encodeURIComponent(ctx.context.session.user.asaasCustomerId);
    const response = await client.request<Page<Payment>>(`/payments?customer=${customer}`);
    return ctx.json(response);
  }
);

export const listSubscriptions = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/subscriptions/list" as const,
  {
    method: "GET" as const,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Page<Subscription>> => {
    const customer = encodeURIComponent(ctx.context.session.user.asaasCustomerId);
    const response = await client.request<Page<Subscription>>(`/subscriptions?customer=${customer}`);
    return ctx.json(response);
  }
);

export const getQrCode = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/qr" as const,
  {
    method: "GET" as const,
    query: z.object({ id: z.string() }),
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<PixQrCode> => {
    const payment = await client.request<Payment>(`/payments/${ctx.query.id}`);

    if (payment.customer !== ctx.context.session.user.asaasCustomerId) {
      throw new APIError("UNAUTHORIZED", {
        message: "Payment does not belong to the authenticated user",
      });
    }

    const response = await client.request<PixQrCode>(`/payments/${ctx.query.id}/pixQrCode`);
    return ctx.json(response);
  }
);
