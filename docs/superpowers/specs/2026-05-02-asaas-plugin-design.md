# better-auth-asaas Plugin Design

**Date:** 2026-05-02
**Status:** Approved

## Overview

A standalone community plugin that integrates [Asaas](https://asaas.com) (Brazilian payment platform) with [Better Auth](https://better-auth.com). Modeled after `@polar-sh/better-auth`. Scope: one-time PIX charges only, no subscriptions.

## Package

- **Name:** `better-auth-asaas`
- **Type:** Standalone npm package (not part of the better-auth monorepo)
- **Build:** `tsup` — dual ESM + CJS output
- **Peer deps:** `better-auth`, `zod`
- **Entry points:** `.` (server) and `./client`

## File Structure

```
better-auth-asaas/
├── src/
│   ├── index.ts          # re-exports server plugin + sub-plugins
│   ├── server.ts         # main asaas() plugin (customer auto-create on sign-up)
│   ├── client.ts         # asaasClient() client plugin
│   ├── types.ts          # shared types
│   └── plugins/
│       ├── charge.ts     # PIX charge endpoints (create, list, get, pixQrCode)
│       └── webhooks.ts   # webhook handler + lifecycle hooks
├── package.json
└── tsconfig.json
```

## Schema

Only one field is added to the existing `user` table. No new tables — Asaas is the source of truth for all charge data.

| Table | Field | Type | Notes |
|---|---|---|---|
| `user` | `asaasCustomerId` | `string` (optional) | Asaas customer ID, set on sign-up |

## Server-Side API

```ts
import { betterAuth } from "better-auth"
import { asaas, charge, webhooks } from "better-auth-asaas"

export const auth = betterAuth({
  plugins: [
    asaas({
      apiKey: process.env.ASAAS_API_KEY!,
      sandbox: true,
      createCustomerOnSignUp: true,
      getCustomerCreateParams: async ({ user }) => ({
        cpfCnpj: user.cpfCnpj,   // required by Asaas
        mobilePhone: user.phone,  // optional
      }),
      onCustomerCreate: async ({ asaasCustomer, user }) => {},
      use: [
        charge({
          onPaymentReceived: async ({ payment, user }) => {},
          onPaymentOverdue:  async ({ payment, user }) => {},
          onPaymentDeleted:  async ({ payment, user }) => {},
        }),
        webhooks({
          accessToken: process.env.ASAAS_WEBHOOK_TOKEN!,
        }),
      ],
    })
  ]
})
```

### Plugin Options

| Option | Type | Required | Description |
|---|---|---|---|
| `apiKey` | `string` | Yes | Asaas API key |
| `sandbox` | `boolean` | No | Use sandbox environment (default: `false`) |
| `createCustomerOnSignUp` | `boolean` | No | Auto-create Asaas customer on user sign-up (default: `false`) |
| `getCustomerCreateParams` | `function` | Required when `createCustomerOnSignUp: true` | Returns Asaas customer fields (must include `cpfCnpj`) |
| `onCustomerCreate` | `function` | No | Called after customer is created; receives `{ asaasCustomer, user }` |
| `use` | `array` | No | Sub-plugins: `charge()`, `webhooks()` |

## Client-Side API

```ts
import { createAuthClient } from "better-auth/client"
import { asaasClient } from "better-auth-asaas/client"

export const authClient = createAuthClient({
  plugins: [asaasClient()]
})

// Create a PIX charge
const { data, error } = await authClient.asaas.charge.create({
  value: 99.90,
  dueDate: "2026-05-10",
  description: "Pro plan",
})
// data.pixQrCode      — base64 QR code image
// data.pixCopiaECola  — copy-paste PIX key string

// List all charges for the current user
const { data } = await authClient.asaas.charge.list()

// Get a specific charge
const { data } = await authClient.asaas.charge.get({ paymentId: "pay_123" })

// Get PIX QR code for an existing charge
const { data } = await authClient.asaas.charge.pixQrCode({ paymentId: "pay_123" })
```

All endpoints are authenticated — the current user's `asaasCustomerId` is resolved from the session.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/asaas/charge` | Create a PIX charge |
| `GET` | `/api/auth/asaas/charges` | List charges for current user |
| `GET` | `/api/auth/asaas/charge/:id` | Get a specific charge |
| `GET` | `/api/auth/asaas/charge/:id/pix` | Get PIX QR code for a charge |
| `POST` | `/api/auth/asaas/webhook` | Asaas webhook receiver |

## Webhook Handling

Webhook endpoint: `/api/auth/asaas/webhook`

Verification: Asaas sends the configured token in the `asaas-access-token` header. The plugin compares it against `accessToken` from `webhooks()` options and rejects requests that don't match.

Unrecognized events are silently ignored.

### Lifecycle Hooks (on `charge()`)

| Asaas Event | Hook | Payload |
|---|---|---|
| `PAYMENT_RECEIVED` | `onPaymentReceived` | `{ payment, user }` |
| `PAYMENT_OVERDUE` | `onPaymentOverdue` | `{ payment, user }` |
| `PAYMENT_DELETED` | `onPaymentDeleted` | `{ payment, user }` |

The `user` object is resolved by looking up `asaasCustomerId` in the local database, so hooks always have access to the local user context.

## Error Handling

All endpoints use `APIError` from `better-auth/api`:

| Situation | Error Code |
|---|---|
| Missing `cpfCnpj` in customer params | `BAD_REQUEST` |
| User has no `asaasCustomerId` | `BAD_REQUEST` |
| Charge not found | `NOT_FOUND` |
| Asaas API failure | `INTERNAL_SERVER_ERROR` |
| Invalid webhook token | `UNAUTHORIZED` |

## Asaas API Environments

| Mode | Base URL |
|---|---|
| Sandbox | `https://api-sandbox.asaas.com/v3` |
| Production | `https://api.asaas.com/v3` |

Controlled by the `sandbox` option on the main `asaas()` plugin.

## Out of Scope (v1)

- Subscriptions / recurring charges
- Boleto and Credit Card payment methods
- Refunds
- Split payments
- Customer portal
