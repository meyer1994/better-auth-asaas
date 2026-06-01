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
| `/payments`  | Protected dashboard: create PIX charges, list all payments, view QR code per charge.        |

## Commands

| Script               | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `pnpm dev`           | Start Next dev server                                |
| `pnpm build`         | Production build                                     |
| `pnpm start`         | Run the production build                             |
| `pnpm typecheck`     | Run `tsc --noEmit`                                   |
| `pnpm db:push`       | Apply schema via drizzle-kit (no migration files)    |
| `pnpm db:generate`   | Regenerate auth tables + drizzle migration files     |
| `pnpm db:migrate`    | Run drizzle migrations                               |
| `pnpm auth:generate` | Regenerate `src/lib/db/auth.ts` from auth config     |

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
