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

  user: {
    additionalFields: {
      cpfCnpj: {
        type: 'string',
        required: true,
        input: true,
      },
    },
  },

  plugins: [
    asaas({
      apiKey: process.env.ASAAS_API_KEY!,
      sandbox: process.env.ASAAS_SANDBOX !== 'false',
    }),
    nextCookies(), // must be last
  ],
})
