import type { GenericEndpointContext } from "@better-auth/core";
import type { User } from "@better-auth/core/db";
import { AsaasClient } from "./asaas";

type HookOptions = {
  user: User & { cpfCnpj?: string }
  client: AsaasClient
  ctx: GenericEndpointContext | null
}

/**
 * Creates an Asaas customer and saves the `asaasCustomerId` on the user table
 *
 * Does nothing if the user does not have a `cpfCnpj` as it is required by Asaas
 */
export const userAfterCreate = async (opts: HookOptions) => {
  if (!opts.ctx) return

  if (!opts.user.cpfCnpj) {
    opts.ctx.context.logger.warn("Asaas customer without cpfCnpj", {
      id: opts.user.id,
      email: opts.user.email,
      cpfCnpj: opts.user.cpfCnpj,
    });
    return;
  }

  opts.ctx.context.logger.debug("Asaas customer creation started", {
    id: opts.user.id,
    email: opts.user.email,
    cpfCnpj: opts.user.cpfCnpj,
  });

  const customer = await opts.client.request<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: opts.user.name,
      email: opts.user.email,
      cpfCnpj: opts.user.cpfCnpj,
      externalReference: opts.user.id,
    }),
  });

  opts.ctx.context.logger.debug("Asaas customer created", {
    id: opts.user.id,
    email: opts.user.email,
    asaasCustomerId: customer.id,
  });

  await opts.ctx.context.internalAdapter.updateUser(opts.user.id, {
    asaasCustomerId: customer.id,
  });

  opts.ctx.context.logger.info("Asaas customer updated", {
    id: opts.user.id,
    email: opts.user.email,
    asaasCustomerId: customer.id,
  });
};

