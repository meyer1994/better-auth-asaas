import { createAuthEndpoint } from "better-auth/api";
import type { AsaasClient } from "./asaas";
import type { Event, EventType, Payment, Subscription } from "./types";

export interface WebhookOptions {
  client: AsaasClient;
  
  onWebhook?: (event: Event<unknown, EventType>) => Promise<unknown> | unknown;

  onPaymentCreated?: (event: Event<Payment, "PAYMENT_CREATED">) => Promise<unknown> | unknown;
  onPaymentAwaitingRiskAnalysis?: (event: Event<Payment, "PAYMENT_AWAITING_RISK_ANALYSIS">) => Promise<unknown> | unknown;
  onPaymentApprovedByRiskAnalysis?: (event: Event<Payment, "PAYMENT_APPROVED_BY_RISK_ANALYSIS">) => Promise<unknown> | unknown;
  onPaymentReprovedByRiskAnalysis?: (event: Event<Payment, "PAYMENT_REPROVED_BY_RISK_ANALYSIS">) => Promise<unknown> | unknown;
  onPaymentAuthorized?: (event: Event<Payment, "PAYMENT_AUTHORIZED">) => Promise<unknown> | unknown;
  onPaymentUpdated?: (event: Event<Payment, "PAYMENT_UPDATED">) => Promise<unknown> | unknown;
  onPaymentConfirmed?: (event: Event<Payment, "PAYMENT_CONFIRMED">) => Promise<unknown> | unknown;
  onPaymentReceived?: (event: Event<Payment, "PAYMENT_RECEIVED">) => Promise<unknown> | unknown;
  onPaymentCreditCardCaptureRefused?: (event: Event<Payment, "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED">) => Promise<unknown> | unknown;
  onPaymentAnticipated?: (event: Event<Payment, "PAYMENT_ANTICIPATED">) => Promise<unknown> | unknown;
  onPaymentOverdue?: (event: Event<Payment, "PAYMENT_OVERDUE">) => Promise<unknown> | unknown;
  onPaymentDeleted?: (event: Event<Payment, "PAYMENT_DELETED">) => Promise<unknown> | unknown;
  onPaymentRestored?: (event: Event<Payment, "PAYMENT_RESTORED">) => Promise<unknown> | unknown;
  onPaymentRefunded?: (event: Event<Payment, "PAYMENT_REFUNDED">) => Promise<unknown> | unknown;
  onPaymentPartiallyRefunded?: (event: Event<Payment, "PAYMENT_PARTIALLY_REFUNDED">) => Promise<unknown> | unknown;
  onPaymentRefundInProgress?: (event: Event<Payment, "PAYMENT_REFUND_IN_PROGRESS">) => Promise<unknown> | unknown;
  onPaymentRefundDenied?: (event: Event<Payment, "PAYMENT_REFUND_DENIED">) => Promise<unknown> | unknown;
  onPaymentReceivedInCashUndone?: (event: Event<Payment, "PAYMENT_RECEIVED_IN_CASH_UNDONE">) => Promise<unknown> | unknown;
  onPaymentChargebackRequested?: (event: Event<Payment, "PAYMENT_CHARGEBACK_REQUESTED">) => Promise<unknown> | unknown;
  onPaymentChargebackDispute?: (event: Event<Payment, "PAYMENT_CHARGEBACK_DISPUTE">) => Promise<unknown> | unknown;
  onPaymentAwaitingChargebackReversal?: (event: Event<Payment, "PAYMENT_AWAITING_CHARGEBACK_REVERSAL">) => Promise<unknown> | unknown;
  onPaymentDunningReceived?: (event: Event<Payment, "PAYMENT_DUNNING_RECEIVED">) => Promise<unknown> | unknown;
  onPaymentDunningRequested?: (event: Event<Payment, "PAYMENT_DUNNING_REQUESTED">) => Promise<unknown> | unknown;
  onPaymentBankSlipCancelled?: (event: Event<Payment, "PAYMENT_BANK_SLIP_CANCELLED">) => Promise<unknown> | unknown;
  onPaymentBankSlipViewed?: (event: Event<Payment, "PAYMENT_BANK_SLIP_VIEWED">) => Promise<unknown> | unknown;
  onPaymentCheckoutViewed?: (event: Event<Payment, "PAYMENT_CHECKOUT_VIEWED">) => Promise<unknown> | unknown;
  onPaymentSplitDivergenceBlock?: (event: Event<Payment, "PAYMENT_SPLIT_DIVERGENCE_BLOCK">) => Promise<unknown> | unknown;
  onPaymentSplitDivergenceBlockFinished?: (event: Event<Payment, "PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED">) => Promise<unknown> | unknown;

  onSubscriptionCreated?: (event: Event<Subscription, "SUBSCRIPTION_CREATED">) => Promise<unknown> | unknown;
  onSubscriptionUpdated?: (event: Event<Subscription, "SUBSCRIPTION_UPDATED">) => Promise<unknown> | unknown;
  onSubscriptionInactivated?: (event: Event<Subscription, "SUBSCRIPTION_INACTIVATED">) => Promise<unknown> | unknown;
  onSubscriptionDeleted?: (event: Event<Subscription, "SUBSCRIPTION_DELETED">) => Promise<unknown> | unknown;
  onSubscriptionSplitDisabled?: (event: Event<Subscription, "SUBSCRIPTION_SPLIT_DISABLED">) => Promise<unknown> | unknown;
  onSubscriptionSplitDivergenceBlock?: (event: Event<Subscription, "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK">) => Promise<unknown> | unknown;
  onSubscriptionSplitDivergenceBlockFinished?: (event: Event<Subscription, "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK_FINISHED">) => Promise<unknown> | unknown;
}

export const webhook = (opts: WebhookOptions) =>
  createAuthEndpoint(
    "/asaas/webhook" as const,
    {
      method: "POST" as const,
      use: [],
    },
    async (ctx): Promise<{ success: boolean }> => {
      const event = ctx.body as Event<Payment | Subscription, EventType>;

      const promises = [];

      promises.push(opts.onWebhook?.(event));

      switch (event.event) {
        case "PAYMENT_CREATED": 
          promises.push(opts.onPaymentCreated?.(event as Event<Payment, "PAYMENT_CREATED">));
          break;
        case "PAYMENT_AWAITING_RISK_ANALYSIS":
          promises.push(opts.onPaymentAwaitingRiskAnalysis?.(event as Event<Payment, "PAYMENT_AWAITING_RISK_ANALYSIS">));
          break;
        case "PAYMENT_APPROVED_BY_RISK_ANALYSIS":
          promises.push(opts.onPaymentApprovedByRiskAnalysis?.(event as Event<Payment, "PAYMENT_APPROVED_BY_RISK_ANALYSIS">));
          break;
        case "PAYMENT_REPROVED_BY_RISK_ANALYSIS":
          promises.push(opts.onPaymentReprovedByRiskAnalysis?.(event as Event<Payment, "PAYMENT_REPROVED_BY_RISK_ANALYSIS">));
          break;
        case "PAYMENT_AUTHORIZED":
          promises.push(opts.onPaymentAuthorized?.(event as Event<Payment, "PAYMENT_AUTHORIZED">));
          break;
        case "PAYMENT_UPDATED":
          promises.push(opts.onPaymentUpdated?.(event as Event<Payment, "PAYMENT_UPDATED">));
          break;
        case "PAYMENT_CONFIRMED":
          promises.push(opts.onPaymentConfirmed?.(event as Event<Payment, "PAYMENT_CONFIRMED">));
          break;
        case "PAYMENT_RECEIVED":
          promises.push(opts.onPaymentReceived?.(event as Event<Payment, "PAYMENT_RECEIVED">));
          break;
        case "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED":
          promises.push(opts.onPaymentCreditCardCaptureRefused?.(event as Event<Payment, "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED">));
          break;
        case "PAYMENT_ANTICIPATED":
          promises.push(opts.onPaymentAnticipated?.(event as Event<Payment, "PAYMENT_ANTICIPATED">));
          break;
        case "PAYMENT_OVERDUE":
          promises.push(opts.onPaymentOverdue?.(event as Event<Payment, "PAYMENT_OVERDUE">));
          break;
        case "PAYMENT_DELETED":
          promises.push(opts.onPaymentDeleted?.(event as Event<Payment, "PAYMENT_DELETED">));
          break;
        case "PAYMENT_RESTORED":
          promises.push(opts.onPaymentRestored?.(event as Event<Payment, "PAYMENT_RESTORED">));
          break;
        case "PAYMENT_REFUNDED":
          promises.push(opts.onPaymentRefunded?.(event as Event<Payment, "PAYMENT_REFUNDED">));
          break;
        case "PAYMENT_PARTIALLY_REFUNDED":
          promises.push(opts.onPaymentPartiallyRefunded?.(event as Event<Payment, "PAYMENT_PARTIALLY_REFUNDED">));
          break;
        case "PAYMENT_REFUND_IN_PROGRESS":
          promises.push(opts.onPaymentRefundInProgress?.(event as Event<Payment, "PAYMENT_REFUND_IN_PROGRESS">));
          break;
        case "PAYMENT_REFUND_DENIED":
          promises.push(opts.onPaymentRefundDenied?.(event as Event<Payment, "PAYMENT_REFUND_DENIED">));
          break;
        case "PAYMENT_RECEIVED_IN_CASH_UNDONE":
          promises.push(opts.onPaymentReceivedInCashUndone?.(event as Event<Payment, "PAYMENT_RECEIVED_IN_CASH_UNDONE">));
          break;
        case "PAYMENT_CHARGEBACK_REQUESTED":
          promises.push(opts.onPaymentChargebackRequested?.(event as Event<Payment, "PAYMENT_CHARGEBACK_REQUESTED">));
          break;
        case "PAYMENT_CHARGEBACK_DISPUTE":
          promises.push(opts.onPaymentChargebackDispute?.(event as Event<Payment, "PAYMENT_CHARGEBACK_DISPUTE">));
          break;
        case "PAYMENT_AWAITING_CHARGEBACK_REVERSAL":
          promises.push(opts.onPaymentAwaitingChargebackReversal?.(event as Event<Payment, "PAYMENT_AWAITING_CHARGEBACK_REVERSAL">));
          break;
        case "PAYMENT_DUNNING_RECEIVED":
          promises.push(opts.onPaymentDunningReceived?.(event as Event<Payment, "PAYMENT_DUNNING_RECEIVED">));
          break;
        case "PAYMENT_DUNNING_REQUESTED":
          promises.push(opts.onPaymentDunningRequested?.(event as Event<Payment, "PAYMENT_DUNNING_REQUESTED">));
          break;
        case "PAYMENT_BANK_SLIP_CANCELLED":
          promises.push(opts.onPaymentBankSlipCancelled?.(event as Event<Payment, "PAYMENT_BANK_SLIP_CANCELLED">));
          break;
        case "PAYMENT_BANK_SLIP_VIEWED":
          promises.push(opts.onPaymentBankSlipViewed?.(event as Event<Payment, "PAYMENT_BANK_SLIP_VIEWED">));
          break;
        case "PAYMENT_CHECKOUT_VIEWED":
          promises.push(opts.onPaymentCheckoutViewed?.(event as Event<Payment, "PAYMENT_CHECKOUT_VIEWED">));
          break;
        case "PAYMENT_SPLIT_DIVERGENCE_BLOCK":
          promises.push(opts.onPaymentSplitDivergenceBlock?.(event as Event<Payment, "PAYMENT_SPLIT_DIVERGENCE_BLOCK">));
          break;
        case "PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED":
          promises.push(opts.onPaymentSplitDivergenceBlockFinished?.(event as Event<Payment, "PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED">));
          break;
        case "SUBSCRIPTION_CREATED":
          promises.push(opts.onSubscriptionCreated?.(event as Event<Subscription, "SUBSCRIPTION_CREATED">));
          break;
        case "SUBSCRIPTION_UPDATED":
          promises.push(opts.onSubscriptionUpdated?.(event as Event<Subscription, "SUBSCRIPTION_UPDATED">));
          break;
        case "SUBSCRIPTION_INACTIVATED":
          promises.push(opts.onSubscriptionInactivated?.(event as Event<Subscription, "SUBSCRIPTION_INACTIVATED">));
          break;
        case "SUBSCRIPTION_DELETED":
          promises.push(opts.onSubscriptionDeleted?.(event as Event<Subscription, "SUBSCRIPTION_DELETED">));
          break;
        case "SUBSCRIPTION_SPLIT_DISABLED":
          promises.push(opts.onSubscriptionSplitDisabled?.(event as Event<Subscription, "SUBSCRIPTION_SPLIT_DISABLED">));
          break;
        case "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK":
          promises.push(opts.onSubscriptionSplitDivergenceBlock?.(event as Event<Subscription, "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK">));
          break;
        case "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK_FINISHED":
          promises.push(opts.onSubscriptionSplitDivergenceBlockFinished?.(event as Event<Subscription, "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK_FINISHED">));
          break;
      }

      await Promise.all(promises.filter(Boolean));
      return ctx.json({ success: true });
    }
  );
