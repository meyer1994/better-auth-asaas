import type { BetterAuthPlugin, GenericEndpointContext, User } from "better-auth";
type PluginEndpoints = NonNullable<BetterAuthPlugin["endpoints"]>;
import { createAsaasClient } from "./asaas-client";
import type {
  AsaasCustomer,
  AsaasEndpoints,
  AsaasOptions,
} from "./types";

const onAfterUserCreate =
  (options: AsaasOptions, client: ReturnType<typeof createAsaasClient>) =>
  async (user: User, context: GenericEndpointContext | null) => {
    if (!context) return;
    if (!options.createCustomerOnSignUp) return;

    try {
      const params = options.getCustomerCreateParams
        ? await options.getCustomerCreateParams({ user })
        : null;

      if (!params?.cpfCnpj) {
        context.context.logger.error(
          "Asaas customer creation skipped: cpfCnpj not provided by getCustomerCreateParams"
        );
        return;
      }

      const customer = await client.request<AsaasCustomer>("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          externalReference: user.id,
          ...params,
        }),
      });

      await context.context.internalAdapter.updateUser(
        user.id,
        { asaasCustomerId: customer.id }
      );

      if (options.onCustomerCreate) {
        await options.onCustomerCreate({ asaasCustomer: customer, user });
      }
    } catch (e: unknown) {
      context.context.logger.error(
        `Asaas customer creation failed: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  };

export const asaas = <O extends AsaasOptions>(options: O) => {
  const client = createAsaasClient(options.apiKey, options.sandbox ?? false);
  const use = options.use ?? [];

  const endpoints = use
    .map((plugin) => plugin(client))
    .reduce((acc, endpoints) => Object.assign(acc, endpoints), {} as AsaasEndpoints);

  return {
    id: "asaas",
    schema: {
      user: {
        fields: {
          cpfCnpj: {
            type: "string" as const,
            required: true,
            input: true,
          },
          asaasCustomerId: {
            type: "string" as const,
            required: false,
          },
        },
      },
    },
    endpoints: endpoints as unknown as PluginEndpoints,
    init() {
      return {
        options: {
          databaseHooks: {
            user: {
              create: {
                after: onAfterUserCreate(options, client),
              },
            },
          },
        },
      };
    },
  } satisfies BetterAuthPlugin;
};
