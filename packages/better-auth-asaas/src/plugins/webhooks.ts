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

          const payload = { payment: body.payment, user };
          switch (body.event) {
            case "PAYMENT_CREATED":
              console.debug("PAYMENT_CREATED", body.payment);
              await chargeHooks.onPaymentCreated?.(payload);
              break;
            case "PAYMENT_AWAITING_RISK_ANALYSIS":
              console.debug("PAYMENT_AWAITING_RISK_ANALYSIS", body.payment);
              await chargeHooks.onPaymentAwaitingRiskAnalysis?.(payload);
              break;
            case "PAYMENT_APPROVED_BY_RISK_ANALYSIS":
              console.debug("PAYMENT_APPROVED_BY_RISK_ANALYSIS", body.payment);
              await chargeHooks.onPaymentApprovedByRiskAnalysis?.(payload);
              break;
            case "PAYMENT_REPROVED_BY_RISK_ANALYSIS":
              console.debug("PAYMENT_REPROVED_BY_RISK_ANALYSIS", body.payment);
              await chargeHooks.onPaymentReprovedByRiskAnalysis?.(payload);
              break;
            case "PAYMENT_AUTHORIZED":
              console.debug("PAYMENT_AUTHORIZED", body.payment);
              await chargeHooks.onPaymentAuthorized?.(payload);
              break;
            case "PAYMENT_UPDATED":
              console.debug("PAYMENT_UPDATED", body.payment);
              await chargeHooks.onPaymentUpdated?.(payload);
              break;
            case "PAYMENT_CONFIRMED":
              console.debug("PAYMENT_CONFIRMED", body.payment);
              await chargeHooks.onPaymentConfirmed?.(payload);
              break;
            case "PAYMENT_RECEIVED":
              console.debug("PAYMENT_RECEIVED", body.payment);
              await chargeHooks.onPaymentReceived?.(payload);
              break;
            case "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED":
              console.debug("PAYMENT_CREDIT_CARD_CAPTURE_REFUSED", body.payment);
              await chargeHooks.onPaymentCreditCardCaptureRefused?.(payload);
              break;
            case "PAYMENT_ANTICIPATED":
              console.debug("PAYMENT_ANTICIPATED", body.payment);
              await chargeHooks.onPaymentAnticipated?.(payload);
              break;
            case "PAYMENT_OVERDUE":
              console.debug("PAYMENT_OVERDUE", body.payment);
              await chargeHooks.onPaymentOverdue?.(payload);
              break;
            case "PAYMENT_DELETED":
              console.debug("PAYMENT_DELETED", body.payment);
              await chargeHooks.onPaymentDeleted?.(payload);
              break;
            case "PAYMENT_RESTORED":
              console.debug("PAYMENT_RESTORED", body.payment);
              await chargeHooks.onPaymentRestored?.(payload);
              break;
            case "PAYMENT_REFUNDED":
              console.debug("PAYMENT_REFUNDED", body.payment);
              await chargeHooks.onPaymentRefunded?.(payload);
              break;
            case "PAYMENT_PARTIALLY_REFUNDED":
              console.debug("PAYMENT_PARTIALLY_REFUNDED", body.payment);
              await chargeHooks.onPaymentPartiallyRefunded?.(payload);
              break;
            case "PAYMENT_REFUND_IN_PROGRESS":
              console.debug("PAYMENT_REFUND_IN_PROGRESS", body.payment);
              await chargeHooks.onPaymentRefundInProgress?.(payload);
              break;
            case "PAYMENT_REFUND_DENIED":
              console.debug("PAYMENT_REFUND_DENIED", body.payment);
              await chargeHooks.onPaymentRefundDenied?.(payload);
              break;
            case "PAYMENT_RECEIVED_IN_CASH_UNDONE":
              console.debug("PAYMENT_RECEIVED_IN_CASH_UNDONE", body.payment);
              await chargeHooks.onPaymentReceivedInCashUndone?.(payload);
              break;
            case "PAYMENT_CHARGEBACK_REQUESTED":
              console.debug("PAYMENT_CHARGEBACK_REQUESTED", body.payment);
              await chargeHooks.onPaymentChargebackRequested?.(payload);
              break;
            case "PAYMENT_CHARGEBACK_DISPUTE":
              console.debug("PAYMENT_CHARGEBACK_DISPUTE", body.payment);
              await chargeHooks.onPaymentChargebackDispute?.(payload);
              break;
            case "PAYMENT_AWAITING_CHARGEBACK_REVERSAL":
              console.debug("PAYMENT_AWAITING_CHARGEBACK_REVERSAL", body.payment);
              await chargeHooks.onPaymentAwaitingChargebackReversal?.(payload);
              break;
            case "PAYMENT_DUNNING_RECEIVED":
              console.debug("PAYMENT_DUNNING_RECEIVED", body.payment);
              await chargeHooks.onPaymentDunningReceived?.(payload);
              break;
            case "PAYMENT_DUNNING_REQUESTED":
              console.debug("PAYMENT_DUNNING_REQUESTED", body.payment);
              await chargeHooks.onPaymentDunningRequested?.(payload);
              break;
            case "PAYMENT_BANK_SLIP_CANCELLED":
              console.debug("PAYMENT_BANK_SLIP_CANCELLED", body.payment);
              await chargeHooks.onPaymentBankSlipCancelled?.(payload);
              break;
            case "PAYMENT_BANK_SLIP_VIEWED":
              console.debug("PAYMENT_BANK_SLIP_VIEWED", body.payment);
              await chargeHooks.onPaymentBankSlipViewed?.(payload);
              break;
            case "PAYMENT_CHECKOUT_VIEWED":
              console.debug("PAYMENT_CHECKOUT_VIEWED", body.payment);
              await chargeHooks.onPaymentCheckoutViewed?.(payload);
              break;
            case "PAYMENT_SPLIT_CANCELLED":
              console.debug("PAYMENT_SPLIT_CANCELLED", body.payment);
              await chargeHooks.onPaymentSplitCancelled?.(payload);
              break;
            case "PAYMENT_SPLIT_DIVERGENCE_BLOCK":
              console.debug("PAYMENT_SPLIT_DIVERGENCE_BLOCK", body.payment);
              await chargeHooks.onPaymentSplitDivergenceBlock?.(payload);
              break;
            case "PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED":
              console.debug("PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED", body.payment);
              await chargeHooks.onPaymentSplitDivergenceBlockFinished?.(payload);
              break;
            default:
              console.debug("UNKNOWN_EVENT", body.event);
              break;
          }

          return ctx.json({ received: true });
        }
      ),
    };
  };
