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

  private buildHeaders(init: RequestInit = {}): Headers {
    const headers = new Headers(init.headers);
    headers.set("access_token", this.apiKey);
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }
    return headers;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = this.buildHeaders(init);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers });

    if (!response.ok) {
      const body = await response.json().catch(e => console.error(e));
      throw new Error(`Asaas API error: ${response.status} - ${JSON.stringify(body)}`);
    }

    return response.json() as Promise<T>;
  }

  /** For Asaas endpoints that return binary (e.g. PDF payment books). */
  async requestBinary(
    path: string,
    init: RequestInit = {},
  ): Promise<{ contentType: string; data: string }> {
    const headers = this.buildHeaders(init);
    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Asaas API error: ${response.status} - ${body}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      contentType: response.headers.get("content-type") ?? "application/octet-stream",
      data: buffer.toString("base64"),
    };
  }
}
