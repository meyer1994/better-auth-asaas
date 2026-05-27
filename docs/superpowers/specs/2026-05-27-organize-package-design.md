---
date: 2026-05-27
status: approved
---

# Organize `better-auth-asaas` package

## Goal

Tidy the existing package before adding features: drop unused Zod schemas, set up the public API surface, trim noisy logs, and add fresh unit tests covering what's there today. No new features, no architectural changes.

## Scope

In:
- Trim `src/zods.ts` to only what's referenced by current code.
- Wire `src/index.ts` to export the server plugin.
- Minor log cleanup in `src/server.ts`.
- Fresh Vitest unit tests for all source files.

Out:
- New endpoints, new schemas, new features.
- File-layout changes (stays flat).
- Refactors to `client.ts`, `middleware.ts`, `asaas.ts`, `endpoints.ts` (webhook switch stays as-is).
- Integration tests, README, docs.

## Changes

### 1. `src/zods.ts` — trim to used surface

Keep:
- Schemas: `CreatePaymentInputSchema`, `ListPaymentsInputSchema`, `WebhookPayloadSchema`, `PaymentWebhookEventSchema`.
- Types: `Payment`, `PaymentStatus`, `ListResponse<T>`, `ListPaymentsOutput`, `Customer`, `PaymentWebhookHandler`, `Webhooks`, and inferred input types for the kept schemas.

Remove:
- `CreateCustomerInputSchema`, `ListCustomersInputSchema`, `UpdateCustomerInputSchema`, `ListCustomersOutput`.
- `PaymentIdInputSchema`, `UpdatePaymentInputSchema`, `CreatePaymentWithCardInputSchema`.
- `GetPaymentStatusOutput`, `GetPaymentPixQrCodeOutput`, `GetPaymentBoletoLineOutput`.

Expected size: ~575 → ~200 lines.

### 2. `src/index.ts` — public exports

```ts
export { asaas } from "./server";
```

Options/Webhooks types remain internal — consumers pass an object literal and TS infers from the function signature. The `./client` subpath in `package.json` is unchanged.

### 3. `src/server.ts` — log cleanup

In the `user.create.after` hook, reduce to two info logs:
- "Creating Asaas customer" (before the request).
- "Asaas customer created" (after `internalAdapter.updateUser` succeeds).

Drop the "skipped" info log (early return is silent) and the redundant "updated" log. Errors are thrown by `client.request` and propagate normally — no try/catch added.

### 4. Tests — fresh unit tests at `src/__tests__/`

All tests use plain mocks (no real HTTP, no Better Auth runtime).

- **`asaas.test.ts`** — `Client.request`:
  - Builds sandbox URL when `sandbox: true`, production URL otherwise.
  - Sets `access_token` header from `apiKey`.
  - Returns parsed JSON on 2xx.
  - Throws on non-2xx.
  - Mocks global `fetch`.

- **`endpoints.test.ts`**:
  - `createCharge`: handler called with mocked `ctx` (session containing `asaasCustomerId`, valid body, mocked `Client`). Asserts outbound `POST /payments` body shape and that response is passed through `ctx.json`.
  - `listPayments`: same pattern; asserts query string includes `customer=<id>` plus passed filters, undefined values skipped.
  - `webhook`: for each event in the switch, the corresponding handler in `Webhooks` is called with the payment. An unknown event no-ops. Missing handler does not throw.

- **`middleware.test.ts`** — `requireAsaasCustomerId`:
  - Passes through when `ctx.context.session.user.asaasCustomerId` is set.
  - Throws when it is missing.

- **`server.test.ts`**:
  - Plugin shape: `id === "asaas"`, endpoints object has `createCharge`, `listPayments`, `webhook` keys, schema declares `user.fields.asaasCustomerId`.
  - User-create hook: invoking `init().options.databaseHooks.user.create.after` with a user that has `cpfCnpj` triggers `client.request("/customers", ...)` and `ctx.context.internalAdapter.updateUser(id, { asaasCustomerId })`. Without `cpfCnpj`, no calls occur.

## Non-goals / explicit deferrals

- README, usage docs.
- Client-side helpers beyond what already exists.
- Re-adding any trimmed schema — deferred until a feature actually needs it.
- Restructuring `zods.ts` into multiple files — flat single file is fine at the reduced size.

## Success criteria

- `pnpm test` passes with the new tests.
- `pnpm build` succeeds; `dist/index.js` exports `asaas`.
- No dead exports in `zods.ts` (every export is imported somewhere in `src/`).
