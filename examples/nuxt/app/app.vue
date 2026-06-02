<script setup lang="ts">
import { useAuth, useSession } from '~/composables/auth'
import type { NavigationMenuItem } from '@nuxt/ui'

const auth = useAuth()
const { data: session, clear } = await useSession()

const items = computed<NavigationMenuItem[]>(() => {
  if (!session.value) {
    return [
      { label: 'Login', to: '/login', icon: 'i-lucide-log-in' },
      { label: 'Register', to: '/register', icon: 'i-lucide-user-plus' },
    ]
  }

  return [
    { label: 'Payments', to: '/payments', icon: 'i-lucide-credit-card' },
    { label: 'Subscriptions', to: '/subscriptions', icon: 'i-lucide-repeat' },
  ]
})

async function signOut() {
  const { error, data } = await auth.signOut()
  if (error) console.error(error)
  if (data?.success) clear()
  if (data?.success) await navigateTo('/login', { replace: true })
}
</script>

<template>
  <UApp>
    <UHeader>
      <div class="flex w-full items-center justify-between gap-4">
        <UNavigationMenu :items="items" />
        <UButton
          v-if="session?.user"
          label="Logout"
          icon="i-lucide-log-out"
          variant="ghost"
          @click="signOut"
        />
      </div>
    </UHeader>

    <UMain class="p-8">
      <NuxtPage />
    </UMain>
  </UApp>
</template>
