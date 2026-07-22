import { APIError, createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import type { AsaasClient } from "./asaas";
import { requireAsaasCustomerId } from "./middleware";
import { upsertPayment, upsertSubscription } from "./sync";
import type {
  CreateSubscriptionRequest,
  CreateSubscriptionWithCreditCardResponse,
  DeleteSubscriptionResponse,
  GetPaymentBillingInfoResponse,
  GetPaymentIdentificationFieldResponse,
  GetPaymentPixQrCodeResponse,
  GetPaymentStatusResponse,
  GetPaymentViewingInfoResponse,
  GetSubscriptionPaymentBookResponse,
  Page,
  Payment,
  PaymentRequestBillingType,
  Subscription,
  SubscriptionCycle,
} from "./types";
import {
  createPaymentSchema,
  createPaymentWithCreditCardSchema,
  createSubscriptionSchema,
  createSubscriptionWithCreditCardSchema,
  deleteSubscriptionSchema,
  getPaymentBillingInfoQuerySchema,
  getPaymentIdentificationFieldQuerySchema,
  getPaymentQuerySchema,
  getPaymentStatusQuerySchema,
  getPaymentViewingInfoQuerySchema,
  getQrCodeQuerySchema,
  getSubscriptionQuerySchema,
  listSubscriptionPaymentsQuerySchema,
  payWithCardSchema,
  payWithCreditCardSchema,
  paymentBookQuerySchema,
  updateSubscriptionCreditCardSchema,
  updateSubscriptionSchema,
} from "./zods";

async function requireOwnedPayment(
  client: AsaasClient,
  id: string,
  asaasCustomerId: string,
): Promise<Payment> {
  const payment = await client.request<Payment>(`/payments/${id}`);
  if (payment.customer !== asaasCustomerId) {
    throw new APIError("UNAUTHORIZED", {
      message: "Payment does not belong to the authenticated user",
    });
  }
  return payment;
}

async function requireOwnedSubscription(
  client: AsaasClient,
  id: string,
  asaasCustomerId: string,
): Promise<Subscription> {
  const subscription = await client.request<Subscription>(`/subscriptions/${id}`);
  if (subscription.customer !== asaasCustomerId) {
    throw new APIError("UNAUTHORIZED", {
      message: "Subscription does not belong to the authenticated user",
    });
  }
  return subscription;
}

export const createPayment = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/create" as const,
  {
    method: "POST" as const,
    body: createPaymentSchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Payment> => {
    const response = await client.request<Payment>("/payments", {
      method: "POST",
      body: JSON.stringify({
        value: ctx.body.value,
        dueDate: ctx.body.dueDate,
        description: ctx.body.description,
        billingType: ctx.body.billingType,
        externalReference: ctx.context.session.user.id,
        customer: ctx.context.session.user.asaasCustomerId,
      }),
    });
    await upsertPayment(ctx, response, { userId: ctx.context.session.user.id });
    return ctx.json(response);
  }
);

export const createPaymentWithCreditCard = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/create-credit-card" as const,
  {
    method: "POST" as const,
    body: createPaymentWithCreditCardSchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Payment> => {
    const response = await client.request<Payment>("/payments/", {
      method: "POST",
      body: JSON.stringify({
        value: ctx.body.value,
        dueDate: ctx.body.dueDate,
        description: ctx.body.description,
        installmentCount: ctx.body.installmentCount,
        totalValue: ctx.body.totalValue,
        installmentValue: ctx.body.installmentValue,
        creditCard: ctx.body.creditCard,
        creditCardHolderInfo: ctx.body.creditCardHolderInfo,
        creditCardToken: ctx.body.creditCardToken,
        authorizeOnly: ctx.body.authorizeOnly,
        remoteIp: ctx.body.remoteIp,
        billingType: "CREDIT_CARD",
        externalReference: ctx.context.session.user.id,
        customer: ctx.context.session.user.asaasCustomerId,
      }),
    });
    await upsertPayment(ctx, response, { userId: ctx.context.session.user.id });
    return ctx.json(response);
  }
);

export const listPayments = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/list" as const,
  {
    method: "GET" as const,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Page<Payment>> => {
    const customer = encodeURIComponent(ctx.context.session.user.asaasCustomerId);
    const response = await client.request<Page<Payment>>(`/payments?customer=${customer}`);
    return ctx.json(response);
  }
);

export const getPayment = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/get" as const,
  {
    method: "GET" as const,
    query: getPaymentQuerySchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Payment> => {
    const response = await requireOwnedPayment(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    return ctx.json(response);
  }
);

export const getPaymentStatus = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/status" as const,
  {
    method: "GET" as const,
    query: getPaymentStatusQuerySchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<GetPaymentStatusResponse> => {
    await requireOwnedPayment(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const response = await client.request<GetPaymentStatusResponse>(
      `/payments/${ctx.query.id}/status`,
    );
    return ctx.json(response);
  }
);

export const getPaymentIdentificationField = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/identification-field" as const,
  {
    method: "GET" as const,
    query: getPaymentIdentificationFieldQuerySchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<GetPaymentIdentificationFieldResponse> => {
    await requireOwnedPayment(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const response = await client.request<GetPaymentIdentificationFieldResponse>(
      `/payments/${ctx.query.id}/identificationField`,
    );
    return ctx.json(response);
  }
);

export const getPaymentBillingInfo = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/billing-info" as const,
  {
    method: "GET" as const,
    query: getPaymentBillingInfoQuerySchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<GetPaymentBillingInfoResponse> => {
    await requireOwnedPayment(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const response = await client.request<GetPaymentBillingInfoResponse>(
      `/payments/${ctx.query.id}/billingInfo`,
    );
    return ctx.json(response);
  }
);

export const getPaymentViewingInfo = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/viewing-info" as const,
  {
    method: "GET" as const,
    query: getPaymentViewingInfoQuerySchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<GetPaymentViewingInfoResponse> => {
    await requireOwnedPayment(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const response = await client.request<GetPaymentViewingInfoResponse>(
      `/payments/${ctx.query.id}/viewingInfo`,
    );
    return ctx.json(response);
  }
);

export const getQrCode = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/qr" as const,
  {
    method: "GET" as const,
    query: getQrCodeQuerySchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<GetPaymentPixQrCodeResponse> => {
    await requireOwnedPayment(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const response = await client.request<GetPaymentPixQrCodeResponse>(
      `/payments/${ctx.query.id}/pixQrCode`,
    );
    return ctx.json(response);
  }
);

export const payWithCard = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/pay-with-card" as const,
  {
    method: "POST" as const,
    body: payWithCardSchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Payment> => {
    await requireOwnedPayment(
      client,
      ctx.body.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const { id, ...payload } = ctx.body;
    const response = await client.request<Payment>(`/payments/${id}/payWithCard`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return ctx.json(response);
  }
);

export const payWithCreditCard = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/pay-with-credit-card" as const,
  {
    method: "POST" as const,
    body: payWithCreditCardSchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Payment> => {
    await requireOwnedPayment(
      client,
      ctx.body.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const { id, ...payload } = ctx.body;
    const response = await client.request<Payment>(`/payments/${id}/payWithCreditCard`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return ctx.json(response);
  }
);

export const createSubscription = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/subscriptions/create" as const,
  {
    method: "POST" as const,
    body: createSubscriptionSchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Subscription> => {
    const response = await client.request<Subscription>("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        billingType: ctx.body.billingType as PaymentRequestBillingType,
        value: ctx.body.value,
        nextDueDate: ctx.body.nextDueDate,
        cycle: ctx.body.cycle as SubscriptionCycle,
        description: ctx.body.description,
        endDate: ctx.body.endDate,
        maxPayments: ctx.body.maxPayments,
        externalReference: ctx.body.externalReference ?? ctx.context.session.user.id,
        customer: ctx.context.session.user.asaasCustomerId,
      } satisfies CreateSubscriptionRequest),
    });
    await upsertSubscription(ctx, response, { userId: ctx.context.session.user.id });
    return ctx.json(response);
  }
);

export const createSubscriptionWithCreditCard = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/subscriptions/create-credit-card" as const,
  {
    method: "POST" as const,
    body: createSubscriptionWithCreditCardSchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<CreateSubscriptionWithCreditCardResponse> => {
    const response = await client.request<CreateSubscriptionWithCreditCardResponse>("/subscriptions/", {
      method: "POST",
      body: JSON.stringify({
        value: ctx.body.value,
        nextDueDate: ctx.body.nextDueDate,
        cycle: ctx.body.cycle,
        description: ctx.body.description,
        endDate: ctx.body.endDate,
        maxPayments: ctx.body.maxPayments,
        externalReference: ctx.body.externalReference ?? ctx.context.session.user.id,
        creditCard: ctx.body.creditCard,
        creditCardHolderInfo: ctx.body.creditCardHolderInfo,
        creditCardToken: ctx.body.creditCardToken,
        remoteIp: ctx.body.remoteIp,
        billingType: "CREDIT_CARD",
        customer: ctx.context.session.user.asaasCustomerId,
      }),
    });
    await upsertSubscription(ctx, response, { userId: ctx.context.session.user.id });
    return ctx.json(response);
  }
);

export const listSubscriptions = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/subscriptions/list" as const,
  {
    method: "GET" as const,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Page<Subscription>> => {
    const customer = encodeURIComponent(ctx.context.session.user.asaasCustomerId);
    const response = await client.request<Page<Subscription>>(`/subscriptions?customer=${customer}`);
    return ctx.json(response);
  }
);

export const getSubscription = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/subscriptions/get" as const,
  {
    method: "GET" as const,
    query: getSubscriptionQuerySchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Subscription> => {
    const response = await requireOwnedSubscription(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    return ctx.json(response);
  }
);

export const updateSubscription = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/subscriptions/update" as const,
  {
    method: "POST" as const,
    body: updateSubscriptionSchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Subscription> => {
    await requireOwnedSubscription(
      client,
      ctx.body.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const { id, ...update } = ctx.body;
    const response = await client.request<Subscription>(`/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(update),
    });
    return ctx.json(response);
  }
);

export const updateSubscriptionCreditCard = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/subscriptions/update-credit-card" as const,
  {
    method: "POST" as const,
    body: updateSubscriptionCreditCardSchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Subscription> => {
    await requireOwnedSubscription(
      client,
      ctx.body.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const { id, ...creditCardUpdate } = ctx.body;
    const response = await client.request<Subscription>(`/subscriptions/${id}/creditCard`, {
      method: "PUT",
      body: JSON.stringify(creditCardUpdate),
    });
    return ctx.json(response);
  }
);

export const deleteSubscription = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/subscriptions/delete" as const,
  {
    method: "POST" as const,
    body: deleteSubscriptionSchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<DeleteSubscriptionResponse> => {
    await requireOwnedSubscription(
      client,
      ctx.body.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const response = await client.request<DeleteSubscriptionResponse>(
      `/subscriptions/${ctx.body.id}`,
      { method: "DELETE" },
    );
    return ctx.json(response);
  }
);

export const listSubscriptionPayments = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/subscriptions/payments" as const,
  {
    method: "GET" as const,
    query: listSubscriptionPaymentsQuerySchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Page<Payment>> => {
    await requireOwnedSubscription(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const params = new URLSearchParams();
    if (ctx.query.status) params.set("status", ctx.query.status);
    const qs = params.toString();
    const response = await client.request<Page<Payment>>(
      `/subscriptions/${ctx.query.id}/payments${qs ? `?${qs}` : ""}`,
    );
    return ctx.json(response);
  }
);

export const getSubscriptionPaymentBook = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/subscriptions/payment-book" as const,
  {
    method: "GET" as const,
    query: paymentBookQuerySchema,
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<GetSubscriptionPaymentBookResponse> => {
    await requireOwnedSubscription(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const params = new URLSearchParams();
    if (ctx.query.month != null) params.set("month", String(ctx.query.month));
    if (ctx.query.year != null) params.set("year", String(ctx.query.year));
    if (ctx.query.sort) params.set("sort", ctx.query.sort);
    if (ctx.query.order) params.set("order", ctx.query.order);
    const qs = params.toString();
    const binary = await client.requestBinary(
      `/subscriptions/${ctx.query.id}/paymentBook${qs ? `?${qs}` : ""}`,
    );
    return ctx.json({
      contentType: "application/pdf",
      data: binary.data,
    } satisfies GetSubscriptionPaymentBookResponse);
  }
);
