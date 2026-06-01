# Next example

Next 15 + shadcn/ui demo of `better-auth-asaas`. Port of the Nuxt example —
scaffold (db, drizzle, env, Tailwind) is in place; pages are WIP.

## Setup

```bash
pnpm install
pnpm build                # build the plugin first
cd examples/next
cp .env.example .env      # fill in values
pnpm db:push              # create SQLite schema
pnpm dev                  # http://localhost:3000
```

## Pages

| Route       | Description                                                     |
| ----------- | --------------------------------------------------------------- |
| `/login`    | Email/password sign-in. *(WIP)*                                 |
| `/register` | Sign-up (name, CPF/CNPJ, email, password) — creates Asaas customer. *(WIP)* |
| `/payments` | Create charges, list payments, view QR code. *(WIP)*            |

## Commands

| Script           | Description                |
| ---------------- | -------------------------- |
| `pnpm dev`       | Start dev server           |
| `pnpm build`     | Production build           |
| `pnpm start`     | Run the built app          |
| `pnpm typecheck` | `tsc --noEmit`             |
| `pnpm db:push`   | Apply schema (drizzle-kit) |

## Env

| Variable                     | Default / Notes                          |
| ---------------------------- | ---------------------------------------- |
| `ASAAS_API_KEY`              | Asaas sandbox API key.                   |
| `ASAAS_SANDBOX`              | `true` to use the sandbox URL.           |
| `ASAAS_WEBHOOK_ACCESS_TOKEN` | Shared secret; matches Asaas dashboard.  |
| `BETTER_AUTH_SECRET`         | Random 32-char string.                   |
| `BETTER_AUTH_URL`            | `http://localhost:3000` for local dev.   |
