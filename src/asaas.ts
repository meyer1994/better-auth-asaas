export const URL_SANDBOX = "https://api-sandbox.asaas.com/v3";
export const URL_PRODUCTION = "https://api.asaas.com/v3";

type AsaasClientOptions = {
  apiKey: string;
  sandbox?: boolean;
};

export class AsaasClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: AsaasClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.sandbox ? URL_SANDBOX : URL_PRODUCTION;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("access_token", this.apiKey);
    headers.set("Content-Type", "application/json");

    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers });

    if (!response.ok) {
      const body = await response.json().catch(e => console.error(e));
      throw new Error(`Asaas API error: ${response.status} - ${JSON.stringify(body)}`);
    }

    return response.json() as Promise<T>;
  }
}


