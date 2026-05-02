<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { authClient } from '~/utils/auth-client'

defineProps<{ collapsed?: boolean }>()

const user = ref<{ name: string; email: string } | null>(null)

onMounted(async () => {
  const { data: session } = await authClient.getSession()
  user.value = session?.user ?? null
})

const items = computed<DropdownMenuItem[][]>(() => [[{
  type: 'label',
  label: user.value?.name ?? '...',
  description: user.value?.email
}], [{
  label: 'Sair',
  icon: 'i-lucide-log-out',
  onSelect: async () => {
    await authClient.signOut()
    await navigateTo('/login')
  }
}]])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      :label="collapsed ? undefined : (user?.name ?? '...')"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{ trailingIcon: 'text-dimmed' }"
    />
  </UDropdownMenu>
</template>
