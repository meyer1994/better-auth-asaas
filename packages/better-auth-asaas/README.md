# better-auth-asaas

[Asaas](https://www.asaas.com/) payments plugin for [Better
Auth](https://www.better-auth.com/). Auto-creates an Asaas customer on sign-up
and exposes endpoints to create and list PIX charges — no extra tables.

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

| Path                          | Method | Description                               |
| ----------------------------- | ------ | ----------------------------------------- |
| `/asaas/payments/create`      | POST   | Create a PIX charge for the session user. |
| `/asaas/payments/list`        | GET    | List the session user's payments.         |
| `/asaas/payments/qr?id={pid}` | GET    | Get the PIX QR code for a payment.        |

## Options

| Field     | Type      | Description                                |
| --------- | --------- | ------------------------------------------ |
| `apiKey`  | `string`  | Asaas API key.                             |
| `sandbox` | `boolean` | Use the sandbox base URL. Default `false`. |

## Schema

Adds two fields to the `user` table:

| Field             | Type     | Notes                                  |
| ----------------- | -------- | -------------------------------------- |
| `cpfCnpj`         | `string` | Required at sign-up.                   |
| `asaasCustomerId` | `string` | Set automatically after user creation. |

## Commands

| Script       | Description            |
| ------------ | ---------------------- |
| `pnpm build` | Build (`tsup`)         |
| `pnpm dev`   | Build in watch         |
| `pnpm test`  | Run vitest             |
| `pnpm clean` | Remove build artifacts |
