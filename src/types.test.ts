import { expectTypeOf, it } from "vitest";
import type {
  CreateSubscriptionWithCreditCardRequest,
  CreditCardHolderInfoRequest,
  CreditCardRequest,
  Event,
  ListPaymentsRequest,
  PayWithCreditCardRequest,
  Subscription,
} from "./types";

it("requires credit-card details for credit-card requests", () => {
  expectTypeOf<Pick<PayWithCreditCardRequest, "creditCard" | "creditCardHolderInfo">>().toEqualTypeOf<{
    creditCard: CreditCardRequest;
    creditCardHolderInfo: CreditCardHolderInfoRequest;
  }>();

  expectTypeOf<
    Pick<
      CreateSubscriptionWithCreditCardRequest,
      "creditCard" | "creditCardHolderInfo"
    >
  >().toEqualTypeOf<{
    creditCard: CreditCardRequest;
    creditCardHolderInfo: CreditCardHolderInfoRequest;
  }>();
});

it("models Asaas payment list filter query keys", () => {
  const request: ListPaymentsRequest = {
    "dateCreated[ge]": "2026-01-01",
    "dateCreated[le]": "2026-01-31",
    "paymentDate[ge]": "2026-01-01",
    "paymentDate[le]": "2026-01-31",
    "estimatedCreditDate[ge]": "2026-01-01",
    "estimatedCreditDate[le]": "2026-01-31",
    "dueDate[ge]": "2026-01-01",
    "dueDate[le]": "2026-01-31",
  };

  expectTypeOf(request).toMatchTypeOf<ListPaymentsRequest>();
});

it("models documented webhook fields", () => {
  const subscription: Subscription = {
    id: "sub_1",
    customer: "cus_1",
    billingType: undefined!,
    cycle: undefined!,
    value: 10,
    nextDueDate: "2026-01-01",
    status: undefined!,
    sendPaymentByPostalService: false,
  };
  const event: Event<Subscription, "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK"> = {
    id: "evt_1",
    event: "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK",
    dateCreated: "2026-01-01",
    subscription,
    additionalInfo: "split exceeds net amount",
  };

  expectTypeOf(event.additionalInfo).toEqualTypeOf<string | null | undefined>();
});
