import { describe, expect, it } from "vitest";
import { asaasClient } from "./client";
import { asaas } from "./server";

describe("asaasClient", () => {
  it("uses the same plugin id as the server plugin", () => {
    const server = asaas({
      apiKey: "test_key",
      webhookAccessToken: "test_token",
    });
    const client = asaasClient();

    expect(client.id).toBe("asaas");
    expect(client.id).toBe(server.id);
  });

  it("exposes $InferServerPlugin for endpoint type inference", () => {
    const client = asaasClient();

    expect(client).toHaveProperty("$InferServerPlugin");
  });
});
