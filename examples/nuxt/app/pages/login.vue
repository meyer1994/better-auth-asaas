<script setup lang="ts">
import { z } from 'zod'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

const auth = useAuth()
const toast = useToast()

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

const fields: AuthFormField[] = [
  { name: 'email', type: 'email', label: 'Email', required: true },
  { name: 'password', type: 'password', label: 'Password', required: true },
]
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        title="Login"
        description="Sign in to your account."
        icon="i-lucide-log-in"
        :fields="fields"
        :schema="schema"
        @submit="async (event: FormSubmitEvent<z.infer<typeof schema>>) => {
          const { error, data } = await auth.signIn.email(event.data)
          if (error) console.error(error)
          if (error) toast.add({ title: 'Sign-in failed', description: error.message, color: 'error' })
          if (data) await reloadNuxtApp({ path: '/payments' })
        }"
      >
        <template #footer>
          <div>
            Don't have an account?
            <ULink
              to="/register"
              class="text-primary font-medium"
              label="Register"
            />
          </div>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
