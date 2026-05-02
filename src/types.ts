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

export interface AsaasWebhookPayload {
  event: "PAYMENT_RECEIVED" | "PAYMENT_OVERDUE" | "PAYMENT_DELETED" | string;
  payment: AsaasPayment;
}

// ── Plugin context shared between sub-plugins ──────────────────────────────

export interface ChargeHooks {
  onPaymentReceived?: (payload: { payment: AsaasPayment; user: User | null }) => Promise<void>;
  onPaymentOverdue?: (payload: { payment: AsaasPayment; user: User | null }) => Promise<void>;
  onPaymentDeleted?: (payload: { payment: AsaasPayment; user: User | null }) => Promise<void>;
}

export interface AsaasPluginContext {
  chargeHooks: ChargeHooks;
}

// ── Sub-plugin types ───────────────────────────────────────────────────────

export interface AsaasApiClient {
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

export type AsaasEndpoints = Record<string, unknown>;

export type AsaasSubPlugin = (
  client: AsaasApiClient,
  context: AsaasPluginContext
) => AsaasEndpoints;

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
