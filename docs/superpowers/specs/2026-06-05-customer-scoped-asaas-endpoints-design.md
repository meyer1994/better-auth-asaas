# Customer-Scoped Asaas Endpoints Design

## Goal

Prevent authenticated users from calling Asaas payment and subscription endpoints without an Asaas customer id, and prevent users from reading or generating Pix QR codes for another customer's payments.

## Current State

The plugin registers payment, subscription, QR code, and webhook endpoints. User-facing endpoints currently use Better Auth session middleware, but they do not all explicitly require `session.user.asaasCustomerId`. The list endpoints call Asaas account-level list APIs without a `customer` filter, and the QR endpoint reads a Pix QR code by payment id without first checking payment ownership.

## Design

Add a reusable middleware that requires a logged-in user with `session.user.asaasCustomerId`. If the user is missing or the customer id is not set, the endpoint returns `APIError("UNAUTHORIZED", ...)`.

Apply this middleware after `sessionMiddleware` to the customer-scoped endpoints:

- `POST /asaas/payments/create`
- `POST /asaas/subscriptions/create`
- `GET /asaas/payments/list`
- `GET /asaas/subscriptions/list`
- `GET /asaas/payments/qr`

The webhook endpoint remains unchanged because it is not session-user scoped.

## Asaas Data Flow

For payment lists, call Asaas with `GET /payments?customer=<session.user.asaasCustomerId>`.

For subscription lists, call Asaas with `GET /subscriptions?customer=<session.user.asaasCustomerId>`.

For Pix QR code retrieval, call `GET /payments/{id}` first. If the returned payment's `customer` differs from `session.user.asaasCustomerId`, return `UNAUTHORIZED` and do not call `GET /payments/{id}/pixQrCode`. If the customer matches, return the Pix QR code response.

## Error Handling

Missing session or missing customer id returns `UNAUTHORIZED`. A QR payment that exists but belongs to another customer also returns `UNAUTHORIZED`. Asaas API errors continue to flow through the existing `AsaasClient.request` error behavior.

## Testing

Add focused tests for endpoint behavior:

- list payments includes the current user's Asaas customer id as the `customer` filter.
- list subscriptions includes the current user's Asaas customer id as the `customer` filter.
- QR retrieval rejects mismatched payment ownership before requesting the QR code.
- QR retrieval allows matched payment ownership and then requests the QR code.
- the customer-id middleware rejects sessions without `asaasCustomerId`.

