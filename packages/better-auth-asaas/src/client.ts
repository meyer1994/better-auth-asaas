import type { BetterAuthClientPlugin } from "better-auth/client";
import type { asaas as asaasServer } from "./server";

export const asaas = () => {
  return {
    id: "asaas" as const,
    $InferServerPlugin: {} as ReturnType<typeof asaasServer>,
  } satisfies BetterAuthClientPlugin;
};
