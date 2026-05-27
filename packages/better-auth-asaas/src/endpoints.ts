import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import type * as z from "zod/v4";
import type { Client } from './asaas';
import { requireAsaasCustomerId } from './middleware';
import {
  CreatePaymentInputSchema,
  ListPaymentsInputSchema,
  WebhookPayloadSchema,
  type ListPaymentsOutput,
  type Payment,
  type Webhooks,
} from './zods';


export const createChargeHandler = async (
  client: Client,
  ctx: {
    body: z.infer<typeof CreatePaymentInputSchema>;
    context: { session: { user: { asaasCustomerId: string } } };
  }
) => {
  return client.request<Payment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: ctx.context.session.user.asaasCustomerId,
      billingType: ctx.body.billingType,
      value: ctx.body.value,
      dueDate: ctx.body.dueDate,
      description: ctx.body.description,
      externalReference: ctx.body.externalReference,
    }),
  });
};

export const createCharge = (client: Client) => createAuthEndpoint(
  "/asaas/payments",
  {
    method: "POST",
    body: CreatePaymentInputSchema,
    use: [sessionMiddleware, requireAsaasCustomerId]
  },
  async (ctx) => ctx.json(await createChargeHandler(client, ctx))
)

export const listPaymentsHandler = async (client: Client) => {
  return client.request<ListPaymentsOutput>(`/payments`, { method: "GET" });
};

export const listPayments = (client: Client) => createAuthEndpoint(
  "/asaas/payments/list",
  {
    method: "POST",
    body: ListPaymentsInputSchema,
    use: [sessionMiddleware, requireAsaasCustomerId]
  },
  async (ctx) => ctx.json(await listPaymentsHandler(client))
)

export const webhookHandler = async (
  handlers: Webhooks,
  body: z.infer<typeof WebhookPayloadSchema>
) => {
  const { event, payment } = body;
  const p = payment as Payment;

  switch (event) {
    case "PAYMENT_CREATED": await handlers.onPaymentCreated?.(p); break;
  }

  return { received: true };
};

export const webhook = (handlers: Webhooks) => createAuthEndpoint(
  "/asaas/webhooks",
  {
    method: "POST",
    body: WebhookPayloadSchema,
  },
  async (ctx) => ctx.json(await webhookHandler(handlers, ctx.body))
)
