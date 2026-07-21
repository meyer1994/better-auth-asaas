import type { BetterAuthPlugin } from "better-auth";
import { AsaasClient } from "./asaas";
import { createPayment, createSubscription, getQrCode, listPayments, listSubscriptions } from "./endpoints";
import { userAfterCreate } from "./hooks";
import { webhook, type WebhookOptions } from "./webhooks";


type Options = Omit<WebhookOptions, "client"> & {
  apiKey: string;
  sandbox?: boolean;
};

export const asaas = <O extends Options>(options: O) => {
  const client = new AsaasClient(options);

  return {
    id: "asaas" as const,

    endpoints: {
      createpayment: createPayment(client),
      listpayments: listPayments(client),
      qrPayment: getQrCode(client),
      createsubscription: createSubscription(client),
      listsubscriptions: listSubscriptions(client),

      webhook: webhook({
        client,
        
        onWebhook: options.onWebhook,
        
        onPaymentCreated: options.onPaymentCreated,
        onPaymentAwaitingRiskAnalysis: options.onPaymentAwaitingRiskAnalysis,
        onPaymentApprovedByRiskAnalysis: options.onPaymentApprovedByRiskAnalysis,
        onPaymentReprovedByRiskAnalysis: options.onPaymentReprovedByRiskAnalysis,
        onPaymentAuthorized: options.onPaymentAuthorized,
        onPaymentUpdated: options.onPaymentUpdated,
        onPaymentConfirmed: options.onPaymentConfirmed,
        onPaymentReceived: options.onPaymentReceived,
        onPaymentCreditCardCaptureRefused: options.onPaymentCreditCardCaptureRefused,
        onPaymentAnticipated: options.onPaymentAnticipated,
        onPaymentOverdue: options.onPaymentOverdue,
        onPaymentDeleted: options.onPaymentDeleted,
        onPaymentRestored: options.onPaymentRestored,
        onPaymentRefunded: options.onPaymentRefunded,
        onPaymentPartiallyRefunded: options.onPaymentPartiallyRefunded,
        onPaymentRefundInProgress: options.onPaymentRefundInProgress,
        onPaymentRefundDenied: options.onPaymentRefundDenied,
        onPaymentReceivedInCashUndone: options.onPaymentReceivedInCashUndone,
        onPaymentChargebackRequested: options.onPaymentChargebackRequested,
        onPaymentChargebackDispute: options.onPaymentChargebackDispute,
        onPaymentAwaitingChargebackReversal: options.onPaymentAwaitingChargebackReversal,
        onPaymentDunningReceived: options.onPaymentDunningReceived,
        onPaymentDunningRequested: options.onPaymentDunningRequested,
        onPaymentBankSlipCancelled: options.onPaymentBankSlipCancelled,
        onPaymentBankSlipViewed: options.onPaymentBankSlipViewed,
        onPaymentCheckoutViewed: options.onPaymentCheckoutViewed,
        onPaymentSplitDivergenceBlock: options.onPaymentSplitDivergenceBlock,
        onPaymentSplitDivergenceBlockFinished: options.onPaymentSplitDivergenceBlockFinished,

        onSubscriptionCreated: options.onSubscriptionCreated,
        onSubscriptionUpdated: options.onSubscriptionUpdated,
        onSubscriptionInactivated: options.onSubscriptionInactivated,
        onSubscriptionDeleted: options.onSubscriptionDeleted,
        onSubscriptionSplitDisabled: options.onSubscriptionSplitDisabled,
        onSubscriptionSplitDivergenceBlock: options.onSubscriptionSplitDivergenceBlock,
        onSubscriptionSplitDivergenceBlockFinished: options.onSubscriptionSplitDivergenceBlockFinished,
      }),
    },

    init: () => ({
      options: {
        databaseHooks: {
          user: {
            create: {
              after: (user, ctx) => userAfterCreate({ user, client, ctx }),
            },
          },
        },
      },
    }),

    schema: {
      user: {
        fields: {
          asaasCustomerId: {
            type: 'string',
            required: false,
            input: false,
          },
          cpfCnpj: {
            type: 'string',
            required: true,
            input: true,
          },
        },
      },
    },
  } satisfies BetterAuthPlugin;
};
