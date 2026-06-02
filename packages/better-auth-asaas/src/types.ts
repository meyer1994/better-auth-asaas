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

export type PaymentEventType =
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
  | "PAYMENT_DUNNING_REQUESTED"
  | "PAYMENT_DUNNING_RECEIVED"
  | "PAYMENT_BANK_SLIP_CANCELLED"
  | "PAYMENT_BANK_SLIP_VIEWED"
  | "PAYMENT_CHECKOUT_VIEWED"
  | "PAYMENT_SPLIT_DIVERGENCE_BLOCK"
  | "PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED";

export type SubscriptionEventType =
  | "SUBSCRIPTION_CREATED"
  | "SUBSCRIPTION_UPDATED"
  | "SUBSCRIPTION_INACTIVATED"
  | "SUBSCRIPTION_DELETED"
  | "SUBSCRIPTION_SPLIT_DISABLED"
  | "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK"
  | "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK_FINISHED";

export type EventType = PaymentEventType | SubscriptionEventType;

export type Event<T, N extends EventType> = {
  id: string;
  event: N;
  dateCreated: string;
} & (
  N extends PaymentEventType
    ? {
        payment: T;
        subscription?: never;
      }
    : N extends SubscriptionEventType
    ? {
        subscription: T;
        payment?: never;
      }
    : {
        payment?: never;
        subscription?: never;
      }
);

export type PaymentBillingType =
  | "UNDEFINED"
  | "BOLETO"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "TRANSFER"
  | "DEPOSIT"
  | "PIX";

export type PaymentStatus =
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "DELETED"
  | "RESTORED"
  | "REFUND_REQUESTED"
  | "REFUND_IN_PROGRESS"
  | "REFUND_DENIED"
  | "CHARGEBACK_REQUESTED"
  | "CHARGEBACK_DISPUTE"
  | "AWAITING_CHARGEBACK_REVERSAL"
  | "DUNNING_REQUESTED"
  | "DUNNING_RECEIVED"
  | "AWAITING_RISK_ANALYSIS"
  | "RECEIVED_IN_CASH";

export type PaymentDiscount = {
  value: number;
  dueDateLimitDays: number;
  type: "FIXED" | "PERCENTAGE";
};

export type PaymentFine = {
  value: number;
  type: "FIXED" | "PERCENTAGE";
};

export type PaymentInterest = {
  value: number;
  type: "FIXED" | "PERCENTAGE";
};

export type SubscriptionBillingType =
  | "UNDEFINED"
  | "BOLETO"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "TRANSFER"
  | "DEPOSIT"
  | "PIX";

export type SubscriptionCycle =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "BIMONTHLY"
  | "QUARTERLY"
  | "SEMIANNUALLY"
  | "YEARLY";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

export type SubscriptionSplitStatus = "ACTIVE" | "DISABLED";

export type SubscriptionSplitDisabledReason = "WALLET_UNABLE_TO_RECEIVE" | "VALUE_DIVERGENCE";

export type Payment = {
  object: "payment";
  id: string;
  dateCreated: string;
  customer: string;
  value: number;
  netValue: number;
  originalValue: number | null;
  description?: string;
  billingType: PaymentBillingType;
  pixTransaction?: string | null;
  dueDate: string;
  paymentDate: string | null;
  clientPaymentDate: string | null;
  externalReference: string | null;
  deleted: boolean;
  anticipated: boolean;
  anticipable: boolean;
  lastInvoiceViewedDate?: string | null;

  status: PaymentStatus;

  discount?: PaymentDiscount;

  fine?: PaymentFine;

  interest?: PaymentInterest;

  callback?: {
    successUrl: string;
    autoRedirect?: boolean;
  };
};

export type Subscription = {
  object: "subscription";
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink: string | null;
  value: number;
  nextDueDate: string;
  endDate: string | null;
  billingType: SubscriptionBillingType;
  cycle: SubscriptionCycle;
  description?: string;
  status: SubscriptionStatus;
  deleted: boolean;
  maxPayments?: number;
  externalReference: string | null;
  checkoutSession?: string;
  discount?: PaymentDiscount;
  fine?: PaymentFine;
  interest?: PaymentInterest;
  split?: SubscriptionSplit[];
};

export type SubscriptionSplit = {
  walletId: string;
  fixedValue?: number | null;
  percentualValue?: number | null;
  totalValue?: number | null;
  externalReference?: string | null;
  description?: string | null;
  status?: SubscriptionSplitStatus;
  disabledReason?: SubscriptionSplitDisabledReason;
};

export type CreatePayment = {
  customer: string;
  billingType: "PIX";
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
};

export type CreateSubscription = {
  customer: string;
  billingType: "UNDEFINED" | "BOLETO" | "CREDIT_CARD" | "PIX";
  value: number;
  nextDueDate: string;
  cycle: SubscriptionCycle;
  description?: string;
  endDate?: string;
  maxPayments?: number;
  externalReference?: string;
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
  limit: number;
  offset: number;
  data: T[];
};
