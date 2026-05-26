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
            case "PAYMENT_CREATED":
              ctx.context.logger.debug("PAYMENT_CREATED", body.payment);
              await chargeHooks.onPaymentCreated?.({ payment: body.payment, user });
              break;
            case "PAYMENT_AWAITING_RISK_ANALYSIS":
              ctx.context.logger.debug("PAYMENT_AWAITING_RISK_ANALYSIS", body.payment);
              await chargeHooks.onPaymentAwaitingRiskAnalysis?.({ payment: body.payment, user });
              break;
            case "PAYMENT_APPROVED_BY_RISK_ANALYSIS":
              ctx.context.logger.debug("PAYMENT_APPROVED_BY_RISK_ANALYSIS", body.payment);
              await chargeHooks.onPaymentApprovedByRiskAnalysis?.({ payment: body.payment, user });
              break;
            case "PAYMENT_REPROVED_BY_RISK_ANALYSIS":
              ctx.context.logger.debug("PAYMENT_REPROVED_BY_RISK_ANALYSIS", body.payment);
              await chargeHooks.onPaymentReprovedByRiskAnalysis?.({ payment: body.payment, user });
              break;
            case "PAYMENT_AUTHORIZED":
              ctx.context.logger.debug("PAYMENT_AUTHORIZED", body.payment);
              await chargeHooks.onPaymentAuthorized?.({ payment: body.payment, user });
              break;
            case "PAYMENT_UPDATED":
              ctx.context.logger.debug("PAYMENT_UPDATED", body.payment);
              await chargeHooks.onPaymentUpdated?.({ payment: body.payment, user });
              break;
            case "PAYMENT_CONFIRMED":
              ctx.context.logger.debug("PAYMENT_CONFIRMED", body.payment);
              await chargeHooks.onPaymentConfirmed?.({ payment: body.payment, user });
              break;
            case "PAYMENT_RECEIVED":
              ctx.context.logger.debug("PAYMENT_RECEIVED", body.payment);
              await chargeHooks.onPaymentReceived?.({ payment: body.payment, user });
              break;
            case "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED":
              ctx.context.logger.debug("PAYMENT_CREDIT_CARD_CAPTURE_REFUSED", body.payment);
              await chargeHooks.onPaymentCreditCardCaptureRefused?.({ payment: body.payment, user });
              break;
            case "PAYMENT_ANTICIPATED":
              ctx.context.logger.debug("PAYMENT_ANTICIPATED", body.payment);
              await chargeHooks.onPaymentAnticipated?.({ payment: body.payment, user });
              break;
            case "PAYMENT_OVERDUE":
              ctx.context.logger.debug("PAYMENT_OVERDUE", body.payment);
              await chargeHooks.onPaymentOverdue?.({ payment: body.payment, user });
              break;
            case "PAYMENT_DELETED":
              ctx.context.logger.debug("PAYMENT_DELETED", body.payment);
              await chargeHooks.onPaymentDeleted?.({ payment: body.payment, user });
              break;
            case "PAYMENT_RESTORED":
              ctx.context.logger.debug("PAYMENT_RESTORED", body.payment);
              await chargeHooks.onPaymentRestored?.({ payment: body.payment, user });
              break;
            case "PAYMENT_REFUNDED":
              ctx.context.logger.debug("PAYMENT_REFUNDED", body.payment);
              await chargeHooks.onPaymentRefunded?.({ payment: body.payment, user });
              break;
            case "PAYMENT_PARTIALLY_REFUNDED":
              ctx.context.logger.debug("PAYMENT_PARTIALLY_REFUNDED", body.payment);
              await chargeHooks.onPaymentPartiallyRefunded?.({ payment: body.payment, user });
              break;
            case "PAYMENT_REFUND_IN_PROGRESS":
              ctx.context.logger.debug("PAYMENT_REFUND_IN_PROGRESS", body.payment);
              await chargeHooks.onPaymentRefundInProgress?.({ payment: body.payment, user });
              break;
            case "PAYMENT_REFUND_DENIED":
              ctx.context.logger.debug("PAYMENT_REFUND_DENIED", body.payment);
              await chargeHooks.onPaymentRefundDenied?.({ payment: body.payment, user });
              break;
            case "PAYMENT_RECEIVED_IN_CASH_UNDONE":
              ctx.context.logger.debug("PAYMENT_RECEIVED_IN_CASH_UNDONE", body.payment);
              await chargeHooks.onPaymentReceivedInCashUndone?.({ payment: body.payment, user });
              break;
            case "PAYMENT_CHARGEBACK_REQUESTED":
              ctx.context.logger.debug("PAYMENT_CHARGEBACK_REQUESTED", body.payment);
              await chargeHooks.onPaymentChargebackRequested?.({ payment: body.payment, user });
              break;
            case "PAYMENT_CHARGEBACK_DISPUTE":
              ctx.context.logger.debug("PAYMENT_CHARGEBACK_DISPUTE", body.payment);
              await chargeHooks.onPaymentChargebackDispute?.({ payment: body.payment, user });
              break;
            case "PAYMENT_AWAITING_CHARGEBACK_REVERSAL":
              ctx.context.logger.debug("PAYMENT_AWAITING_CHARGEBACK_REVERSAL", body.payment);
              await chargeHooks.onPaymentAwaitingChargebackReversal?.({ payment: body.payment, user });
              break;
            case "PAYMENT_DUNNING_RECEIVED":
              ctx.context.logger.debug("PAYMENT_DUNNING_RECEIVED", body.payment);
              await chargeHooks.onPaymentDunningReceived?.({ payment: body.payment, user });
              break;
            case "PAYMENT_DUNNING_REQUESTED":
              ctx.context.logger.debug("PAYMENT_DUNNING_REQUESTED", body.payment);
              await chargeHooks.onPaymentDunningRequested?.({ payment: body.payment, user });
              break;
            case "PAYMENT_BANK_SLIP_CANCELLED":
              ctx.context.logger.debug("PAYMENT_BANK_SLIP_CANCELLED", body.payment);
              await chargeHooks.onPaymentBankSlipCancelled?.({ payment: body.payment, user });
              break;
            case "PAYMENT_BANK_SLIP_VIEWED":
              ctx.context.logger.debug("PAYMENT_BANK_SLIP_VIEWED", body.payment);
              await chargeHooks.onPaymentBankSlipViewed?.({ payment: body.payment, user });
              break;
            case "PAYMENT_CHECKOUT_VIEWED":
              ctx.context.logger.debug("PAYMENT_CHECKOUT_VIEWED", body.payment);
              await chargeHooks.onPaymentCheckoutViewed?.({ payment: body.payment, user });
              break;
            case "PAYMENT_SPLIT_CANCELLED":
              ctx.context.logger.debug("PAYMENT_SPLIT_CANCELLED", body.payment);
              await chargeHooks.onPaymentSplitCancelled?.({ payment: body.payment, user });
              break;
            case "PAYMENT_SPLIT_DIVERGENCE_BLOCK":
              ctx.context.logger.debug("PAYMENT_SPLIT_DIVERGENCE_BLOCK", body.payment);
              await chargeHooks.onPaymentSplitDivergenceBlock?.({ payment: body.payment, user });
              break;
            case "PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED":
              ctx.context.logger.debug("PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED", body.payment);
              await chargeHooks.onPaymentSplitDivergenceBlockFinished?.({ payment: body.payment, user });
              break;
            default:
              ctx.context.logger.debug("UNKNOWN_EVENT", body.event);
              break;
          }

          return ctx.json({ received: true });
        }
      ),
    };
  };
