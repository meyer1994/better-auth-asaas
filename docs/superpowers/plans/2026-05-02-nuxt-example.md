# Nuxt Example Project Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working Nuxt 4 + Nuxt UI example app at `examples/nuxt/` that demonstrates all `better-auth-asaas` features: email/password sign-up with automatic Asaas customer creation, PIX charge creation, charge listing, charge detail with QR code, and a webhook endpoint.

**Architecture:** Bootstrap from `nuxt-ui-templates/dashboard` (via degit), strip demo pages/components, wire in Better Auth with the `asaas` plugin, Drizzle ORM over SQLite, and add four pages (login, charges list, create charge, charge detail). `better-auth-asaas` is referenced as a `workspace:*` dep so the example always consumes the local build.

**Tech Stack:** Nuxt 4, Nuxt UI 4, Better Auth, `@better-auth/drizzle-adapter`, `drizzle-orm` + `better-sqlite3`, `better-auth-asaas` (workspace), Zod 4

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `pnpm-workspace.yaml` (repo root) | Create | Declare workspace packages |
| `examples/nuxt/` | Scaffold | Cloned from dashboard template |
| `examples/nuxt/package.json` | Modify | Add deps, remove unused ones, add `db:push` script |
| `examples/nuxt/nuxt.config.ts` | Modify | Keep modules, remove irrelevant routeRules |
| `examples/nuxt/app/app.vue` | Modify | Simplified SEO meta |
| `examples/nuxt/app/layouts/default.vue` | Modify | Update nav links, remove TeamsMenu/search/notifications |
| `examples/nuxt/app/composables/useDashboard.ts` | Modify | Update keyboard shortcuts |
| `examples/nuxt/app/components/UserMenu.vue` | Modify | Wire to real session + sign-out |
| `examples/nuxt/app/pages/index.vue` | Replace | Charges list with UTable |
| `examples/nuxt/app/pages/login.vue` | Create | Login + register tabs, no sidebar layout |
| `examples/nuxt/app/pages/charges/new.vue` | Create | Create charge form |
| `examples/nuxt/app/pages/charges/[id].vue` | Create | Charge detail + PIX QR code |
| `examples/nuxt/app/middleware/auth.ts` | Create | Redirect unauthenticated users to /login |
| `examples/nuxt/app/composables/useAsaasClient.ts` | Create | Thin wrappers around $fetch for asaas endpoints |
| `examples/nuxt/server/utils/auth.ts` | Create | Better Auth server config (server-only) |
| `examples/nuxt/server/db/index.ts` | Create | Drizzle db instance |
| `examples/nuxt/server/db/schema.ts` | Create | Better Auth tables + cpfCnpj + asaasCustomerId |
| `examples/nuxt/server/api/auth/[...all].ts` | Create | Better Auth catch-all route handler |
| `examples/nuxt/drizzle.config.ts` | Create | Points drizzle-kit at sqlite.db + schema |
| `examples/nuxt/.env.example` | Create | Template env vars |
| `examples/nuxt/README.md` | Create | Setup instructions |

**Delete** (template demo content):
- `app/pages/customers.vue`, `app/pages/inbox.vue`, `app/pages/settings.vue`, `app/pages/settings/`
- `server/api/customers.ts`, `server/api/mails.ts`, `server/api/members.ts`, `server/api/notifications.ts`
- `app/components/customers/`, `app/components/home/`, `app/components/inbox/`, `app/components/settings/`
- `app/components/TeamsMenu.vue`, `app/components/NotificationsSlideover.vue`
- `app/utils/index.ts`, `app/types/index.d.ts` (demo-specific)

---

## Task 1: Create pnpm workspace and scaffold example from template

**Files:**
- Create: `pnpm-workspace.yaml` (repo root)
- Create: `examples/nuxt/` (via degit)

- [ ] **Step 1: Create the pnpm workspace file at the repo root**

  ```yaml
  # /home/meyer/prjs/asaas/pnpm-workspace.yaml
  packages:
    - '.'
    - 'examples/*'
  ```

- [ ] **Step 2: Scaffold the dashboard template into examples/nuxt/**

  Run from `/home/meyer/prjs/asaas/`:
  ```bash
  pnpm dlx degit nuxt-ui-templates/dashboard examples/nuxt
  ```

  Expected: `examples/nuxt/` created with the template's files.

- [ ] **Step 3: Commit**

  ```bash
  git add pnpm-workspace.yaml examples/nuxt
  git commit -m "chore: add pnpm workspace and scaffold nuxt example"
  ```

---

## Task 2: Update package.json and install dependencies

**Files:**
- Modify: `examples/nuxt/package.json`

- [ ] **Step 1: Replace examples/nuxt/package.json**

  ```json
  {
    "name": "better-auth-asaas-example-nuxt",
    "private": true,
    "type": "module",
    "scripts": {
      "build": "nuxt build",
      "dev": "nuxt dev",
      "preview": "nuxt preview",
      "postinstall": "nuxt prepare",
      "typecheck": "nuxt typecheck",
      "db:push": "drizzle-kit push"
    },
    "dependencies": {
      "@better-auth/drizzle-adapter": "latest",
      "@iconify-json/lucide": "^1.2.104",
      "@iconify-json/simple-icons": "^1.2.80",
      "@nuxt/ui": "^4.7.0",
      "@tanstack/table-core": "^8.21.3",
      "@vueuse/core": "^14.2.1",
      "@vueuse/nuxt": "^14.2.1",
      "better-auth": "^1.6.9",
      "better-auth-asaas": "workspace:*",
      "better-sqlite3": "latest",
      "drizzle-orm": "latest",
      "nuxt": "^4.4.2",
      "tailwindcss": "^4.2.4",
      "vue": "^3.5.33",
      "zod": "^4.3.6"
    },
    "devDependencies": {
      "@nuxt/eslint": "^1.15.2",
      "@types/better-sqlite3": "latest",
      "drizzle-kit": "latest",
      "eslint": "^10.2.1",
      "typescript": "^6.0.3",
      "vue-tsc": "^3.2.7"
    },
    "packageManager": "pnpm@10.33.2"
  }
  ```

- [ ] **Step 2: Build the root package first (so workspace:* resolves)**

  Run from `/home/meyer/prjs/asaas/`:
  ```bash
  pnpm build
  ```

- [ ] **Step 3: Install all workspace deps**

  Run from `/home/meyer/prjs/asaas/`:
  ```bash
  pnpm install
  ```

  Expected: `node_modules` populated in `examples/nuxt/`, `better-auth-asaas` linked from local `dist/`.

- [ ] **Step 4: Commit**

  ```bash
  git add examples/nuxt/package.json pnpm-lock.yaml pnpm-workspace.yaml
  git commit -m "chore(example): configure package.json and workspace deps"
  ```

---

## Task 3: Clean up template demo content

**Files:** Delete multiple template files, modify `nuxt.config.ts` and `app/app.vue`

- [ ] **Step 1: Delete demo pages**

  ```bash
  rm examples/nuxt/app/pages/customers.vue
  rm examples/nuxt/app/pages/inbox.vue
  rm examples/nuxt/app/pages/settings.vue
  rm -rf examples/nuxt/app/pages/settings
  ```

- [ ] **Step 2: Delete demo server API routes**

  ```bash
  rm examples/nuxt/server/api/customers.ts
  rm examples/nuxt/server/api/mails.ts
  rm examples/nuxt/server/api/members.ts
  rm examples/nuxt/server/api/notifications.ts
  ```

- [ ] **Step 3: Delete demo components**

  ```bash
  rm -rf examples/nuxt/app/components/customers
  rm -rf examples/nuxt/app/components/home
  rm -rf examples/nuxt/app/components/inbox
  rm -rf examples/nuxt/app/components/settings
  rm examples/nuxt/app/components/TeamsMenu.vue
  rm examples/nuxt/app/components/NotificationsSlideover.vue
  ```

- [ ] **Step 4: Delete demo-specific type/util files**

  ```bash
  rm examples/nuxt/app/utils/index.ts
  rm examples/nuxt/app/types/index.d.ts
  ```

- [ ] **Step 5: Update nuxt.config.ts**

  ```ts
  // examples/nuxt/nuxt.config.ts
  export default defineNuxtConfig({
    modules: [
      '@nuxt/eslint',
      '@nuxt/ui',
      '@vueuse/nuxt'
    ],

    devtools: { enabled: true },

    css: ['~/assets/css/main.css'],

    compatibilityDate: '2024-07-11',

    eslint: {
      config: {
        stylistic: {
          commaDangle: 'never',
          braceStyle: '1tbs'
        }
      }
    }
  })
  ```

- [ ] **Step 6: Update app/app.vue**

  ```vue
  <!-- examples/nuxt/app/app.vue -->
  <script setup lang="ts">
  const colorMode = useColorMode()
  const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

  useHead({
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { key: 'theme-color', name: 'theme-color', content: color }
    ],
    link: [{ rel: 'icon', href: '/favicon.ico' }],
    htmlAttrs: { lang: 'pt-BR' }
  })

  useSeoMeta({
    title: 'better-auth-asaas example',
    description: 'Nuxt example for better-auth-asaas: PIX charges with Better Auth.'
  })
  </script>

  <template>
    <UApp>
      <NuxtLoadingIndicator />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </template>
  ```

- [ ] **Step 7: Commit**

  ```bash
  git add examples/nuxt
  git commit -m "chore(example): strip template demo content"
  ```

---

## Task 4: Drizzle config + database instance

**Files:**
- Create: `examples/nuxt/drizzle.config.ts`
- Create: `examples/nuxt/server/db/index.ts`

- [ ] **Step 1: Create drizzle.config.ts**

  ```ts
  // examples/nuxt/drizzle.config.ts
  import { defineConfig } from 'drizzle-kit'

  export default defineConfig({
    schema: './server/db/schema.ts',
    out: './server/db/migrations',
    dialect: 'sqlite',
    dbCredentials: {
      url: './sqlite.db'
    }
  })
  ```

- [ ] **Step 2: Create server/db/index.ts**

  ```ts
  // examples/nuxt/server/db/index.ts
  import Database from 'better-sqlite3'
  import { drizzle } from 'drizzle-orm/better-sqlite3'

  const sqlite = new Database('./sqlite.db')
  export const db = drizzle(sqlite)
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add examples/nuxt/drizzle.config.ts examples/nuxt/server/db/index.ts
  git commit -m "feat(example): add Drizzle config and SQLite db instance"
  ```

---

## Task 5: Better Auth server config

**Files:**
- Create: `examples/nuxt/server/utils/auth.ts`

- [ ] **Step 1: Create server/utils/auth.ts**

  ```ts
  // examples/nuxt/server/utils/auth.ts
  import { betterAuth } from 'better-auth'
  import { drizzleAdapter } from '@better-auth/drizzle-adapter'
  import { asaas, charge, webhooks } from 'better-auth-asaas'
  import { db } from '../db'

  export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',

    database: drizzleAdapter(db, { provider: 'sqlite' }),

    emailAndPassword: { enabled: true },

    user: {
      additionalFields: {
        cpfCnpj: {
          type: 'string',
          required: true,
          input: true
        }
        // asaasCustomerId is registered internally by the asaas plugin — do not redeclare here
      }
    },

    plugins: [
      asaas({
        apiKey: process.env.ASAAS_API_KEY!,
        sandbox: process.env.ASAAS_SANDBOX !== 'false',
        createCustomerOnSignUp: true,
        getCustomerCreateParams: async ({ user }) => ({
          cpfCnpj: (user as any).cpfCnpj as string
        }),
        onCustomerCreate: async ({ asaasCustomer, user }) => {
          console.log('[asaas] customer created', asaasCustomer.id, 'for user', user.email)
        },
        use: [
          charge({
            onPaymentReceived: async ({ payment, user }) => {
              console.log('[webhook] PAYMENT_RECEIVED', payment.id, user?.email)
            },
            onPaymentOverdue: async ({ payment, user }) => {
              console.log('[webhook] PAYMENT_OVERDUE', payment.id, user?.email)
            },
            onPaymentDeleted: async ({ payment, user }) => {
              console.log('[webhook] PAYMENT_DELETED', payment.id, user?.email)
            }
          }),
          webhooks({
            accessToken: process.env.ASAAS_WEBHOOK_ACCESS_TOKEN!
          })
        ]
      })
    ]
  })
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add examples/nuxt/server/utils/auth.ts
  git commit -m "feat(example): add Better Auth server config with asaas plugin"
  ```

---

## Task 6: Create database schema and push to SQLite

**Files:**
- Create: `examples/nuxt/server/db/schema.ts`
- Create: `examples/nuxt/.env` (local only, not committed)

- [ ] **Step 1: Create the .env file (not committed)**

  ```bash
  cp examples/nuxt/.env.example examples/nuxt/.env
  # Fill in real values:
  # ASAAS_API_KEY=your_sandbox_key
  # ASAAS_SANDBOX=true
  # ASAAS_WEBHOOK_ACCESS_TOKEN=any_string_for_local
  # BETTER_AUTH_SECRET=a_random_32char_string
  # BETTER_AUTH_URL=http://localhost:3000
  ```

  Note: `.env.example` is created in Task 15. For now create `.env` manually.

- [ ] **Step 2: Create server/db/schema.ts**

  ```ts
  // examples/nuxt/server/db/schema.ts
  import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

  export const user = sqliteTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
    image: text('image'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    cpfCnpj: text('cpf_cnpj').notNull(),
    asaasCustomerId: text('asaas_customer_id')
  })

  export const session = sqliteTable('session', {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
  })

  export const account = sqliteTable('account', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
  })

  export const verification = sqliteTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
  })
  ```

- [ ] **Step 3: Push schema to SQLite**

  Run from `examples/nuxt/`:
  ```bash
  cd examples/nuxt && pnpm db:push
  ```

  Expected output includes: `[✓] Changes applied` (or similar Drizzle Kit success message). A `sqlite.db` file is created in `examples/nuxt/`.

- [ ] **Step 4: Add sqlite.db to .gitignore**

  Append to `examples/nuxt/.gitignore`:
  ```
  sqlite.db
  .env
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add examples/nuxt/server/db/schema.ts examples/nuxt/.gitignore
  git commit -m "feat(example): add Drizzle schema and push to SQLite"
  ```

---

## Task 7: Better Auth route handler

**Files:**
- Create: `examples/nuxt/server/api/auth/[...all].ts`

- [ ] **Step 1: Create the catch-all auth handler**

  ```ts
  // examples/nuxt/server/api/auth/[...all].ts
  import { auth } from '~/server/utils/auth'

  export default defineEventHandler((event) => {
    return auth.handler(toWebRequest(event))
  })
  ```

- [ ] **Step 2: Verify the handler compiles**

  Run from `examples/nuxt/`:
  ```bash
  cd examples/nuxt && pnpm typecheck
  ```

  Expected: no errors related to `auth.handler` or `toWebRequest`.

- [ ] **Step 3: Commit**

  ```bash
  git add examples/nuxt/server/api/auth
  git commit -m "feat(example): add Better Auth catch-all route handler"
  ```

---

## Task 8: Better Auth client

**Files:**
- Create: `examples/nuxt/utils/auth-client.ts`

- [ ] **Step 1: Create utils/auth-client.ts**

  ```ts
  // examples/nuxt/utils/auth-client.ts
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
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add examples/nuxt/utils/auth-client.ts
  git commit -m "feat(example): add Better Auth client with asaas plugin"
  ```

---

## Task 9: Auth middleware and useAsaasClient composable

**Files:**
- Create: `examples/nuxt/app/middleware/auth.ts`
- Create: `examples/nuxt/app/composables/useAsaasClient.ts`

- [ ] **Step 1: Create app/middleware/auth.ts**

  ```ts
  // examples/nuxt/app/middleware/auth.ts
  import { authClient } from '~/utils/auth-client'

  export default defineNuxtRouteMiddleware(async (to) => {
    if (to.path === '/login') return

    const { data: session } = await authClient.getSession()
    if (!session?.user) {
      return navigateTo('/login')
    }
  })
  ```

- [ ] **Step 2: Create app/composables/useAsaasClient.ts**

  ```ts
  // examples/nuxt/app/composables/useAsaasClient.ts
  import type { AsaasPayment, AsaasPaymentList, AsaasPixQrCode } from 'better-auth-asaas'

  type CreateChargeBody = {
    value: number
    dueDate: string
    description?: string
  }

  type CreateChargeResponse = AsaasPayment & {
    pixQrCode: string
    pixCopiaECola: string
  }

  export const useAsaasClient = () => {
    const listCharges = () =>
      $fetch<AsaasPaymentList>('/api/auth/asaas/charges')

    const getCharge = (id: string) =>
      $fetch<AsaasPayment>(`/api/auth/asaas/charge/${id}`)

    const getPixQrCode = (id: string) =>
      $fetch<AsaasPixQrCode>(`/api/auth/asaas/charge/${id}/pix`)

    const createCharge = (body: CreateChargeBody) =>
      $fetch<CreateChargeResponse>('/api/auth/asaas/charge', {
        method: 'POST',
        body
      })

    return { listCharges, getCharge, getPixQrCode, createCharge }
  }
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add examples/nuxt/app/middleware examples/nuxt/app/composables/useAsaasClient.ts
  git commit -m "feat(example): add auth middleware and useAsaasClient composable"
  ```

---

## Task 10: Update default layout and UserMenu

**Files:**
- Modify: `examples/nuxt/app/layouts/default.vue`
- Modify: `examples/nuxt/app/components/UserMenu.vue`
- Modify: `examples/nuxt/app/composables/useDashboard.ts`

- [ ] **Step 1: Replace app/layouts/default.vue**

  ```vue
  <!-- examples/nuxt/app/layouts/default.vue -->
  <script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui'

  const open = ref(false)

  const links = [[{
    label: 'Cobranças',
    icon: 'i-lucide-receipt',
    to: '/',
    onSelect: () => { open.value = false }
  }, {
    label: 'Nova cobrança',
    icon: 'i-lucide-plus-circle',
    to: '/charges/new',
    onSelect: () => { open.value = false }
  }]] satisfies NavigationMenuItem[][]
  </script>

  <template>
    <UDashboardGroup unit="rem">
      <UDashboardSidebar
        id="default"
        v-model:open="open"
        collapsible
        resizable
        class="bg-elevated/25"
        :ui="{ footer: 'lg:border-t lg:border-default' }"
      >
        <template #header="{ collapsed }">
          <div class="flex items-center gap-2 px-2 py-1">
            <UIcon name="i-lucide-zap" class="text-primary size-5 shrink-0" />
            <span v-if="!collapsed" class="font-semibold truncate">Asaas Example</span>
          </div>
        </template>

        <template #default="{ collapsed }">
          <UNavigationMenu
            :collapsed="collapsed"
            :items="links[0]"
            orientation="vertical"
            tooltip
          />
        </template>

        <template #footer="{ collapsed }">
          <UserMenu :collapsed="collapsed" />
        </template>
      </UDashboardSidebar>

      <slot />
    </UDashboardGroup>
  </template>
  ```

- [ ] **Step 2: Replace app/components/UserMenu.vue**

  ```vue
  <!-- examples/nuxt/app/components/UserMenu.vue -->
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
  ```

- [ ] **Step 3: Replace app/composables/useDashboard.ts**

  ```ts
  // examples/nuxt/app/composables/useDashboard.ts
  import { createSharedComposable } from '@vueuse/core'

  const _useDashboard = () => {
    const router = useRouter()

    defineShortcuts({
      'g-h': () => router.push('/'),
      'g-n': () => router.push('/charges/new')
    })

    return {}
  }

  export const useDashboard = createSharedComposable(_useDashboard)
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add examples/nuxt/app/layouts/default.vue \
          examples/nuxt/app/components/UserMenu.vue \
          examples/nuxt/app/composables/useDashboard.ts
  git commit -m "feat(example): update layout and UserMenu with real session"
  ```

---

## Task 11: Login page

**Files:**
- Create: `examples/nuxt/app/pages/login.vue`

- [ ] **Step 1: Create app/pages/login.vue**

  ```vue
  <!-- examples/nuxt/app/pages/login.vue -->
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
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add examples/nuxt/app/pages/login.vue
  git commit -m "feat(example): add login/register page"
  ```

---

## Task 12: Charges list page

**Files:**
- Replace: `examples/nuxt/app/pages/index.vue`

- [ ] **Step 1: Replace app/pages/index.vue**

  ```vue
  <!-- examples/nuxt/app/pages/index.vue -->
  <script setup lang="ts">
  import type { AsaasPayment, AsaasPaymentList } from 'better-auth-asaas'
  import type { TableColumn } from '@nuxt/ui'

  definePageMeta({ middleware: 'auth' })

  useDashboard()

  const { listCharges } = useAsaasClient()

  const { data, pending, error, refresh } = await useAsyncData<AsaasPaymentList>(
    'charges',
    () => listCharges()
  )

  const columns: TableColumn<AsaasPayment>[] = [{
    accessorKey: 'id',
    header: 'ID'
  }, {
    accessorKey: 'value',
    header: 'Valor (R$)',
    cell: ({ row }) => `R$ ${row.original.value.toFixed(2)}`
  }, {
    accessorKey: 'dueDate',
    header: 'Vencimento'
  }, {
    accessorKey: 'status',
    header: 'Status'
  }]
  </script>

  <template>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar title="Cobranças">
          <template #right>
            <UButton icon="i-lucide-plus" to="/charges/new">Nova cobrança</UButton>
          </template>
        </UDashboardNavbar>
      </template>

      <div class="p-4">
        <UAlert
          v-if="error"
          color="error"
          title="Erro ao carregar cobranças"
          :description="(error as any)?.message"
          class="mb-4"
        />

        <UTable
          v-if="data"
          :data="data.data"
          :columns="columns"
          :loading="pending"
          @select="(row: AsaasPayment) => navigateTo(`/charges/${row.id}`)"
          class="cursor-pointer"
        />

        <UButton
          v-if="data"
          variant="ghost"
          icon="i-lucide-refresh-cw"
          class="mt-2"
          @click="refresh"
        >
          Atualizar
        </UButton>
      </div>
    </UDashboardPanel>
  </template>
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add examples/nuxt/app/pages/index.vue
  git commit -m "feat(example): add charges list page"
  ```

---

## Task 13: Create charge page

**Files:**
- Create: `examples/nuxt/app/pages/charges/new.vue`

- [ ] **Step 1: Create app/pages/charges/new.vue**

  ```vue
  <!-- examples/nuxt/app/pages/charges/new.vue -->
  <script setup lang="ts">
  import { z } from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  definePageMeta({ middleware: 'auth' })

  const { createCharge } = useAsaasClient()
  const error = ref<string | null>(null)
  const submitting = ref(false)

  const today = new Date().toISOString().slice(0, 10)

  const schema = z.object({
    value: z.coerce.number().positive('Valor deve ser positivo'),
    dueDate: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato AAAA-MM-DD')
      .refine(d => d >= today, 'Data deve ser hoje ou futura'),
    description: z.string().max(500).optional()
  })

  type Schema = z.output<typeof schema>

  const state = reactive<Partial<Schema>>({
    value: undefined,
    dueDate: today,
    description: ''
  })

  async function onSubmit(event: FormSubmitEvent<Schema>) {
    error.value = null
    submitting.value = true
    try {
      const result = await createCharge({
        value: event.data.value,
        dueDate: event.data.dueDate,
        description: event.data.description || undefined
      })
      await navigateTo(`/charges/${result.id}`)
    } catch (err: any) {
      error.value = err?.data?.message ?? err?.message ?? 'Erro ao criar cobrança.'
    } finally {
      submitting.value = false
    }
  }
  </script>

  <template>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar title="Nova cobrança">
          <template #leading>
            <UButton icon="i-lucide-arrow-left" variant="ghost" to="/" />
          </template>
        </UDashboardNavbar>
      </template>

      <div class="p-4 max-w-md">
        <UAlert v-if="error" color="error" :description="error" class="mb-4" />

        <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
          <UFormField label="Valor (R$)" name="value">
            <UInput v-model="state.value" type="number" step="0.01" min="0.01" placeholder="10.00" class="w-full" />
          </UFormField>
          <UFormField label="Vencimento" name="dueDate">
            <UInput v-model="state.dueDate" type="date" :min="today" class="w-full" />
          </UFormField>
          <UFormField label="Descrição (opcional)" name="description">
            <UTextarea v-model="state.description" placeholder="Descrição da cobrança" :rows="3" class="w-full" />
          </UFormField>
          <UButton type="submit" :loading="submitting" block>Criar cobrança PIX</UButton>
        </UForm>
      </div>
    </UDashboardPanel>
  </template>
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add examples/nuxt/app/pages/charges
  git commit -m "feat(example): add create charge page"
  ```

---

## Task 14: Charge detail page

**Files:**
- Create: `examples/nuxt/app/pages/charges/[id].vue`

- [ ] **Step 1: Create app/pages/charges/[id].vue**

  ```vue
  <!-- examples/nuxt/app/pages/charges/[id].vue -->
  <script setup lang="ts">
  import type { AsaasPayment, AsaasPixQrCode } from 'better-auth-asaas'

  definePageMeta({ middleware: 'auth' })

  const route = useRoute()
  const id = route.params.id as string
  const { getCharge, getPixQrCode } = useAsaasClient()
  const copied = ref(false)

  const { data: charge, error: chargeError } = await useAsyncData<AsaasPayment>(
    `charge-${id}`,
    () => getCharge(id)
  )

  const { data: pix, error: pixError } = await useAsyncData<AsaasPixQrCode>(
    `charge-pix-${id}`,
    () => getPixQrCode(id)
  )

  const statusColor: Record<string, string> = {
    PENDING: 'warning',
    RECEIVED: 'success',
    CONFIRMED: 'success',
    OVERDUE: 'error',
    REFUNDED: 'neutral',
    DELETED: 'neutral'
  }

  async function copyPix() {
    if (!pix.value?.payload) return
    await navigator.clipboard.writeText(pix.value.payload)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
  </script>

  <template>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title="`Cobrança ${id}`">
          <template #leading>
            <UButton icon="i-lucide-arrow-left" variant="ghost" to="/" />
          </template>
        </UDashboardNavbar>
      </template>

      <div class="p-4 space-y-6 max-w-lg">
        <UAlert v-if="chargeError" color="error" title="Erro ao carregar cobrança" :description="(chargeError as any)?.message" />

        <UCard v-if="charge">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">Detalhes</span>
              <UBadge :color="statusColor[charge.status] ?? 'neutral'" :label="charge.status" />
            </div>
          </template>

          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-muted">Valor</dt>
              <dd class="font-medium">R$ {{ charge.value.toFixed(2) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-muted">Vencimento</dt>
              <dd>{{ charge.dueDate }}</dd>
            </div>
            <div v-if="charge.description" class="flex justify-between">
              <dt class="text-muted">Descrição</dt>
              <dd>{{ charge.description }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-muted">Criado em</dt>
              <dd>{{ charge.dateCreated }}</dd>
            </div>
          </dl>
        </UCard>

        <UCard v-if="pix && !pixError">
          <template #header>
            <span class="font-medium">PIX</span>
          </template>

          <div class="flex flex-col items-center gap-4">
            <img
              :src="`data:image/png;base64,${pix.encodedImage}`"
              alt="QR Code PIX"
              class="w-48 h-48 rounded"
            />

            <div class="w-full space-y-2">
              <p class="text-sm text-muted">Copia e cola</p>
              <div class="flex gap-2">
                <UInput :model-value="pix.payload" readonly class="flex-1 font-mono text-xs" />
                <UButton
                  :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
                  :color="copied ? 'success' : 'neutral'"
                  variant="outline"
                  @click="copyPix"
                />
              </div>
              <p class="text-xs text-muted">Expira em: {{ pix.expirationDate }}</p>
            </div>
          </div>
        </UCard>

        <UAlert
          v-if="pixError"
          color="warning"
          title="QR Code não disponível"
          description="O QR Code PIX pode não estar disponível para cobranças já pagas ou expiradas."
        />
      </div>
    </UDashboardPanel>
  </template>
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add examples/nuxt/app/pages/charges/\[id\].vue
  git commit -m "feat(example): add charge detail page with PIX QR code"
  ```

---

## Task 15: Environment file and README

**Files:**
- Create: `examples/nuxt/.env.example`
- Create: `examples/nuxt/README.md`

- [ ] **Step 1: Create .env.example**

  ```bash
  # examples/nuxt/.env.example
  # Asaas API – get your sandbox key at https://sandbox.asaas.com
  ASAAS_API_KEY=your_sandbox_api_key_here
  ASAAS_SANDBOX=true
  # Any string – must match what you configure in the Asaas dashboard
  ASAAS_WEBHOOK_ACCESS_TOKEN=replace_with_a_secret_token

  # Better Auth
  BETTER_AUTH_SECRET=replace_with_a_random_32char_string
  BETTER_AUTH_URL=http://localhost:3000
  ```

- [ ] **Step 2: Create README.md**

  ```markdown
  # better-auth-asaas — Nuxt example

  A working Nuxt 4 + Nuxt UI app showing all `better-auth-asaas` features:

  - Email/password sign-up → Asaas customer created automatically
  - Create PIX charges
  - List and view charges with QR code
  - Webhook endpoint for payment events

  ## Prerequisites

  - Node.js 18+
  - pnpm
  - [Asaas sandbox account](https://sandbox.asaas.com) + API key

  ## Setup

  1. **Install and build from the repo root:**

     ```bash
     pnpm install
     pnpm build      # builds better-auth-asaas before the example can use it
     ```

  2. **Configure environment variables:**

     ```bash
     cp .env.example .env
     # edit .env and fill in ASAAS_API_KEY, ASAAS_WEBHOOK_ACCESS_TOKEN, BETTER_AUTH_SECRET
     ```

  3. **Push the database schema:**

     ```bash
     pnpm db:push
     ```

  4. **Start the dev server:**

     ```bash
     pnpm dev
     ```

     Open [http://localhost:3000](http://localhost:3000). Register an account — an Asaas
     customer is created automatically using the CPF/CNPJ you provide.

  ## Webhook (local development)

  Asaas needs to reach your app over the internet to deliver webhook events.
  Use a tunnel tool to expose the local server:

  ```bash
  # ngrok
  ngrok http 3000

  # cloudflared
  cloudflared tunnel --url http://localhost:3000
  ```

  Then in the [Asaas dashboard](https://sandbox.asaas.com) → **Configurações → Webhooks**:

  - URL: `https://<your-tunnel-url>/api/auth/asaas/webhook`
  - Access token: the value of `ASAAS_WEBHOOK_ACCESS_TOKEN` in your `.env`

  Events `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, and `PAYMENT_DELETED` are logged to
  the dev server console via the hooks configured in `server/utils/auth.ts`.

  ## Keyboard shortcuts

  | Shortcut | Action |
  |----------|--------|
  | `g h`    | Go to charges list |
  | `g n`    | Go to new charge |
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add examples/nuxt/.env.example examples/nuxt/README.md
  git commit -m "docs(example): add .env.example and README"
  ```

---

## Task 16: Smoke test — start the dev server

This is a manual verification step, not automated.

- [ ] **Step 1: Start the dev server**

  Run from `examples/nuxt/`:
  ```bash
  cd examples/nuxt && pnpm dev
  ```

  Expected: Nuxt starts on `http://localhost:3000` with no startup errors.

- [ ] **Step 2: Verify login redirect**

  Open `http://localhost:3000`. Expected: redirected to `/login`.

- [ ] **Step 3: Register a new user**

  Fill in the register form with a name, email, CPF/CNPJ (`00000000000` is valid in Asaas sandbox), and password. Click "Criar conta".

  Expected: redirect to `/` (charges list). Check the dev server logs — you should see `[asaas] customer created ...` if `ASAAS_API_KEY` is set and valid.

  If the API key is not yet set, the sign-up still succeeds but the log line won't appear (the customer creation error is non-fatal in the plugin).

- [ ] **Step 4: Create a charge**

  Click "Nova cobrança". Fill in a value (e.g. `10`), a due date (tomorrow), and optionally a description. Submit.

  Expected: redirect to `/charges/:id` showing the charge details and PIX QR code.

- [ ] **Step 5: Verify charges list**

  Navigate back to `/`. Expected: the charge appears in the table.

- [ ] **Step 6: Verify sign-out**

  Click the user menu in the sidebar footer → "Sair". Expected: redirect to `/login`.

- [ ] **Step 7: Final commit**

  ```bash
  git add examples/nuxt
  git commit -m "feat(example): complete nuxt example project"
  ```
