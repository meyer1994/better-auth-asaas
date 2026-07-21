# AGENTS.md

## Project Structure

```text
.
|-- README.md                         # plugin docs + repo overview
|-- AGENTS.md                         # agent guide
|-- CLAUDE.md                         # empty local guide
|-- package.json                      # publishable better-auth-asaas package
|-- pnpm-workspace.yaml               # pnpm packages (root + examples)
|-- pnpm-lock.yaml                    # locked deps
|-- tsconfig.json                     # plugin TS config
|-- tsup.config.ts                    # build config
|-- vitest.config.ts                  # test config
|-- .mcp.json                         # MCP servers
|-- .claude/                          # ignored local Claude settings
|-- .codex/
|   `-- config.toml                   # Codex MCP config
|-- src/
|   |-- index.ts                      # server export
|   |-- server.ts                     # plugin setup
|   |-- client.ts                     # client plugin
|   |-- asaas.ts                      # Asaas API client
|   |-- endpoints.ts                  # auth endpoints
|   |-- hooks.ts                      # user hooks
|   |-- middleware.ts                 # middleware helpers
|   |-- types.ts                      # public types
|   |-- webhooks.ts                   # webhook dispatch
|   |-- asaas.test.ts                 # Asaas client tests
|   |-- endpoints.test.ts             # endpoint tests
|   |-- hooks.test.ts                 # hook tests
|   `-- middleware.test.ts            # middleware tests
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
|   `-- superpowers/                  # ignored planning docs
`-- .github/
    |-- dependabot.yml                # dependency updates
    `-- workflows/                    # CI workflows
```

Ignored/generated folders and files such as `node_modules`, `.pnpm-store`, `dist`,
`.nuxt`, `.next`, `.output`, `.playwright-mcp`, `.claude`, `docs`, local
`.env` files, SQLite databases, and TypeScript build info are intentionally omitted
from the tracked project shape. Note that `docs/superpowers` files can exist locally
for planning, but `docs` is ignored by `.gitignore`.

## Finding Files And Text

Prefer `rg` and `rg --files` for normal code searches because they are fast and
respect ignore files by default. Use the standard shell tools below when `rg` is
unavailable, when you need POSIX-style behavior, or when combining file discovery
with content filters.

| Command                                                                    | Use for                                                         |
| -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `find . -name "*.ts"`                                                      | Find files by name or extension.                                |
| `find . -type f -path "*/src/*"`                                           | Find files under matching paths.                                |
| `grep -rin "pattern" src`                                                 | Recursive, case-insensitive text search with line numbers.      |
| `find src -type f -name "*.ts" -print0 \| xargs -0 grep -n "pattern"`     | Search only files selected by `find`.                           |
| `grep -rin "payment" . \| grep "asaasCustomerId"`                          | Narrow a broad grep result with a second grep.                  |
| `tree -a -I "node_modules\|dist\|.nuxt\|.next\|.output\|.git"`             | Quickly inspect directory shape while hiding generated folders. |

Keep searches scoped to relevant directories when possible. Avoid broad searches
through generated or ignored folders unless the task specifically needs them.

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

Root package (plugin) — run from repo root:

| Command             | Description      |
| ------------------- | ---------------- |
| `pnpm run build`    | Build with tsup  |
| `pnpm run dev`      | Watch build      |
| `pnpm run clean`    | Remove artifacts |
| `pnpm run test`     | Run vitest       |
| `pnpm run typecheck`| Run TypeScript   |

Examples — `cd` into the example, or use a filter from the root:

| Command                                                 | Description               |
| ------------------------------------------------------- | ------------------------- |
| `pnpm --filter better-auth-asaas-example-nuxt <script>` | Run a Nuxt example script |
| `pnpm --filter better-auth-asaas-example-next <script>` | Run a Next example script |

Nuxt example (`examples/nuxt` or filter above):

| Command                                                      | Description          |
| ------------------------------------------------------------ | -------------------- |
| `pnpm --filter better-auth-asaas-example-nuxt dev`           | Start Nuxt dev       |
| `pnpm --filter better-auth-asaas-example-nuxt build`         | Production build     |
| `pnpm --filter better-auth-asaas-example-nuxt preview`       | Preview build        |
| `pnpm --filter better-auth-asaas-example-nuxt clean`         | Remove artifacts     |
| `pnpm --filter better-auth-asaas-example-nuxt lint`          | Run ESLint           |
| `pnpm --filter better-auth-asaas-example-nuxt typecheck`     | Nuxt typecheck       |
| `pnpm --filter better-auth-asaas-example-nuxt auth:generate` | Generate auth schema |
| `pnpm --filter better-auth-asaas-example-nuxt db:push`       | Push DB schema       |
| `pnpm --filter better-auth-asaas-example-nuxt db:generate`   | Generate migrations  |
| `pnpm --filter better-auth-asaas-example-nuxt db:migrate`    | Run migrations       |

Next example (`examples/next` or filter above):

| Command                                                      | Description          |
| ------------------------------------------------------------ | -------------------- |
| `pnpm --filter better-auth-asaas-example-next dev`           | Start Next dev       |
| `pnpm --filter better-auth-asaas-example-next build`         | Production build     |
| `pnpm --filter better-auth-asaas-example-next start`         | Start production app |
| `pnpm --filter better-auth-asaas-example-next lint`          | Run ESLint           |
| `pnpm --filter better-auth-asaas-example-next clean`         | Remove artifacts     |
| `pnpm --filter better-auth-asaas-example-next typecheck`     | Run TypeScript       |
| `pnpm --filter better-auth-asaas-example-next auth:generate` | Generate auth schema |
| `pnpm --filter better-auth-asaas-example-next db:push`       | Push DB schema       |
| `pnpm --filter better-auth-asaas-example-next db:generate`   | Generate migrations  |
| `pnpm --filter better-auth-asaas-example-next db:migrate`    | Run migrations       |
