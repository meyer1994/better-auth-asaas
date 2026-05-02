import { createAuthClient } from 'better-auth/client'
import { asaasClient } from 'better-auth-asaas/client'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from '~/server/utils/auth'

export const authClient = createAuthClient({
  plugins: [
    asaasClient(),
    inferAdditionalFields<typeof auth>()
  ]
})
