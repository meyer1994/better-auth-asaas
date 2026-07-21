# better-auth-asaas

[Asaas](https://www.asaas.com/) payments plugin for [Better
Auth](https://www.better-auth.com/). Auto-creates an Asaas customer on sign-up
and exposes endpoints for PIX charges, subscriptions, QR codes, and webhook
dispatch - no extra tables.

## Layout

```
.                 # plugin (publishable package)
examples/nuxt     # Nuxt 4 demo
examples/next     # Next demo
```

## Install

```bash
pnpm add better-auth-asaas
```

## Usage

```ts
// auth.ts
import { betterAuth } from "better-auth";
import { asaas } from "better-auth-asaas";

export const auth = betterAuth({
  plugins: [
    asaas({
      apiKey: process.env.ASAAS_API_KEY!,
      sandbox: true,

      webhookAccessToken: process.env.ASAAS_WEBHOOK_ACCESS_TOKEN!,
      onWebhook: (e) => console.log(e.event, e.id),
      onPaymentReceived: (e) => console.log("paid", e.payment.id),
    }),
  ],
});
```

```ts
// auth-client.ts
import { createAuthClient } from "better-auth/client";
import { asaasClient } from "better-auth-asaas/client";

export const authClient = createAuthClient({
  plugins: [asaasClient()],
});
```

## Endpoints

| Path                          | Method | Description                                   |
| ----------------------------- | ------ | --------------------------------------------- |
| `/asaas/payments/create`      | POST   | Create a PIX charge for the session user.     |
| `/asaas/payments/list`        | GET    | List payments.                                |
| `/asaas/payments/qr?id={pid}` | GET    | Get the PIX QR code for a payment.            |
| `/asaas/subscriptions/create` | POST   | Create a subscription for the session user.   |
| `/asaas/subscriptions/list`   | GET    | List subscriptions.                           |
| `/asaas/webhook`              | POST   | Dispatch Asaas payment/subscription webhooks. |

## Options

| Field     | Type      | Description                                |
| --------- | --------- | ------------------------------------------ |
| `apiKey`  | `string`  | Asaas API key.                             |
| `sandbox` | `boolean` | Use the sandbox base URL. Default `false`. |

### Webhooks

| Field                | Type       | Description                                                      |
| -------------------- | ---------- | ---------------------------------------------------------------- |
| `webhookAccessToken` | `string`   | Shared secret; must match the Asaas `asaas-access-token` header. |
| `onWebhook`          | `function` | Optional handler for any webhook event.                          |

Webhook-specific handlers are also supported. Payment handlers include
`onPaymentCreated`, `onPaymentReceived`, `onPaymentUpdated`,
`onPaymentConfirmed`, `onPaymentOverdue`, `onPaymentDeleted`, refund,
chargeback, dunning, bank slip, checkout, split divergence, and risk-analysis
handlers. Subscription handlers include `onSubscriptionCreated`,
`onSubscriptionUpdated`, `onSubscriptionInactivated`, `onSubscriptionDeleted`,
`onSubscriptionSplitDisabled`, and split divergence handlers.

## Schema

Adds two fields to the `user` table:

| Field             | Type     | Notes                                  |
| ----------------- | -------- | -------------------------------------- |
| `cpfCnpj`         | `string` | Required at sign-up.                   |
| `asaasCustomerId` | `string` | Set automatically after user creation. |

## Commands

Root scripts apply to the plugin only. For examples, `cd` into the example
directory (or use `pnpm --filter`).

| Script           | Description            |
| ---------------- | ---------------------- |
| `pnpm run build` | Build (`tsup`)         |
| `pnpm run dev`   | Build in watch         |
| `pnpm run test`  | Run vitest             |
| `pnpm run clean` | Remove build artifacts |

See [`examples/nuxt/README.md`](./examples/nuxt/README.md) and
[`examples/next/README.md`](./examples/next/README.md) for the demo apps.
