import { asaasClient } from '@meyer1994/better-auth-asaas/client'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'
import type { auth as AuthInstance } from '~~/server/utils/auth'

type Auth = typeof AuthInstance

export default defineNuxtPlugin(() => {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

  const client = createAuthClient({
    baseURL: url.origin,
    fetchOptions: { headers },
    plugins: [
      asaasClient(),
      inferAdditionalFields<Auth>(),
    ],
  })

  type SessionData = NonNullable<Awaited<ReturnType<typeof client.getSession>>['data']>

  const useSession = () => {
    return useAsyncData<SessionData | null>('auth-session', async () => {
      const { data, error } = await client.getSession()
      if (error) throw createError(error)
      if (!data?.session || !data?.user) return null
      return data
    })
  }

  return {
    provide: {
      auth: {
        signIn: client.signIn,
        signUp: client.signUp,
        signOut: client.signOut,
        asaas: client.asaas,
        useSession,
      },
    },
  }
})
