# better-auth-asaas - Next.js example

Next.js + shadcn/ui demo of `better-auth-asaas`: sign-up with auto Asaas
customer creation, PIX and credit-card charges, subscriptions, payment lookups,
QR codes, and webhooks.

## Prerequisites

- Node 18+, pnpm
- [Asaas sandbox account](https://sandbox.asaas.com) + API key

## Start

```bash
# from repo root
pnpm install
pnpm run build

cd examples/next
cp .env.example .env   # fill in Asaas + Better Auth values
pnpm run db:push
pnpm run dev           # http://localhost:3000
```

Or from the repo root:

```bash
pnpm --filter better-auth-asaas-example-next dev
```

## Env

Copy `.env.example` to `.env` and set:

| Variable                     | Description                                                 |
| ---------------------------- | ----------------------------------------------------------- |
| `ASAAS_API_KEY`              | Asaas sandbox API key.                                      |
| `ASAAS_SANDBOX`              | `true` to use the sandbox base URL.                         |
| `ASAAS_WEBHOOK_ACCESS_TOKEN` | Shared secret; must match the value in the Asaas dashboard. |
| `BETTER_AUTH_SECRET`         | Random 32-char string.                                      |
| `BETTER_AUTH_URL`            | `http://localhost:3000` for local dev.                      |

## Pages

| Route            | Description                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `/`              | Landing.                                                                                             |
| `/login`         | Email/password sign-in.                                                                              |
| `/register`      | Sign-up with name, CPF/CNPJ, email, and password.                                                    |
| `/payments`      | Protected page: PIX/credit-card charges, pay existing charges, lookups, list payments, view QR codes.|
| `/subscriptions` | Protected page: create/update/delete subscriptions, credit card, payments list, and payment book.    |

## Commands

| Script                   | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `pnpm run dev`           | Start Next dev server                            |
| `pnpm run build`         | Production build                                 |
| `pnpm run start`         | Run the production build                         |
| `pnpm run lint`          | Run ESLint                                       |
| `pnpm run typecheck`     | Run `tsc --noEmit`                               |
| `pnpm run db:push`       | Apply schema via drizzle-kit                     |
| `pnpm run db:generate`   | Regenerate auth tables + drizzle migration files |
| `pnpm run db:migrate`    | Run drizzle migrations                           |
| `pnpm run auth:generate` | Regenerate `src/lib/db/auth.ts` from auth config |

## Webhook (local)

Expose the dev server with a tunnel so Asaas can reach it:

```bash
ngrok http 3000
# or
cloudflared tunnel --url http://localhost:3000
```

In Asaas -> **Configuracoes -> Webhooks**:

- URL: `https://<tunnel>/api/auth/asaas/webhook`
- Access token: value of `ASAAS_WEBHOOK_ACCESS_TOKEN`

Webhook handlers are configured in `src/lib/auth.ts`.
