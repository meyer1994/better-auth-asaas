# Nuxt example

Nuxt 4 + Nuxt UI demo of `better-auth-asaas`: sign-up with auto Asaas customer
creation, PIX/Boleto/Card charges, charge list with QR codes, and the webhook
receiver.

## Setup

```bash
pnpm install
pnpm build                # build the plugin first
cd examples/nuxt
cp .env.example .env      # fill in values
pnpm db:push              # create SQLite schema
pnpm dev                  # http://localhost:3000
```

## Pages

| Route       | Description                                                         |
| ----------- | ------------------------------------------------------------------- |
| `/`         | Landing.                                                            |
| `/login`    | Email/password sign-in.                                             |
| `/register` | Sign-up (name, CPF/CNPJ, email, password) — creates Asaas customer. |
| `/payments` | Create charges, list payments, view QR code.                        |

## Commands

| Script               | Description                         |
| -------------------- | ----------------------------------- |
| `pnpm dev`           | Start dev server                    |
| `pnpm build`         | Production build                    |
| `pnpm preview`       | Preview the build                   |
| `pnpm typecheck`     | `nuxt typecheck`                    |
| `pnpm lint`          | ESLint                              |
| `pnpm db:push`       | Apply schema (drizzle-kit)          |
| `pnpm db:generate`   | Regenerate auth tables + migrations |
| `pnpm db:migrate`    | Run drizzle migrations              |
| `pnpm auth:generate` | Regenerate `server/db/auth.ts`      |

## Env

| Variable                     | Default / Notes                         |
| ---------------------------- | --------------------------------------- |
| `ASAAS_API_KEY`              | Asaas sandbox API key.                  |
| `ASAAS_SANDBOX`              | `true` to use the sandbox URL.          |
| `ASAAS_WEBHOOK_ACCESS_TOKEN` | Shared secret; matches Asaas dashboard. |
| `BETTER_AUTH_SECRET`         | Random 32-char string.                  |
| `BETTER_AUTH_URL`            | `http://localhost:3000` for local dev.  |

## Webhook (local)

```bash
cloudflared tunnel --url http://localhost:3000
# or: ngrok http 3000
```

In Asaas → **Configurações → Webhooks**: URL
`https://<tunnel>/api/auth/asaas/webhook`, access token =
`ASAAS_WEBHOOK_ACCESS_TOKEN`.
