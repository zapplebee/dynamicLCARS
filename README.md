# dynamicLCARS

This branch revives the original LCARS experiment as a React app.

The legacy project used PHP to emit SVG fragments and jQuery plugins to animate them. The new app keeps the original LCARS font, palette, corner geometry, and fixed 1245 x 655 composition, but rebuilds the interface with reusable React components and modern CSS layout.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- `index.php` and `svg.php` are still present as the original implementation for reference.
- The React source lives in [`src`](./src).
- The LCARS webfont is reused from [`css/fontface`](./css/fontface).
