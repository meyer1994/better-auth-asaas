# better-auth-asaas

[Asaas](https://www.asaas.com/) payments for [Better
Auth](https://www.better-auth.com/): PIX one-time charges, optional customer
creation on sign-up, and webhooks that dispatch into your app without extra
tables.

- **Transport:** plain `fetch` to Asaas REST API v3 (no official Node SDK
  required).
- **Output:** ESM and CJS builds with TypeScript declarations (`tsup`).

## Requirements

- **Node** with a modern runtime that provides `fetch` and `Request` (Node 18+
  is typical).
- Peer dependencies: **`better-auth`** `>=1.0.0`, **`zod`** `^3.25.0 || ^4.0.0`.

Install in your app (package manager of your choice):

```bash
pnpm add better-auth-asaas better-auth zod
```

Build this package from source when developing locally:

```bash
pnpm install
pnpm build
pnpm test
```

Published installs consume the `dist/` artifacts referenced by `package.json`
`"exports"`.

## Server plugin

Import the main plugin and any sub-plugins from the package root:

```ts
import { betterAuth } from "better-auth";
import { asaas, charge, webhooks } from "better-auth-asaas";

export const auth = betterAuth({
  plugins: [
    asaas({
      apiKey: process.env.ASAAS_API_KEY!,
      sandbox: process.env.ASAAS_SANDBOX === "true",
      createCustomerOnSignUp: true,
      getCustomerCreateParams: async ({ user }) => ({
        cpfCnpj: "...", // required when auto-creating customers
      }),
      onCustomerCreate: async ({ asaasCustomer, user }) => {
        /* optional */
      },
      use: [
        charge({
          onPaymentReceived: async ({ payment, user }) => {
            /* optional; same hooks power webhook dispatch */
          },
          onPaymentOverdue: async ({ payment, user }) => {},
          onPaymentDeleted: async ({ payment, user }) => {},
        }),
        webhooks({
          accessToken: process.env.ASAAS_WEBHOOK_ACCESS_TOKEN!,
        }),
      ],
    }),
  ],
});
```

### User schema

The plugin extends the Better Auth **user** model with an optional string field:

| Field             | Purpose                                 |
| ----------------- | --------------------------------------- |
| `asaasCustomerId` | Asaas customer id stored after creation |

When `createCustomerOnSignUp` is enabled, a row’s `asaasCustomerId` is set after
a successful `POST /customers` call. Charge endpoints require this field for the
signed-in user.

### Options (`AsaasOptions`)

| Option                    | Description                                                                     |
| ------------------------- | ------------------------------------------------------------------------------- |
| `apiKey`                  | Asaas API key (sent as `access_token` on API requests).                         |
| `sandbox`                 | Use sandbox base URL. Default `false`.                                          |
| `createCustomerOnSignUp`  | After user creation, create an Asaas customer. Default `false`.                 |
| `getCustomerCreateParams` | Required when `createCustomerOnSignUp` is true; must return at least `cpfCnpj`. |
| `onCustomerCreate`        | Optional callback after the customer is created and the user is updated.        |
| `use`                     | Sub-plugins (typically `charge()` and `webhooks()`).                            |

API calls use:

- Production: `https://api.asaas.com/v3`
- Sandbox: `https://api-sandbox.asaas.com/v3`

## Charge sub-plugin (`charge`)

Registers authenticated endpoints (paths are appended under your Better Auth
base URL, e.g. `/api/auth`):

| Method | Path                    | Description                                                |
| ------ | ----------------------- | ---------------------------------------------------------- |
| `POST` | `/asaas/charge`         | Create a PIX charge and return payment + QR payload fields |
| `GET`  | `/asaas/charges`        | List payments for the session user’s Asaas customer        |
| `GET`  | `/asaas/charge/:id`     | Fetch one payment by id                                    |
| `GET`  | `/asaas/charge/:id/pix` | PIX QR payload for a payment                               |

**Create body (JSON):**

- `value` — positive number  
- `dueDate` — `YYYY-MM-DD`  
- `description` — optional, max 500 chars  
- `externalReference` — optional  

**Create response** includes the payment fields from Asaas plus:

- `pixQrCode` — base64 image string from Asaas  
- `pixCopiaECola` — PIX copy-and-paste payload  

Pass **`onPaymentReceived`**, **`onPaymentOverdue`**, and **`onPaymentDeleted`**
on `charge({ ... })`. The main plugin forwards those hooks to the webhook
handler so HTTP notifications and your callbacks stay aligned.

## Webhooks sub-plugin (`webhooks`)

Registers **`POST /asaas/webhook`**.

1. Asaas must send header **`asaas-access-token`** matching `webhooks({
   accessToken })`.
2. Body is parsed as JSON (`AsaasWebhookPayload`: `event` + `payment`).
3. The handler loads `user` via `internalAdapter.findOne` on
   **`asaasCustomerId`** = `payment.customer` (when available).
4. Known events invoke the matching hook from **`charge()`** options:

| Event              | Hook called         |
| ------------------ | ------------------- |
| `PAYMENT_RECEIVED` | `onPaymentReceived` |
| `PAYMENT_OVERDUE`  | `onPaymentOverdue`  |
| `PAYMENT_DELETED`  | `onPaymentDeleted`  |

Other events are ignored; the endpoint still responds with `{ received: true }`.

Configure the webhook URL and token in the Asaas dashboard to match your
deployed Better Auth base URL and secret.

## Client plugin (types)

For Better Auth’s client bundle, import the thin client plugin so server
endpoint types infer correctly:

```ts
import { createAuthClient } from "better-auth/client";
import { asaasClient } from "better-auth-asaas/client";

export const authClient = createAuthClient({
  plugins: [asaasClient()],
});
```

Entry point: **`better-auth-asaas/client`** (see `"exports"` in `package.json`).

## Errors

Endpoints use Better Auth’s **`APIError`** where appropriate (for example
`UNAUTHORIZED` when there is no session, or when the webhook token is wrong).

## Development

| Script      | Command           |
| ----------- | ----------------- |
| Build       | `pnpm build`      |
| Test        | `pnpm test`       |
| Watch tests | `pnpm test:watch` |
| Watch build | `pnpm dev`        |

## License

Specify your license in `package.json` or add a `LICENSE` file when you publish.
