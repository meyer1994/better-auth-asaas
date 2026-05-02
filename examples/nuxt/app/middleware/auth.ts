import { authClient } from '~/utils/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return

  const { data: session } = await authClient.getSession()
  if (!session?.user) {
    return navigateTo('/login')
  }
})
