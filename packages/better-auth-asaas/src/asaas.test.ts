import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AsaasClient } from "./asaas";

describe("Client", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends access_token header and parses JSON", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "cus_1" }), { status: 200 })
    );
    const client = new AsaasClient({ apiKey: "secret" });

    const result = await client.request<{ id: string }>("/customers");

    expect(result).toEqual({ id: "cus_1" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.asaas.com/v3/customers");
    const headers = init.headers as Headers;
    expect(headers.get("access_token")).toBe("secret");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("uses sandbox URL when sandbox=true", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));
    const client = new AsaasClient({ apiKey: "k", sandbox: true });

    await client.request("/anything");

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api-sandbox.asaas.com/v3/anything"
    );
  });

  it("throws on non-ok response", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: [{ description: "bad" }] }), {
        status: 400,
      })
    );
    const client = new AsaasClient({ apiKey: "k" });

    await expect(client.request("/x")).rejects.toThrow(/Asaas API error: 400/);
  });

  it("passes through method and body", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));
    const client = new AsaasClient({ apiKey: "k" });

    await client.request("/customers", {
      method: "POST",
      body: JSON.stringify({ name: "Joao" }),
    });

    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"name":"Joao"}');
  });
});
