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

export interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: "PIX";
  status: "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE" | "REFUNDED" | "DELETED";
  dueDate: string;
  description?: string;
  externalReference?: string;
  dateCreated: string;
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

export interface AsaasWebhookPayload {
  event: AsaasPaymentEvent | (string & {});
  payment: AsaasPayment;
}

// ── Plugin context shared between sub-plugins ──────────────────────────────

export type ChargeHookPayload = { payment: AsaasPayment; user: User | null };
export type ChargeHook = (payload: ChargeHookPayload) => Promise<void>;

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

export interface AsaasPluginContext {
  chargeHooks: ChargeHooks;
}

// ── Sub-plugin types ───────────────────────────────────────────────────────

export interface AsaasApiClient {
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsaasEndpoints = Record<string, (inputCtx: any) => Promise<any>>;

export type AsaasSubPlugin = (
  client: AsaasApiClient,
  context: AsaasPluginContext
) => AsaasEndpoints;

export type AsaasSubPluginWithHooks = AsaasSubPlugin & { __chargeOptions?: ChargeHooks };

// ── charge() options ───────────────────────────────────────────────────────

/** Options for the `charge()` sub-plugin. Configures lifecycle hooks for PIX charge events. */
export interface ChargeOptions extends ChargeHooks {}

// ── webhooks() options ─────────────────────────────────────────────────────

export interface WebhooksOptions {
  /** The access token Asaas sends in the `asaas-access-token` header. */
  accessToken: string;
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
