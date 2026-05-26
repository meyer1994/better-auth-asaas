# Next.js Example App — Design

## Goal

Add `examples/next/` — a Next.js App Router example that mirrors the existing `examples/nuxt/` example feature-for-feature. Same auth flow, same Asaas integration, same SQLite + Drizzle backend, same set of pages.

## Stack

- Next.js 15 (App Router, React Server Components)
- React 19 + TypeScript
- shadcn/ui + Tailwind v4
- Better Auth + `better-auth-asaas` (workspace dep)
- Drizzle ORM + `better-sqlite3`
- `react-hook-form` + `zod` resolver for forms

## Workspace Integration

- Add `examples/next` to `pnpm-workspace.yaml`.
- Add `example:next` script in root `package.json` mirroring `example:nuxt`.
- Depend on `better-auth-asaas: workspace:*`.

## File Layout

```
examples/next/
  package.json
  tsconfig.json
  next.config.ts
  drizzle.config.ts
  components.json            # shadcn config
  .env.example
  src/
    middleware.ts            # protects "/" and "/charges/*"
    lib/
      auth.ts                # betterAuth() server instance
      auth-client.ts         # createAuthClient() for the browser
      asaas-client.ts        # typed fetch helpers
      db/
        index.ts
        schema.ts
    app/
      layout.tsx             # root layout + Toaster
      page.tsx               # dashboard: charges table (RSC)
      login/page.tsx         # email+password + signup with cpfCnpj
      charges/new/page.tsx   # client form
      charges/[id]/page.tsx  # detail + PIX QR
      api/auth/[...all]/route.ts  # toNextJsHandler(auth)
    components/
      user-menu.tsx
      app-sidebar.tsx        # default layout equivalent
      ui/...                 # shadcn primitives (button, table, input, etc.)
```

## Parity Map (Nuxt → Next)

| Nuxt | Next |
|---|---|
| `app/pages/login.vue` | `src/app/login/page.tsx` |
| `app/pages/index.vue` | `src/app/page.tsx` (RSC) |
| `app/pages/charges/new.vue` | `src/app/charges/new/page.tsx` |
| `app/pages/charges/[id].vue` | `src/app/charges/[id]/page.tsx` |
| `app/middleware/auth.ts` | `src/middleware.ts` |
| `server/api/auth/[...all].ts` | `src/app/api/auth/[...all]/route.ts` |
| `server/utils/auth.ts` | `src/lib/auth.ts` (identical config) |
| `server/db/*` | `src/lib/db/*` (identical schema) |
| `app/utils/auth-client.ts` | `src/lib/auth-client.ts` |
| `app/composables/useAsaasClient.ts` | `src/lib/asaas-client.ts` |
| `app/components/UserMenu.vue` | `src/components/user-menu.tsx` |
| `app/layouts/default.vue` | `src/components/app-sidebar.tsx` |

## Data Flow

- **Server components** (`/`, `/charges/[id]`) call `auth.api.listCharges({ headers: await headers() })` / `auth.api.getCharge(...)` directly. No extra fetch hop.
- **Client components** (new charge form, PIX QR refresh) call `/api/auth/asaas/*` through typed helpers in `src/lib/asaas-client.ts`. The helpers wrap `fetch` and reuse `AsaasPayment`/`AsaasPaymentList`/`AsaasPixQrCode` types from `better-auth-asaas`.
- Auth gating: `src/middleware.ts` checks the session cookie (`getSessionCookie` from `better-auth/cookies`) at the edge for fast redirects. Protected server pages also call `auth.api.getSession` once for an authoritative recheck.

## Auth Configuration

Identical to the Nuxt example's `server/utils/auth.ts`:

- `emailAndPassword: { enabled: true }`
- `asaas({ apiKey, sandbox, createCustomerOnSignUp: true, getCustomerCreateParams: ({ user }) => ({ cpfCnpj: user.cpfCnpj }) })`
- `use: [charge(), webhooks({ onPaymentReceived, onPaymentOverdue, onPaymentDeleted })]`
- Drizzle adapter, SQLite provider, same schema (`user` extended with `cpfCnpj` and `asaasCustomerId`).

## Forms

- `login/page.tsx`: tabs for sign-in / sign-up. Sign-up form requires `name`, `email`, `password`, `cpfCnpj`. Uses `react-hook-form` + `zod` schema.
- `charges/new/page.tsx`: fields `value` (number, BRL), `dueDate` (date), `description` (optional). Submits via `asaasClient.createCharge`.

## Pages In Detail

- `/login` — sign-in/sign-up tabs, redirects to `/` on success.
- `/` (dashboard) — server-rendered shadcn `Table` of the user's charges with status badges. Empty state with CTA to `/charges/new`.
- `/charges/new` — client form, on success redirects to `/charges/[id]`.
- `/charges/[id]` — card with charge metadata + PIX QR section (`getPixQrCode`) with a manual refresh button and a "Copia e Cola" copy button.

## Out Of Scope (YAGNI)

- Tests (the Nuxt example has none either).
- Deploy / Docker config beyond `.env.example`.
- Theme switcher, i18n.
- Webhook receiver UI (covered by the existing `webhooks()` server handler; logging only, like the Nuxt example).

## Environment Variables

Mirror `examples/nuxt/.env.example`:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (default `http://localhost:3000`)
- `ASAAS_API_KEY`
- `ASAAS_SANDBOX` (default `true`)

## Scripts

```
"dev": "next dev",
"build": "next build",
"start": "next start",
"typecheck": "tsc --noEmit",
"db:push": "drizzle-kit push"
```
