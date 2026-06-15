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

- Tidy up the CSS on the team dialog, avoid layout shifting when subs get added
- Set activeFormation as undefined in the initialState and then default to the first one in the list
- Look into subs not getting persisted when pressing reset
- Remove free-drag behaviour from formation editor, pin players to pegs/poles and allow them to be swapped
- Allow players and subs to be swapped on the edit team modal 
- Overhaul penalty logic, rework schema to store players. Client side will need a "penalty mode" to easily pick players across both teams who have scored a penalty.