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
          console.debug('asaasWebhooks', ctx.request?.headers)
          const token = ctx.request?.headers.get("asaas-access-token");
          // if (token !== webhooksOptions.accessToken) {
          //   throw new APIError("UNAUTHORIZED", {
          //     message: "Invalid webhook access token",
          //   });
          // }

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
              console.debug('PAYMENT_RECEIVED', body.payment)
              await chargeHooks.onPaymentReceived?.({ payment: body.payment, user });
              break;
            case "PAYMENT_OVERDUE":
              console.debug('PAYMENT_OVERDUE', body.payment)
              await chargeHooks.onPaymentOverdue?.({ payment: body.payment, user });
              break;
            case "PAYMENT_DELETED":
              console.debug('PAYMENT_DELETED', body.payment)
              await chargeHooks.onPaymentDeleted?.({ payment: body.payment, user });
              break;
            default:
              console.debug('UNKNOWN_EVENT', body.event)
              break;
          }

          return ctx.json({ received: true });
        }
      ),
    };
  };
