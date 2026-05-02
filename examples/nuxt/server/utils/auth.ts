import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { asaas, charge, webhooks } from 'better-auth-asaas'
import { db } from '../db'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',

  database: drizzleAdapter(db, { provider: 'sqlite' }),

  emailAndPassword: { enabled: true },

  user: {
    additionalFields: {
      cpfCnpj: {
        type: 'string',
        required: true,
        input: true
      }
      // asaasCustomerId is registered internally by the asaas plugin — do not redeclare here
    }
  },

  plugins: [
    asaas({
      apiKey: process.env.ASAAS_API_KEY!,
      sandbox: process.env.ASAAS_SANDBOX !== 'false',
      createCustomerOnSignUp: true,
      getCustomerCreateParams: async ({ user }) => ({
        cpfCnpj: (user as any).cpfCnpj as string
      }),
      onCustomerCreate: async ({ asaasCustomer, user }) => {
        console.log('[asaas] customer created', asaasCustomer.id, 'for user', user.email)
      },
      use: [
        charge({
          onPaymentReceived: async ({ payment, user }) => {
            console.log('[webhook] PAYMENT_RECEIVED', payment.id, user?.email)
          },
          onPaymentOverdue: async ({ payment, user }) => {
            console.log('[webhook] PAYMENT_OVERDUE', payment.id, user?.email)
          },
          onPaymentDeleted: async ({ payment, user }) => {
            console.log('[webhook] PAYMENT_DELETED', payment.id, user?.email)
          }
        }),
        webhooks({
          accessToken: process.env.ASAAS_WEBHOOK_ACCESS_TOKEN!
        })
      ]
    })
  ]
})
