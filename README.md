# dynamicLCARS

This branch revives the original LCARS experiment as a React app.

The legacy project used PHP to emit SVG fragments and jQuery plugins to animate them. The current app keeps the original LCARS font, palette, corner geometry, and fixed 1245 x 655 composition, but rebuilds the interface with reusable React components and modern CSS layout.

## Run

```bash
bun install
cat > .env.local <<'EOF'
WETTY_SSH_PASS=your-temporary-password
TMUX_SSH_PASS=your-temporary-password
VITE_WETTY_SSH_PASS=your-temporary-password
EOF
bun run dev:wetty
bun run dev:api
bun run dev
```

Then open the forwarded Vite preview on port `5173`. The app proxies the terminal
pane to the local WeTTY Docker service on port `3001`, and proxies tmux control
requests to the Bun bridge on port `3002`.

## Build

```bash
bun run build
```

## Notes

- The React source lives in [`src`](./src).
- The LCARS webfont assets live in [`css/fontface`](./css/fontface) as `lcars.woff` and `lcars.ttf`.
- The embedded terminal uses [WeTTY](https://github.com/butlerx/wetty) in Docker and connects to `zac@192.168.1.238` through the SSH config in `ops/wetty/config`.
- `bun run dev:wetty` and `bun run dev:api` both read credentials from `.env.local` through Bun.
- `bun run dev:api` starts the Bun tmux bridge that lists and switches remote sessions on `nyx`.
- The tmux bridge uses the local `ops/ssh/askpass.sh` helper for temporary password auth, so `sshpass` is no longer required.
- Install `ops/nyx/lcars-view` on `nyx` as `~/.local/bin/lcars-view` and make it executable so WeTTY always attaches to the selected tmux session.
