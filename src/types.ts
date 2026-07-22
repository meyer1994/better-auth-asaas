/**
 * Public Asaas types for @meyer1994/better-auth-asaas/types.
 * Enums and DTOs aligned with Asaas OpenAPI for endpoints used by this plugin.
 */

// ---------------------------------------------------------------------------
// Customer (plugin)
// ---------------------------------------------------------------------------

export type Customer = {
  id: string;
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
  groupName?: string;
  company?: string;
  foreignCustomer?: boolean;
};

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

/** Billing type on create/update requests (payment & subscription). */
export enum PaymentRequestBillingType {
  UNDEFINED = "UNDEFINED",
  BOLETO = "BOLETO",
  CREDIT_CARD = "CREDIT_CARD",
  PIX = "PIX",
}

/** Billing type on payment/subscription response objects. */
export enum PaymentBillingType {
  UNDEFINED = "UNDEFINED",
  BOLETO = "BOLETO",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  TRANSFER = "TRANSFER",
  DEPOSIT = "DEPOSIT",
  PIX = "PIX",
}

/** @deprecated Prefer PaymentRequestBillingType */
export const SubscriptionRequestBillingType = PaymentRequestBillingType;
export type SubscriptionRequestBillingType = PaymentRequestBillingType;

/** @deprecated Prefer PaymentBillingType for response billing types */
export const SubscriptionBillingType = PaymentBillingType;
export type SubscriptionBillingType = PaymentBillingType;

export enum PaymentStatus {
  PENDING = "PENDING",
  RECEIVED = "RECEIVED",
  CONFIRMED = "CONFIRMED",
  OVERDUE = "OVERDUE",
  REFUNDED = "REFUNDED",
  RECEIVED_IN_CASH = "RECEIVED_IN_CASH",
  REFUND_REQUESTED = "REFUND_REQUESTED",
  REFUND_IN_PROGRESS = "REFUND_IN_PROGRESS",
  CHARGEBACK_REQUESTED = "CHARGEBACK_REQUESTED",
  CHARGEBACK_DISPUTE = "CHARGEBACK_DISPUTE",
  AWAITING_CHARGEBACK_REVERSAL = "AWAITING_CHARGEBACK_REVERSAL",
  DUNNING_REQUESTED = "DUNNING_REQUESTED",
  DUNNING_RECEIVED = "DUNNING_RECEIVED",
  AWAITING_RISK_ANALYSIS = "AWAITING_RISK_ANALYSIS",
}

export enum DiscountType {
  FIXED = "FIXED",
  PERCENTAGE = "PERCENTAGE",
}

export enum FineType {
  FIXED = "FIXED",
  PERCENTAGE = "PERCENTAGE",
}

export enum CreditCardBrand {
  VISA = "VISA",
  MASTERCARD = "MASTERCARD",
  ELO = "ELO",
  DINERS = "DINERS",
  DISCOVER = "DISCOVER",
  AMEX = "AMEX",
  CABAL = "CABAL",
  BANESCARD = "BANESCARD",
  CREDZ = "CREDZ",
  SOROCRED = "SOROCRED",
  CREDSYSTEM = "CREDSYSTEM",
  JCB = "JCB",
  UNKNOWN = "UNKNOWN",
}

export enum PaymentSplitCancellationReason {
  PAYMENT_DELETED = "PAYMENT_DELETED",
  PAYMENT_OVERDUE = "PAYMENT_OVERDUE",
  PAYMENT_RECEIVED_IN_CASH = "PAYMENT_RECEIVED_IN_CASH",
  PAYMENT_REFUNDED = "PAYMENT_REFUNDED",
  VALUE_DIVERGENCE_BLOCK = "VALUE_DIVERGENCE_BLOCK",
  WALLET_UNABLE_TO_RECEIVE = "WALLET_UNABLE_TO_RECEIVE",
}

export enum PaymentSplitStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PROCESSING_REFUND = "PROCESSING_REFUND",
  AWAITING_CREDIT = "AWAITING_CREDIT",
  CANCELLED = "CANCELLED",
  DONE = "DONE",
  REFUNDED = "REFUNDED",
  BLOCKED_BY_VALUE_DIVERGENCE = "BLOCKED_BY_VALUE_DIVERGENCE",
}

export enum ChargebackStatus {
  REQUESTED = "REQUESTED",
  IN_DISPUTE = "IN_DISPUTE",
  DISPUTE_LOST = "DISPUTE_LOST",
  REVERSED = "REVERSED",
  DONE = "DONE",
}

export enum ChargebackReason {
  ABSENCE_OF_PRINT = "ABSENCE_OF_PRINT",
  ABSENT_CARD_FRAUD = "ABSENT_CARD_FRAUD",
  CARD_ACTIVATED_PHONE_TRANSACTION = "CARD_ACTIVATED_PHONE_TRANSACTION",
  CARD_FRAUD = "CARD_FRAUD",
  CARD_RECOVERY_BULLETIN = "CARD_RECOVERY_BULLETIN",
  COMMERCIAL_DISAGREEMENT = "COMMERCIAL_DISAGREEMENT",
  COPY_NOT_RECEIVED = "COPY_NOT_RECEIVED",
  CREDIT_OR_DEBIT_PRESENTATION_ERROR = "CREDIT_OR_DEBIT_PRESENTATION_ERROR",
  DIFFERENT_PAY_METHOD = "DIFFERENT_PAY_METHOD",
  FRAUD = "FRAUD",
  INCORRECT_TRANSACTION_VALUE = "INCORRECT_TRANSACTION_VALUE",
  INVALID_CURRENCY = "INVALID_CURRENCY",
  INVALID_DATA = "INVALID_DATA",
  LATE_PRESENTATION = "LATE_PRESENTATION",
  LOCAL_REGULATORY_OR_LEGAL_DISPUTE = "LOCAL_REGULATORY_OR_LEGAL_DISPUTE",
  MULTIPLE_ROCS = "MULTIPLE_ROCS",
  ORIGINAL_CREDIT_TRANSACTION_NOT_ACCEPTED = "ORIGINAL_CREDIT_TRANSACTION_NOT_ACCEPTED",
  OTHER_ABSENT_CARD_FRAUD = "OTHER_ABSENT_CARD_FRAUD",
  PROCESS_ERROR = "PROCESS_ERROR",
  RECEIVED_COPY_ILLEGIBLE_OR_INCOMPLETE = "RECEIVED_COPY_ILLEGIBLE_OR_INCOMPLETE",
  RECURRENCE_CANCELED = "RECURRENCE_CANCELED",
  REQUIRED_AUTHORIZATION_NOT_GRANTED = "REQUIRED_AUTHORIZATION_NOT_GRANTED",
  RIGHT_OF_FULL_RECOURSE_FOR_FRAUD = "RIGHT_OF_FULL_RECOURSE_FOR_FRAUD",
  SALE_CANCELED = "SALE_CANCELED",
  SERVICE_DISAGREEMENT_OR_DEFECTIVE_PRODUCT = "SERVICE_DISAGREEMENT_OR_DEFECTIVE_PRODUCT",
  SERVICE_NOT_RECEIVED = "SERVICE_NOT_RECEIVED",
  SPLIT_SALE = "SPLIT_SALE",
  TRANSFERS_OF_DIVERSE_RESPONSIBILITIES = "TRANSFERS_OF_DIVERSE_RESPONSIBILITIES",
  UNQUALIFIED_CAR_RENTAL_DEBIT = "UNQUALIFIED_CAR_RENTAL_DEBIT",
  USA_CARDHOLDER_DISPUTE = "USA_CARDHOLDER_DISPUTE",
  VISA_FRAUD_MONITORING_PROGRAM = "VISA_FRAUD_MONITORING_PROGRAM",
  WARNING_BULLETIN_FILE = "WARNING_BULLETIN_FILE",
}

export enum ChargebackDisputeStatus {
  REQUESTED = "REQUESTED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export enum PaymentEscrowStatus {
  ACTIVE = "ACTIVE",
  DONE = "DONE",
}

export enum PaymentEscrowFinishReason {
  CHARGEBACK = "CHARGEBACK",
  EXPIRED = "EXPIRED",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  PAYMENT_REFUNDED = "PAYMENT_REFUNDED",
  REQUESTED_BY_CUSTOMER = "REQUESTED_BY_CUSTOMER",
  CUSTOMER_CONFIG_DISABLED = "CUSTOMER_CONFIG_DISABLED",
}

export enum PaymentRefundStatus {
  PENDING = "PENDING",
  AWAITING_CRITICAL_ACTION_AUTHORIZATION = "AWAITING_CRITICAL_ACTION_AUTHORIZATION",
  AWAITING_CUSTOMER_EXTERNAL_AUTHORIZATION = "AWAITING_CUSTOMER_EXTERNAL_AUTHORIZATION",
  CANCELLED = "CANCELLED",
  DONE = "DONE",
}

export enum InvoiceStatus {
  SCHEDULED = "SCHEDULED",
  AUTHORIZED = "AUTHORIZED",
  PROCESSING_CANCELLATION = "PROCESSING_CANCELLATION",
  CANCELED = "CANCELED",
  CANCELLATION_DENIED = "CANCELLATION_DENIED",
  ERROR = "ERROR",
}

export enum CardTransactionType {
  CREDIT = "CREDIT",
  VOUCHER = "VOUCHER",
}

export enum SubscriptionCycle {
  WEEKLY = "WEEKLY",
  BIWEEKLY = "BIWEEKLY",
  MONTHLY = "MONTHLY",
  BIMONTHLY = "BIMONTHLY",
  QUARTERLY = "QUARTERLY",
  SEMIANNUALLY = "SEMIANNUALLY",
  YEARLY = "YEARLY",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  INACTIVE = "INACTIVE",
}

export enum SubscriptionUpdateStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum SubscriptionSplitStatus {
  ACTIVE = "ACTIVE",
  DISABLED = "DISABLED",
}

export enum SubscriptionSplitDisabledReason {
  WALLET_UNABLE_TO_RECEIVE = "WALLET_UNABLE_TO_RECEIVE",
  VALUE_DIVERGENCE = "VALUE_DIVERGENCE",
}

export enum PaymentBookOrder {
  ASC = "asc",
  DESC = "desc",
}

export enum PaymentEventType {
  PAYMENT_CREATED = "PAYMENT_CREATED",
  PAYMENT_AWAITING_RISK_ANALYSIS = "PAYMENT_AWAITING_RISK_ANALYSIS",
  PAYMENT_APPROVED_BY_RISK_ANALYSIS = "PAYMENT_APPROVED_BY_RISK_ANALYSIS",
  PAYMENT_REPROVED_BY_RISK_ANALYSIS = "PAYMENT_REPROVED_BY_RISK_ANALYSIS",
  PAYMENT_AUTHORIZED = "PAYMENT_AUTHORIZED",
  PAYMENT_UPDATED = "PAYMENT_UPDATED",
  PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  PAYMENT_CREDIT_CARD_CAPTURE_REFUSED = "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED",
  PAYMENT_ANTICIPATED = "PAYMENT_ANTICIPATED",
  PAYMENT_OVERDUE = "PAYMENT_OVERDUE",
  PAYMENT_DELETED = "PAYMENT_DELETED",
  PAYMENT_RESTORED = "PAYMENT_RESTORED",
  PAYMENT_REFUNDED = "PAYMENT_REFUNDED",
  PAYMENT_PARTIALLY_REFUNDED = "PAYMENT_PARTIALLY_REFUNDED",
  PAYMENT_REFUND_IN_PROGRESS = "PAYMENT_REFUND_IN_PROGRESS",
  PAYMENT_REFUND_DENIED = "PAYMENT_REFUND_DENIED",
  PAYMENT_RECEIVED_IN_CASH_UNDONE = "PAYMENT_RECEIVED_IN_CASH_UNDONE",
  PAYMENT_CHARGEBACK_REQUESTED = "PAYMENT_CHARGEBACK_REQUESTED",
  PAYMENT_CHARGEBACK_DISPUTE = "PAYMENT_CHARGEBACK_DISPUTE",
  PAYMENT_AWAITING_CHARGEBACK_REVERSAL = "PAYMENT_AWAITING_CHARGEBACK_REVERSAL",
  PAYMENT_DUNNING_RECEIVED = "PAYMENT_DUNNING_RECEIVED",
  PAYMENT_BANK_SLIP_CANCELLED = "PAYMENT_BANK_SLIP_CANCELLED",
  PAYMENT_DUNNING_REQUESTED = "PAYMENT_DUNNING_REQUESTED",
  PAYMENT_BANK_SLIP_VIEWED = "PAYMENT_BANK_SLIP_VIEWED",
  PAYMENT_CHECKOUT_VIEWED = "PAYMENT_CHECKOUT_VIEWED",
  PAYMENT_SPLIT_CANCELLED = "PAYMENT_SPLIT_CANCELLED",
  PAYMENT_SPLIT_DIVERGENCE_BLOCK = "PAYMENT_SPLIT_DIVERGENCE_BLOCK",
  PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED = "PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED",
}

export enum SubscriptionEventType {
  SUBSCRIPTION_CREATED = "SUBSCRIPTION_CREATED",
  SUBSCRIPTION_UPDATED = "SUBSCRIPTION_UPDATED",
  SUBSCRIPTION_INACTIVATED = "SUBSCRIPTION_INACTIVATED",
  SUBSCRIPTION_DELETED = "SUBSCRIPTION_DELETED",
  SUBSCRIPTION_SPLIT_DISABLED = "SUBSCRIPTION_SPLIT_DISABLED",
  SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK = "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK",
  SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK_FINISHED = "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK_FINISHED",
}

export type PaymentEventTypeName = `${PaymentEventType}`;
export type SubscriptionEventTypeName = `${SubscriptionEventType}`;
export type EventType = PaymentEventTypeName | SubscriptionEventTypeName;

// ---------------------------------------------------------------------------
// Shared nested DTOs
// ---------------------------------------------------------------------------

export interface PaymentDiscount {
  value?: number | null;
  dueDateLimitDays?: number | null;
  type?: DiscountType | null;
}

export interface PaymentInterestRequest {
  value?: number | null;
}

export interface PaymentFineRequest {
  value?: number | null;
  type?: FineType | null;
}

export interface PaymentFineResponse {
  value?: number | null;
}

export interface PaymentInterestResponse {
  value?: number | null;
}

export interface PaymentCallbackRequest {
  successUrl: string;
  autoRedirect?: boolean | null;
}

export interface PaymentSplitRequest {
  walletId: string;
  fixedValue?: number | null;
  percentualValue?: number | null;
  totalFixedValue?: number | null;
  externalReference?: string | null;
  description?: string | null;
}

export interface PaymentSplit {
  id?: string | null;
  walletId?: string | null;
  fixedValue?: number | null;
  percentualValue?: number | null;
  totalValue?: number | null;
  cancellationReason?: PaymentSplitCancellationReason | null;
  status?: PaymentSplitStatus | null;
  externalReference?: string | null;
  description?: string | null;
}

export interface CreditCardRequest {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface CreditCardHolderInfoRequest {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
  addressComplement?: string | null;
  mobilePhone?: string | null;
}

export interface PaymentCreditCard {
  creditCardNumber?: string | null;
  creditCardBrand?: CreditCardBrand | null;
  creditCardToken?: string | null;
}

export interface ChargebackCreditCard {
  number?: string | null;
  brand?: CreditCardBrand | null;
}

export interface PaymentChargeback {
  id?: string | null;
  payment?: string | null;
  installment?: string | null;
  customerAccount?: string | null;
  status?: ChargebackStatus | null;
  reason?: ChargebackReason | null;
  disputeStartDate?: string | null;
  value?: number | null;
  paymentDate?: string | null;
  creditCard?: ChargebackCreditCard | null;
  disputeStatus?: ChargebackDisputeStatus | null;
  deadlineToSendDisputeDocuments?: string | null;
}

export interface PaymentEscrow {
  id?: string | null;
  status?: PaymentEscrowStatus | null;
  expirationDate?: string | null;
  finishDate?: string | null;
  finishReason?: PaymentEscrowFinishReason | null;
}

export interface PaymentRefundedSplit {
  id?: string | null;
  value?: number | null;
  done?: boolean | null;
}

export interface PaymentRefund {
  dateCreated?: string | null;
  status?: PaymentRefundStatus | null;
  value?: number | null;
  endToEndIdentifier?: string | null;
  description?: string | null;
  effectiveDate?: string | null;
  transactionReceiptUrl?: string | null;
  refundedSplits?: PaymentRefundedSplit[] | null;
}

export interface SubscriptionSplitRequest {
  walletId: string;
  fixedValue?: number | null;
  percentualValue?: number | null;
  externalReference?: string | null;
  description?: string | null;
}

export interface SubscriptionSplit {
  walletId?: string | null;
  fixedValue?: number | null;
  percentualValue?: number | null;
  totalValue?: number | null;
  externalReference?: string | null;
  description?: string | null;
  status?: SubscriptionSplitStatus | null;
  disabledReason?: SubscriptionSplitDisabledReason | null;
}

export interface PaymentCardHolder {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  address?: string | null;
  addressNumber?: string | null;
  complement?: string | null;
  province?: string | null;
  city?: string | null;
  uf?: string | null;
  country?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
}

export interface PaymentCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  holder?: PaymentCardHolder | null;
}

// ---------------------------------------------------------------------------
// Core resource types (PaymentGetResponseDTO / SubscriptionGetResponseDTO)
// ---------------------------------------------------------------------------

export interface Payment {
  object?: string | null;
  id: string;
  dateCreated?: string | null;
  customer: string;
  subscription?: string | null;
  installment?: string | null;
  checkoutSession?: string | null;
  paymentLink?: string | null;
  value: number;
  netValue?: number | null;
  originalValue?: number | null;
  interestValue?: number | null;
  description?: string | null;
  billingType: PaymentBillingType;
  creditCard?: PaymentCreditCard | null;
  canBePaidAfterDueDate?: boolean | null;
  pixTransaction?: string | null;
  pixQrCodeId?: string | null;
  status: PaymentStatus;
  dueDate: string;
  originalDueDate?: string | null;
  paymentDate?: string | null;
  clientPaymentDate?: string | null;
  installmentNumber?: number | null;
  invoiceUrl?: string | null;
  invoiceNumber?: string | null;
  externalReference?: string | null;
  deleted?: boolean | null;
  anticipated?: boolean | null;
  anticipable?: boolean | null;
  creditDate?: string | null;
  estimatedCreditDate?: string | null;
  transactionReceiptUrl?: string | null;
  nossoNumero?: string | null;
  bankSlipUrl?: string | null;
  lastInvoiceViewedDate?: string | null;
  discount?: PaymentDiscount | null;
  fine?: PaymentFineResponse | null;
  interest?: PaymentInterestResponse | null;
  split?: PaymentSplit[] | null;
  postalService?: boolean | null;
  daysAfterDueDateToRegistrationCancellation?: number | null;
  chargeback?: PaymentChargeback | null;
  escrow?: PaymentEscrow | null;
  refunds?: PaymentRefund[] | null;
}

export interface Subscription {
  object?: string | null;
  id: string;
  dateCreated?: string | null;
  customer: string;
  paymentLink?: string | null;
  billingType: PaymentBillingType;
  cycle: SubscriptionCycle;
  value: number;
  nextDueDate: string;
  endDate?: string | null;
  description?: string | null;
  status: SubscriptionStatus;
  discount?: PaymentDiscount | null;
  fine?: PaymentFineResponse | null;
  interest?: PaymentInterestResponse | null;
  deleted?: boolean | null;
  maxPayments?: number | null;
  externalReference?: string | null;
  checkoutSession?: string | null;
  sendPaymentByPostalService?: boolean | null;
  split?: SubscriptionSplit[] | null;
  creditCard?: PaymentCreditCard | null;
}

export interface Page<T> {
  object?: string | null;
  hasMore?: boolean | null;
  totalCount?: number | null;
  limit?: number | null;
  offset?: number | null;
  data?: T[] | null;
}

// ---------------------------------------------------------------------------

// Payment endpoints
// ---------------------------------------------------------------------------

export interface CreatePaymentRequest {
  customer: string;
  billingType: PaymentRequestBillingType;
  value: number;
  dueDate: string;
  description?: string | null;
  daysAfterDueDateToRegistrationCancellation?: number | null;
  externalReference?: string | null;
  installmentCount?: number | null;
  totalValue?: number | null;
  installmentValue?: number | null;
  discount?: PaymentDiscount | null;
  interest?: PaymentInterestRequest | null;
  fine?: PaymentFineRequest | null;
  postalService?: boolean | null;
  split?: PaymentSplitRequest[] | null;
  callback?: PaymentCallbackRequest | null;
  pixAutomaticAuthorizationId?: string | null;
}
export type CreatePaymentResponse = Payment

export interface CreatePaymentWithCreditCardRequest {
  customer: string;
  billingType: PaymentRequestBillingType;
  value: number;
  dueDate: string;
  remoteIp: string;
  description?: string | null;
  daysAfterDueDateToRegistrationCancellation?: number | null;
  externalReference?: string | null;
  installmentCount?: number | null;
  totalValue?: number | null;
  installmentValue?: number | null;
  discount?: PaymentDiscount | null;
  interest?: PaymentInterestRequest | null;
  fine?: PaymentFineRequest | null;
  postalService?: boolean | null;
  split?: PaymentSplitRequest[] | null;
  callback?: PaymentCallbackRequest | null;
  pixAutomaticAuthorizationId?: string | null;
  creditCard?: CreditCardRequest | null;
  creditCardHolderInfo?: CreditCardHolderInfoRequest | null;
  creditCardToken?: string | null;
  authorizeOnly?: boolean | null;
}
export interface CreatePaymentWithCreditCardResponse extends Payment {}

export interface ListPaymentsRequest {
  offset?: number | null;
  limit?: number | null;
  customer?: string | null;
  customerGroupName?: string | null;
  billingType?: PaymentRequestBillingType | null;
  status?: PaymentStatus | null;
  subscription?: string | null;
  installment?: string | null;
  externalReference?: string | null;
  paymentDate?: string | null;
  invoiceStatus?: InvoiceStatus | null;
  estimatedCreditDate?: string | null;
  pixQrCodeId?: string | null;
  anticipated?: boolean | null;
  anticipable?: boolean | null;
  "dateCreated[ge]"?: string | null;
  "dateCreated[le]"?: string | null;
  "paymentDate[ge]"?: string | null;
  "paymentDate[le]"?: string | null;
  "estimatedCreditDate[ge]"?: string | null;
  "estimatedCreditDate[le]"?: string | null;
  "dueDate[ge]"?: string | null;
  "dueDate[le]"?: string | null;
  user?: string | null;
  checkoutSession?: string | null;
}
export interface ListPaymentsResponse extends Page<Payment> {}

export interface GetPaymentRequest {
  id: string;
}
export interface GetPaymentResponse extends Payment {}

export interface GetPaymentStatusRequest {
  id: string;
}
export interface GetPaymentStatusResponse {
  status?: PaymentStatus | null;
}

export interface GetPaymentIdentificationFieldRequest {
  id: string;
}
export interface GetPaymentIdentificationFieldResponse {
  identificationField?: string | null;
  nossoNumero?: string | null;
  barCode?: string | null;
}

export interface PaymentBillingInfoPix {
  encodedImage?: string | null;
  payload?: string | null;
  expirationDate?: string | null;
  description?: string | null;
}
export interface PaymentBillingInfoCreditCard {
  creditCardNumber?: string | null;
  creditCardBrand?: CreditCardBrand | null;
  creditCardToken?: string | null;
}
export interface PaymentBillingInfoBankSlip {
  identificationField?: string | null;
  nossoNumero?: string | null;
  barCode?: string | null;
  bankSlipUrl?: string | null;
  daysAfterDueDateToRegistrationCancellation?: number | null;
}
export interface GetPaymentBillingInfoRequest {
  id: string;
}
export interface GetPaymentBillingInfoResponse {
  pix?: PaymentBillingInfoPix | null;
  creditCard?: PaymentBillingInfoCreditCard | null;
  bankSlip?: PaymentBillingInfoBankSlip | null;
}

export interface GetPaymentViewingInfoRequest {
  id: string;
}
export interface GetPaymentViewingInfoResponse {
  invoiceViewedDate?: string | null;
  boletoViewedDate?: string | null;
}

export interface GetPaymentPixQrCodeRequest {
  id: string;
}
export interface GetPaymentPixQrCodeResponse {
  encodedImage?: string | null;
  payload?: string | null;
  expirationDate?: string | null;
  description?: string | null;
}
/** @deprecated Prefer GetPaymentPixQrCodeResponse */
export type PixQrCode = GetPaymentPixQrCodeResponse & { success?: boolean };

export interface PayWithCardRequest {
  id: string;
  cardType: CardTransactionType;
  card?: PaymentCard | null;
  cardToken?: string | null;
}
export interface PayWithCardResponse extends Payment {}

export interface PayWithCreditCardRequest {
  id: string;
  creditCard: CreditCardRequest;
  creditCardHolderInfo: CreditCardHolderInfoRequest;
  creditCardToken?: string | null;
}
export interface PayWithCreditCardResponse extends Payment {}

// ---------------------------------------------------------------------------
// Subscription endpoints
// ---------------------------------------------------------------------------

export interface CreateSubscriptionRequest {
  customer: string;
  billingType: PaymentRequestBillingType;
  value: number;
  nextDueDate: string;
  cycle: SubscriptionCycle;
  discount?: PaymentDiscount | null;
  interest?: PaymentInterestRequest | null;
  fine?: PaymentFineRequest | null;
  description?: string | null;
  endDate?: string | null;
  maxPayments?: number | null;
  externalReference?: string | null;
  split?: SubscriptionSplitRequest[] | null;
  callback?: PaymentCallbackRequest | null;
}
export interface CreateSubscriptionResponse extends Subscription {}
/** @deprecated Prefer CreateSubscriptionRequest */
export type CreateSubscription = CreateSubscriptionRequest;

export interface CreateSubscriptionWithCreditCardRequest {
  customer: string;
  billingType: PaymentRequestBillingType;
  value: number;
  nextDueDate: string;
  cycle: SubscriptionCycle;
  remoteIp: string;
  discount?: PaymentDiscount | null;
  interest?: PaymentInterestRequest | null;
  fine?: PaymentFineRequest | null;
  description?: string | null;
  endDate?: string | null;
  maxPayments?: number | null;
  externalReference?: string | null;
  split?: SubscriptionSplitRequest[] | null;
  callback?: PaymentCallbackRequest | null;
  creditCard: CreditCardRequest;
  creditCardHolderInfo: CreditCardHolderInfoRequest;
  creditCardToken?: string | null;
}
export interface CreateSubscriptionWithCreditCardResponse extends Subscription {}

export interface ListSubscriptionsRequest {
  offset?: number | null;
  limit?: number | null;
  customer?: string | null;
  customerGroupName?: string | null;
  billingType?: PaymentBillingType | null;
  status?: SubscriptionStatus | null;
  deletedOnly?: string | null;
  includeDeleted?: string | null;
  externalReference?: string | null;
  order?: string | null;
  sort?: string | null;
}
export interface ListSubscriptionsResponse extends Page<Subscription> {}

export interface GetSubscriptionRequest {
  id: string;
}
export interface GetSubscriptionResponse extends Subscription {}

export interface UpdateSubscriptionRequest {
  id: string;
  billingType?: PaymentRequestBillingType | null;
  status?: SubscriptionUpdateStatus | null;
  nextDueDate?: string | null;
  discount?: PaymentDiscount | null;
  interest?: PaymentInterestRequest | null;
  fine?: PaymentFineRequest | null;
  cycle?: SubscriptionCycle | null;
  description?: string | null;
  endDate?: string | null;
  updatePendingPayments?: boolean | null;
  externalReference?: string | null;
  split?: SubscriptionSplitRequest[] | null;
  callback?: PaymentCallbackRequest | null;
}
export interface UpdateSubscriptionResponse extends Subscription {}

export interface UpdateSubscriptionCreditCardRequest {
  id: string;
  remoteIp: string;
  creditCard?: CreditCardRequest | null;
  creditCardHolderInfo?: CreditCardHolderInfoRequest | null;
  creditCardToken?: string | null;
}
export interface UpdateSubscriptionCreditCardResponse extends Subscription {}

export interface DeleteSubscriptionRequest {
  id: string;
}
export interface DeleteSubscriptionResponse {
  deleted?: boolean | null;
  id?: string | null;
}

export interface ListSubscriptionPaymentsRequest {
  id: string;
  status?: PaymentStatus | null;
}
export interface ListSubscriptionPaymentsResponse extends Page<Payment> {}

export interface GetSubscriptionPaymentBookRequest {
  id: string;
  month?: number | null;
  year?: number | null;
  sort?: string | null;
  order?: PaymentBookOrder | null;
}
export interface GetSubscriptionPaymentBookResponse {
  contentType: "application/pdf";
  data: string;
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

export interface WebhookAccount {
  id?: string | null;
  ownerId?: string | null;
}

export interface WebhookEvent {
  id: string;
  event: EventType;
  dateCreated: string;
  account?: WebhookAccount | null;
  additionalInfo?: string | null;
}

export type Event<T, N extends EventType = EventType> = {
  id: string;
  event: N;
  dateCreated: string;
  account?: WebhookAccount | null;
  additionalInfo?: string | null;
} & (
  N extends PaymentEventTypeName
    ? { payment: T; subscription?: never }
    : N extends SubscriptionEventTypeName
      ? { subscription: T; payment?: never }
      : { payment?: never; subscription?: never }
);

export interface PaymentWebhookEvent {
  id: string;
  event: PaymentEventType;
  dateCreated: string;
  account?: WebhookAccount | null;
  additionalInfo?: string | null;
  payment: Payment;
}

export interface SubscriptionWebhookEvent {
  id: string;
  event: SubscriptionEventType;
  dateCreated: string;
  account?: WebhookAccount | null;
  additionalInfo?: string | null;
  subscription: Subscription;
}

/** @deprecated Prefer CreatePaymentRequest */
export type CreatePayment = CreatePaymentRequest;
