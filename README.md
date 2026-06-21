# Local GFX

HTML Graphics with the control, server and renderer in a single app. Primarily developed to support
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

TODO:

- Remove x/y coordinates from player object and rely on percentages to give
you positioning. This will ensure that subbing on players from the data input
view doesn't rely on positions calculated from the team formation editor.
- Prevent duplicate numbers from being entered on the data input view.