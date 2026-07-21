import type { BetterAuthClientPlugin } from "better-auth/client";
import type { asaas as asaasServer } from "./server";

export const asaasClient = () => {
  return {
    id: "asaas",
    $InferServerPlugin: {} as ReturnType<typeof asaasServer>,
  } satisfies BetterAuthClientPlugin;
};
