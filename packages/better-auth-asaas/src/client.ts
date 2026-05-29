import type { BetterAuthClientPlugin } from "@better-auth/core";
import type { asaas as asaasServer } from "./server";

export const asaasClient = () => {
  return {
    id: "asaas-client",
    $InferServerPlugin: {} as ReturnType<typeof asaasServer>,
  } satisfies BetterAuthClientPlugin;
};
