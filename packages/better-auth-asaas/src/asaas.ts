const URL_SANDBOX = "https://api-sandbox.asaas.com/v3";
const URL_PRODUCTION = "https://api.asaas.com/v3";

type Options = {
  apiKey: string;
  sandbox?: boolean;
};

export class Client {
  private apiKey: string;
  private baseUrl: string;
  private sandbox: boolean;

  constructor(options: Options) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.sandbox ? URL_SANDBOX : URL_PRODUCTION;
    this.sandbox = options.sandbox ?? false;
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


