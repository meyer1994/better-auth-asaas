# AGENTS.md

## Project Structure

```text
.
|-- README.md                         # repo overview
|-- AGENTS.md                         # agent guide
|-- CLAUDE.md                         # empty local guide
|-- package.json                      # workspace scripts
|-- pnpm-workspace.yaml               # pnpm packages
|-- pnpm-lock.yaml                    # locked deps
|-- tsconfig.json                     # shared TS config
|-- .mcp.json                         # MCP servers
|-- .codex/
|   `-- config.toml                   # Codex MCP config
|-- packages/
|   `-- better-auth-asaas/
|       |-- README.md                 # plugin docs
|       |-- package.json              # plugin scripts
|       |-- tsconfig.json             # plugin TS config
|       |-- tsup.config.ts            # build config
|       |-- vitest.config.ts          # test config
|       `-- src/
|           |-- index.ts              # server export
|           |-- server.ts             # plugin setup
|           |-- client.ts             # client plugin
|           |-- asaas.ts              # Asaas API client
|           |-- endpoints.ts          # auth endpoints
|           |-- hooks.ts              # user hooks
|           |-- middleware.ts         # middleware helpers
|           |-- types.ts              # public types
|           |-- webhooks.ts           # webhook dispatch
|           `-- asaas.test.ts         # vitest tests
|-- examples/
|   |-- nuxt/
|   |   |-- README.md                 # Nuxt example docs
|   |   |-- package.json              # Nuxt scripts
|   |   |-- nuxt.config.ts            # Nuxt config
|   |   |-- drizzle.config.ts         # Drizzle config
|   |   |-- eslint.config.mjs         # ESLint config
|   |   |-- tsconfig.json             # Nuxt TS config
|   |   |-- app/                      # Vue app
|   |   |-- public/                   # static files
|   |   `-- server/                   # API, auth, db
|   `-- next/
|       |-- README.md                 # Next example docs
|       |-- package.json              # Next scripts
|       |-- next.config.ts            # Next config
|       |-- drizzle.config.ts         # Drizzle config
|       |-- eslint.config.mjs         # ESLint config
|       |-- postcss.config.mjs        # PostCSS config
|       |-- components.json           # shadcn/ui config
|       |-- tsconfig.json             # Next TS config
|       `-- src/                      # React app
|-- docs/
|   `-- superpowers/                  # planning docs
`-- .github/
    `-- workflows/                    # CI workflows
```

Generated folders such as `node_modules`, `dist`, `.nuxt`, `.next`, and `.output`
are intentionally omitted.


## MCP Servers

Configured in `.mcp.json` and `.codex/config.toml`:

| Server        | Source                            | Use for                             |
| ------------- | --------------------------------- | ----------------------------------- |
| `better-auth` | `https://mcp.better-auth.com/mcp` | Better Auth docs and API details    |
| `asaas`       | `https://docs.asaas.com/mcp`      | Asaas API docs and endpoint details |
| `nuxt`        | `https://nuxt.com/mcp`            | Nuxt docs, deployment, modules      |
| `nuxt-ui`     | `https://ui.nuxt.com/mcp`         | Nuxt UI components and examples     |
| `playwright`  | `pnpx @playwright/mcp@latest`     | Browser checks and UI inspection    |

Prefer these MCP sources over web search for project-specific framework/API docs.

## Commands

Root workspace:

| Command                          | Description             |
| -------------------------------- | ----------------------- |
| `pnpm run dev`                   | Plugin watch build      |
| `pnpm run test`                  | Plugin tests            |
| `pnpm run build`                 | Plugin build            |
| `pnpm run lib <script>`          | Run plugin script       |
| `pnpm run example:nuxt <script>` | Run Nuxt example script |
| `pnpm run example:next <script>` | Run Next example script |
| `pnpm run dev:nuxt`              | Nuxt dev server         |
| `pnpm run dev:next`              | Next dev server         |
| `pnpm run build:nuxt`            | Build plugin + Nuxt     |
| `pnpm run build:next`            | Build plugin + Next     |

Plugin package:

| Command          | Description      |
| ---------------- | ---------------- |
| `pnpm run build` | Build with tsup  |
| `pnpm run dev`   | Watch build      |
| `pnpm run clean` | Remove artifacts |
| `pnpm run test`  | Run vitest       |

Nuxt example:

| Command                  | Description          |
| ------------------------ | -------------------- |
| `pnpm run dev`           | Start Nuxt dev       |
| `pnpm run build`         | Production build     |
| `pnpm run preview`       | Preview build        |
| `pnpm run clean`         | Remove artifacts     |
| `pnpm run lint`          | Run ESLint           |
| `pnpm run typecheck`     | Nuxt typecheck       |
| `pnpm run auth:generate` | Generate auth schema |
| `pnpm run db:push`       | Push DB schema       |
| `pnpm run db:generate`   | Generate migrations  |
| `pnpm run db:migrate`    | Run migrations       |

Next example:

| Command                  | Description          |
| ------------------------ | -------------------- |
| `pnpm run dev`           | Start Next dev       |
| `pnpm run build`         | Production build     |
| `pnpm run start`         | Start production app |
| `pnpm run lint`          | Run ESLint           |
| `pnpm run clean`         | Remove artifacts     |
| `pnpm run typecheck`     | Run TypeScript       |
| `pnpm run auth:generate` | Generate auth schema |
| `pnpm run db:push`       | Push DB schema       |
| `pnpm run db:generate`   | Generate migrations  |
| `pnpm run db:migrate`    | Run migrations       |
