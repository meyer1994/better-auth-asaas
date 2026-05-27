# Nuxt demo app — design

**Date:** 2026-05-27
**Location:** `examples/nuxt/`

## Goal

A minimal-functional Nuxt 4 demo exercising the `better-auth-asaas` plugin end-to-end with three pages: `/login`, `/signup`, `/payments`. The example doubles as a smoke test for the plugin's signup-hook (auto-creating an Asaas customer when `cpfCnpj` is provided) and its payment endpoints.

## Non-goals

- No tests for the example app.
- No PIX QR / boleto-line UI (the package endpoints exist; left for later).
- No global navigation, header component, or polished empty states.
- No new endpoints in the `better-auth-asaas` package. The demo works within what's already exported.

## Prerequisite fixes to existing files

The example currently has stale references that prevent it from running. These must be fixed first:

1. **`app/utils/auth.ts`** — imports `asaasClient` from `better-auth-asaas/client`, but the actual export is `asaas`. Rename the import.
2. **`server/utils/auth.ts`** — imports `charge` and `webhooks` from `better-auth-asaas` and passes them via `use: [...]`. The current plugin API exposes endpoints directly and no longer takes sub-plugins. Drop the imports and the `use` array; keep `apiKey`, `sandbox`, and `createCustomerOnSignUp` if still supported (else drop the unsupported option).
3. **`server/api/auth/[...all].ts`** — does not exist. Add a catch-all that delegates to the better-auth handler. Without it, the client cannot reach the server.

## File layout (new files)

```
examples/nuxt/
  server/api/auth/[...all].ts
  app/
    pages/
      index.vue        # redirect to /payments
      login.vue
      signup.vue
      payments.vue
```

`app/app.vue` is updated to render `<UApp><NuxtPage /></UApp>` (it currently hard-codes a single-page switch).

## Auth flow

### `/signup`
- `UForm` (Nuxt UI) with fields: `name`, `email`, `password`, `cpfCnpj` (all required).
- Submits via `auth.signUp.email({ name, email, password, cpfCnpj })`.
- On mount, if `useSession()` reports a signed-in user → `navigateTo('/payments')`.
- On success → `navigateTo('/payments')`.
- Link to `/login`.

### `/login`
- `UForm` with `email`, `password`.
- Submits via `auth.signIn.email(...)`.
- Same mount-time guard and post-success redirect as `/signup`.
- Link to `/signup`.

### Route guards
Implemented inline in each page's `<script setup>` (no `middleware/` files):
- `/login`, `/signup`: signed-in → redirect to `/payments`.
- `/payments`: not signed-in → redirect to `/login`.
- `/` (index): unconditional redirect to `/payments`.

## `/payments` page

### Header strip
- Shows current user's email.
- "Sign out" button → `auth.signOut()` then `navigateTo('/login')`.

### Create-charge form (`UForm`)
- `value` (number, required, > 0)
- `dueDate` (date, defaults to today + 3 days)
- `billingType` (`USelect`: `PIX`, `BOLETO`, `CREDIT_CARD`, `UNDEFINED`)
- `description` (text, optional)
- Submits via the client method inferred from the server endpoint `/asaas/payments` (expected: `auth.asaas.payments.create(...)` or equivalent — see "Client method shape" below).
- On success, push the returned payment's `id` into a `useLocalStorage('asaas:payment-ids', [] as string[])` ref. Toast on success.

### Payments table (`UTable`)
- For each id in the local-storage array, call the get-payment endpoint (expected: `auth.asaas.payments.get({ id })`). Fetched on mount and re-fetched after each create.
- Columns: `id`, `value`, `status`, `billingType`, `dueDate`, actions.
- Row actions:
  - **Refresh** — re-fetch this single payment.
  - **Delete** — calls the delete endpoint, drops the id from local storage on success.
- Errors surface via Nuxt UI's `useToast()`.

## Client method shape (assumption)

The client plugin (`packages/better-auth-asaas/src/client.ts`) declares `$InferServerPlugin` only — no explicit method overrides. The exact method names are derived by better-auth from the server endpoint paths (`/asaas/payments`, `/asaas/payments/get`, `/asaas/payments/delete`, etc.).

At implementation time, use whatever the inferred client actually exposes. Do not add wrappers in the package to "make the names nicer" — that's a separate scope.

## Data shapes

The signup form passes `cpfCnpj` straight through. The server-side asaas plugin reads it inside its `databaseHooks.user.create.after` to call `POST /customers` and update the user with `asaasCustomerId`. No additional schema work is needed; `server/db/schema.ts` already has `cpfCnpj` and `asaasCustomerId` columns.

## Errors

- All form errors caught from `auth.*` calls or asaas-endpoint calls are surfaced through `useToast()` with the error's `message`.
- No retries, no special-case handling per error code.

## What gets committed in implementation

1. The three prerequisite fixes above.
2. `server/api/auth/[...all].ts`.
3. Rewritten `app/app.vue`.
4. Four new files under `app/pages/`.

That's it.
