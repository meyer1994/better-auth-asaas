import type { BetterAuthClientPlugin } from "better-auth/client";
import type { asaas } from "./server";

export const asaasClient = () => {
  return {
    id: "asaas-client",
    $InferServerPlugin: {} as ReturnType<typeof asaas>,
  } satisfies BetterAuthClientPlugin;
};
