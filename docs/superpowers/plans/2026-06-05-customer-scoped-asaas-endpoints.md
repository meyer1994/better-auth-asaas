# Customer-Scoped Asaas Endpoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scope Asaas payment, subscription, and Pix QR endpoints to the authenticated user's `asaasCustomerId`.

**Architecture:** Reuse Better Auth middleware composition in `endpoints.ts`. Add a required customer-id middleware to every session-scoped Asaas endpoint, pass `customer` query filters to Asaas list APIs, and verify QR payment ownership through `GET /payments/{id}` before returning `GET /payments/{id}/pixQrCode`.

**Tech Stack:** TypeScript, Better Auth endpoint middleware, Vitest, Asaas REST API.

---

### Task 1: Add Endpoint Behavior Tests

**Files:**
- Modify: `packages/better-auth-asaas/src/asaas.test.ts`
- Read: `packages/better-auth-asaas/src/endpoints.ts`

- [ ] **Step 1: Write failing tests**

Add endpoint tests that construct endpoint handlers with a fake Asaas client and invoke the handlers through their exported endpoint objects. Assert that list endpoints call `/payments?customer=cus_1` and `/subscriptions?customer=cus_1`, that QR rejects mismatched ownership before requesting `/pixQrCode`, and that QR allows matched ownership.

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm --filter better-auth-asaas test`

Expected: at least the new endpoint tests fail because current code calls unfiltered list endpoints and fetches QR codes without ownership checks.

### Task 2: Implement Customer Guardrails

**Files:**
- Modify: `packages/better-auth-asaas/src/middleware.ts`
- Modify: `packages/better-auth-asaas/src/endpoints.ts`
- Modify: `packages/better-auth-asaas/src/types.ts`

- [ ] **Step 1: Update middleware**

Ensure `requireAsaasCustomerId` throws `APIError("UNAUTHORIZED", ...)` when `ctx.context.session?.user` is missing or `user.asaasCustomerId` is missing.

- [ ] **Step 2: Apply middleware to endpoint definitions**

Add `requireAsaasCustomerId` to the `use` array for payment creation, subscription creation, payment listing, subscription listing, and QR retrieval.

- [ ] **Step 3: Filter list endpoints**

Change list endpoints to call Asaas with a URL-encoded `customer` query parameter from `ctx.context.session.user.asaasCustomerId`.

- [ ] **Step 4: Add QR ownership check**

Fetch the payment by id, compare `payment.customer` to `ctx.context.session.user.asaasCustomerId`, throw `APIError("UNAUTHORIZED", ...)` on mismatch, and only then request `/payments/{id}/pixQrCode`.

- [ ] **Step 5: Run package tests**

Run: `pnpm --filter better-auth-asaas test`

Expected: all tests pass.

### Task 3: Verify Build Health

**Files:**
- Read: `packages/better-auth-asaas/package.json`

- [ ] **Step 1: Run typecheck**

Run: `pnpm --filter better-auth-asaas typecheck`

Expected: TypeScript completes without errors.

- [ ] **Step 2: Review diff**

Run: `git diff -- packages/better-auth-asaas/src docs/superpowers`

Expected: diff contains only the approved customer scoping behavior, tests, and planning docs.

