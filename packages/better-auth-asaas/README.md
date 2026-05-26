# better-auth-asaas

[Asaas](https://www.asaas.com/) payments for [Better
Auth](https://www.better-auth.com/): PIX charges, optional customer creation on
sign-up, and webhook dispatch.

## Install

```bash
pnpm add better-auth-asaas better-auth zod
```

Peers: `better-auth >=1.0.0`, `zod ^3.25.0 || ^4.0.0`. Requires Node 18+.

## Server

```ts
import { betterAuth } from "better-auth";
import { asaas, charge, webhooks } from "better-auth-asaas";

export const auth = betterAuth({
  plugins: [
    asaas({
      apiKey: process.env.ASAAS_API_KEY!,
      sandbox: process.env.ASAAS_SANDBOX === "true",
      createCustomerOnSignUp: true,
      getCustomerCreateParams: async ({ user }) => ({ cpfCnpj: "..." }),
      use: [
        charge(),
        webhooks({ accessToken: process.env.ASAAS_WEBHOOK_ACCESS_TOKEN! }),
      ],
    }),
  ],
});
```

Extends the Better Auth user model with two fields:

| Field             | Type     | Required | Notes                                                 |
| ----------------- | -------- | -------- | ----------------------------------------------------- |
| `cpfCnpj`         | `string` | yes      | Accepted at sign-up (`input: true`).                  |
| `asaasCustomerId` | `string` | no       | Set after the Asaas customer is created.              |

Base URLs: `https://api.asaas.com/v3` (prod) / `https://api-sandbox.asaas.com/v3` (sandbox).

### `asaas()` options

| Option                    | Description                                                    |
| ------------------------- | -------------------------------------------------------------- |
| `apiKey`                  | Asaas API key (sent as `access_token`).                        |
| `sandbox`                 | Use sandbox base URL. Default `false`.                         |
| `createCustomerOnSignUp`  | Create an Asaas customer after user creation. Default `false`. |
| `getCustomerCreateParams` | Required when above is true; must return at least `cpfCnpj`.   |
| `onCustomerCreate`        | Optional callback after customer creation.                     |
| `use`                     | Sub-plugins: `charge()` and/or `webhooks()`.                   |

### Endpoints (under your Better Auth base, e.g. `/api/auth`)

| Method | Path                    | Description                         |
| ------ | ----------------------- | ----------------------------------- |
| `POST` | `/asaas/charge`         | Create a PIX charge (returns QR).   |
| `GET`  | `/asaas/charges`        | List payments for the session user. |
| `GET`  | `/asaas/charge/:id`     | Fetch one payment.                  |
| `GET`  | `/asaas/charge/:id/pix` | PIX QR payload for a payment.       |
| `POST` | `/asaas/webhook`        | Asaas webhook receiver.             |

Create body: `{ value, dueDate: "YYYY-MM-DD", description?, externalReference?
}`. Response adds `pixQrCode` (base64) and `pixCopiaECola`.

### Webhook

Requires header `asaas-access-token` matching `webhooks({ accessToken })`. On every event the handler looks up the user by `asaasCustomerId = payment.customer` and invokes the matching hook from `charge()` (if defined). The endpoint always responds `{ received: true }`.

Every Asaas payment event maps to a hook — naming follows `EVENT_NAME` → `onEventName`. Examples:

| Event                              | Hook                            |
| ---------------------------------- | ------------------------------- |
| `PAYMENT_CREATED`                  | `onPaymentCreated`              |
| `PAYMENT_CONFIRMED`                | `onPaymentConfirmed`            |
| `PAYMENT_RECEIVED`                 | `onPaymentReceived`             |
| `PAYMENT_OVERDUE`                  | `onPaymentOverdue`              |
| `PAYMENT_DELETED`                  | `onPaymentDeleted`              |
| `PAYMENT_REFUNDED`                 | `onPaymentRefunded`             |
| `PAYMENT_CHARGEBACK_REQUESTED`     | `onPaymentChargebackRequested`  |
| …28 events total                   | see `ChargeHooks` in `types.ts` |

## Client

```ts
import { createAuthClient } from "better-auth/client";
import { asaasClient } from "better-auth-asaas/client";

export const authClient = createAuthClient({ plugins: [asaasClient()] });
```

## Development

| Script            | Description  |
| ----------------- | ------------ |
| `pnpm build`      | Build (tsup) |
| `pnpm dev`        | Watch build  |
| `pnpm test`       | Run tests    |
| `pnpm test:watch` | Watch tests  |
