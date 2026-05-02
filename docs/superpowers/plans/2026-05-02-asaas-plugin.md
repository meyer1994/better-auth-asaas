# better-auth-asaas Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `better-auth-asaas`, a standalone Better Auth plugin for Asaas PIX one-time charges, modeled after `@polar-sh/better-auth`.

**Architecture:** The main `asaas()` server plugin registers a `user` schema extension (`asaasCustomerId`), auto-creates an Asaas customer after user sign-up via a database hook, and composes sub-plugins (`charge`, `webhooks`) that each expose endpoints. Sub-plugins are curried functions `(client, context) => endpoints`; `context` carries charge lifecycle hooks so `webhooks` can call them without circular imports.

**Tech Stack:** TypeScript, Better Auth, Zod, Vitest, tsup (ESM+CJS dual output), plain `fetch` (no Asaas SDK).

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` | Package metadata, scripts, peer deps |
| `tsconfig.json` | TypeScript config |
| `vitest.config.ts` | Test runner config |
| `src/types.ts` | All shared TypeScript types and interfaces |
| `src/asaas-client.ts` | Thin `fetch` wrapper for Asaas REST API |
| `src/server.ts` | Main `asaas()` plugin — schema, db hook, sub-plugin wiring |
| `src/plugins/charge.ts` | Four PIX charge endpoints: create, list, get, pixQrCode |
| `src/plugins/webhooks.ts` | Webhook receiver — token verification + event dispatch |
| `src/client.ts` | `asaasClient()` Better Auth client plugin |
| `src/index.ts` | Re-exports for the `.` entry point |
| `src/__tests__/utils/mocks.ts` | Shared test helpers and mock factories |
| `src/__tests__/asaas-client.test.ts` | Tests for HTTP client |
| `src/__tests__/server.test.ts` | Tests for main plugin and customer hook |
| `src/__tests__/plugins/charge.test.ts` | Tests for charge endpoints |
| `src/__tests__/plugins/webhooks.test.ts` | Tests for webhook handler |

---

## Task 1: Scaffold the package

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "better-auth-asaas",
  "version": "0.1.0",
  "description": "Asaas payment integration for Better Auth",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./client": {
      "import": {
        "types": "./dist/client.d.ts",
        "default": "./dist/client.js"
      },
      "require": {
        "types": "./dist/client.d.cts",
        "default": "./dist/client.cjs"
      }
    }
  },
  "type": "module",
  "scripts": {
    "build": "tsup ./src/index.ts ./src/client.ts --format esm,cjs --dts --clean --sourcemap",
    "dev": "npm run build -- --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "files": ["dist"],
  "keywords": ["asaas", "better-auth", "payments", "pix", "brazil"],
  "peerDependencies": {
    "better-auth": ">=1.0.0",
    "zod": "^3.25.0 || ^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "better-auth": "^1.4.18",
    "tsup": "^8.5.0",
    "typescript": "^5.0.0",
    "vitest": "^2.1.0",
    "zod": "^3.25.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,
    "outDir": "dist",
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
});
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json vitest.config.ts
git commit -m "chore: scaffold better-auth-asaas package"
```

---

## Task 2: Define shared types

**Files:**
- Create: `src/types.ts`

No tests needed — type-only file; TypeScript compilation verifies it.

- [ ] **Step 1: Create `src/types.ts`**

```ts
import type { BetterAuthClientPlugin, User } from "better-auth";
import type { UnionToIntersection } from "better-auth";

// ── Asaas API response shapes ──────────────────────────────────────────────

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  externalReference?: string;
  dateCreated: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: "PIX";
  status: "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE" | "REFUNDED" | "DELETED";
  dueDate: string;
  description?: string;
  externalReference?: string;
  dateCreated: string;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export interface AsaasPaymentList {
  object: "list";
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: AsaasPayment[];
}

export interface AsaasWebhookPayload {
  event: "PAYMENT_RECEIVED" | "PAYMENT_OVERDUE" | "PAYMENT_DELETED" | string;
  payment: AsaasPayment;
}

// ── Plugin context shared between sub-plugins ──────────────────────────────

export interface ChargeHooks {
  onPaymentReceived?: (payload: { payment: AsaasPayment; user: User | null }) => Promise<void>;
  onPaymentOverdue?: (payload: { payment: AsaasPayment; user: User | null }) => Promise<void>;
  onPaymentDeleted?: (payload: { payment: AsaasPayment; user: User | null }) => Promise<void>;
}

export interface AsaasPluginContext {
  chargeHooks: ChargeHooks;
}

// ── Sub-plugin types ───────────────────────────────────────────────────────

export interface AsaasApiClient {
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

export type AsaasEndpoints = Record<string, unknown>;

export type AsaasSubPlugin = (
  client: AsaasApiClient,
  context: AsaasPluginContext
) => AsaasEndpoints;

// ── charge() options ───────────────────────────────────────────────────────

export interface ChargeOptions extends ChargeHooks {}

// ── webhooks() options ─────────────────────────────────────────────────────

export interface WebhooksOptions {
  /** The access token Asaas sends in the `asaas-access-token` header. */
  accessToken: string;
}

// ── Main asaas() options ───────────────────────────────────────────────────

export interface AsaasOptions {
  /** Asaas API key (`access_token` header). */
  apiKey: string;
  /** Use the Asaas sandbox environment. Default: false. */
  sandbox?: boolean;
  /** Auto-create an Asaas customer when a user signs up. Default: false. */
  createCustomerOnSignUp?: boolean;
  /**
   * Return the Asaas customer creation parameters for a new user.
   * Required when `createCustomerOnSignUp` is true.
   * Must include `cpfCnpj`.
   */
  getCustomerCreateParams?: (data: { user: Partial<User> }) => Promise<{
    cpfCnpj: string;
    mobilePhone?: string;
    phone?: string;
    address?: string;
    addressNumber?: string;
    complement?: string;
    province?: string;
    postalCode?: string;
    externalReference?: string;
  }>;
  /** Called after an Asaas customer is created. */
  onCustomerCreate?: (payload: { asaasCustomer: AsaasCustomer; user: User }) => Promise<void>;
  /** Sub-plugins to compose (charge, webhooks). */
  use?: AsaasSubPlugin[];
}
```

- [ ] **Step 2: Verify type-checks**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add shared types for better-auth-asaas"
```

---

## Task 3: Asaas HTTP client

**Files:**
- Create: `src/asaas-client.ts`
- Create: `src/__tests__/asaas-client.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/asaas-client.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- asaas-client
```

Expected: FAIL — `Cannot find module '../asaas-client'`

- [ ] **Step 3: Implement `src/asaas-client.ts`**

```ts
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
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm test -- asaas-client
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/asaas-client.ts src/__tests__/asaas-client.test.ts
git commit -m "feat: add Asaas HTTP client wrapper"
```

---

## Task 4: Server plugin (main `asaas()` + customer hook)

**Files:**
- Create: `src/server.ts`
- Create: `src/__tests__/utils/mocks.ts`
- Create: `src/__tests__/server.test.ts`

- [ ] **Step 1: Create test mocks**

```ts
// src/__tests__/utils/mocks.ts
import type { User } from "better-auth";
import { vi } from "vitest";
import type { AsaasApiClient, AsaasCustomer } from "../../types";

export const createMockAsaasClient = (): AsaasApiClient => ({
  request: vi.fn(),
});

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  emailVerified: false,
  ...overrides,
});

export const createMockAsaasCustomer = (overrides: Partial<AsaasCustomer> = {}): AsaasCustomer => ({
  id: "cus_abc123",
  name: "Test User",
  email: "test@example.com",
  cpfCnpj: "12345678901",
  dateCreated: "2026-05-02",
  ...overrides,
});

export const createMockEndpointContext = (user?: Partial<User>) => ({
  context: {
    logger: {
      error: vi.fn(),
      info: vi.fn(),
    },
    internalAdapter: {
      updateUser: vi.fn().mockResolvedValue(undefined),
      findOne: vi.fn(),
    },
  },
  request: new Request("http://localhost:3000/test"),
});
```

- [ ] **Step 2: Write the failing tests**

```ts
// src/__tests__/server.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { asaas } from "../server";
import { createMockAsaasClient, createMockAsaasCustomer, createMockEndpointContext, createMockUser } from "./utils/mocks";

vi.mock("../asaas-client", () => ({
  createAsaasClient: vi.fn(() => createMockAsaasClient()),
}));

import { createAsaasClient } from "../asaas-client";

describe("asaas() plugin", () => {
  it("returns a plugin with id 'asaas'", () => {
    const plugin = asaas({ apiKey: "key", use: [] });
    expect(plugin.id).toBe("asaas");
  });

  it("extends user schema with asaasCustomerId field", () => {
    const plugin = asaas({ apiKey: "key", use: [] });
    expect(plugin.schema?.user?.fields).toHaveProperty("asaasCustomerId");
    expect(plugin.schema?.user?.fields?.asaasCustomerId?.type).toBe("string");
  });

  it("returns database hooks from init()", () => {
    const plugin = asaas({ apiKey: "key", use: [] });
    const init = plugin.init?.();
    expect(init?.options?.databaseHooks?.user?.create?.after).toBeDefined();
  });

  it("passes sandbox flag to createAsaasClient", () => {
    asaas({ apiKey: "my-key", sandbox: true, use: [] });
    expect(createAsaasClient).toHaveBeenCalledWith("my-key", true);
  });

  it("defaults sandbox to false", () => {
    asaas({ apiKey: "my-key", use: [] });
    expect(createAsaasClient).toHaveBeenCalledWith("my-key", false);
  });
});

describe("onAfterUserCreate hook", () => {
  let mockClient: ReturnType<typeof createMockAsaasClient>;

  beforeEach(() => {
    mockClient = createMockAsaasClient();
    vi.mocked(createAsaasClient).mockReturnValue(mockClient);
    vi.clearAllMocks();
  });

  it("creates Asaas customer and saves ID when createCustomerOnSignUp is true", async () => {
    const asaasCustomer = createMockAsaasCustomer();
    vi.mocked(mockClient.request).mockResolvedValueOnce(asaasCustomer);

    const plugin = asaas({
      apiKey: "key",
      createCustomerOnSignUp: true,
      getCustomerCreateParams: async () => ({ cpfCnpj: "12345678901" }),
      use: [],
    });

    const user = createMockUser();
    const ctx = createMockEndpointContext();
    const hook = plugin.init?.()?.options?.databaseHooks?.user?.create?.after;

    await hook?.(user, ctx as any);

    expect(mockClient.request).toHaveBeenCalledWith(
      "/customers",
      expect.objectContaining({ method: "POST" })
    );
    expect(ctx.context.internalAdapter.updateUser).toHaveBeenCalledWith(
      user.id,
      { asaasCustomerId: asaasCustomer.id },
      ctx
    );
  });

  it("calls onCustomerCreate callback after customer is created", async () => {
    const asaasCustomer = createMockAsaasCustomer();
    vi.mocked(mockClient.request).mockResolvedValueOnce(asaasCustomer);
    const onCustomerCreate = vi.fn().mockResolvedValue(undefined);

    const plugin = asaas({
      apiKey: "key",
      createCustomerOnSignUp: true,
      getCustomerCreateParams: async () => ({ cpfCnpj: "12345678901" }),
      onCustomerCreate,
      use: [],
    });

    const user = createMockUser();
    const ctx = createMockEndpointContext();
    const hook = plugin.init?.()?.options?.databaseHooks?.user?.create?.after;

    await hook?.(user, ctx as any);

    expect(onCustomerCreate).toHaveBeenCalledWith({ asaasCustomer, user });
  });

  it("does nothing when createCustomerOnSignUp is false", async () => {
    const plugin = asaas({ apiKey: "key", createCustomerOnSignUp: false, use: [] });
    const ctx = createMockEndpointContext();
    const hook = plugin.init?.()?.options?.databaseHooks?.user?.create?.after;

    await hook?.(createMockUser(), ctx as any);

    expect(mockClient.request).not.toHaveBeenCalled();
  });

  it("logs error but does not throw when Asaas API fails", async () => {
    vi.mocked(mockClient.request).mockRejectedValueOnce(new Error("network error"));

    const plugin = asaas({
      apiKey: "key",
      createCustomerOnSignUp: true,
      getCustomerCreateParams: async () => ({ cpfCnpj: "12345678901" }),
      use: [],
    });

    const ctx = createMockEndpointContext();
    const hook = plugin.init?.()?.options?.databaseHooks?.user?.create?.after;

    await expect(hook?.(createMockUser(), ctx as any)).resolves.not.toThrow();
    expect(ctx.context.logger.error).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
npm test -- server
```

Expected: FAIL — `Cannot find module '../server'`

- [ ] **Step 4: Implement `src/server.ts`**

```ts
import type { BetterAuthPlugin, GenericEndpointContext, User } from "better-auth";
import { APIError } from "better-auth/api";
import { createAsaasClient } from "./asaas-client";
import type { AsaasCustomer, AsaasEndpoints, AsaasOptions, AsaasPluginContext, AsaasSubPlugin } from "./types";

const buildChargeHooks = (use: AsaasSubPlugin[]) => {
  for (const plugin of use) {
    const hooks = (plugin as any).__chargeOptions;
    if (hooks) return hooks;
  }
  return {};
};

const onAfterUserCreate =
  (options: AsaasOptions, client: ReturnType<typeof createAsaasClient>) =>
  async (user: User, context: GenericEndpointContext | null) => {
    if (!context || !options.createCustomerOnSignUp) return;

    try {
      const params = options.getCustomerCreateParams
        ? await options.getCustomerCreateParams({ user })
        : null;

      if (!params?.cpfCnpj) {
        context.context.logger.error(
          "Asaas customer creation skipped: cpfCnpj not provided by getCustomerCreateParams"
        );
        return;
      }

      const customer = await client.request<AsaasCustomer>("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          externalReference: user.id,
          ...params,
        }),
      });

      await context.context.internalAdapter.updateUser(
        user.id,
        { asaasCustomerId: customer.id },
        context
      );

      if (options.onCustomerCreate) {
        await options.onCustomerCreate({ asaasCustomer: customer, user });
      }
    } catch (e: unknown) {
      context.context.logger.error(
        `Asaas customer creation failed: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  };

export const asaas = <O extends AsaasOptions>(options: O) => {
  const client = createAsaasClient(options.apiKey, options.sandbox ?? false);
  const use = options.use ?? [];

  const pluginContext: AsaasPluginContext = {
    chargeHooks: buildChargeHooks(use),
  };

  const endpoints = use
    .map((plugin) => plugin(client, pluginContext))
    .reduce((acc, endpoints) => Object.assign(acc, endpoints), {} as AsaasEndpoints);

  return {
    id: "asaas",
    schema: {
      user: {
        fields: {
          asaasCustomerId: {
            type: "string" as const,
            required: false,
          },
        },
      },
    },
    endpoints,
    init() {
      return {
        options: {
          databaseHooks: {
            user: {
              create: {
                after: onAfterUserCreate(options, client),
              },
            },
          },
        },
      };
    },
  } satisfies BetterAuthPlugin;
};
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test -- server
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/server.ts src/__tests__/utils/mocks.ts src/__tests__/server.test.ts
git commit -m "feat: implement asaas() server plugin with customer auto-create"
```

---

## Task 5: Charge plugin (4 PIX endpoints)

**Files:**
- Create: `src/plugins/charge.ts`
- Create: `src/__tests__/plugins/charge.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/__tests__/plugins/charge.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { charge } from "../../plugins/charge";
import type { AsaasPluginContext } from "../../types";
import { createMockAsaasClient, createMockAsaasCustomer, createMockUser } from "../utils/mocks";

vi.mock("better-auth/api", () => ({
  APIError: class APIError extends Error {
    constructor(public code: string, public data?: { message: string }) {
      super(data?.message ?? code);
    }
  },
  createAuthEndpoint: vi.fn((path: string, _config: unknown, handler: Function) => ({
    path,
    handler,
  })),
  getSessionFromCtx: vi.fn(),
}));

import { APIError, createAuthEndpoint, getSessionFromCtx } from "better-auth/api";

const mockContext: AsaasPluginContext = { chargeHooks: {} };

const createMockCtx = (user: ReturnType<typeof createMockUser> & { asaasCustomerId?: string }) => ({
  body: {},
  params: {},
  query: {},
  request: new Request("http://localhost/"),
  context: {
    logger: { error: vi.fn() },
    internalAdapter: { findOne: vi.fn() },
  },
  json: vi.fn((data: unknown) => data),
});

describe("charge plugin", () => {
  let mockClient: ReturnType<typeof createMockAsaasClient>;

  beforeEach(() => {
    mockClient = createMockAsaasClient();
    vi.clearAllMocks();
  });

  it("registers createCharge, listCharges, getCharge, getChargePixQrCode endpoints", () => {
    const plugin = charge();
    const endpoints = plugin(mockClient, mockContext);

    expect(endpoints).toHaveProperty("createCharge");
    expect(endpoints).toHaveProperty("listCharges");
    expect(endpoints).toHaveProperty("getCharge");
    expect(endpoints).toHaveProperty("getChargePixQrCode");
  });

  describe("createCharge handler", () => {
    it("creates a PIX payment and returns QR code data", async () => {
      const user = createMockUser() as ReturnType<typeof createMockUser> & { asaasCustomerId: string };
      user.asaasCustomerId = "cus_abc";

      vi.mocked(getSessionFromCtx).mockResolvedValueOnce({ user, session: {} as any });

      const payment = {
        id: "pay_1",
        customer: "cus_abc",
        value: 99.9,
        billingType: "PIX" as const,
        status: "PENDING" as const,
        dueDate: "2026-05-10",
        netValue: 99.9,
        dateCreated: "2026-05-02",
      };
      const pixQr = {
        encodedImage: "base64img",
        payload: "00020101...",
        expirationDate: "2026-05-10T23:59:59",
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(payment)
        .mockResolvedValueOnce(pixQr);

      const plugin = charge();
      const endpoints = plugin(mockClient, mockContext) as any;
      const ctx = {
        ...createMockCtx(user),
        body: { value: 99.9, dueDate: "2026-05-10", description: "Pro plan" },
      };

      await endpoints.createCharge.handler(ctx);

      expect(mockClient.request).toHaveBeenNthCalledWith(
        1,
        "/payments",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"billingType":"PIX"'),
        })
      );
      expect(mockClient.request).toHaveBeenNthCalledWith(
        2,
        `/payments/${payment.id}/pixQrCode`
      );
      expect(ctx.json).toHaveBeenCalledWith(
        expect.objectContaining({ pixQrCode: "base64img", pixCopiaECola: "00020101..." })
      );
    });

    it("throws BAD_REQUEST when user has no asaasCustomerId", async () => {
      const user = createMockUser();
      vi.mocked(getSessionFromCtx).mockResolvedValueOnce({ user, session: {} as any });

      const plugin = charge();
      const endpoints = plugin(mockClient, mockContext) as any;
      const ctx = {
        ...createMockCtx(user),
        body: { value: 99.9, dueDate: "2026-05-10" },
      };

      await expect(endpoints.createCharge.handler(ctx)).rejects.toThrow(APIError);
    });

    it("throws UNAUTHORIZED when there is no session", async () => {
      vi.mocked(getSessionFromCtx).mockResolvedValueOnce(null);

      const plugin = charge();
      const endpoints = plugin(mockClient, mockContext) as any;
      const ctx = { ...createMockCtx(createMockUser()), body: { value: 99.9, dueDate: "2026-05-10" } };

      await expect(endpoints.createCharge.handler(ctx)).rejects.toThrow(APIError);
    });
  });

  describe("listCharges handler", () => {
    it("returns payments for the current user's asaasCustomerId", async () => {
      const user = { ...createMockUser(), asaasCustomerId: "cus_abc" };
      vi.mocked(getSessionFromCtx).mockResolvedValueOnce({ user, session: {} as any });

      const paymentList = { data: [], hasMore: false, totalCount: 0, limit: 10, offset: 0, object: "list" };
      vi.mocked(mockClient.request).mockResolvedValueOnce(paymentList);

      const plugin = charge();
      const endpoints = plugin(mockClient, mockContext) as any;
      const ctx = createMockCtx(user);

      await endpoints.listCharges.handler(ctx);

      expect(mockClient.request).toHaveBeenCalledWith("/payments?customer=cus_abc");
      expect(ctx.json).toHaveBeenCalledWith(paymentList);
    });
  });

  describe("getCharge handler", () => {
    it("returns a single payment by ID", async () => {
      const user = { ...createMockUser(), asaasCustomerId: "cus_abc" };
      vi.mocked(getSessionFromCtx).mockResolvedValueOnce({ user, session: {} as any });

      const payment = { id: "pay_1", customer: "cus_abc", value: 50, billingType: "PIX" as const, status: "RECEIVED" as const, dueDate: "2026-05-01", netValue: 50, dateCreated: "2026-05-01" };
      vi.mocked(mockClient.request).mockResolvedValueOnce(payment);

      const plugin = charge();
      const endpoints = plugin(mockClient, mockContext) as any;
      const ctx = { ...createMockCtx(user), params: { id: "pay_1" } };

      await endpoints.getCharge.handler(ctx);

      expect(mockClient.request).toHaveBeenCalledWith("/payments/pay_1");
      expect(ctx.json).toHaveBeenCalledWith(payment);
    });
  });

  describe("getChargePixQrCode handler", () => {
    it("returns PIX QR code for a payment", async () => {
      const user = { ...createMockUser(), asaasCustomerId: "cus_abc" };
      vi.mocked(getSessionFromCtx).mockResolvedValueOnce({ user, session: {} as any });

      const pix = { encodedImage: "base64", payload: "pix_key", expirationDate: "2026-05-10T23:59:59" };
      vi.mocked(mockClient.request).mockResolvedValueOnce(pix);

      const plugin = charge();
      const endpoints = plugin(mockClient, mockContext) as any;
      const ctx = { ...createMockCtx(user), params: { id: "pay_1" } };

      await endpoints.getChargePixQrCode.handler(ctx);

      expect(mockClient.request).toHaveBeenCalledWith("/payments/pay_1/pixQrCode");
      expect(ctx.json).toHaveBeenCalledWith(pix);
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- charge
```

Expected: FAIL — `Cannot find module '../../plugins/charge'`

- [ ] **Step 3: Implement `src/plugins/charge.ts`**

```ts
import { APIError, createAuthEndpoint, getSessionFromCtx } from "better-auth/api";
import * as z from "zod/v4";
import type {
  AsaasApiClient,
  AsaasEndpoints,
  AsaasPayment,
  AsaasPixQrCode,
  AsaasPluginContext,
  ChargeOptions,
} from "../types";

const CreateChargeBody = z.object({
  value: z.number().positive(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  description: z.string().max(500).optional(),
  externalReference: z.string().optional(),
});

export const charge =
  (chargeOptions: ChargeOptions = {}) =>
  (client: AsaasApiClient, _context: AsaasPluginContext): AsaasEndpoints => {
    const endpoints = {
      createCharge: createAuthEndpoint(
        "/asaas/charge",
        { method: "POST", body: CreateChargeBody },
        async (ctx) => {
          const session = await getSessionFromCtx(ctx);
          if (!session) throw new APIError("UNAUTHORIZED");

          const user = session.user as typeof session.user & { asaasCustomerId?: string };
          if (!user.asaasCustomerId) {
            throw new APIError("BAD_REQUEST", {
              message: "User does not have an Asaas customer ID. Ensure createCustomerOnSignUp is enabled.",
            });
          }

          const payment = await client.request<AsaasPayment>("/payments", {
            method: "POST",
            body: JSON.stringify({
              customer: user.asaasCustomerId,
              billingType: "PIX",
              value: ctx.body.value,
              dueDate: ctx.body.dueDate,
              description: ctx.body.description,
              externalReference: ctx.body.externalReference,
            }),
          });

          const pix = await client.request<AsaasPixQrCode>(
            `/payments/${payment.id}/pixQrCode`
          );

          return ctx.json({
            ...payment,
            pixQrCode: pix.encodedImage,
            pixCopiaECola: pix.payload,
          });
        }
      ),

      listCharges: createAuthEndpoint(
        "/asaas/charges",
        { method: "GET" },
        async (ctx) => {
          const session = await getSessionFromCtx(ctx);
          if (!session) throw new APIError("UNAUTHORIZED");

          const user = session.user as typeof session.user & { asaasCustomerId?: string };
          if (!user.asaasCustomerId) {
            throw new APIError("BAD_REQUEST", {
              message: "User does not have an Asaas customer ID.",
            });
          }

          const payments = await client.request(`/payments?customer=${user.asaasCustomerId}`);
          return ctx.json(payments);
        }
      ),

      getCharge: createAuthEndpoint(
        "/asaas/charge/:id",
        { method: "GET" },
        async (ctx) => {
          const session = await getSessionFromCtx(ctx);
          if (!session) throw new APIError("UNAUTHORIZED");

          const payment = await client.request<AsaasPayment>(
            `/payments/${ctx.params.id}`
          );
          return ctx.json(payment);
        }
      ),

      getChargePixQrCode: createAuthEndpoint(
        "/asaas/charge/:id/pix",
        { method: "GET" },
        async (ctx) => {
          const session = await getSessionFromCtx(ctx);
          if (!session) throw new APIError("UNAUTHORIZED");

          const pix = await client.request<AsaasPixQrCode>(
            `/payments/${ctx.params.id}/pixQrCode`
          );
          return ctx.json(pix);
        }
      ),
    };

    // Attach chargeOptions as metadata so asaas() can extract hooks
    (charge as any).__chargeOptions = chargeOptions;

    return endpoints;
  };
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- charge
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/plugins/charge.ts src/__tests__/plugins/charge.test.ts
git commit -m "feat: implement charge plugin with PIX endpoints"
```

---

## Task 6: Webhooks plugin

**Files:**
- Create: `src/plugins/webhooks.ts`
- Create: `src/__tests__/plugins/webhooks.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/__tests__/plugins/webhooks.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { webhooks } from "../../plugins/webhooks";
import type { AsaasPayment, AsaasPluginContext, AsaasWebhookPayload } from "../../types";
import { createMockAsaasClient, createMockUser } from "../utils/mocks";

vi.mock("better-auth/api", () => ({
  APIError: class APIError extends Error {
    constructor(public code: string, public data?: { message: string }) {
      super(data?.message ?? code);
    }
  },
  createAuthEndpoint: vi.fn((path: string, _config: unknown, handler: Function) => ({
    path,
    handler,
  })),
}));

import { APIError } from "better-auth/api";

const mockPayment: AsaasPayment = {
  id: "pay_1",
  customer: "cus_abc",
  value: 99.9,
  netValue: 99.9,
  billingType: "PIX",
  status: "RECEIVED",
  dueDate: "2026-05-10",
  dateCreated: "2026-05-02",
};

const makeCtx = (
  body: AsaasWebhookPayload,
  token: string,
  internalAdapter = { findOne: vi.fn() }
) => ({
  request: new Request("http://localhost/api/auth/asaas/webhook", {
    method: "POST",
    headers: { "asaas-access-token": token },
    body: JSON.stringify(body),
  }),
  context: {
    logger: { error: vi.fn() },
    internalAdapter,
  },
  json: vi.fn((data: unknown) => data),
});

describe("webhooks plugin", () => {
  let mockClient: ReturnType<typeof createMockAsaasClient>;
  const validToken = "webhook-secret";

  beforeEach(() => {
    mockClient = createMockAsaasClient();
    vi.clearAllMocks();
  });

  it("registers asaasWebhooks endpoint", () => {
    const plugin = webhooks({ accessToken: validToken });
    const context: AsaasPluginContext = { chargeHooks: {} };
    const endpoints = plugin(mockClient, context);
    expect(endpoints).toHaveProperty("asaasWebhooks");
  });

  it("throws UNAUTHORIZED when token does not match", async () => {
    const plugin = webhooks({ accessToken: validToken });
    const context: AsaasPluginContext = { chargeHooks: {} };
    const endpoints = plugin(mockClient, context) as any;

    const ctx = makeCtx({ event: "PAYMENT_RECEIVED", payment: mockPayment }, "wrong-token");

    await expect(endpoints.asaasWebhooks.handler(ctx)).rejects.toThrow(APIError);
  });

  it("calls onPaymentReceived with payment and resolved user", async () => {
    const user = createMockUser();
    const onPaymentReceived = vi.fn().mockResolvedValue(undefined);
    const findOne = vi.fn().mockResolvedValue(user);

    const plugin = webhooks({ accessToken: validToken });
    const context: AsaasPluginContext = {
      chargeHooks: { onPaymentReceived },
    };
    const endpoints = plugin(mockClient, context) as any;
    const ctx = makeCtx({ event: "PAYMENT_RECEIVED", payment: mockPayment }, validToken, { findOne });

    await endpoints.asaasWebhooks.handler(ctx);

    expect(findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "user",
        where: expect.arrayContaining([{ field: "asaasCustomerId", value: mockPayment.customer }]),
      })
    );
    expect(onPaymentReceived).toHaveBeenCalledWith({ payment: mockPayment, user });
    expect(ctx.json).toHaveBeenCalledWith({ received: true });
  });

  it("calls onPaymentOverdue for PAYMENT_OVERDUE event", async () => {
    const onPaymentOverdue = vi.fn().mockResolvedValue(undefined);
    const plugin = webhooks({ accessToken: validToken });
    const context: AsaasPluginContext = { chargeHooks: { onPaymentOverdue } };
    const endpoints = plugin(mockClient, context) as any;
    const ctx = makeCtx({ event: "PAYMENT_OVERDUE", payment: mockPayment }, validToken, { findOne: vi.fn().mockResolvedValue(null) });

    await endpoints.asaasWebhooks.handler(ctx);

    expect(onPaymentOverdue).toHaveBeenCalledWith({ payment: mockPayment, user: null });
  });

  it("calls onPaymentDeleted for PAYMENT_DELETED event", async () => {
    const onPaymentDeleted = vi.fn().mockResolvedValue(undefined);
    const plugin = webhooks({ accessToken: validToken });
    const context: AsaasPluginContext = { chargeHooks: { onPaymentDeleted } };
    const endpoints = plugin(mockClient, context) as any;
    const ctx = makeCtx({ event: "PAYMENT_DELETED", payment: mockPayment }, validToken, { findOne: vi.fn().mockResolvedValue(null) });

    await endpoints.asaasWebhooks.handler(ctx);

    expect(onPaymentDeleted).toHaveBeenCalledWith({ payment: mockPayment, user: null });
  });

  it("silently ignores unrecognized events", async () => {
    const onPaymentReceived = vi.fn();
    const plugin = webhooks({ accessToken: validToken });
    const context: AsaasPluginContext = { chargeHooks: { onPaymentReceived } };
    const endpoints = plugin(mockClient, context) as any;
    const ctx = makeCtx({ event: "UNKNOWN_EVENT", payment: mockPayment }, validToken, { findOne: vi.fn() });

    await expect(endpoints.asaasWebhooks.handler(ctx)).resolves.not.toThrow();
    expect(onPaymentReceived).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- webhooks
```

Expected: FAIL — `Cannot find module '../../plugins/webhooks'`

- [ ] **Step 3: Implement `src/plugins/webhooks.ts`**

```ts
import { APIError, createAuthEndpoint } from "better-auth/api";
import type {
  AsaasApiClient,
  AsaasEndpoints,
  AsaasPluginContext,
  AsaasWebhookPayload,
  WebhooksOptions,
} from "../types";

export const webhooks =
  (webhooksOptions: WebhooksOptions) =>
  (_client: AsaasApiClient, context: AsaasPluginContext): AsaasEndpoints => {
    return {
      asaasWebhooks: createAuthEndpoint(
        "/asaas/webhook",
        {
          method: "POST",
          metadata: { isAction: false },
          cloneRequest: true,
        },
        async (ctx) => {
          const token = ctx.request?.headers.get("asaas-access-token");
          if (token !== webhooksOptions.accessToken) {
            throw new APIError("UNAUTHORIZED", {
              message: "Invalid webhook access token",
            });
          }

          const body = (await ctx.request?.json()) as AsaasWebhookPayload;
          const { chargeHooks } = context;

          const user = await ctx.context.internalAdapter
            .findOne({
              model: "user",
              where: [{ field: "asaasCustomerId", value: body.payment.customer }],
            })
            .catch(() => null);

          switch (body.event) {
            case "PAYMENT_RECEIVED":
              await chargeHooks.onPaymentReceived?.({ payment: body.payment, user });
              break;
            case "PAYMENT_OVERDUE":
              await chargeHooks.onPaymentOverdue?.({ payment: body.payment, user });
              break;
            case "PAYMENT_DELETED":
              await chargeHooks.onPaymentDeleted?.({ payment: body.payment, user });
              break;
            default:
              break;
          }

          return ctx.json({ received: true });
        }
      ),
    };
  };
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- webhooks
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/plugins/webhooks.ts src/__tests__/plugins/webhooks.test.ts
git commit -m "feat: implement webhooks plugin with token verification and event dispatch"
```

---

## Task 7: Client plugin

**Files:**
- Create: `src/client.ts`

The client plugin has no logic — it only infers server types. TypeScript compilation is the verification.

- [ ] **Step 1: Implement `src/client.ts`**

```ts
import type { BetterAuthClientPlugin } from "better-auth/client";
import type { asaas } from "./server";

export const asaasClient = () => {
  return {
    id: "asaas-client",
    $InferServerPlugin: {} as ReturnType<typeof asaas>,
  } satisfies BetterAuthClientPlugin;
};
```

- [ ] **Step 2: Verify it type-checks**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/client.ts
git commit -m "feat: add asaasClient() Better Auth client plugin"
```

---

## Task 8: Wire up index exports

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: Implement `src/index.ts`**

```ts
export { asaas } from "./server";
export { charge } from "./plugins/charge";
export { webhooks } from "./plugins/webhooks";
export type {
  AsaasOptions,
  AsaasCustomer,
  AsaasPayment,
  AsaasPixQrCode,
  AsaasWebhookPayload,
  AsaasPaymentList,
  ChargeOptions,
  WebhooksOptions,
} from "./types";
```

- [ ] **Step 2: Verify type-checks**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: wire up index exports for better-auth-asaas"
```

---

## Task 9: Build and verify output

**Files:** none new — verifies the dist output.

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 2: Build the package**

```bash
npm run build
```

Expected: `dist/` created with:
- `dist/index.js` (ESM)
- `dist/index.cjs` (CJS)
- `dist/index.d.ts` (types)
- `dist/client.js`
- `dist/client.cjs`
- `dist/client.d.ts`

- [ ] **Step 3: Verify exports resolve correctly**

```bash
node -e "const m = require('./dist/index.cjs'); console.log(Object.keys(m))"
```

Expected output: `[ 'asaas', 'charge', 'webhooks' ]` (plus type exports).

- [ ] **Step 4: Commit**

```bash
git add dist/ 2>/dev/null || true
git add -A
git commit -m "chore: verify build output for better-auth-asaas"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by |
|---|---|
| Package name `better-auth-asaas` | Task 1 |
| Standalone npm package with tsup build | Task 1 |
| ESM + CJS dual output | Task 1 |
| Peer deps: `better-auth`, `zod` | Task 1 |
| `./client` export | Tasks 1 + 7 |
| `asaasCustomerId` on user table | Task 4 |
| No new tables | Architecture — only user field |
| Auto-create customer on sign-up | Task 4 |
| `getCustomerCreateParams` with `cpfCnpj` | Task 4 |
| `onCustomerCreate` callback | Task 4 |
| PIX charge create endpoint | Task 5 |
| List charges endpoint | Task 5 |
| Get charge endpoint | Task 5 |
| Get PIX QR code endpoint | Task 5 |
| `pixQrCode` + `pixCopiaECola` in create response | Task 5 |
| Webhook endpoint at `/asaas/webhook` | Task 6 |
| Token verification via `asaas-access-token` header | Task 6 |
| `PAYMENT_RECEIVED` → `onPaymentReceived` | Task 6 |
| `PAYMENT_OVERDUE` → `onPaymentOverdue` | Task 6 |
| `PAYMENT_DELETED` → `onPaymentDeleted` | Task 6 |
| User resolved from `asaasCustomerId` in webhook | Task 6 |
| Unrecognized events ignored | Task 6 |
| `APIError` for all error cases | Tasks 4, 5, 6 |
| `asaasClient()` client plugin with type inference | Task 7 |

**Deviation from spec:** Lifecycle hooks (`onPaymentReceived`, etc.) are passed through `AsaasPluginContext` from `charge()` to the `webhooks()` endpoint handler, rather than being called directly in `charge.ts`. This is transparent to users — the config API is identical to the spec.

**Placeholder scan:** None found.

**Type consistency:** `AsaasApiClient`, `AsaasPluginContext`, `ChargeOptions`, `WebhooksOptions` are all defined in `types.ts` in Task 2 and referenced consistently across Tasks 3–8.
