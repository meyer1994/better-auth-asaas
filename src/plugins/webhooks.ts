import type { User } from "better-auth";
import { APIError, createAuthEndpoint } from "better-auth/api";
import type {
  AsaasApiClient,
  AsaasEndpoints,
  AsaasPluginContext,
  AsaasWebhookPayload,
  WebhooksOptions,
} from "../types";

type UserLookupAdapter = {
  findOne?: (args: {
    model: string;
    where: { field: string; value: string }[];
  }) => Promise<User | null>;
};

export const webhooks =
  (webhooksOptions: WebhooksOptions) =>
  (_client: AsaasApiClient, context: AsaasPluginContext): AsaasEndpoints => {
    return {
      asaasWebhooks: createAuthEndpoint(
        "/asaas/webhook",
        {
          method: "POST",
          metadata: { isAction: false },
          cloneRequest: true,
        },
        async (ctx) => {
          const token = ctx.request?.headers.get("asaas-access-token");
          if (token !== webhooksOptions.accessToken) {
            throw new APIError("UNAUTHORIZED", {
              message: "Invalid webhook access token",
            });
          }

          const body = (await ctx.request?.json()) as AsaasWebhookPayload;
          const { chargeHooks } = context;

          const internalAdapter = ctx.context.internalAdapter as UserLookupAdapter;
          const user =
            (await Promise.resolve(
              internalAdapter.findOne?.({
                model: "user",
                where: [{ field: "asaasCustomerId", value: body.payment.customer }],
              })
            ).catch(() => null)) ?? null;

          switch (body.event) {
            case "PAYMENT_RECEIVED":
              await chargeHooks.onPaymentReceived?.({ payment: body.payment, user });
              break;
            case "PAYMENT_OVERDUE":
              await chargeHooks.onPaymentOverdue?.({ payment: body.payment, user });
              break;
            case "PAYMENT_DELETED":
              await chargeHooks.onPaymentDeleted?.({ payment: body.payment, user });
              break;
            default:
              break;
          }

          return ctx.json({ received: true });
        }
      ),
    };
  };
