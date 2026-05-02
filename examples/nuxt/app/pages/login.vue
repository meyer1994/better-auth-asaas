<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { authClient } from '~/utils/auth-client'

definePageMeta({ layout: false })

const tab = ref('login')
const error = ref<string | null>(null)

// ── Login ──────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres')
})
type LoginSchema = z.output<typeof loginSchema>

const loginState = reactive<Partial<LoginSchema>>({ email: '', password: '' })

async function onLogin(event: FormSubmitEvent<LoginSchema>) {
  error.value = null
  const { error: err } = await authClient.signIn.email({
    email: event.data.email,
    password: event.data.password
  })
  if (err) { error.value = err.message ?? 'Erro ao entrar.'; return }
  await navigateTo('/')
}

// ── Register ───────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido').max(14),
  password: z.string().min(8, 'Mínimo 8 caracteres')
})
type RegisterSchema = z.output<typeof registerSchema>

const registerState = reactive<Partial<RegisterSchema>>({
  name: '', email: '', cpfCnpj: '', password: ''
})

async function onRegister(event: FormSubmitEvent<RegisterSchema>) {
  error.value = null
  const { error: err } = await authClient.signUp.email({
    name: event.data.name,
    email: event.data.email,
    password: event.data.password,
    data: { cpfCnpj: event.data.cpfCnpj }
  })
  if (err) { error.value = err.message ?? 'Erro ao criar conta.'; return }
  await navigateTo('/')
}
</script>

<template>
  <UApp>
    <div class="min-h-screen flex items-center justify-center p-4">
      <UCard class="w-full max-w-sm">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-zap" class="text-primary size-5" />
            <span class="font-semibold">Asaas Example</span>
          </div>
        </template>

        <UTabs v-model="tab" :items="[{ label: 'Entrar', value: 'login' }, { label: 'Criar conta', value: 'register' }]" class="mb-4" />

        <UAlert v-if="error" color="error" :description="error" class="mb-4" />

        <!-- Login tab -->
        <UForm v-if="tab === 'login'" :schema="loginSchema" :state="loginState" @submit="onLogin" class="space-y-4">
          <UFormField label="E-mail" name="email">
            <UInput v-model="loginState.email" type="email" placeholder="voce@exemplo.com" class="w-full" />
          </UFormField>
          <UFormField label="Senha" name="password">
            <UInput v-model="loginState.password" type="password" placeholder="••••••••" class="w-full" />
          </UFormField>
          <UButton type="submit" block>Entrar</UButton>
        </UForm>

        <!-- Register tab -->
        <UForm v-else :schema="registerSchema" :state="registerState" @submit="onRegister" class="space-y-4">
          <UFormField label="Nome" name="name">
            <UInput v-model="registerState.name" placeholder="Seu nome" class="w-full" />
          </UFormField>
          <UFormField label="E-mail" name="email">
            <UInput v-model="registerState.email" type="email" placeholder="voce@exemplo.com" class="w-full" />
          </UFormField>
          <UFormField label="CPF / CNPJ" name="cpfCnpj">
            <UInput v-model="registerState.cpfCnpj" placeholder="00000000000" class="w-full" />
          </UFormField>
          <UFormField label="Senha" name="password">
            <UInput v-model="registerState.password" type="password" placeholder="••••••••" class="w-full" />
          </UFormField>
          <UButton type="submit" block>Criar conta</UButton>
        </UForm>
      </UCard>
    </div>
  </UApp>
</template>
