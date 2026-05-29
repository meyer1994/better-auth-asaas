import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import { asaasClient } from 'better-auth-asaas/client'
import type { auth } from './auth'

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    asaasClient(),
  ],
})

export const { useSession, signIn, signUp, signOut } = authClient
