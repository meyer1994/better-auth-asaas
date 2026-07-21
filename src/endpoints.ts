import { APIError, createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import * as z from "zod";
import type { AsaasClient } from "./asaas";
import { requireAsaasCustomerId } from "./asaas-middleware";
import { upsertPayment, upsertSubscription } from "./sync";
import type {
  CreateSubscription,
  Page,
  Payment,
  PaymentStatus,
  PixQrCode,
  Subscription,
} from "./types";

type PaymentStatusResponse = { status: PaymentStatus };

type PaymentIdentificationField = {
  identificationField: string;
  nossoNumero: string;
  barCode: string;
};

type PaymentBillingInfo = {
  pix?: {
    encodedImage?: string;
    payload?: string;
    expirationDate?: string;
    description?: string;
  };
  creditCard?: {
    creditCardNumber?: string;
    creditCardBrand?: string;
    creditCardToken?: string;
  };
  bankSlip?: {
    identificationField?: string;
    nossoNumero?: string;
    barCode?: string;
    bankSlipUrl?: string;
    daysAfterDueDateToRegistrationCancellation?: number;
  };
};

type PaymentViewingInfo = {
  invoiceViewedDate?: string;
  boletoViewedDate?: string;
};

type SubscriptionDeleteResponse = {
  deleted: boolean;
  id: string;
};

type SubscriptionWithCreditCard = Subscription & {
  creditCard?: {
    creditCardNumber?: string;
    creditCardBrand?: string;
    creditCardToken?: string;
  };
};

type SubscriptionPaymentBook = {
  contentType: "application/pdf";
  data: string;
};

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
    body: z.object({
      billingType: z.enum(["PIX", /* "BOLETO", "CREDIT_CARD", "UNDEFINED" */]),
      value: z.number().positive(),
      dueDate: z.string(),
      description: z.string().max(256).optional(),
    }),
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
    body: z.object({
      value: z.number().positive(),
      dueDate: z.string(),
      description: z.string().max(500).optional(),
      installmentCount: z.number().int().positive().optional(),
      totalValue: z.number().positive().optional(),
      installmentValue: z.number().positive().optional(),
      creditCard: z.object({
        holderName: z.string(),
        number: z.string(),
        expiryMonth: z.string(),
        expiryYear: z.string(),
        ccv: z.string(),
      }).optional(),
      creditCardHolderInfo: z.object({
        name: z.string(),
        email: z.string(),
        cpfCnpj: z.string(),
        postalCode: z.string(),
        addressNumber: z.string(),
        addressComplement: z.string().optional(),
        phone: z.string(),
        mobilePhone: z.string().optional(),
      }).optional(),
      creditCardToken: z.string().optional(),
      authorizeOnly: z.boolean().optional(),
      remoteIp: z.string(),
    }).refine(
      (body) =>
        Boolean(body.creditCardToken) ||
        (Boolean(body.creditCard) && Boolean(body.creditCardHolderInfo)),
      { message: "Provide creditCardToken, or both creditCard and creditCardHolderInfo" },
    ),
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
    query: z.object({ id: z.string() }),
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
    query: z.object({ id: z.string() }),
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<PaymentStatusResponse> => {
    await requireOwnedPayment(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const response = await client.request<PaymentStatusResponse>(
      `/payments/${ctx.query.id}/status`,
    );
    return ctx.json(response);
  }
);

export const getPaymentIdentificationField = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/identification-field" as const,
  {
    method: "GET" as const,
    query: z.object({ id: z.string() }),
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<PaymentIdentificationField> => {
    await requireOwnedPayment(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const response = await client.request<PaymentIdentificationField>(
      `/payments/${ctx.query.id}/identificationField`,
    );
    return ctx.json(response);
  }
);

export const getPaymentBillingInfo = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/billing-info" as const,
  {
    method: "GET" as const,
    query: z.object({ id: z.string() }),
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<PaymentBillingInfo> => {
    await requireOwnedPayment(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const response = await client.request<PaymentBillingInfo>(
      `/payments/${ctx.query.id}/billingInfo`,
    );
    return ctx.json(response);
  }
);

export const getPaymentViewingInfo = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/viewing-info" as const,
  {
    method: "GET" as const,
    query: z.object({ id: z.string() }),
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<PaymentViewingInfo> => {
    await requireOwnedPayment(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const response = await client.request<PaymentViewingInfo>(
      `/payments/${ctx.query.id}/viewingInfo`,
    );
    return ctx.json(response);
  }
);

export const getQrCode = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/qr" as const,
  {
    method: "GET" as const,
    query: z.object({ id: z.string() }),
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<PixQrCode> => {
    await requireOwnedPayment(
      client,
      ctx.query.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const response = await client.request<PixQrCode>(`/payments/${ctx.query.id}/pixQrCode`);
    return ctx.json(response);
  }
);

export const payWithCard = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/payments/pay-with-card" as const,
  {
    method: "POST" as const,
    body: z.object({
      id: z.string(),
      cardType: z.enum(["CREDIT", "VOUCHER"]),
      card: z.object({
        holderName: z.string(),
        number: z.string(),
        expiryMonth: z.string(),
        expiryYear: z.string(),
        ccv: z.string(),
        holder: z.object({
          name: z.string(),
          email: z.string(),
          cpfCnpj: z.string(),
          postalCode: z.string(),
          address: z.string().optional(),
          addressNumber: z.string().optional(),
          complement: z.string().optional(),
          province: z.string().optional(),
          city: z.string().optional(),
          uf: z.string().optional(),
          country: z.string().optional(),
          phone: z.string().optional(),
          mobilePhone: z.string().optional(),
        }).refine(
          (holder) => Boolean(holder.phone) || Boolean(holder.mobilePhone),
          { message: "Provide phone or mobilePhone" },
        ),
      }).optional(),
      cardToken: z.string().optional(),
    }).refine(
      (body) => Boolean(body.cardToken) || Boolean(body.card),
      { message: "Provide cardToken or card" },
    ),
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
    body: z.object({
      id: z.string(),
      creditCard: z.object({
        holderName: z.string(),
        number: z.string(),
        expiryMonth: z.string(),
        expiryYear: z.string(),
        ccv: z.string(),
      }).optional(),
      creditCardHolderInfo: z.object({
        name: z.string(),
        email: z.string(),
        cpfCnpj: z.string(),
        postalCode: z.string(),
        addressNumber: z.string(),
        addressComplement: z.string().optional(),
        phone: z.string(),
        mobilePhone: z.string().optional(),
      }).optional(),
      creditCardToken: z.string().optional(),
    }).refine(
      (body) =>
        Boolean(body.creditCardToken) ||
        (Boolean(body.creditCard) && Boolean(body.creditCardHolderInfo)),
      { message: "Provide creditCardToken, or both creditCard and creditCardHolderInfo" },
    ),
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
    body: z.object({
      billingType: z.enum(["UNDEFINED", "BOLETO", "CREDIT_CARD", "PIX"]),
      value: z.number().positive(),
      nextDueDate: z.string(),
      cycle: z.enum([
        "WEEKLY",
        "BIWEEKLY",
        "MONTHLY",
        "BIMONTHLY",
        "QUARTERLY",
        "SEMIANNUALLY",
        "YEARLY",
      ]),
      description: z.string().max(500).optional(),
      endDate: z.string().optional(),
      maxPayments: z.number().int().positive().optional(),
      externalReference: z.string().optional(),
    }),
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<Subscription> => {
    const response = await client.request<Subscription>("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        billingType: ctx.body.billingType,
        value: ctx.body.value,
        nextDueDate: ctx.body.nextDueDate,
        cycle: ctx.body.cycle,
        description: ctx.body.description,
        endDate: ctx.body.endDate,
        maxPayments: ctx.body.maxPayments,
        externalReference: ctx.body.externalReference ?? ctx.context.session.user.id,
        customer: ctx.context.session.user.asaasCustomerId,
      } satisfies CreateSubscription),
    });
    await upsertSubscription(ctx, response, { userId: ctx.context.session.user.id });
    return ctx.json(response);
  }
);

export const createSubscriptionWithCreditCard = (client: AsaasClient) => createAuthEndpoint(
  "/asaas/subscriptions/create-credit-card" as const,
  {
    method: "POST" as const,
    body: z.object({
      value: z.number().positive(),
      nextDueDate: z.string(),
      cycle: z.enum([
        "WEEKLY",
        "BIWEEKLY",
        "MONTHLY",
        "BIMONTHLY",
        "QUARTERLY",
        "SEMIANNUALLY",
        "YEARLY",
      ]),
      description: z.string().max(500).optional(),
      endDate: z.string().optional(),
      maxPayments: z.number().int().positive().optional(),
      externalReference: z.string().optional(),
      creditCard: z.object({
        holderName: z.string(),
        number: z.string(),
        expiryMonth: z.string(),
        expiryYear: z.string(),
        ccv: z.string(),
      }).optional(),
      creditCardHolderInfo: z.object({
        name: z.string(),
        email: z.string(),
        cpfCnpj: z.string(),
        postalCode: z.string(),
        addressNumber: z.string(),
        addressComplement: z.string().optional(),
        phone: z.string(),
        mobilePhone: z.string().optional(),
      }).optional(),
      creditCardToken: z.string().optional(),
      remoteIp: z.string(),
    }).refine(
      (body) =>
        Boolean(body.creditCardToken) ||
        (Boolean(body.creditCard) && Boolean(body.creditCardHolderInfo)),
      { message: "Provide creditCardToken, or both creditCard and creditCardHolderInfo" },
    ),
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<SubscriptionWithCreditCard> => {
    const response = await client.request<SubscriptionWithCreditCard>("/subscriptions/", {
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
    query: z.object({ id: z.string() }),
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
    body: z.object({
      id: z.string(),
      description: z.string().max(500).optional(),
      endDate: z.string().optional(),
      nextDueDate: z.string().optional(),
      updatePendingPayments: z.boolean().optional(),
    }),
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
    body: z.object({
      id: z.string(),
      creditCard: z.object({
        holderName: z.string(),
        number: z.string(),
        expiryMonth: z.string(),
        expiryYear: z.string(),
        ccv: z.string(),
      }).optional(),
      creditCardHolderInfo: z.object({
        name: z.string(),
        email: z.string(),
        cpfCnpj: z.string(),
        postalCode: z.string(),
        addressNumber: z.string(),
        addressComplement: z.string().optional(),
        phone: z.string(),
        mobilePhone: z.string().optional(),
      }).optional(),
      creditCardToken: z.string().optional(),
      remoteIp: z.string(),
    }).refine(
      (body) =>
        Boolean(body.creditCardToken) ||
        (Boolean(body.creditCard) && Boolean(body.creditCardHolderInfo)),
      { message: "Provide creditCardToken, or both creditCard and creditCardHolderInfo" },
    ),
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
    body: z.object({ id: z.string() }),
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<SubscriptionDeleteResponse> => {
    await requireOwnedSubscription(
      client,
      ctx.body.id,
      ctx.context.session.user.asaasCustomerId,
    );
    const response = await client.request<SubscriptionDeleteResponse>(
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
    query: z.object({
      id: z.string(),
      status: z.enum([
        "PENDING",
        "RECEIVED",
        "CONFIRMED",
        "OVERDUE",
        "REFUNDED",
        "RECEIVED_IN_CASH",
        "REFUND_REQUESTED",
        "REFUND_IN_PROGRESS",
        "CHARGEBACK_REQUESTED",
        "CHARGEBACK_DISPUTE",
        "AWAITING_CHARGEBACK_REVERSAL",
        "DUNNING_REQUESTED",
        "DUNNING_RECEIVED",
        "AWAITING_RISK_ANALYSIS",
      ]).optional(),
    }),
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
    query: z.object({
      id: z.string(),
      month: z.coerce.number().int().min(1).max(12).optional(),
      year: z.coerce.number().int().optional(),
      sort: z.string().optional(),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    use: [sessionMiddleware, requireAsaasCustomerId],
  },
  async (ctx): Promise<SubscriptionPaymentBook> => {
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
    } satisfies SubscriptionPaymentBook);
  }
);
