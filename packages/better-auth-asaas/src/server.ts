import type { BetterAuthPlugin, EndpointBaseOptions, EndpointOptions, StrictEndpoint } from "better-auth";
import { AsaasClient } from "./asaas";
import { createPayment, getQrCode, listPayments } from "./endpoints";
import { userAfterCreate } from "./hooks";


type Options = {
  apiKey: string;
  sandbox?: boolean;
}

export const asaas = <O extends Options>(options: O) => {
  const client = new AsaasClient(options);

  return {
    id: "asaas" as const,

    endpoints: {
      createpayment: createPayment(client),
      listpayments: listPayments(client),
      qrPayment: getQrCode(client),
    },

    init: () => ({
      options: {
        databaseHooks: {
          user: {
            create: {
              after: (user, ctx) => userAfterCreate({ user, client, ctx }),
            },
          },
        },
      },
    }),

    schema: {
      user: {
        fields: {
          asaasCustomerId: {
            type: 'string',
            required: false,
            input: false,
          },
          cpfCnpj: {
            type: 'string',
            required: true,
            input: true,
          },
        },
      },
    },
  } satisfies BetterAuthPlugin;
};
