# Local GFX

HTML Graphics served on `localhost` by default. Primarily developed to support
the [Y'morzin Cup Final](https://ymorzincupfinal.com)'s first ever live
broadcast.

Hoping to make it more general in the future.

## Development

```sh
pnpm install
pnpm dev
```

## Production

```sh
pnpm build
node .output/server/index.mjs
```
