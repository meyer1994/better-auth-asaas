declare module '#app' {
  interface PageMeta {
    auth?: boolean
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    auth?: boolean
  }
}

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.client) {
    console.info(`[client.middleware.auth.global] from ${from.path} to ${to.path}`)
  }

  if (import.meta.server) {
    console.info(`[server.middleware.auth.global] from ${from.path} to ${to.path}`)
  }

  const { data: session } = await useSession()

  // skip if not protected route
  if (!to.meta.auth) return
  // abort if not logged in (404)
  if (!session.value) return navigateTo('/login')
})
