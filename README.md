# better-auth-asaas

[Asaas](https://www.asaas.com/) payments plugin for [Better
Auth](https://www.better-auth.com/): PIX charges, auto-create customers on
sign-up, and webhook dispatch — no extra tables.

## Layout

```
packages/better-auth-asaas   # the plugin (server + client)
examples/nuxt                # Nuxt 4 demo app using all features
```

## Quick start

```bash
pnpm install
pnpm build              # build the plugin
pnpm example:nuxt dev   # run the Nuxt example
```

## Commands (root)

| Command                   | What it does                                    |
| ------------------------- | ----------------------------------------------- |
| `pnpm build`              | Build the plugin (`packages/better-auth-asaas`) |
| `pnpm lib <cmd>`          | Run a script in the plugin package              |
| `pnpm example:nuxt <cmd>` | Run a script in the Nuxt example                |

See
[`packages/better-auth-asaas/README.md`](./packages/better-auth-asaas/README.md)
for plugin usage and [`examples/nuxt/README.md`](./examples/nuxt/README.md) for
the demo app.
