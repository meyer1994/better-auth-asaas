# better-auth-asaas — Nuxt example

Nuxt 4 + Nuxt UI app demoing every `better-auth-asaas` feature: sign-up with auto Asaas customer creation, PIX charge creation, charge listing/details with QR code, and the webhook receiver.

## Prerequisites

- Node 18+, pnpm
- [Asaas sandbox account](https://sandbox.asaas.com) + API key

## Setup

```bash
# from repo root
pnpm install
pnpm build                       # build the plugin first

cd examples/nuxt
cp .env.example .env             # fill in the values below
pnpm db:push                     # create the SQLite schema
pnpm dev                         # http://localhost:3000
```

### `.env`

| Variable                    | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| `ASAAS_API_KEY`             | Asaas sandbox API key.                                   |
| `ASAAS_SANDBOX`             | `true` to use the sandbox base URL.                      |
| `ASAAS_WEBHOOK_ACCESS_TOKEN`| Shared secret; must match the value in the Asaas dashboard. |
| `BETTER_AUTH_SECRET`        | Random 32-char string.                                   |
| `BETTER_AUTH_URL`           | `http://localhost:3000` for local dev.                   |

## Commands

| Script            | Description                |
| ----------------- | -------------------------- |
| `pnpm dev`        | Start Nuxt dev server      |
| `pnpm build`      | Production build           |
| `pnpm preview`    | Preview the build          |
| `pnpm typecheck`  | Run `nuxt typecheck`       |
| `pnpm db:push`    | Apply schema via drizzle-kit |

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

`PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `PAYMENT_DELETED` are logged from `server/utils/auth.ts`.

## Keyboard shortcuts

| Shortcut | Action             |
| -------- | ------------------ |
| `g h`    | Go to charges list |
| `g n`    | Go to new charge   |
