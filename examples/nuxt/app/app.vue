<script setup lang="ts">
import { useAuth, useSession } from '~/composables/auth'
import type { NavigationMenuItem } from '@nuxt/ui'

const auth = useAuth()
const { data: session, clear } = await useSession()

const items = computed<NavigationMenuItem[]>(() => {
  if (!session.value?.user) {
    return [
      { label: 'Login', to: '/login', icon: 'i-lucide-log-in' },
      { label: 'Register', to: '/register', icon: 'i-lucide-user-plus' },
    ]
  }

  if (session.value?.user) {
    return [
      { label: 'Payments', to: '/payments', icon: 'i-lucide-credit-card' },
      {
        label: 'Logout',
        icon: 'i-lucide-log-out',
        onSelect: async () => {
          const { error, data } = await auth.signOut()
          if (error) console.error(error)
          if (data?.success) clear()
          if (data?.success) await navigateTo('/login', { replace: true })
        },
      },
    ]
  }

  throw new Error('Invalid session')
})
</script>

<template>
  <UApp>
    <UHeader>
      <UNavigationMenu :items="items" />
    </UHeader>

    <UMain class="p-8">
      <NuxtPage />
    </UMain>
  </UApp>
</template>
