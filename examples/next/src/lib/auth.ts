import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { asaas } from 'better-auth-asaas'
import { db } from './db'
import * as schema from './db/schema'


export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',

  database: drizzleAdapter(db, { provider: 'sqlite', schema, debugLogs: true }),

  emailAndPassword: { enabled: true },

  plugins: [
    asaas({
      apiKey: process.env.ASAAS_API_KEY!,
      sandbox: process.env.ASAAS_SANDBOX !== 'false',

      onWebhook: e => console.log('Webhook received', e),

      onPaymentCreated: e => console.log('Payment created', e.payment.id),
      onPaymentReceived: e => console.log('Payment received', e.payment.id),
      onPaymentUpdated: e => console.log('Payment updated', e.payment.id),
      onPaymentConfirmed: e => console.log('Payment confirmed', e.payment.id),
      onPaymentAuthorized: e => console.log('Payment authorized', e.payment.id),
      onPaymentAnticipated: e => console.log('Payment anticipated', e.payment.id),
      onPaymentOverdue: e => console.log('Payment overdue', e.payment.id),
      onPaymentDeleted: e => console.log('Payment deleted', e.payment.id),
      onPaymentRestored: e => console.log('Payment restored', e.payment.id),
      onPaymentRefunded: e => console.log('Payment refunded', e.payment.id),
      onPaymentPartiallyRefunded: e => console.log('Payment partially refunded', e.payment.id),
      onPaymentRefundInProgress: e => console.log('Payment refund in progress', e.payment.id),
      onPaymentRefundDenied: e => console.log('Payment refund denied', e.payment.id),
      onPaymentReceivedInCashUndone: e => console.log('Payment received in cash undone', e.payment.id),
      onPaymentChargebackRequested: e => console.log('Payment chargeback requested', e.payment.id),
      onPaymentChargebackDispute: e => console.log('Payment chargeback dispute', e.payment.id),
      onPaymentDunningRequested: e => console.log('Payment dunning requested', e.payment.id),
      onPaymentBankSlipCancelled: e => console.log('Payment bank slip cancelled', e.payment.id),
      onPaymentBankSlipViewed: e => console.log('Payment bank slip viewed', e.payment.id),
      onPaymentCheckoutViewed: e => console.log('Payment checkout viewed', e.payment.id),
      onPaymentSplitDivergenceBlock: e => console.log('Payment split divergence block', e.payment.id),
      onPaymentSplitDivergenceBlockFinished: e => console.log('Payment split divergence block finished', e.payment.id),

      onSubscriptionCreated: e => console.log('Subscription created', e.subscription.id),
      onSubscriptionUpdated: e => console.log('Subscription updated', e.subscription.id),
      onSubscriptionInactivated: e => console.log('Subscription inactivated', e.subscription.id),
      onSubscriptionDeleted: e => console.log('Subscription deleted', e.subscription.id),
      onSubscriptionSplitDisabled: e => console.log('Subscription split disabled', e.subscription.id),
      onSubscriptionSplitDivergenceBlock: e => console.log('Subscription split divergence block', e.subscription.id),
      onSubscriptionSplitDivergenceBlockFinished: e => console.log('Subscription split divergence block finished', e.subscription.id),
    }),

    nextCookies(), // must be last
  ],
})
