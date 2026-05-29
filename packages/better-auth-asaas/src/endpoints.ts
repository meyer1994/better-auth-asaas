import { createAuthEndpoint } from "@better-auth/core/api";
import { sessionMiddleware } from "better-auth/api";
import * as z from "zod";
import type { AsaasClient, Page, Payment } from "./asaas";
import { APIError } from "@better-auth/core/error";

export const PaymentBillingTypeSchema = z.enum([
  "UNDEFINED",
  "BOLETO",
  "CREDIT_CARD",
  "PIX",
]);

export const PaymentDiscountSchema = z.object({
  value: z.number(),
  dueDateLimitDays: z.number().int().optional(),
  type: z.enum(["FIXED", "PERCENTAGE"]).optional(),
});

export const PaymentInterestSchema = z.object({
  value: z.number(),
});

export const PaymentFineSchema = z.object({
  value: z.number(),
  type: z.enum(["FIXED", "PERCENTAGE"]).optional(),
});

export const PaymentSplitSchema = z.object({
  walletId: z.string(),
  fixedValue: z.number().optional(),
  percentualValue: z.number().optional(),
  totalFixedValue: z.number().optional(),
  externalReference: z.string().optional(),
  description: z.string().optional(),
});

export const PaymentCallbackSchema = z.object({
  successUrl: z.string().max(255),
  autoRedirect: z.boolean().optional(),
});

export const CreatePaymentInputSchema = z.object({
  billingType: PaymentBillingTypeSchema,
  value: z.number(),
  dueDate: z.string(),
  description: z.string().max(500).optional(),
  daysAfterDueDateToRegistrationCancellation: z.number().int().optional(),
  externalReference: z.string().optional(),
  installmentCount: z.number().int().optional(),
  totalValue: z.number().optional(),
  installmentValue: z.number().optional(),
  discount: PaymentDiscountSchema.optional(),
  interest: PaymentInterestSchema.optional(),
  fine: PaymentFineSchema.optional(),
  postalService: z.boolean().optional(),
  split: z.array(PaymentSplitSchema).optional(),
  callback: PaymentCallbackSchema.optional(),
  pixAutomaticAuthorizationId: z.string().optional(),
});

export const createPayment = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/create",
  {
    method: "POST",
    body: CreatePaymentInputSchema,
    use: [sessionMiddleware],
  },
  async (ctx) => {
    const response = await client.request<Payment>("/payments", {
      method: "POST",
      body: JSON.stringify({
        ...ctx.body,
        customer: ctx.context.session.user.asaasCustomerId,
      }),
    });
    return ctx.json(response);
  }
);

export const listPayments = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/list",
  {
    method: "GET",
    use: [sessionMiddleware],
  },
  async (ctx) => {
    const response = await client.request<Page<Payment>>(`/payments`);
    return ctx.json(response);
  }
);
