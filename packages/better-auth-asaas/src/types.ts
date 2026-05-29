
export type Customer = {
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

export type PaymentBillingType =
  | "UNDEFINED"
  | "BOLETO"
  | "CREDIT_CARD"
  | "PIX";

export type PaymentValueType = "FIXED" | "PERCENTAGE";

export type PaymentDiscount = {
  value: number;
  limitDate: string | null;
  dueDateLimitDays: number;
  type: PaymentValueType;
};

export type PaymentInterest = {
  value: number;
  type: PaymentValueType;
};

export type PaymentFine = {
  value: number;
  type: PaymentValueType;
};

export type CreatePaymentDiscount = {
  value: number;
  dueDateLimitDays?: number;
  type?: PaymentValueType;
};

export type CreatePaymentInterest = {
  value: number;
};

export type CreatePaymentFine = {
  value: number;
  type?: PaymentValueType;
};

export type PaymentSplit = {
  walletId: string;
  fixedValue?: number;
  percentualValue?: number;
  totalFixedValue?: number;
  externalReference?: string;
  description?: string;
};

export type PaymentCallback = {
  successUrl: string;
  autoRedirect?: boolean;
};

export type PaymentStatus =
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "DELETED"
  | "RESTORED"
  | "REFUND_REQUESTED"
  | "CHARGEBACK_REQUESTED"
  | "CHARGEBACK_DISPUTE"
  | "AWAITING_CHARGEBACK_REVERSAL"
  | "DUNNING_REQUESTED"
  | "DUNNING_RECEIVED"
  | "AWAITING_RISK_ANALYSIS";

export type Payment = {
  object: "payment";
  id: string;
  dateCreated: string;
  customer: string;
  checkoutSession: unknown | null;
  paymentLink: string | null;
  value: number;
  netValue: number;
  originalValue: number | null;
  interestValue: number | null;
  description: string;
  billingType: PaymentBillingType;
  pixTransaction: unknown | null;
  status: PaymentStatus;
  dueDate: string;
  originalDueDate: string;
  paymentDate: string | null;
  clientPaymentDate: string | null;
  installmentNumber: number | null;
  invoiceUrl: string;
  invoiceNumber: string;
  externalReference: string | null;
  deleted: boolean;
  anticipated: boolean;
  anticipable: boolean;
  creditDate: string | null;
  estimatedCreditDate: string | null;
  transactionReceiptUrl: string | null;
  nossoNumero: string | null;
  bankSlipUrl: string | null;
  lastInvoiceViewedDate: string | null;
  lastBankSlipViewedDate: string | null;
  discount: PaymentDiscount;
  fine: PaymentFine;
  interest: PaymentInterest;
  postalService: boolean;
  escrow: unknown | null;
  refunds: unknown | null;
};

export type CreatePayment = {
  customer: string;
  billingType: PaymentBillingType;
  value: number;
  dueDate: string;
  description?: string;
  daysAfterDueDateToRegistrationCancellation?: number;
  externalReference?: string;
  installmentCount?: number;
  totalValue?: number;
  installmentValue?: number;
  discount?: CreatePaymentDiscount;
  interest?: CreatePaymentInterest;
  fine?: CreatePaymentFine;
  postalService?: boolean;
  split?: PaymentSplit[];
  callback?: PaymentCallback;
  pixAutomaticAuthorizationId?: string;
};

export type PixQrCode = {
  success: boolean;
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

export type Page<T> = {
  object: "list";
  hasMore: boolean;
  totalCount: number;
  limit: number;   // page size (max 100)
  offset: number;  // starting index of this page
  data: T[];
};
