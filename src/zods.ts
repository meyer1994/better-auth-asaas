import * as z from "zod";

const creditCardSchema = z.object({
  holderName: z.string(),
  number: z.string(),
  expiryMonth: z.string(),
  expiryYear: z.string(),
  ccv: z.string(),
});

const creditCardHolderInfoSchema = z.object({
  name: z.string(),
  email: z.string(),
  cpfCnpj: z.string(),
  postalCode: z.string(),
  addressNumber: z.string(),
  addressComplement: z.string().optional(),
  phone: z.string(),
  mobilePhone: z.string().optional(),
});

const subscriptionCycleSchema = z.enum([
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "BIMONTHLY",
  "QUARTERLY",
  "SEMIANNUALLY",
  "YEARLY",
]);

export const createPaymentSchema = z.object({
  billingType: z.enum(["PIX"]),
  value: z.number().positive(),
  dueDate: z.string(),
  description: z.string().max(256).optional(),
});

export const createPaymentWithCreditCardSchema = z.object({
  value: z.number().positive(),
  dueDate: z.string(),
  description: z.string().max(500).optional(),
  installmentCount: z.number().int().positive().optional(),
  totalValue: z.number().positive().optional(),
  installmentValue: z.number().positive().optional(),
  creditCard: creditCardSchema.optional(),
  creditCardHolderInfo: creditCardHolderInfoSchema.optional(),
  creditCardToken: z.string().optional(),
  authorizeOnly: z.boolean().optional(),
  remoteIp: z.string(),
}).refine(
  (body) =>
    Boolean(body.creditCardToken) ||
    (Boolean(body.creditCard) && Boolean(body.creditCardHolderInfo)),
  { message: "Provide creditCardToken, or both creditCard and creditCardHolderInfo" },
);

export const getPaymentQuerySchema = z.object({ id: z.string() });

export const getPaymentStatusQuerySchema = z.object({ id: z.string() });

export const getPaymentIdentificationFieldQuerySchema = z.object({ id: z.string() });

export const getPaymentBillingInfoQuerySchema = z.object({ id: z.string() });

export const getPaymentViewingInfoQuerySchema = z.object({ id: z.string() });

export const getQrCodeQuerySchema = z.object({ id: z.string() });

const payWithCardHolderSchema = z.object({
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
);

const payWithCardCardSchema = creditCardSchema.extend({
  holder: payWithCardHolderSchema,
});

export const payWithCardSchema = z.object({
  id: z.string(),
  cardType: z.enum(["CREDIT", "VOUCHER"]),
  card: payWithCardCardSchema.optional(),
  cardToken: z.string().optional(),
}).refine(
  (body) => Boolean(body.cardToken) || Boolean(body.card),
  { message: "Provide cardToken or card" },
);

export const payWithCreditCardSchema = z.object({
  id: z.string(),
  creditCard: creditCardSchema.optional(),
  creditCardHolderInfo: creditCardHolderInfoSchema.optional(),
  creditCardToken: z.string().optional(),
}).refine(
  (body) =>
    Boolean(body.creditCardToken) ||
    (Boolean(body.creditCard) && Boolean(body.creditCardHolderInfo)),
  { message: "Provide creditCardToken, or both creditCard and creditCardHolderInfo" },
);

export const createSubscriptionSchema = z.object({
  billingType: z.enum(["UNDEFINED", "BOLETO", "CREDIT_CARD", "PIX"]),
  value: z.number().positive(),
  nextDueDate: z.string(),
  cycle: subscriptionCycleSchema,
  description: z.string().max(500).optional(),
  endDate: z.string().optional(),
  maxPayments: z.number().int().positive().optional(),
  externalReference: z.string().optional(),
});

export const createSubscriptionWithCreditCardSchema = z.object({
  value: z.number().positive(),
  nextDueDate: z.string(),
  cycle: subscriptionCycleSchema,
  description: z.string().max(500).optional(),
  endDate: z.string().optional(),
  maxPayments: z.number().int().positive().optional(),
  externalReference: z.string().optional(),
  creditCard: creditCardSchema.optional(),
  creditCardHolderInfo: creditCardHolderInfoSchema.optional(),
  creditCardToken: z.string().optional(),
  remoteIp: z.string(),
}).refine(
  (body) =>
    Boolean(body.creditCardToken) ||
    (Boolean(body.creditCard) && Boolean(body.creditCardHolderInfo)),
  { message: "Provide creditCardToken, or both creditCard and creditCardHolderInfo" },
);

export const getSubscriptionQuerySchema = z.object({ id: z.string() });

export const updateSubscriptionSchema = z.object({
  id: z.string(),
  description: z.string().max(500).optional(),
  endDate: z.string().optional(),
  nextDueDate: z.string().optional(),
  updatePendingPayments: z.boolean().optional(),
});

export const updateSubscriptionCreditCardSchema = z.object({
  id: z.string(),
  creditCard: creditCardSchema.optional(),
  creditCardHolderInfo: creditCardHolderInfoSchema.optional(),
  creditCardToken: z.string().optional(),
  remoteIp: z.string(),
}).refine(
  (body) =>
    Boolean(body.creditCardToken) ||
    (Boolean(body.creditCard) && Boolean(body.creditCardHolderInfo)),
  { message: "Provide creditCardToken, or both creditCard and creditCardHolderInfo" },
);

export const deleteSubscriptionSchema = z.object({ id: z.string() });

export const listSubscriptionPaymentsQuerySchema = z.object({
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
});

export const paymentBookQuerySchema = z.object({
  id: z.string(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});
