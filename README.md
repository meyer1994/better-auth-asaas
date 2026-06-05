# better-auth-asaas

[Asaas](https://www.asaas.com/) payments plugin for [Better
Auth](https://www.better-auth.com/): PIX charges, subscriptions, auto-create
customers on sign-up, and webhook dispatch - no extra tables.

## Layout

```
packages/better-auth-asaas   # plugin (server + client)
examples/nuxt                # Nuxt 4 demo
examples/next                # Next 15 demo
```

## Commands

| Command            | What it does         |
| ------------------ | -------------------- |
| `pnpm run build`   | Build the plugin     |
| `pnpm run test`    | Run vitest           |
| `pnpm run dev`     | Plugin watch build   |
| `pnpm run dev:nuxt` | Run the Nuxt example |
| `pnpm run dev:next` | Run the Next example |

See [`examples/nuxt/README.md`](./examples/nuxt/README.md) and
[`examples/next/README.md`](./examples/next/README.md) for the demo apps.
