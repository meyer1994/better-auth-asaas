import type { AsaasApiClient } from "./types";

const SANDBOX_URL = "https://api-sandbox.asaas.com/v3";
const PRODUCTION_URL = "https://api.asaas.com/v3";

export const createAsaasClient = (apiKey: string, sandbox: boolean): AsaasApiClient => {
  const baseUrl = sandbox ? SANDBOX_URL : PRODUCTION_URL;

  return {
    async request<T>(path: string, init: RequestInit = {}): Promise<T> {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          access_token: apiKey,
          "Content-Type": "application/json",
          ...(init.headers as Record<string, string> | undefined),
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(`Asaas API error: ${response.status} - ${JSON.stringify(body)}`);
      }

      return response.json() as Promise<T>;
    },
  };
};
