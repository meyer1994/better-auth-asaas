import { APIError, createAuthEndpoint, getSessionFromCtx } from "better-auth/api";
import * as z from "zod/v4";
import type {
  AsaasApiClient,
  AsaasEndpoints,
  AsaasPayment,
  AsaasPaymentList,
  AsaasPixQrCode,
  AsaasPluginContext,
  AsaasSubPluginWithHooks,
  ChargeOptions,
} from "../types";

const CreateChargeBody = z.object({
  value: z.number().positive(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  description: z.string().max(500).optional(),
  externalReference: z.string().optional(),
});

type CreateChargeInput = z.infer<typeof CreateChargeBody>;

export const charge =
  (chargeOptions: ChargeOptions = {}) => {
    const plugin = (client: AsaasApiClient, _context: AsaasPluginContext): AsaasEndpoints => {
      const endpoints = {
        createCharge: createAuthEndpoint(
          "/asaas/charge",
          { method: "POST", body: CreateChargeBody },
          async (ctx) => {
            const session = await getSessionFromCtx(ctx);
            if (!session) throw new APIError("UNAUTHORIZED");

            const user = session.user as typeof session.user & { asaasCustomerId?: string };
            if (!user.asaasCustomerId) {
              throw new APIError("BAD_REQUEST", {
                message: "User does not have an Asaas customer ID. Ensure createCustomerOnSignUp is enabled.",
              });
            }

            const body = ctx.body as CreateChargeInput;

            const payment = await client.request<AsaasPayment>("/payments", {
              method: "POST",
              body: JSON.stringify({
                customer: user.asaasCustomerId,
                billingType: "PIX",
                value: body.value,
                dueDate: body.dueDate,
                description: body.description,
                externalReference: body.externalReference,
              }),
            });

            const pix = await client.request<AsaasPixQrCode>(`/payments/${payment.id}/pixQrCode`);

            return ctx.json({
              ...payment,
              pixQrCode: pix.encodedImage,
              pixCopiaECola: pix.payload,
            });
          }
        ),

        listCharges: createAuthEndpoint(
          "/asaas/charges",
          { method: "GET" },
          async (ctx) => {
            const session = await getSessionFromCtx(ctx);
            if (!session) throw new APIError("UNAUTHORIZED");

            const user = session.user as typeof session.user & { asaasCustomerId?: string };
            if (!user.asaasCustomerId) {
              throw new APIError("BAD_REQUEST", {
                message: "User does not have an Asaas customer ID.",
              });
            }

            const payments = await client.request<AsaasPaymentList>(
              `/payments?customer=${user.asaasCustomerId}`
            );
            return ctx.json(payments);
          }
        ),

        getCharge: createAuthEndpoint(
          "/asaas/charge/:id",
          { method: "GET" },
          async (ctx) => {
            const session = await getSessionFromCtx(ctx);
            if (!session) throw new APIError("UNAUTHORIZED");

            const { id } = ctx.params as { id: string };
            const payment = await client.request<AsaasPayment>(`/payments/${id}`);
            return ctx.json(payment);
          }
        ),

        getChargePixQrCode: createAuthEndpoint(
          "/asaas/charge/:id/pix",
          { method: "GET" },
          async (ctx) => {
            const session = await getSessionFromCtx(ctx);
            if (!session) throw new APIError("UNAUTHORIZED");

            const { id } = ctx.params as { id: string };
            const pix = await client.request<AsaasPixQrCode>(`/payments/${id}/pixQrCode`);
            return ctx.json(pix);
          }
        ),
      };

      return endpoints;
    };

    (plugin as AsaasSubPluginWithHooks).__chargeOptions = chargeOptions;

    return plugin;
  };
