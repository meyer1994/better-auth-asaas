# better-auth-asaas

[Asaas](https://www.asaas.com/) payments plugin for [Better
Auth](https://www.better-auth.com/): PIX/Boleto/Card charges, auto-create
customers on sign-up, and webhook dispatch — no extra tables.

## Layout

```
packages/better-auth-asaas   # the plugin (server + client)
examples/nuxt                # Nuxt 4 demo
examples/next                # Next 15 demo (WIP)
```

## Commands

| Command          | What it does                       |
| ---------------- | ---------------------------------- |
| `pnpm build`     | Build the plugin                   |
| `pnpm test`      | Run vitest                         |
| `pnpm dev:nuxt`  | Run plugin + Nuxt example in watch |
| `pnpm dev:next`  | Run plugin + Next example in watch |

See [`examples/nuxt/README.md`](./examples/nuxt/README.md) and
[`examples/next/README.md`](./examples/next/README.md) for the demo apps.
