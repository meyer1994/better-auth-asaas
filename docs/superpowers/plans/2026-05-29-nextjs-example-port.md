# Next.js Example Port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port `examples/nuxt/` to `examples/next/` with full feature and basic-layout parity (auth, Asaas payment create/list/QR, webhooks), using Next.js 15 App Router + shadcn/ui + TanStack Query.

**Architecture:** Mirrors Nuxt structure: a thin server (catch-all auth handler) with everything else done client-side via the better-auth React client and `asaasClient` plugin. TanStack Query stands in for `useAsyncData`. Root layout is a server component that reads the session; pages are client components except `/` (server redirect).

**Tech Stack:** Next 15 App Router, React 19, TypeScript, shadcn/ui (new-york style, RSC enabled), Tailwind v4, Better Auth + `better-auth-asaas`, Drizzle ORM + `better-sqlite3`, `@tanstack/react-query`, `react-hook-form` + Zod, `sonner`.

**Spec:** `docs/superpowers/specs/2026-05-29-nextjs-example-port-design.md`

**Starting state:** `examples/next/` has `package.json` (with Radix + shadcn helpers but no auth/asaas/tanstack-query deps), `components.json` (shadcn config), `drizzle.config.ts`, `next.config.ts`, `src/app/globals.css`, `src/lib/utils.ts`, `src/lib/db/index.ts`, `src/lib/db/schema.ts`. No pages, no auth, no `.env.example`.

**Verification model:** The Nuxt example has no test suite; per spec, this port doesn't add one either. Each task's verification is `pnpm typecheck` + `pnpm lint` (where applicable) plus a brief manual check. End-to-end manual smoke is the final task.

**Working directory:** All paths are relative to `examples/next/` unless prefixed with `<repo-root>/`. Run commands inside `examples/next/`.

---

## Task 1: Add dependencies and finalize package.json scripts

**Files:**
- Modify: `examples/next/package.json`

- [ ] **Step 1: Add runtime + dev dependencies**

Run from `examples/next/`:

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

(`better-auth`, `better-auth-asaas`, `@better-auth/drizzle-adapter`, `drizzle-orm`, `better-sqlite3`, `react-hook-form`, `@hookform/resolvers`, `zod`, `sonner`, `lucide-react`, all Radix primitives, `clsx`, `tailwind-merge`, `class-variance-authority`, `tailwindcss-animate`, `tw-animate-css` are already installed — confirm by reading `package.json` after install.)

- [ ] **Step 2: Replace `scripts` block in `package.json`**

Open `examples/next/package.json` and replace the `"scripts"` block with:

```json
"scripts": {
  "dev":           "next dev",
  "build":         "next build",
  "start":         "next start",
  "lint":          "next lint",
  "typecheck":     "tsc --noEmit",
  "db:push":       "drizzle-kit push",
  "db:generate":   "pnpm auth:generate && drizzle-kit generate",
  "db:migrate":    "drizzle-kit migrate",
  "auth:generate": "pnpx @better-auth/cli generate --yes --config src/lib/auth.ts --output src/lib/db/auth.ts"
}
```

- [ ] **Step 3: Verify install**

Run: `pnpm install` then `pnpm typecheck`
Expected: install succeeds; typecheck passes (no source files yet to typecheck, just baseline).

- [ ] **Step 4: Commit**

```bash
git add examples/next/package.json examples/next/pnpm-lock.yaml <repo-root>/pnpm-lock.yaml
git commit -m "examples/next: add tanstack-query deps and fill in scripts"
```

(Only commit the lockfile that actually changed — typically the workspace root `pnpm-lock.yaml`.)

---

## Task 2: Create `.env.example` and `.gitignore` parity

**Files:**
- Create: `examples/next/.env.example`
- Modify: `examples/next/.gitignore` (verify `sqlite.db` and `.env` are ignored; add if missing)

- [ ] **Step 1: Create `.env.example`**

Write `examples/next/.env.example` with the same content as `examples/nuxt/.env.example`:

```
# Asaas API – get your sandbox key at https://sandbox.asaas.com
ASAAS_API_KEY=your_sandbox_api_key_here
ASAAS_SANDBOX=true
# Any string – must match what you configure in the Asaas dashboard
ASAAS_WEBHOOK_ACCESS_TOKEN=replace_with_a_secret_token

# Better Auth
BETTER_AUTH_SECRET=replace_with_a_random_32char_string
BETTER_AUTH_URL=http://localhost:3000
```

- [ ] **Step 2: Verify `.gitignore` excludes `.env` and `sqlite.db`**

Read `examples/next/.gitignore`. If `.env` or `sqlite.db` is missing, append them. Leave Next's defaults alone.

- [ ] **Step 3: Commit**

```bash
git add examples/next/.env.example examples/next/.gitignore
git commit -m "examples/next: add .env.example mirroring nuxt example"
```

---

## Task 3: Port the better-auth server config

**Files:**
- Create: `examples/next/src/lib/auth.ts`

- [ ] **Step 1: Write `src/lib/auth.ts`**

```ts
import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { asaas } from 'better-auth-asaas'
import { db } from './db'
import * as schema from './db/schema'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',

  database: drizzleAdapter(db, { provider: 'sqlite', schema, debugLogs: true }),

  emailAndPassword: { enabled: true },

  user: {
    additionalFields: {
      cpfCnpj: {
        type: 'string',
        required: true,
        input: true,
      },
    },
  },

  plugins: [
    asaas({
      apiKey: process.env.ASAAS_API_KEY!,
      sandbox: process.env.ASAAS_SANDBOX !== 'false',
    }),
    nextCookies(), // must be last
  ],
})
```

Note: `nextCookies()` is the Next.js cookie helper from better-auth; it MUST be the last plugin. It enables cookie writes inside server actions (we don't use server actions in this example, but it's the documented best practice).

- [ ] **Step 2: Run typecheck (expect transient unresolved-import error)**

Run: `pnpm typecheck`
Expected: errors referencing `./db/schema` exports — fine for now; resolved in Task 4.

- [ ] **Step 3: Commit**

```bash
git add examples/next/src/lib/auth.ts
git commit -m "examples/next: add better-auth server config with asaas plugin"
```

---

## Task 4: Generate auth tables, wire schema, push to SQLite

**Files:**
- Generated: `examples/next/src/lib/db/auth.ts`
- Modify: `examples/next/src/lib/db/schema.ts` (already re-exports `./auth`; verify)
- Generated: `examples/next/sqlite.db`

- [ ] **Step 1: Generate the auth tables**

Run: `pnpm auth:generate`
Expected: creates `src/lib/db/auth.ts` containing `user`, `session`, `account`, `verification` Drizzle tables with the extra `cpfCnpj` and `asaasCustomerId` columns on `user`. Compare against `examples/nuxt/server/db/schema.ts` — should match.

- [ ] **Step 2: Verify `schema.ts` re-exports**

Open `src/lib/db/schema.ts`. Expected content (already in place from the existing starter):

```ts
export * from './auth'
```

If different, replace with the above.

- [ ] **Step 3: Push schema to SQLite**

Run: `pnpm db:push`
Expected: drizzle-kit creates `sqlite.db` and applies the schema. Confirm by running `sqlite3 sqlite.db '.tables'` — should list `user`, `session`, `account`, `verification`.

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`
Expected: passes (auth.ts now resolves its schema imports).

- [ ] **Step 5: Commit**

```bash
git add examples/next/src/lib/db/auth.ts examples/next/src/lib/db/schema.ts
git commit -m "examples/next: generate auth drizzle tables"
```

(Do NOT commit `sqlite.db` — already gitignored.)

---

## Task 5: Mount the auth catch-all route handler

**Files:**
- Create: `examples/next/src/app/api/auth/[...all]/route.ts`

- [ ] **Step 1: Write the route handler**

```ts
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

This handles all `/api/auth/*` requests, including the Asaas plugin endpoints (`/api/auth/asaas/payments`, `/api/auth/asaas/webhook`, etc.). Equivalent to `examples/nuxt/server/api/auth/[...all].ts`.

- [ ] **Step 2: Smoke-test the handler**

Run: `pnpm dev` (in a separate terminal)
Then: `curl -sS http://localhost:3000/api/auth/ok` (Better Auth health probe)
Expected: `{"ok":true}` or similar 200 response. Kill the dev server when done.

- [ ] **Step 3: Commit**

```bash
git add examples/next/src/app/api/auth/[...all]/route.ts
git commit -m "examples/next: mount better-auth catch-all route handler"
```

---

## Task 6: Add the better-auth React client

**Files:**
- Create: `examples/next/src/lib/auth-client.ts`

- [ ] **Step 1: Write the client**

```ts
import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import { asaasClient } from 'better-auth-asaas/client'
import type { auth } from './auth'

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    asaasClient(),
  ],
})

export const { useSession, signIn, signUp, signOut } = authClient
```

`inferAdditionalFields<typeof auth>()` propagates the `cpfCnpj` field type into `signUp.email`, so the TS call site stays type-safe. Mirrors `examples/nuxt/app/composables/auth.ts`.

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add examples/next/src/lib/auth-client.ts
git commit -m "examples/next: add better-auth react client with asaas plugin"
```

---

## Task 7: Install required shadcn/ui primitives

**Files:**
- Generated: `examples/next/src/components/ui/{button,card,dialog,form,input,label,select,table,sonner}.tsx`

- [ ] **Step 1: Install the primitives**

Run from `examples/next/`:

```bash
pnpx shadcn@latest add button card dialog form input label select table sonner --yes
```

Expected: creates the nine component files under `src/components/ui/`. If shadcn prompts about overwriting `globals.css`, decline (we keep the existing one).

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add examples/next/src/components/ui
git commit -m "examples/next: scaffold shadcn primitives (button, card, dialog, form, input, label, select, table, sonner)"
```

---

## Task 8: Add the Providers component (QueryClient + Toaster)

**Files:**
- Create: `examples/next/src/components/providers.tsx`

- [ ] **Step 1: Write `providers.tsx`**

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/sonner'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster richColors position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add examples/next/src/components/providers.tsx
git commit -m "examples/next: add providers (query client, sonner toaster, devtools)"
```

---

## Task 9: Build the root layout

**Files:**
- Create: `examples/next/src/app/layout.tsx`

- [ ] **Step 1: Write `layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'

export const metadata: Metadata = {
  title: 'better-auth-asaas — Next example',
  description: 'Next.js port of the Nuxt example',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <Header />
          <main className="p-8">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
```

`Header` will be added in Task 10. Typecheck will fail until then — that's expected.

- [ ] **Step 2: Commit**

```bash
git add examples/next/src/app/layout.tsx
git commit -m "examples/next: add root layout with providers and header slot"
```

---

## Task 10: Build the Header (server component) and LogoutButton

**Files:**
- Create: `examples/next/src/components/header.tsx`
- Create: `examples/next/src/components/logout-button.tsx`

- [ ] **Step 1: Write `logout-button.tsx`**

```tsx
'use client'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function onClick() {
    const { error } = await authClient.signOut()
    if (error) {
      console.error(error)
      return
    }
    router.replace('/login')
    router.refresh()
  }

  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <LogOut className="size-4" />
      Logout
    </Button>
  )
}
```

- [ ] **Step 2: Write `header.tsx`**

```tsx
import Link from 'next/link'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { LogIn, UserPlus, CreditCard } from 'lucide-react'
import { LogoutButton } from './logout-button'

export async function Header() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <header className="flex items-center justify-between border-b px-8 py-3">
      <Link href="/" className="font-semibold">better-auth-asaas</Link>

      <nav className="flex items-center gap-2">
        {!session?.user ? (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login"><LogIn className="size-4" />Login</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/register"><UserPlus className="size-4" />Register</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/payments"><CreditCard className="size-4" />Payments</Link>
            </Button>
            <LogoutButton />
          </>
        )}
      </nav>
    </header>
  )
}
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add examples/next/src/components/header.tsx examples/next/src/components/logout-button.tsx
git commit -m "examples/next: add header (server) and logout button (client)"
```

---

## Task 11: Add the `/` redirect page

**Files:**
- Create: `examples/next/src/app/page.tsx`

- [ ] **Step 1: Write `page.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  redirect(session?.user ? '/payments' : '/login')
}
```

- [ ] **Step 2: Smoke-test**

Run: `pnpm dev` then `curl -sSI http://localhost:3000/` (HEAD request)
Expected: `307` redirect to `/login` (no session). Kill dev server.

- [ ] **Step 3: Commit**

```bash
git add examples/next/src/app/page.tsx
git commit -m "examples/next: add / redirect to /login or /payments"
```

---

## Task 12: Build the login page

**Files:**
- Create: `examples/next/src/app/login/page.tsx`

- [ ] **Step 1: Write `login/page.tsx`**

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { LogIn } from 'lucide-react'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type Values = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: Values) {
    const { error } = await authClient.signIn.email(values)
    if (error) {
      toast.error('Sign-in failed', { description: error.message })
      return
    }
    router.replace('/payments')
    router.refresh()
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LogIn className="size-5" />Login</CardTitle>
          <CardDescription>Sign in to your account.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-3">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary font-medium">Register</Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add examples/next/src/app/login/page.tsx
git commit -m "examples/next: add login page with email/password form"
```

---

## Task 13: Build the register page

**Files:**
- Create: `examples/next/src/app/register/page.tsx`

- [ ] **Step 1: Write `register/page.tsx`**

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UserPlus } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1),
  cpfCnpj: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

type Values = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', cpfCnpj: '', email: '', password: '' },
  })

  async function onSubmit(values: Values) {
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      cpfCnpj: values.cpfCnpj,
    })
    if (error) {
      toast.error('Sign-up failed', { description: error.message })
      return
    }
    router.replace('/payments')
    router.refresh()
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="size-5" />Create an account</CardTitle>
          <CardDescription>Sign up to get started.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="cpfCnpj" render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF/CNPJ</FormLabel>
                  <FormControl><Input placeholder="12345678901" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-3">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating…' : 'Sign up'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-medium">Login</Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: passes. If `signUp.email` rejects `cpfCnpj` on type-check, confirm `inferAdditionalFields<typeof auth>()` is wired in `src/lib/auth-client.ts`.

- [ ] **Step 3: Commit**

```bash
git add examples/next/src/app/register/page.tsx
git commit -m "examples/next: add register page with cpfCnpj field"
```

---

## Task 14: Add the AsyncData component and TanStack Query hooks

**Files:**
- Create: `examples/next/src/components/async-data.tsx`
- Create: `examples/next/src/hooks/use-payments.ts`
- Create: `examples/next/src/hooks/use-create-payment.ts`

(`useSession` is re-exported from `@/lib/auth-client` already, so no `hooks/use-session.ts` file is needed.)

- [ ] **Step 1: Write `async-data.tsx`**

```tsx
'use client'

import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'

type Props<T> = {
  query: UseQueryResult<T, unknown>
  loading?: ReactNode
  error?: (err: unknown) => ReactNode
  children: (data: T) => ReactNode
}

export function AsyncData<T>({ query, loading, error, children }: Props<T>) {
  if (query.isPending) return <>{loading ?? <p className="text-sm text-muted-foreground">Loading…</p>}</>
  if (query.isError) return <>{error ? error(query.error) : <p className="text-sm text-destructive">Error: {String(query.error)}</p>}</>
  if (query.data === undefined) return null
  return <>{children(query.data)}</>
}
```

- [ ] **Step 2: Write `use-payments.ts`**

```ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await authClient.asaas.payments.list()
      if (error) throw error
      return data
    },
  })
}
```

- [ ] **Step 3: Write `use-create-payment.ts`**

```ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

type CreateInput = {
  value: number
  dueDate: string
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'UNDEFINED'
  description?: string
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateInput) => {
      const { data, error } = await authClient.asaas.payments.create(input)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      toast.success('Payment created', { description: data?.id })
      qc.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: (err) => {
      toast.error('Error', { description: String(err) })
    },
  })
}
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add examples/next/src/components/async-data.tsx examples/next/src/hooks
git commit -m "examples/next: add AsyncData component and tanstack-query hooks"
```

---

## Task 15: Build the payments page

**Files:**
- Create: `examples/next/src/app/payments/page.tsx`

- [ ] **Step 1: Write `payments/page.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, RefreshCw, QrCode, Copy } from 'lucide-react'
import Image from 'next/image'

import { authClient, useSession } from '@/lib/auth-client'
import { usePayments } from '@/hooks/use-payments'
import { useCreatePayment } from '@/hooks/use-create-payment'
import { AsyncData } from '@/components/async-data'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const schema = z.object({
  value: z.coerce.number().positive('Must be > 0'),
  dueDate: z.string().min(1),
  billingType: z.enum(['PIX', 'BOLETO', 'CREDIT_CARD', 'UNDEFINED']).default('PIX'),
  description: z.string().optional(),
})

type Values = z.infer<typeof schema>

export default function PaymentsPage() {
  const router = useRouter()
  const session = useSession()
  const payments = usePayments()
  const createPayment = useCreatePayment()

  // Lightweight client-side guard, matching the Nuxt example's posture.
  useEffect(() => {
    if (!session.isPending && !session.data?.user) router.replace('/login')
  }, [session.isPending, session.data, router])

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      value: 100,
      dueDate: '2026-06-20',
      billingType: 'PIX',
      description: 'Test payment',
    },
  })

  async function onSubmit(values: Values) {
    await createPayment.mutateAsync(values)
  }

  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      {/* Left column: form + session */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Create payment
              <Button type="submit" form="create-payment-form" variant="ghost" size="icon">
                <Plus className="size-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form id="create-payment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="value" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl><Input type="number" step="1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="billingType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="BOLETO">BOLETO</SelectItem>
                        <SelectItem value="CREDIT_CARD">CREDIT_CARD</SelectItem>
                        <SelectItem value="UNDEFINED">UNDEFINED</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Session
              <Button variant="ghost" size="icon" onClick={() => session.refetch()}>
                <RefreshCw className="size-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs">{JSON.stringify(session.data, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>

      {/* Right column: payments table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Payments
            <Button variant="ghost" size="icon" onClick={() => payments.refetch()}>
              <RefreshCw className="size-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Billing type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.isPending && (
                <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>
              )}
              {payments.isError && (
                <TableRow><TableCell colSpan={6} className="text-destructive">{String(payments.error)}</TableCell></TableRow>
              )}
              {payments.data?.data?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.value}</TableCell>
                  <TableCell>{p.dueDate}</TableCell>
                  <TableCell>{p.billingType}</TableCell>
                  <TableCell>{p.description}</TableCell>
                  <TableCell><QrButton id={p.id} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function QrButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const qr = useQuery({
    queryKey: ['payment-qr', id],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await authClient.asaas.payments.qr({ query: { id } })
      if (error) throw error
      return data
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><QrCode className="size-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>QR</DialogTitle></DialogHeader>
        <AsyncData query={qr}>
          {(data) => (
            <div className="flex flex-col items-center gap-4">
              {data?.encodedImage && (
                <Image
                  src={`data:image/png;base64,${data.encodedImage}`}
                  width={256}
                  height={256}
                  alt="PIX QR code"
                  unoptimized
                />
              )}
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!data?.payload) return
                    navigator.clipboard.writeText(data.payload)
                    toast.success('Copied to clipboard', { duration: 1000 })
                  }}
                >
                  <Copy className="size-4" />PIX
                </Button>
                <Input readOnly value={data?.payload ?? ''} title={data?.payload ?? ''} />
              </div>
            </div>
          )}
        </AsyncData>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: passes. If `authClient.asaas.payments.qr({ query: { id } })` shape differs from the plugin's actual signature, adjust to match (the Nuxt example uses exactly this shape — see `examples/nuxt/app/pages/payments.vue:161`).

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: passes. Fix any auto-fixable issues with `pnpm lint -- --fix` if needed.

- [ ] **Step 4: Commit**

```bash
git add examples/next/src/app/payments/page.tsx
git commit -m "examples/next: add payments page with form, table, and QR modal"
```

---

## Task 16: Write the README

**Files:**
- Create: `examples/next/README.md`

- [ ] **Step 1: Write the README**

```markdown
# better-auth-asaas — Next.js example

Next.js 15 + shadcn/ui app demoing every `better-auth-asaas` feature: sign-up with auto Asaas customer creation, PIX charge creation, charge listing/details with QR code, and the webhook receiver.

## Prerequisites

- Node 18+, pnpm
- [Asaas sandbox account](https://sandbox.asaas.com) + API key

## Setup

```bash
# from repo root
pnpm install
pnpm build                       # build the plugin first

cd examples/next
cp .env.example .env             # fill in the values below
pnpm db:push                     # create the SQLite schema
pnpm dev                         # http://localhost:3000
```

### `.env`

| Variable                     | Description                                                 |
| ---------------------------- | ----------------------------------------------------------- |
| `ASAAS_API_KEY`              | Asaas sandbox API key.                                      |
| `ASAAS_SANDBOX`              | `true` to use the sandbox base URL.                         |
| `ASAAS_WEBHOOK_ACCESS_TOKEN` | Shared secret; must match the value in the Asaas dashboard. |
| `BETTER_AUTH_SECRET`         | Random 32-char string.                                      |
| `BETTER_AUTH_URL`            | `http://localhost:3000` for local dev.                      |

## Pages

| Route        | Description                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------- |
| `/login`     | Email/password sign-in.                                                                     |
| `/register`  | Sign-up with name, CPF/CNPJ, email and password. Auto-creates an Asaas customer on submit.  |
| `/payments`  | Protected dashboard: create PIX/Boleto/Credit Card charges, list all payments, view QR code per charge. |

## Commands

| Script              | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `pnpm dev`          | Start Next dev server                                |
| `pnpm build`        | Production build                                     |
| `pnpm start`        | Run the production build                             |
| `pnpm typecheck`    | Run `tsc --noEmit`                                   |
| `pnpm lint`         | Run `next lint`                                      |
| `pnpm db:push`      | Apply schema via drizzle-kit (no migration files)    |
| `pnpm db:generate`  | Regenerate auth tables + drizzle migration files     |
| `pnpm db:migrate`   | Run drizzle migrations                               |
| `pnpm auth:generate`| Regenerate `src/lib/db/auth.ts` from auth config     |

## Webhook (local)

Expose the dev server with a tunnel so Asaas can reach it:

```bash
ngrok http 3000
# or
cloudflared tunnel --url http://localhost:3000
```

In Asaas → **Configurações → Webhooks**:

- URL: `https://<tunnel>/api/auth/asaas/webhook`
- Access token: value of `ASAAS_WEBHOOK_ACCESS_TOKEN`

`PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `PAYMENT_DELETED` are logged from `src/lib/auth.ts`.
```

- [ ] **Step 2: Commit**

```bash
git add examples/next/README.md
git commit -m "examples/next: add README mirroring the nuxt example"
```

---

## Task 17: End-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 1: Clean install and build**

From repo root:

```bash
pnpm install
pnpm --filter better-auth-asaas build
```

Expected: plugin built; no errors.

- [ ] **Step 2: Configure env**

```bash
cd examples/next
cp .env.example .env
# Fill in real ASAAS_API_KEY, ASAAS_SANDBOX=true, a 32-char BETTER_AUTH_SECRET, BETTER_AUTH_URL=http://localhost:3000
```

- [ ] **Step 3: Init DB and run dev server**

```bash
rm -f sqlite.db
pnpm db:push
pnpm dev
```

Expected: server listens on http://localhost:3000.

- [ ] **Step 4: Smoke-test the user flow**

In a browser (or via curl + manual UI):

1. Visit `http://localhost:3000/` → redirects to `/login`.
2. Click "Register" → fill name/cpfCnpj/email/password → submit.
   - Expected: redirected to `/payments`; new user visible in `sqlite.db`; Asaas sandbox shows a new customer with the given CPF/CNPJ.
3. On `/payments`, submit the create-payment form with default values.
   - Expected: success toast; row appears in the table within a few seconds.
4. Click the QR icon on the new row.
   - Expected: dialog opens, QR image renders, "Copy PIX" copies the payload (verify by pasting somewhere).
5. Click the session card's refresh icon.
   - Expected: pretty-printed session JSON re-renders.
6. Click "Logout" in the header → confirm redirected to `/login` and that `/payments` is no longer reachable (redirects back to `/login`).

- [ ] **Step 5: Smoke-test the webhook**

In a second terminal:

```bash
ngrok http 3000
```

Configure the webhook in the Asaas sandbox dashboard to point at `https://<tunnel>/api/auth/asaas/webhook` with the same access token as in `.env`. Trigger a sandbox payment status change (or simulate via the Asaas dashboard).

Expected: server logs show the payment event (`PAYMENT_RECEIVED` / `PAYMENT_OVERDUE` / `PAYMENT_DELETED`).

- [ ] **Step 6: Final typecheck + lint**

```bash
pnpm typecheck
pnpm lint
```

Expected: both pass.

- [ ] **Step 7: No commit needed**

Verification is observational. If any task uncovers a bug, fix it in a follow-up commit referencing the task.

---

## Self-Review Notes

- **Spec coverage:** All spec sections (file layout, parity map, pages, data layer, auth config, webhook, env, scripts, deps, README, dropped items) map to specific tasks. The keyboard shortcuts are explicitly dropped in the spec and not in the plan — intentional.
- **Cross-task type consistency:** `authClient` is exported from `src/lib/auth-client.ts` in Task 6 and used unchanged in Tasks 10, 12, 13, 14, 15. `usePayments`, `useCreatePayment`, `AsyncData` defined in Task 14 with the exact same names used by `payments/page.tsx` in Task 15. `useSession` is re-exported from `auth-client.ts` (Task 6, Step 1) and imported directly in Task 15.
- **No placeholders:** every code step shows the full code.
- **DB column on signup:** the user table has `cpfCnpj NOT NULL` (Task 4). The register form sends `cpfCnpj` (Task 13). The auth config marks the field `required: true, input: true` (Task 3). All three line up.
- **One known fragile point:** the exact call shape of `authClient.asaas.payments.qr(...)` — Task 15 Step 2 calls it out and points at the Nuxt example for the canonical shape, so a fix is one line if the plugin's signature has shifted.
