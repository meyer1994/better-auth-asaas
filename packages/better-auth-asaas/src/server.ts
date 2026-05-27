import type { BetterAuthPlugin, GenericEndpointContext, User } from "better-auth";
import { Client } from "./asaas";
import { createCharge, listPayments, webhook } from "./endpoints";
import type { Customer, Webhooks } from "./zods";

type Options = {
  apiKey: string;
  sandbox?: boolean;
  webhooks?: Webhooks;
};

export const hookAfterCreateUser = async (
  client: Client,
  user: User & { cpfCnpj?: string },
  ctx: GenericEndpointContext | undefined
) => {
  if (!user.cpfCnpj) {
    ctx?.context.logger.info("Asaas customer creation skipped", {
      id: user.id,
      email: user.email,
      cpfCnpj: user.cpfCnpj
    });
    return;
  }

  ctx?.context.logger.info("Creating Asaas customer", {
    id: user.id,
    email: user.email,
    cpfCnpj: user.cpfCnpj,
  });

  const customer = await client.request<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      cpfCnpj: user.cpfCnpj,
      externalReference: user.id,
    }),
  });

  ctx?.context.logger.info("Asaas customer created", {
    id: user.id,
    email: user.email,
    asaasCustomerId: customer.id,
  });

  await ctx?.context.internalAdapter.updateUser(user.id, {
    asaasCustomerId: customer.id,
  });

  ctx?.context.logger.info("Asaas customer updated", {
    id: user.id,
    email: user.email,
    asaasCustomerId: customer.id,
  });
};

export const asaas = (options: Options) => {
  const client = new Client(options);

  return {
    id: "asaas" as const,

    endpoints: {
      createCharge: createCharge(client),
      listPayments: listPayments(client),
      webhook: webhook(options.webhooks ?? {}),
    },

    init() {
      return {
        options: {
          databaseHooks: {
            user: {
              create: {
                after: (user, ctx) => hookAfterCreateUser(client, user, ctx),
              },
            },
          },
        },
      };
    },

    schema: {
      user: {
        fields: {
          asaasCustomerId: {
            type: "string" as const,
            input: false,
            required: false,
          },
        },
      },
    },
  } satisfies BetterAuthPlugin;
};
