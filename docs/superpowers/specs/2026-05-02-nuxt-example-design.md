---
title: Nuxt Example Project Design
date: 2026-05-02
status: approved
---

# Nuxt Example Project

A working example application at `examples/nuxt/` demonstrating all features of `better-auth-asaas`: email/password sign-up with automatic Asaas customer creation, PIX charge creation, charge listing, charge detail with QR code, and a webhook endpoint.

## Overview

- **Base:** `nuxt-ui-templates/dashboard` (cloned via `degit`)
- **UI:** Nuxt UI (already included in the dashboard template)
- **Auth:** Better Auth with email + password
- **Database:** SQLite via Drizzle ORM (`drizzle-orm` + `better-sqlite3`)
- **Payments:** `better-auth-asaas` (local workspace dependency)

## Project Structure

```
examples/nuxt/
├── .env.example
├── drizzle.config.ts
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── README.md
├── app/
│   ├── app.vue
│   ├── app.config.ts
│   ├── assets/css/main.css
│   ├── layouts/
│   │   └── default.vue          # sidebar layout (from template, adapted)
│   ├── middleware/
│   │   └── auth.ts              # redirect to /login if no session
│   ├── composables/
│   │   ├── useDashboard.ts      # sidebar state (from template)
│   │   └── useAsaasClient.ts    # thin wrapper around authClient asaas methods
│   ├── components/
│   │   ├── UserMenu.vue         # shows logged-in user + logout (from template)
│   │   └── AppHeader.vue        # top bar with user menu
│   └── pages/
│       ├── login.vue            # register + login tabs
│       ├── index.vue            # charges list
│       └── charges/
│           ├── new.vue          # create charge form
│           └── [id].vue         # charge detail + QR code
├── utils/
│   └── auth-client.ts           # Better Auth client (browser + SSR safe)
└── server/
    ├── utils/
    │   └── auth.ts              # Better Auth server config (server-only)
    ├── db/
    │   ├── index.ts             # Drizzle instance
    │   └── schema.ts            # Better Auth tables + asaasCustomerId
    └── api/
        └── auth/
            └── [...all].ts      # Better Auth catch-all handler
```

## Database

**Adapter:** `drizzle-orm` with `better-sqlite3`. The Drizzle instance is created in `server/db/index.ts` and passed to Better Auth's Drizzle adapter.

**Schema** (`server/db/schema.ts`): Generated via `pnpm dlx @better-auth/cli generate` — produces the standard Better Auth tables (`user`, `session`, `account`, `verification`). The `user` table includes the `asaasCustomerId` field (added by the `asaas` plugin automatically when `createCustomerOnSignUp` is enabled).

**Migrations:** `drizzle-kit push` (SQLite, no migration files needed for development). The `drizzle.config.ts` points to `sqlite.db` and `server/db/schema.ts`.

## Authentication

`server/utils/auth.ts` configures Better Auth with:
- `emailAndPassword` — enabled
- `database` — Drizzle adapter using the `server/db` instance
- `plugins` — `asaas({ ... })`

Placing it under `server/utils/` ensures Nitro keeps it server-only and it is never bundled into the client.

`utils/auth-client.ts` creates the Better Auth client with `asaasClient()` and exports it for use in pages and composables. This file is safe to import on both server and client.

`server/api/auth/[...all].ts` exports the Better Auth handler for all `/api/auth/**` requests.

### Asaas plugin config

```ts
asaas({
  apiKey: process.env.ASAAS_API_KEY!,
  sandbox: process.env.ASAAS_SANDBOX === 'true',
  createCustomerOnSignUp: true,
  getCustomerCreateParams: async ({ user }) => ({
    cpfCnpj: (user as any).cpfCnpj, // stored as additionalField at registration
  }),
  use: [
    charge({
      onPaymentReceived: async ({ payment, user }) => {
        console.log('[webhook] payment received', payment.id, user?.email)
      },
      onPaymentOverdue: async ({ payment, user }) => {
        console.log('[webhook] payment overdue', payment.id)
      },
      onPaymentDeleted: async ({ payment, user }) => {
        console.log('[webhook] payment deleted', payment.id)
      },
    }),
    webhooks({
      accessToken: process.env.ASAAS_WEBHOOK_ACCESS_TOKEN!,
    }),
  ],
})
```

### Additional user field: `cpfCnpj`

Better Auth's `emailAndPassword` plugin supports `additionalFields` on the user model. `cpfCnpj` is declared there so it is stored at registration and available in `getCustomerCreateParams`:

```ts
user: {
  additionalFields: {
    cpfCnpj: {
      type: 'string',
      required: true,
      input: true, // accepted from signUp.email({ data: { cpfCnpj } })
    },
  },
},
```

The register form sends `cpfCnpj` via `authClient.signUp.email({ ..., data: { cpfCnpj } })`.

## Pages

### `/login` — Login / Register

`UCard` with `UTabs` (two tabs: "Entrar" and "Criar conta").

- **Login tab:** email + password fields → `authClient.signIn.email()` → redirect to `/`
- **Register tab:** name + email + CPF/CNPJ + password → `authClient.signUp.email()` with `cpfCnpj` in `data` → redirect to `/`
- On success, the asaas plugin creates the Asaas customer automatically.
- Unauthenticated users are redirected here by `middleware/auth.ts`.

### `/` — Charges List

Protected by `middleware/auth.ts`. Uses the default sidebar layout.

- Fetches charges via `useAsaasClient().listCharges()` (calls `GET /api/auth/asaas/charges`)
- Displays results in a `UTable` with columns: ID, value, due date, status
- Each row links to `/charges/[id]`
- `UButton` "Nova cobrança" navigates to `/charges/new`
- Shows a `UAlert` if `asaasCustomerId` is missing (customer creation failed at sign-up)

### `/charges/new` — Create Charge

`UForm` with Zod schema validation:

| Field | Type | Validation |
|---|---|---|
| `value` | number | positive |
| `dueDate` | string | `YYYY-MM-DD`, today or future |
| `description` | string (optional) | max 500 chars |

On submit → `POST /api/auth/asaas/charge` → redirect to `/charges/[id]` with the new payment ID.

Error responses from the plugin (e.g. missing customer) surfaced via `UAlert`.

### `/charges/[id]` — Charge Detail

Fetches via `GET /api/auth/asaas/charge/:id` and `GET /api/auth/asaas/charge/:id/pix`.

Displays:
- Payment metadata (value, status, due date, description)
- PIX QR code image (`<img :src="pixQrCode" />`, base64)
- PIX copia-e-cola string in a `UInput` with a copy button

`UButton` "Voltar" navigates to `/`.

## Middleware

`app/middleware/auth.ts` — runs on every navigation. Calls `authClient.getSession()`. If no session and the route is not `/login`, redirects to `/login`.

## Webhook Endpoint

Registered automatically by the `webhooks()` sub-plugin at `POST /api/auth/asaas/webhook`.

Asaas must send the `asaas-access-token` header matching `ASAAS_WEBHOOK_ACCESS_TOKEN`. The handler dispatches to `onPaymentReceived`, `onPaymentOverdue`, or `onPaymentDeleted` based on the event type.

**Local development:** the webhook URL must be reachable by Asaas. Use a tunnel tool (ngrok, cloudflared, localtunnel) to expose the local server. See the README for instructions.

## Environment Variables

`.env.example`:

```env
# Asaas
ASAAS_API_KEY=your_api_key
ASAAS_SANDBOX=true
ASAAS_WEBHOOK_ACCESS_TOKEN=your_webhook_token

# Better Auth
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000
```

## Dependencies

```json
{
  "dependencies": {
    "better-auth": ">=1.0.0",
    "better-auth-asaas": "workspace:*",
    "drizzle-orm": "latest",
    "better-sqlite3": "latest",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "latest",
    "drizzle-kit": "latest"
  }
}
```

`better-auth-asaas` is referenced as `workspace:*` so the example always uses the local build.

## README

The example README covers:
1. Prerequisites (Node 18+, pnpm, Asaas sandbox account)
2. Install + build the root package (`pnpm install && pnpm build`)
3. Copy `.env.example` to `.env` and fill in values
4. Generate + push schema (`pnpm dlx @better-auth/cli generate` then `pnpm db:push`)
5. Run the dev server (`pnpm dev`)
6. Webhook tunneling note: expose `http://localhost:3000` with a tunnel, then configure `<tunnel-url>/api/auth/asaas/webhook` + the access token in the Asaas dashboard
