# dynamicLCARS

`dynamicLCARS` is a single-origin remote workstation UI: one web app, one mounted SSH key, one mounted `known_hosts`, and a remote machine that already has `tmux`, `git`, and `gh` installed.

## Usage

The recommended user-facing way to run `dynamicLCARS` is with the published Docker image.

Quick start:

```bash
docker run --rm -p 1701:1701 \
  -e LCARS_SSH_HOST=example-host \
  -e LCARS_SSH_USER=zac \
  -e LCARS_SSH_KEY_PATH=/run/secrets/id_ed25519 \
  -e LCARS_SSH_KNOWN_HOSTS_PATH=/run/secrets/known_hosts \
  -v "$HOME/.ssh/id_ed25519:/run/secrets/id_ed25519:ro" \
  -v "$HOME/.ssh/known_hosts:/run/secrets/known_hosts:ro" \
  harbor.prettybird.zapplebee.online/library/dynamic-lcars:latest
```

Example Compose:

```yaml
services:
  dynamic-lcars:
    image: harbor.prettybird.zapplebee.online/library/dynamic-lcars:latest
    ports:
      - "1701:1701"
    environment:
      LCARS_SSH_HOST: example-host
      LCARS_SSH_USER: zac
      LCARS_SSH_KEY_PATH: /run/secrets/id_ed25519
      LCARS_SSH_KNOWN_HOSTS_PATH: /run/secrets/known_hosts
    volumes:
      - ${HOME}/.ssh/id_ed25519:/run/secrets/id_ed25519:ro
      - ${HOME}/.ssh/known_hosts:/run/secrets/known_hosts:ro
```

Open `http://127.0.0.1:1701` and see `docs/usage.md` for the full usage guide.

## Developer Notes

The rest of this README is aimed at developers and coding agents working on the repo.

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

## Bun Binary

There is now an experimental Bun-native server path for shipping the app without Docker.

Build the binary:

```bash
bun run build:binary
```

This produces `dist-bin/dynamic-lcars`.

Run it directly:

```bash
LCARS_SSH_HOST=example-host \
LCARS_SSH_USER=zac \
LCARS_SSH_KEY_PATH=/absolute/path/to/id_ed25519 \
LCARS_SSH_KNOWN_HOSTS_PATH=/absolute/path/to/known_hosts \
./dist-bin/dynamic-lcars
```

The compiled server still expects the built frontend assets in `dist/` next to the binary.
It also expects the host to provide `ssh` and `script` from `util-linux` so it can allocate interactive shell sessions without Docker.

## Docker image

Build the image locally:

```bash
docker build -t dynamic-lcars .
```

## Notes

- The frontend lives in `src/`.
- The Node/Hono backend lives in `server/`.
- The terminal session is reconnectable per browser tab using `sessionStorage`.
- Idle backend-managed sessions are cleaned up after 30 minutes by default.
- SSH host verification is strict and depends on the mounted `known_hosts` file.
