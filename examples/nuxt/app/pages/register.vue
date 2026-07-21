<script setup lang="ts">
import { z } from 'zod'
import type { AuthFormField } from '@nuxt/ui'

const { $auth } = useNuxtApp()
const toast = useToast()

const schema = z.object({
  name: z.string().optional(),
  cpfCnpj: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
})

const fields: AuthFormField[] = [
  { name: 'name', type: 'text', label: 'Name', placeholder: 'Jane Doe', required: true },
  { name: 'cpfCnpj', type: 'text', label: 'CPF/CNPJ', placeholder: '12345678901', required: true },
  { name: 'email', type: 'email', label: 'Email', placeholder: 'you@example.com', required: true },
  { name: 'password', type: 'password', label: 'Password', placeholder: '••••••••', required: true },
]

async function onSubmit(payload: { data: z.infer<typeof schema> }) {
  const { error, data } = await $auth.signUp.email({
    name: payload.data.name || payload.data.email,
    email: payload.data.email,
    password: payload.data.password,
    cpfCnpj: payload.data.cpfCnpj,
  })
  if (error) console.error(error)
  if (error) toast.add({ title: 'Sign-up failed', description: error.message, color: 'error' })
  if (data) await reloadNuxtApp({ path: '/payments' })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        title="Create an account"
        description="Sign up to get started."
        icon="i-lucide-user-plus"
        :fields="fields"
        :schema="schema"
        @submit="onSubmit"
      >
        <template #footer>
          Already have an account?
          <ULink
            to="/login"
            class="text-primary font-medium"
          >Login</ULink>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
