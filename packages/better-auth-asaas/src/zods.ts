import * as z from "zod/v4";

// Payments

const BillingTypeSchema = z.enum(["UNDEFINED", "BOLETO", "CREDIT_CARD", "PIX"]);

const PaymentStatusSchema = z.enum([
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
]);

const InvoiceStatusSchema = z.enum([
  "SCHEDULED",
  "AUTHORIZED",
  "PROCESSING_CANCELLATION",
  "CANCELED",
  "CANCELLATION_DENIED",
  "ERROR",
]);

const PaymentDiscountSchema = z.object({
  value: z.number(),
  dueDateLimitDays: z.number().int(),
  type: z.enum(["FIXED", "PERCENTAGE"]),
});

const PaymentInterestSchema = z.object({
  value: z.number(),
});

const PaymentFineSchema = z.object({
  value: z.number(),
  type: z.enum(["FIXED", "PERCENTAGE"]),
});

const PaymentSplitSchema = z.object({
  walletId: z.string(),
  fixedValue: z.number().optional(),
  percentualValue: z.number().optional(),
  totalFixedValue: z.number().optional(),
  externalReference: z.string().optional(),
  description: z.string().optional(),
});

const PaymentCallbackSchema = z.object({
  successUrl: z.string().max(255),
  autoRedirect: z.boolean().optional(),
});

export const CreatePaymentInputSchema = z.object({
  customer: z.string(),
  billingType: BillingTypeSchema,
  value: z.number(),
  dueDate: z.string(),
  description: z.string().optional(),
  daysAfterDueDateToRegistrationCancellation: z.number().int().optional(),
  externalReference: z.string().optional(),
  installmentCount: z.number().int().optional(),
  totalValue: z.number().optional(),
  installmentValue: z.number().optional(),
  discount: PaymentDiscountSchema.optional(),
  interest: PaymentInterestSchema.optional(),
  fine: PaymentFineSchema.optional(),
  postalService: z.boolean().optional(),
  split: z.array(PaymentSplitSchema).optional(),
  callback: PaymentCallbackSchema.optional(),
  pixAutomaticAuthorizationId: z.string().optional(),
});

export const ListPaymentsInputSchema = z.object({
  offset: z.number().int().optional(),
  limit: z.number().int().max(100).optional(),
  customer: z.string().optional(),
  customerGroupName: z.string().optional(),
  billingType: BillingTypeSchema.optional(),
  status: PaymentStatusSchema.optional(),
  subscription: z.string().optional(),
  installment: z.string().optional(),
  externalReference: z.string().optional(),
  paymentDate: z.string().optional(),
  invoiceStatus: InvoiceStatusSchema.optional(),
  estimatedCreditDate: z.string().optional(),
  pixQrCodeId: z.string().optional(),
  anticipated: z.boolean().optional(),
  anticipable: z.boolean().optional(),
  checkoutSession: z.string().optional(),
  user: z.string().optional(),
  "dateCreated[ge]": z.string().optional(),
  "dateCreated[le]": z.string().optional(),
  "paymentDate[ge]": z.string().optional(),
  "paymentDate[le]": z.string().optional(),
  "estimatedCreditDate[ge]": z.string().optional(),
  "estimatedCreditDate[le]": z.string().optional(),
  "dueDate[ge]": z.string().optional(),
  "dueDate[le]": z.string().optional(),
});

// Response types

type ListResponse<T> = {
  object: "list";
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: T[];
};

export type Customer = {
  object: "customer";
  id: string;
  dateCreated: string;
  name: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: number;
  cityName?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  cpfCnpj: string;
  personType?: "JURIDICA" | "FISICA";
  deleted: boolean;
  additionalEmails?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  observations?: string;
  foreignCustomer?: boolean;
};

type PaymentBillingType =
  | "UNDEFINED"
  | "BOLETO"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "TRANSFER"
  | "DEPOSIT"
  | "PIX";

type PaymentStatus =
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "RECEIVED_IN_CASH"
  | "REFUND_REQUESTED"
  | "REFUND_IN_PROGRESS"
  | "CHARGEBACK_REQUESTED"
  | "CHARGEBACK_DISPUTE"
  | "AWAITING_CHARGEBACK_REVERSAL"
  | "DUNNING_REQUESTED"
  | "DUNNING_RECEIVED"
  | "AWAITING_RISK_ANALYSIS";

type CreditCardBrand =
  | "VISA"
  | "MASTERCARD"
  | "ELO"
  | "DINERS"
  | "DISCOVER"
  | "AMEX"
  | "CABAL"
  | "BANESCARD"
  | "CREDZ"
  | "SOROCRED"
  | "CREDSYSTEM"
  | "JCB"
  | "UNKNOWN";

type PaymentDiscount = {
  value: number;
  dueDateLimitDays: number;
  type: "FIXED" | "PERCENTAGE";
};

type PaymentFine = { value: number };
type PaymentInterest = { value: number };

type PaymentCreditCard = {
  creditCardNumber?: string;
  creditCardBrand?: CreditCardBrand;
  creditCardToken?: string;
};

type PaymentSplit = {
  id: string;
  walletId: string;
  fixedValue?: number;
  percentualValue?: number;
  totalValue?: number;
  cancellationReason?:
  | "PAYMENT_DELETED"
  | "PAYMENT_OVERDUE"
  | "PAYMENT_RECEIVED_IN_CASH"
  | "PAYMENT_REFUNDED"
  | "VALUE_DIVERGENCE_BLOCK"
  | "WALLET_UNABLE_TO_RECEIVE";
  status:
  | "PENDING"
  | "PROCESSING"
  | "PROCESSING_REFUND"
  | "AWAITING_CREDIT"
  | "CANCELLED"
  | "DONE"
  | "REFUNDED"
  | "BLOCKED_BY_VALUE_DIVERGENCE";
  externalReference?: string;
  description?: string;
};

type PaymentChargeback = {
  id: string;
  payment: string;
  installment?: string;
  customerAccount: string;
  status: "REQUESTED" | "IN_DISPUTE" | "DISPUTE_LOST" | "REVERSED" | "DONE";
  reason:
  | "ABSENCE_OF_PRINT"
  | "ABSENT_CARD_FRAUD"
  | "CARD_ACTIVATED_PHONE_TRANSACTION"
  | "CARD_FRAUD"
  | "CARD_RECOVERY_BULLETIN"
  | "COMMERCIAL_DISAGREEMENT"
  | "COPY_NOT_RECEIVED"
  | "CREDIT_OR_DEBIT_PRESENTATION_ERROR"
  | "DIFFERENT_PAY_METHOD"
  | "FRAUD"
  | "INCORRECT_TRANSACTION_VALUE"
  | "INVALID_CURRENCY"
  | "INVALID_DATA"
  | "LATE_PRESENTATION"
  | "LOCAL_REGULATORY_OR_LEGAL_DISPUTE"
  | "MULTIPLE_ROCS"
  | "ORIGINAL_CREDIT_TRANSACTION_NOT_ACCEPTED"
  | "OTHER_ABSENT_CARD_FRAUD"
  | "PROCESS_ERROR"
  | "RECEIVED_COPY_ILLEGIBLE_OR_INCOMPLETE"
  | "RECURRENCE_CANCELED"
  | "REQUIRED_AUTHORIZATION_NOT_GRANTED"
  | "RIGHT_OF_FULL_RECOURSE_FOR_FRAUD"
  | "SALE_CANCELED"
  | "SERVICE_DISAGREEMENT_OR_DEFECTIVE_PRODUCT"
  | "SERVICE_NOT_RECEIVED"
  | "SPLIT_SALE"
  | "TRANSFERS_OF_DIVERSE_RESPONSIBILITIES"
  | "UNQUALIFIED_CAR_RENTAL_DEBIT"
  | "USA_CARDHOLDER_DISPUTE"
  | "VISA_FRAUD_MONITORING_PROGRAM"
  | "WARNING_BULLETIN_FILE";
  disputeStartDate: string;
  value: number;
  paymentDate?: string;
  creditCard?: { number?: string; brand?: CreditCardBrand };
  disputeStatus?: "REQUESTED" | "ACCEPTED" | "REJECTED";
  deadlineToSendDisputeDocuments?: string;
};

type PaymentEscrow = {
  id: string;
  status: "ACTIVE" | "DONE";
  expirationDate?: string;
  finishDate?: string;
  finishReason?:
  | "CHARGEBACK"
  | "EXPIRED"
  | "INSUFFICIENT_BALANCE"
  | "PAYMENT_REFUNDED"
  | "REQUESTED_BY_CUSTOMER"
  | "CUSTOMER_CONFIG_DISABLED";
};

type PaymentRefund = {
  dateCreated: string;
  status:
  | "PENDING"
  | "AWAITING_CRITICAL_ACTION_AUTHORIZATION"
  | "AWAITING_CUSTOMER_EXTERNAL_AUTHORIZATION"
  | "CANCELLED"
  | "DONE";
  value: number;
  endToEndIdentifier?: string;
  description?: string;
  effectiveDate?: string;
  transactionReceiptUrl?: string;
  refundedSplits?: { id: string; value: number; done: boolean }[];
};

export type Payment = {
  object: "payment";
  id: string;
  dateCreated: string;
  customer: string;
  subscription?: string;
  installment?: string;
  checkoutSession?: string;
  paymentLink?: string;
  value: number;
  netValue: number;
  originalValue?: number;
  interestValue?: number;
  description?: string;
  billingType: PaymentBillingType;
  creditCard?: PaymentCreditCard;
  canBePaidAfterDueDate?: boolean;
  pixTransaction?: string;
  pixQrCodeId?: string;
  status: PaymentStatus;
  dueDate: string;
  originalDueDate: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  installmentNumber?: number;
  invoiceUrl?: string;
  invoiceNumber?: string;
  externalReference?: string;
  deleted: boolean;
  anticipated: boolean;
  anticipable: boolean;
  creditDate?: string;
  estimatedCreditDate?: string;
  transactionReceiptUrl?: string;
  nossoNumero?: string;
  bankSlipUrl?: string;
  discount?: PaymentDiscount;
  fine?: PaymentFine;
  interest?: PaymentInterest;
  split?: PaymentSplit[];
  postalService?: boolean;
  daysAfterDueDateToRegistrationCancellation?: number;
  chargeback?: PaymentChargeback;
  escrow?: PaymentEscrow;
  refunds?: PaymentRefund[];
};

export type ListPaymentsOutput = ListResponse<Payment>;

// Webhooks

const PaymentWebhookEventSchema = z.enum([
  "PAYMENT_CREATED",
  "PAYMENT_AWAITING_RISK_ANALYSIS",
  "PAYMENT_APPROVED_BY_RISK_ANALYSIS",
  "PAYMENT_REPROVED_BY_RISK_ANALYSIS",
  "PAYMENT_AUTHORIZED",
  "PAYMENT_UPDATED",
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED",
  "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED",
  "PAYMENT_ANTICIPATED",
  "PAYMENT_OVERDUE",
  "PAYMENT_DELETED",
  "PAYMENT_RESTORED",
  "PAYMENT_REFUNDED",
  "PAYMENT_PARTIALLY_REFUNDED",
  "PAYMENT_REFUND_IN_PROGRESS",
  "PAYMENT_REFUND_DENIED",
  "PAYMENT_RECEIVED_IN_CASH_UNDONE",
  "PAYMENT_CHARGEBACK_REQUESTED",
  "PAYMENT_CHARGEBACK_DISPUTE",
  "PAYMENT_AWAITING_CHARGEBACK_REVERSAL",
  "PAYMENT_DUNNING_RECEIVED",
  "PAYMENT_DUNNING_REQUESTED",
  "PAYMENT_BANK_SLIP_CANCELLED",
  "PAYMENT_BANK_SLIP_VIEWED",
  "PAYMENT_CHECKOUT_VIEWED",
  "PAYMENT_SPLIT_DIVERGENCE_BLOCK",
  "PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED",
]);

export const WebhookPayloadSchema = z.object({
  id: z.string().optional(),
  event: PaymentWebhookEventSchema,
  dateCreated: z.string().optional(),
  payment: z.any(),
});

type PaymentWebhookHandler = (payment: Payment) => void | Promise<void>;

export type Webhooks = {
  onPaymentCreated?: PaymentWebhookHandler;
  onPaymentAwaitingRiskAnalysis?: PaymentWebhookHandler;
  onPaymentApprovedByRiskAnalysis?: PaymentWebhookHandler;
  onPaymentReprovedByRiskAnalysis?: PaymentWebhookHandler;
  onPaymentAuthorized?: PaymentWebhookHandler;
  onPaymentUpdated?: PaymentWebhookHandler;
  onPaymentConfirmed?: PaymentWebhookHandler;
  onPaymentReceived?: PaymentWebhookHandler;
  onPaymentCreditCardCaptureRefused?: PaymentWebhookHandler;
  onPaymentAnticipated?: PaymentWebhookHandler;
  onPaymentOverdue?: PaymentWebhookHandler;
  onPaymentDeleted?: PaymentWebhookHandler;
  onPaymentRestored?: PaymentWebhookHandler;
  onPaymentRefunded?: PaymentWebhookHandler;
  onPaymentPartiallyRefunded?: PaymentWebhookHandler;
  onPaymentRefundInProgress?: PaymentWebhookHandler;
  onPaymentRefundDenied?: PaymentWebhookHandler;
  onPaymentReceivedInCashUndone?: PaymentWebhookHandler;
  onPaymentChargebackRequested?: PaymentWebhookHandler;
  onPaymentChargebackDispute?: PaymentWebhookHandler;
  onPaymentAwaitingChargebackReversal?: PaymentWebhookHandler;
  onPaymentDunningReceived?: PaymentWebhookHandler;
  onPaymentDunningRequested?: PaymentWebhookHandler;
  onPaymentBankSlipCancelled?: PaymentWebhookHandler;
  onPaymentBankSlipViewed?: PaymentWebhookHandler;
  onPaymentCheckoutViewed?: PaymentWebhookHandler;
  onPaymentSplitDivergenceBlock?: PaymentWebhookHandler;
  onPaymentSplitDivergenceBlockFinished?: PaymentWebhookHandler;
};
