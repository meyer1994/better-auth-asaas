import type { BetterAuthPlugin } from "better-auth";
import { AsaasClient } from "./asaas";
import {
  createPayment,
  createPaymentWithCreditCard,
  createSubscription,
  createSubscriptionWithCreditCard,
  deleteSubscription,
  getPayment,
  getPaymentBillingInfo,
  getPaymentIdentificationField,
  getPaymentStatus,
  getPaymentViewingInfo,
  getQrCode,
  getSubscription,
  getSubscriptionPaymentBook,
  listPayments,
  listSubscriptionPayments,
  listSubscriptions,
  payWithCard,
  payWithCreditCard,
  updateSubscription,
  updateSubscriptionCreditCard,
} from "./endpoints";
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
      createPaymentWithCreditCard: createPaymentWithCreditCard(client),
      listpayments: listPayments(client),
      getPayment: getPayment(client),
      getPaymentStatus: getPaymentStatus(client),
      getPaymentIdentificationField: getPaymentIdentificationField(client),
      getPaymentBillingInfo: getPaymentBillingInfo(client),
      getPaymentViewingInfo: getPaymentViewingInfo(client),
      qrPayment: getQrCode(client),
      payWithCard: payWithCard(client),
      payWithCreditCard: payWithCreditCard(client),

      createsubscription: createSubscription(client),
      createSubscriptionWithCreditCard: createSubscriptionWithCreditCard(client),
      listsubscriptions: listSubscriptions(client),
      getSubscription: getSubscription(client),
      updateSubscription: updateSubscription(client),
      updateSubscriptionCreditCard: updateSubscriptionCreditCard(client),
      deleteSubscription: deleteSubscription(client),
      listSubscriptionPayments: listSubscriptionPayments(client),
      getSubscriptionPaymentBook: getSubscriptionPaymentBook(client),

      webhook: webhook({
        client,
        webhookAccessToken: options.webhookAccessToken,

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
