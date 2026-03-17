# dynamicLCARS

`dynamicLCARS` is a single-origin remote workstation UI: one web app, one mounted SSH key, one mounted `known_hosts`, and a remote machine that already has `tmux`, `git`, and `gh` installed.

## Runtime contract

The server expects these environment variables at runtime:

- `LCARS_SSH_HOST`
- `LCARS_SSH_USER`
- `LCARS_SSH_KEY_PATH`
- `LCARS_SSH_KNOWN_HOSTS_PATH`
- `LCARS_HTTP_PORT` (optional, defaults to `1701`)
- `LCARS_SESSION_IDLE_TTL_SECONDS` (optional, defaults to `1800`)

The mounted private key and `known_hosts` file should be read-only.

## Local development

Install dependencies with Bun:

```bash
bun install
```

Run the frontend dev server:

```bash
bun run dev
```

Run the backend server in a second terminal:

```bash
export LCARS_SSH_HOST=example-host
export LCARS_SSH_USER=zac
export LCARS_SSH_KEY_PATH=/absolute/path/to/id_ed25519
export LCARS_SSH_KNOWN_HOSTS_PATH=/absolute/path/to/known_hosts
bun run dev:server
```

Open `http://127.0.0.1:5173`. Vite proxies `/api/*` and `/terminal/*` to the Node/Hono backend on port `1701`.

## Build

```bash
bun run build
```

This produces:

- frontend assets in `dist/`
- bundled Node server in `dist-server/`

## Docker image

Build the image:

```bash
docker build -t dynamic-lcars .
```

Run it with a mounted private key and mounted `known_hosts`:

```bash
docker run --rm -p 1701:1701 \
  -e LCARS_SSH_HOST=example-host \
  -e LCARS_SSH_USER=zac \
  -e LCARS_SSH_KEY_PATH=/run/secrets/id_ed25519 \
  -e LCARS_SSH_KNOWN_HOSTS_PATH=/run/secrets/known_hosts \
  -e LCARS_SESSION_IDLE_TTL_SECONDS=1800 \
  -v "$HOME/.ssh/id_ed25519:/run/secrets/id_ed25519:ro" \
  -v "$HOME/.ssh/known_hosts:/run/secrets/known_hosts:ro" \
  dynamic-lcars
```

Then open `http://127.0.0.1:1701`.

## Notes

- The frontend lives in `src/`.
- The Node/Hono backend lives in `server/`.
- The terminal session is reconnectable per browser tab using `sessionStorage`.
- Idle backend-managed sessions are cleaned up after 30 minutes by default.
- SSH host verification is strict and depends on the mounted `known_hosts` file.
