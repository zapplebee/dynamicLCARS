# dynamicLCARS

This branch revives the original LCARS experiment as a React app.

The legacy project used PHP to emit SVG fragments and jQuery plugins to animate them. The current app keeps the original LCARS font, palette, corner geometry, and fixed 1245 x 655 composition, but rebuilds the interface with reusable React components and modern CSS layout.

## Run

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```

## Notes

- The React source lives in [`src`](./src).
- The LCARS webfont assets live in [`css/fontface`](./css/fontface) as `lcars.woff` and `lcars.ttf`.
