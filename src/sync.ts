import type { GenericEndpointContext } from "better-auth";
import type { EventType, Payment, Subscription, WebhookEvent } from "./types";

type UpsertOptions = {
  userId: string;
};

/**
 * Upsert the top-level fields of a webhook event for idempotent delivery
 * tracking. Payment and subscription payloads are intentionally excluded.
 */
export async function upsertWebhookEvent(
  ctx: GenericEndpointContext,
  event: WebhookEvent,
): Promise<void> {
  try {
    const now = new Date();
    const data = {
      asaasEventId: event.id,
      event: event.event as EventType,
      dateCreated: event.dateCreated,
      accountId: event.account?.id ?? null,
      ownerId: event.account?.ownerId ?? null,
      additionalInfo: event.additionalInfo ?? null,
      rawPayload: JSON.stringify(event),
      updatedAt: now,
    };

    const updated = await ctx.context.adapter.update({
      model: "asaasWebhook",
      where: [{ field: "asaasEventId", value: event.id }],
      update: data,
    });

    if (updated) return;

    await ctx.context.adapter.create({
      model: "asaasWebhook",
      data: {
        ...data,
        createdAt: now,
      },
    });
  } catch (error) {
    ctx.context.logger.error("Failed to upsert webhook event", {
      asaasEventId: event.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Upsert a local payment row in one query when the row already exists
 * (`update` by `asaasPaymentId`), or create it when it does not.
 */
export async function upsertPayment(
  ctx: GenericEndpointContext,
  payment: Payment,
  opts: UpsertOptions,
): Promise<void> {
  try {
    const now = new Date();
    const data = {
      userId: opts.userId,
      asaasPaymentId: payment.id,
      asaasCustomerId: payment.customer,
      asaasSubscriptionId: payment.subscription ?? null,
      status: payment.status,
      billingType: payment.billingType,
      value: String(payment.value),
      dueDate: payment.dueDate,
      paymentDate: payment.paymentDate,
      description: payment.description ?? null,
      deleted: payment.deleted ?? false,
      updatedAt: now,
    };

    const updated = await ctx.context.adapter.update({
      model: "asaasPayment",
      where: [{ field: "asaasPaymentId", value: payment.id }],
      update: data,
    });

    if (updated) return;

    await ctx.context.adapter.create({
      model: "asaasPayment",
      data: {
        ...data,
        createdAt: now,
      },
    });
  } catch (error) {
    ctx.context.logger.error("Failed to upsert payment", {
      asaasPaymentId: payment.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Upsert a local subscription row in one query when the row already exists
 * (`update` by `asaasSubscriptionId`), or create it when it does not.
 */
export async function upsertSubscription(
  ctx: GenericEndpointContext,
  subscription: Subscription,
  opts: UpsertOptions,
): Promise<void> {
  try {
    const now = new Date();
    const data = {
      userId: opts.userId,
      asaasSubscriptionId: subscription.id,
      asaasCustomerId: subscription.customer,
      status: subscription.status,
      billingType: subscription.billingType,
      cycle: subscription.cycle,
      value: String(subscription.value),
      nextDueDate: subscription.nextDueDate,
      endDate: subscription.endDate,
      description: subscription.description ?? null,
      deleted: subscription.deleted ?? false,
      updatedAt: now,
    };

    const updated = await ctx.context.adapter.update({
      model: "asaasSubscription",
      where: [{ field: "asaasSubscriptionId", value: subscription.id }],
      update: data,
    });

    if (updated) return;

    await ctx.context.adapter.create({
      model: "asaasSubscription",
      data: {
        ...data,
        createdAt: now,
      },
    });
  } catch (error) {
    ctx.context.logger.error("Failed to upsert subscription", {
      asaasSubscriptionId: subscription.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
