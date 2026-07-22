# @meyer1994/better-auth-asaas

[Asaas](https://www.asaas.com/) payments plugin for [Better
Auth](https://www.better-auth.com/). Auto-creates an Asaas customer on sign-up
and exposes endpoints for PIX and credit-card charges, subscriptions, payment
lookups, QR codes, and webhook dispatch. Local `asaas_payment` and
`asaas_subscription` tables mirror payment/subscription state, while
`asaas_webhook` stores webhook deliveries and raw payloads. Asaas remains the
source of truth.

## Layout

```
.                 # plugin (publishable package)
examples/nuxt     # Nuxt 4 demo
examples/next     # Next demo
```

## Install

```bash
pnpm add @meyer1994/better-auth-asaas
```

## Public exports

The package exposes the plugin, client plugin, public Asaas types, and reusable
Zod schemas through separate entry points:

```ts
import { asaas } from "@meyer1994/better-auth-asaas";
import { asaasClient } from "@meyer1994/better-auth-asaas/client";
import type { Payment, Subscription } from "@meyer1994/better-auth-asaas/types";
import { createPaymentSchema } from "@meyer1994/better-auth-asaas/zods";
```

Use the `types` export for response and request DTOs and the `zods` export for
endpoint validation schemas shared by server and client applications.

## Usage

```ts
// auth.ts
import { betterAuth } from "better-auth";
import { asaas } from "@meyer1994/better-auth-asaas";

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
import { asaasClient } from "@meyer1994/better-auth-asaas/client";

export const authClient = createAuthClient({
  plugins: [asaasClient()],
});
```

## Endpoints

### Payments

| Path                                          | Method | Description                                      |
| --------------------------------------------- | ------ | ------------------------------------------------ |
| `/asaas/payments/create`                      | POST   | Create a PIX charge for the session user.        |
| `/asaas/payments/create-credit-card`          | POST   | Create a credit-card charge for the session user.|
| `/asaas/payments/list`                        | GET    | List payments.                                   |
| `/asaas/payments/get?id={pid}`                | GET    | Get a payment by id.                             |
| `/asaas/payments/status?id={pid}`             | GET    | Get payment status.                              |
| `/asaas/payments/identification-field?id={pid}` | GET  | Get boleto/Pix identification field.             |
| `/asaas/payments/billing-info?id={pid}`       | GET    | Get payment billing info.                        |
| `/asaas/payments/viewing-info?id={pid}`       | GET    | Get payment viewing info.                        |
| `/asaas/payments/qr?id={pid}`                 | GET    | Get the PIX QR code for a payment.               |
| `/asaas/payments/pay-with-card`               | POST   | Pay an existing charge with card type + token.   |
| `/asaas/payments/pay-with-credit-card`        | POST   | Pay an existing charge with a credit-card token. |

### Subscriptions

| Path                                          | Method | Description                                         |
| --------------------------------------------- | ------ | --------------------------------------------------- |
| `/asaas/subscriptions/create`                 | POST   | Create a subscription for the session user.         |
| `/asaas/subscriptions/create-credit-card`     | POST   | Create a credit-card subscription.                  |
| `/asaas/subscriptions/list`                   | GET    | List subscriptions.                                 |
| `/asaas/subscriptions/get?id={sid}`           | GET    | Get a subscription by id.                           |
| `/asaas/subscriptions/update`                 | POST   | Update a subscription.                              |
| `/asaas/subscriptions/update-credit-card`     | POST   | Update a subscription credit card.                  |
| `/asaas/subscriptions/delete`                 | POST   | Delete a subscription.                              |
| `/asaas/subscriptions/payments?id={sid}`      | GET    | List payments for a subscription.                   |
| `/asaas/subscriptions/payment-book?id={sid}`  | GET    | Get the subscription payment book.                  |

### Webhooks

| Path             | Method | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
| `/asaas/webhook` | POST   | Dispatch Asaas payment/subscription webhooks. |

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

Adds fields to the `user` table and three tables (`asaasPayment`,
`asaasSubscription`, `asaasWebhook`). Asaas remains the source of truth for
create/list/get API calls; local rows are upserted after successful creates and
from webhook payloads. The `asaasWebhook` table stores top-level webhook data
and the raw payload for idempotency and delivery inspection. Run `auth generate`
(or your ORM migrate flow) after adding the plugin.

### `user`

| Field             | Type     | Notes                                  |
| ----------------- | -------- | -------------------------------------- |
| `cpfCnpj`         | `string` | Required at sign-up.                   |
| `asaasCustomerId` | `string` | Set automatically after user creation. |

### `asaasPayment`

| Field                 | Type      | Notes                                      |
| --------------------- | --------- | ------------------------------------------ |
| `userId`              | `string`  | References `user.id` (cascade).             |
| `asaasPaymentId`      | `string`  | Unique Asaas payment id.                   |
| `asaasCustomerId`     | `string`  | Asaas customer id.                         |
| `asaasSubscriptionId` | `string?` | Set when the payment belongs to a subscription. |
| `status`              | `string`  | Asaas payment status.                      |
| `billingType`         | `string`  | e.g. `PIX`, `CREDIT_CARD`.                 |
| `value`               | `string`  | Charge amount (string to preserve decimals). |
| `dueDate`             | `string`  | Asaas due date string.                     |
| `paymentDate`         | `string?` | Asaas payment date string.                 |
| `description`         | `string?` | Optional description.                      |
| `deleted`             | `boolean` | Mirrored from Asaas (`payment.deleted`).   |
| `createdAt`           | `date`    | Local row created at.                      |
| `updatedAt`           | `date`    | Local row updated at.                      |

### `asaasSubscription`

| Field                  | Type      | Notes                                         |
| ---------------------- | --------- | --------------------------------------------- |
| `userId`               | `string`  | References `user.id` (cascade).                |
| `asaasSubscriptionId`  | `string`  | Unique Asaas subscription id.                 |
| `asaasCustomerId`      | `string`  | Asaas customer id.                            |
| `status`               | `string`  | Asaas subscription status.                    |
| `billingType`          | `string`  | e.g. `PIX`, `CREDIT_CARD`.                    |
| `cycle`                | `string`  | Billing cycle.                                |
| `value`                | `string`  | Subscription amount (string to preserve decimals). |
| `nextDueDate`          | `string`  | Asaas next due date string.                   |
| `endDate`              | `string?` | Optional end date.                            |
| `description`          | `string?` | Optional description.                         |
| `deleted`              | `boolean` | Mirrored from Asaas (`subscription.deleted`). |
| `createdAt`            | `date`    | Local row created at.                         |
| `updatedAt`            | `date`    | Local row updated at.                         |

### `asaasWebhook`

Stores the top-level fields of each Asaas webhook event. The Asaas event ID is
unique, so repeated deliveries update the existing row.

| Field            | Type      | Notes                               |
| ---------------- | --------- | ----------------------------------- |
| `asaasEventId`   | `string`  | Unique Asaas webhook event id.      |
| `event`          | `string`  | Asaas event type.                   |
| `dateCreated`    | `string`  | Asaas event creation timestamp.     |
| `accountId`      | `string?` | Asaas account id, when provided.    |
| `ownerId`        | `string?` | Parent account id, when provided.   |
| `additionalInfo` | `string?` | Additional Asaas event information. |
| `rawPayload`     | `string`  | JSON string of the complete event.  |
| `createdAt`      | `date`    | Local row created at.               |
| `updatedAt`      | `date`    | Local row updated at.               |

## Commands

Root scripts apply to the plugin only. For examples, `cd` into the example
directory (or use `pnpm --filter`).

| Script               | Description            |
| -------------------- | ---------------------- |
| `pnpm run build`     | Build (`tsup`)         |
| `pnpm run dev`       | Build in watch         |
| `pnpm run test`      | Run vitest             |
| `pnpm run typecheck` | Run TypeScript         |
| `pnpm run lint`      | Run ESLint             |
| `pnpm run clean`     | Remove build artifacts |

See [`examples/nuxt/README.md`](./examples/nuxt/README.md) and
[`examples/next/README.md`](./examples/next/README.md) for the demo apps.
