import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAsaasClient } from "../asaas-client";

describe("createAsaasClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses sandbox base URL when sandbox is true", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "cus_1" }), { status: 200 })
    );

    const client = createAsaasClient("test-key", true);
    await client.request("/customers");

    expect(fetch).toHaveBeenCalledWith(
      "https://api-sandbox.asaas.com/v3/customers",
      expect.objectContaining({
        headers: expect.objectContaining({ access_token: "test-key" }),
      })
    );
  });

  it("uses production base URL when sandbox is false", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "cus_1" }), { status: 200 })
    );

    const client = createAsaasClient("prod-key", false);
    await client.request("/customers");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.asaas.com/v3/customers",
      expect.anything()
    );
  });

  it("returns parsed JSON on success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "pay_1", value: 99.9 }), { status: 200 })
    );

    const client = createAsaasClient("key", true);
    const result = await client.request<{ id: string; value: number }>("/payments");

    expect(result).toEqual({ id: "pay_1", value: 99.9 });
  });

  it("throws on non-OK response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: [{ description: "Invalid" }] }), { status: 400 })
    );

    const client = createAsaasClient("key", true);
    await expect(client.request("/payments")).rejects.toThrow("Asaas API error: 400");
  });
});
