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
