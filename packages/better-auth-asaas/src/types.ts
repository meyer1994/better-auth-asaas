import type { User } from "better-auth";

// ── Asaas API response shapes ──────────────────────────────────────────────

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  externalReference?: string;
  dateCreated: string;
}

export type AsaasBillingType =
  | "UNDEFINED"
  | "BOLETO"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "TRANSFER"
  | "DEPOSIT"
  | "PIX";

export type AsaasPaymentStatus =
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

export type AsaasCreditCardBrand =
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

export interface AsaasPaymentCreditCard {
  creditCardNumber: string;
  creditCardBrand: AsaasCreditCardBrand;
  creditCardToken: string | null;
}

export interface AsaasPaymentDiscount {
  value: number;
  dueDateLimitDays: number;
  limitedDate?: string | null;
  type: "FIXED" | "PERCENTAGE";
}

export interface AsaasPaymentFine {
  value: number;
  type?: "FIXED" | "PERCENTAGE";
}

export interface AsaasPaymentInterest {
  value: number;
  type?: "FIXED" | "PERCENTAGE";
}

export type AsaasSplitStatus =
  | "PENDING"
  | "PROCESSING"
  | "PROCESSING_REFUND"
  | "AWAITING_CREDIT"
  | "CANCELLED"
  | "DONE"
  | "REFUNDED"
  | "BLOCKED_BY_VALUE_DIVERGENCE";

export type AsaasSplitCancellationReason =
  | "PAYMENT_DELETED"
  | "PAYMENT_OVERDUE"
  | "PAYMENT_RECEIVED_IN_CASH"
  | "PAYMENT_REFUNDED"
  | "VALUE_DIVERGENCE_BLOCK"
  | "WALLET_UNABLE_TO_RECEIVE";

export interface AsaasPaymentSplit {
  id: string;
  walletId: string;
  fixedValue?: number | null;
  percentualValue?: number | null;
  totalValue?: number;
  status: AsaasSplitStatus;
  cancellationReason?: AsaasSplitCancellationReason | null;
  refusalReason?: string | null;
  externalReference?: string | null;
  description?: string | null;
}

export type AsaasChargebackStatus =
  | "REQUESTED"
  | "IN_DISPUTE"
  | "DISPUTE_LOST"
  | "REVERSED"
  | "DONE";

export type AsaasChargebackDisputeStatus = "REQUESTED" | "ACCEPTED" | "REJECTED";

export type AsaasChargebackReason =
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

export interface AsaasPaymentChargeback {
  id?: string;
  payment?: string;
  installment?: string | null;
  customerAccount?: string;
  status: AsaasChargebackStatus;
  reason: AsaasChargebackReason;
  disputeStartDate?: string;
  value?: number;
  paymentDate?: string;
  creditCard?: { number: string; brand: AsaasCreditCardBrand };
  disputeStatus?: AsaasChargebackDisputeStatus;
  deadlineToSendDisputeDocuments?: string;
}

export type AsaasRefundStatus =
  | "PENDING"
  | "AWAITING_CRITICAL_ACTION_AUTHORIZATION"
  | "AWAITING_CUSTOMER_EXTERNAL_AUTHORIZATION"
  | "CANCELLED"
  | "DONE";

export interface AsaasPaymentRefundedSplit {
  id: string;
  value: number;
  done: boolean;
}

export interface AsaasPaymentRefund {
  dateCreated: string;
  status: AsaasRefundStatus;
  value: number;
  endToEndIdentifier?: string | null;
  description?: string | null;
  effectiveDate?: string | null;
  transactionReceiptUrl?: string | null;
  refundedSplits?: AsaasPaymentRefundedSplit[];
}

export type AsaasEscrowStatus = "ACTIVE" | "DONE";

export type AsaasEscrowFinishReason =
  | "CHARGEBACK"
  | "EXPIRED"
  | "INSUFFICIENT_BALANCE"
  | "PAYMENT_REFUNDED"
  | "REQUESTED_BY_CUSTOMER"
  | "CUSTOMER_CONFIG_DISABLED";

export interface AsaasPaymentEscrow {
  id: string;
  status: AsaasEscrowStatus;
  expirationDate?: string;
  finishDate?: string;
  finishReason?: AsaasEscrowFinishReason;
}

export interface AsaasPayment {
  object?: "payment";
  id: string;
  dateCreated: string;
  customer: string;
  subscription?: string | null;
  installment?: string | null;
  checkoutSession?: string | null;
  paymentLink?: string | null;
  value: number;
  netValue: number;
  originalValue?: number | null;
  interestValue?: number | null;
  description?: string | null;
  billingType: AsaasBillingType;
  creditCard?: AsaasPaymentCreditCard;
  canBePaidAfterDueDate?: boolean;
  pixTransaction?: string | null;
  pixQrCodeId?: string | null;
  status: AsaasPaymentStatus;
  dueDate: string;
  originalDueDate?: string;
  paymentDate?: string | null;
  clientPaymentDate?: string | null;
  confirmedDate?: string | null;
  installmentNumber?: number | null;
  invoiceUrl?: string;
  invoiceNumber?: string;
  externalReference?: string | null;
  deleted?: boolean;
  anticipated?: boolean;
  anticipable?: boolean;
  creditDate?: string | null;
  estimatedCreditDate?: string | null;
  transactionReceiptUrl?: string | null;
  nossoNumero?: string | null;
  bankSlipUrl?: string | null;
  custody?: unknown | null;
  lastInvoiceViewedDate?: string | null;
  lastBankSlipViewedDate?: string | null;
  postalService?: boolean;
  daysAfterDueDateToRegistrationCancellation?: number | null;
  discount?: AsaasPaymentDiscount;
  fine?: AsaasPaymentFine;
  interest?: AsaasPaymentInterest;
  split?: AsaasPaymentSplit[];
  chargeback?: AsaasPaymentChargeback | null;
  escrow?: AsaasPaymentEscrow | null;
  refunds?: AsaasPaymentRefund[] | null;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export interface AsaasPaymentList {
  object: "list";
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: AsaasPayment[];
}

export type AsaasPaymentEvent =
  | "PAYMENT_CREATED"
  | "PAYMENT_AWAITING_RISK_ANALYSIS"
  | "PAYMENT_APPROVED_BY_RISK_ANALYSIS"
  | "PAYMENT_REPROVED_BY_RISK_ANALYSIS"
  | "PAYMENT_AUTHORIZED"
  | "PAYMENT_UPDATED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED"
  | "PAYMENT_ANTICIPATED"
  | "PAYMENT_OVERDUE"
  | "PAYMENT_DELETED"
  | "PAYMENT_RESTORED"
  | "PAYMENT_REFUNDED"
  | "PAYMENT_PARTIALLY_REFUNDED"
  | "PAYMENT_REFUND_IN_PROGRESS"
  | "PAYMENT_REFUND_DENIED"
  | "PAYMENT_RECEIVED_IN_CASH_UNDONE"
  | "PAYMENT_CHARGEBACK_REQUESTED"
  | "PAYMENT_CHARGEBACK_DISPUTE"
  | "PAYMENT_AWAITING_CHARGEBACK_REVERSAL"
  | "PAYMENT_DUNNING_RECEIVED"
  | "PAYMENT_DUNNING_REQUESTED"
  | "PAYMENT_BANK_SLIP_CANCELLED"
  | "PAYMENT_BANK_SLIP_VIEWED"
  | "PAYMENT_CHECKOUT_VIEWED"
  | "PAYMENT_SPLIT_CANCELLED"
  | "PAYMENT_SPLIT_DIVERGENCE_BLOCK"
  | "PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED";

export interface AsaasWebhookAccount {
  id: string;
  ownerId: string | null;
}

interface AsaasWebhookEnvelope<E extends string, P = AsaasPayment> {
  id: string;
  event: E;
  dateCreated: string;
  account: AsaasWebhookAccount;
  payment: P;
}

type WithChargeback = AsaasPayment & { chargeback: AsaasPaymentChargeback };
type WithRefunds = AsaasPayment & { refunds: AsaasPaymentRefund[] };
type WithSplit = AsaasPayment & { split: AsaasPaymentSplit[] };
type WithCreditCard = AsaasPayment & { creditCard: AsaasPaymentCreditCard };

export type AsaasChargebackEventName =
  | "PAYMENT_CHARGEBACK_REQUESTED"
  | "PAYMENT_CHARGEBACK_DISPUTE"
  | "PAYMENT_AWAITING_CHARGEBACK_REVERSAL";

export type AsaasRefundEventName =
  | "PAYMENT_REFUNDED"
  | "PAYMENT_PARTIALLY_REFUNDED"
  | "PAYMENT_REFUND_IN_PROGRESS"
  | "PAYMENT_REFUND_DENIED";

export type AsaasSplitEventName =
  | "PAYMENT_SPLIT_CANCELLED"
  | "PAYMENT_SPLIT_DIVERGENCE_BLOCK"
  | "PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED";

export type AsaasCreditCardEventName =
  | "PAYMENT_AUTHORIZED"
  | "PAYMENT_AWAITING_RISK_ANALYSIS"
  | "PAYMENT_APPROVED_BY_RISK_ANALYSIS"
  | "PAYMENT_REPROVED_BY_RISK_ANALYSIS"
  | "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED";

type NarrowedEventName =
  | AsaasChargebackEventName
  | AsaasRefundEventName
  | AsaasSplitEventName
  | AsaasCreditCardEventName;

export type AsaasGenericPaymentEventName = Exclude<AsaasPaymentEvent, NarrowedEventName>;

export type AsaasWebhookPayload =
  | AsaasWebhookEnvelope<AsaasChargebackEventName, WithChargeback>
  | AsaasWebhookEnvelope<AsaasRefundEventName, WithRefunds>
  | AsaasWebhookEnvelope<AsaasSplitEventName, WithSplit>
  | AsaasWebhookEnvelope<AsaasCreditCardEventName, WithCreditCard>
  | AsaasWebhookEnvelope<AsaasGenericPaymentEventName>
  | AsaasWebhookEnvelope<string & {}>;

// ── Plugin context shared between sub-plugins ──────────────────────────────

export type ChargeHookPayload<P = AsaasPayment> = { payment: P; user: User | null };
export type ChargeHook<P = AsaasPayment> = (payload: ChargeHookPayload<P>) => Promise<void>;

export interface ChargeHooks {
  onPaymentCreated?: ChargeHook;
  onPaymentAwaitingRiskAnalysis?: ChargeHook;
  onPaymentApprovedByRiskAnalysis?: ChargeHook;
  onPaymentReprovedByRiskAnalysis?: ChargeHook;
  onPaymentAuthorized?: ChargeHook;
  onPaymentUpdated?: ChargeHook;
  onPaymentConfirmed?: ChargeHook;
  onPaymentReceived?: ChargeHook;
  onPaymentCreditCardCaptureRefused?: ChargeHook;
  onPaymentAnticipated?: ChargeHook;
  onPaymentOverdue?: ChargeHook;
  onPaymentDeleted?: ChargeHook;
  onPaymentRestored?: ChargeHook;
  onPaymentRefunded?: ChargeHook;
  onPaymentPartiallyRefunded?: ChargeHook;
  onPaymentRefundInProgress?: ChargeHook;
  onPaymentRefundDenied?: ChargeHook;
  onPaymentReceivedInCashUndone?: ChargeHook;
  onPaymentChargebackRequested?: ChargeHook;
  onPaymentChargebackDispute?: ChargeHook;
  onPaymentAwaitingChargebackReversal?: ChargeHook;
  onPaymentDunningReceived?: ChargeHook;
  onPaymentDunningRequested?: ChargeHook;
  onPaymentBankSlipCancelled?: ChargeHook;
  onPaymentBankSlipViewed?: ChargeHook;
  onPaymentCheckoutViewed?: ChargeHook;
  onPaymentSplitCancelled?: ChargeHook;
  onPaymentSplitDivergenceBlock?: ChargeHook;
  onPaymentSplitDivergenceBlockFinished?: ChargeHook;
}

// ── Sub-plugin types ───────────────────────────────────────────────────────

export interface AsaasApiClient {
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsaasEndpoints = Record<string, (inputCtx: any) => Promise<any>>;

export type AsaasSubPlugin = (client: AsaasApiClient) => AsaasEndpoints;

// ── webhooks() options ─────────────────────────────────────────────────────

export interface WebhooksOptions extends ChargeHooks {
  /**
   * The access token Asaas sends in the `asaas-access-token` header.
   * Defaults to `process.env.ASAAS_WEBHOOK_ACCESS_TOKEN`.
   */
  accessToken?: string;
}

// ── Main asaas() options ───────────────────────────────────────────────────

export interface AsaasOptions {
  /** Asaas API key (`access_token` header). */
  apiKey: string;
  /** Use the Asaas sandbox environment. Default: false. */
  sandbox?: boolean;
  /** Auto-create an Asaas customer when a user signs up. Default: false. */
  createCustomerOnSignUp?: boolean;
  /**
   * Return the Asaas customer creation parameters for a new user.
   * Required when `createCustomerOnSignUp` is true.
   * Must include `cpfCnpj`.
   */
  getCustomerCreateParams?: (data: { user: Partial<User> }) => Promise<{
    cpfCnpj: string;
    mobilePhone?: string;
    phone?: string;
    address?: string;
    addressNumber?: string;
    complement?: string;
    province?: string;
    postalCode?: string;
    externalReference?: string;
  }>;
  /** Called after an Asaas customer is created. */
  onCustomerCreate?: (payload: { asaasCustomer: AsaasCustomer; user: User }) => Promise<void>;
  /** Sub-plugins to compose (charge, webhooks). */
  use?: AsaasSubPlugin[];
}
