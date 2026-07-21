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


type RateLimitRuleOptions = {
  max?: number;
  window?: number;
};

type Options = Omit<WebhookOptions, "client"> & {
  apiKey: string;
  sandbox?: boolean;
  rateLimit?: {
    webhook?: RateLimitRuleOptions;
    api?: RateLimitRuleOptions;
  };
};

export const asaas = <O extends Options>(options: O) => {
  const client = new AsaasClient(options);

  return {
    id: "asaas" as const,

    endpoints: {
      createPayment: createPayment(client),
      createPaymentWithCreditCard: createPaymentWithCreditCard(client),
      listPayments: listPayments(client),
      getPayment: getPayment(client),
      getPaymentStatus: getPaymentStatus(client),
      getPaymentIdentificationField: getPaymentIdentificationField(client),
      getPaymentBillingInfo: getPaymentBillingInfo(client),
      getPaymentViewingInfo: getPaymentViewingInfo(client),
      getPaymentQrCode: getQrCode(client),
      payWithCard: payWithCard(client),
      payWithCreditCard: payWithCreditCard(client),

      createSubscription: createSubscription(client),
      createSubscriptionWithCreditCard: createSubscriptionWithCreditCard(client),
      listSubscriptions: listSubscriptions(client),
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

    rateLimit: [
      {
        pathMatcher: (path) => path === "/asaas/webhook",
        max: options.rateLimit?.webhook?.max ?? 100,
        window: options.rateLimit?.webhook?.window ?? 60,
      },
      {
        pathMatcher: (path) =>
          path.startsWith("/asaas/payments/") || path.startsWith("/asaas/subscriptions/"),
        max: options.rateLimit?.api?.max ?? 30,
        window: options.rateLimit?.api?.window ?? 60,
      },
    ],

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
            type: "string",
            required: false,
            input: false,
          },
          cpfCnpj: {
            type: "string",
            required: true,
            input: true,
          },
        },
      },
      asaasPayment: {
        fields: {
          userId: {
            type: "string",
            required: true,
            references: {
              model: "user",
              field: "id",
              onDelete: "cascade",
            },
          },
          asaasPaymentId: {
            type: "string",
            required: true,
            unique: true,
          },
          asaasCustomerId: {
            type: "string",
            required: true,
          },
          asaasSubscriptionId: {
            type: "string",
            required: false,
          },
          status: {
            type: "string",
            required: true,
          },
          billingType: {
            type: "string",
            required: true,
          },
          value: {
            type: "string",
            required: true,
          },
          dueDate: {
            type: "string",
            required: true,
          },
          paymentDate: {
            type: "string",
            required: false,
          },
          description: {
            type: "string",
            required: false,
          },
          deleted: {
            type: "boolean",
            required: true,
            defaultValue: false,
          },
          createdAt: {
            type: "date",
            required: true,
          },
          updatedAt: {
            type: "date",
            required: true,
          },
        },
      },
      asaasSubscription: {
        fields: {
          userId: {
            type: "string",
            required: true,
            references: {
              model: "user",
              field: "id",
              onDelete: "cascade",
            },
          },
          asaasSubscriptionId: {
            type: "string",
            required: true,
            unique: true,
          },
          asaasCustomerId: {
            type: "string",
            required: true,
          },
          status: {
            type: "string",
            required: true,
          },
          billingType: {
            type: "string",
            required: true,
          },
          cycle: {
            type: "string",
            required: true,
          },
          value: {
            type: "string",
            required: true,
          },
          nextDueDate: {
            type: "string",
            required: true,
          },
          endDate: {
            type: "string",
            required: false,
          },
          description: {
            type: "string",
            required: false,
          },
          deleted: {
            type: "boolean",
            required: true,
            defaultValue: false,
          },
          createdAt: {
            type: "date",
            required: true,
          },
          updatedAt: {
            type: "date",
            required: true,
          },
        },
      },
    },
  } satisfies BetterAuthPlugin;
};
