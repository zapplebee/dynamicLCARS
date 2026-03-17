# Usage

The recommended way to run `dynamicLCARS` is with the published Docker image.

You need:

- a reachable SSH host
- an SSH username on that host
- a private key that can log into that host
- a `known_hosts` file containing that host key

The app exposes one web interface on port `1701` and connects to the remote machine over SSH using the mounted key.

## Docker run

```bash
docker run --rm -p 1701:1701 \
  -e LCARS_SSH_HOST=example-host \
  -e LCARS_SSH_USER=zac \
  -e LCARS_SSH_KEY_PATH=/run/secrets/id_ed25519 \
  -e LCARS_SSH_KNOWN_HOSTS_PATH=/run/secrets/known_hosts \
  -e LCARS_SESSION_IDLE_TTL_SECONDS=1800 \
  -v "$HOME/.ssh/id_ed25519:/run/secrets/id_ed25519:ro" \
  -v "$HOME/.ssh/known_hosts:/run/secrets/known_hosts:ro" \
  harbor.prettybird.zapplebee.online/library/dynamic-lcars:latest
```

Then open `http://127.0.0.1:1701`.

## Docker Compose

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
      LCARS_SESSION_IDLE_TTL_SECONDS: "1800"
    volumes:
      - ${HOME}/.ssh/id_ed25519:/run/secrets/id_ed25519:ro
      - ${HOME}/.ssh/known_hosts:/run/secrets/known_hosts:ro
```

## Runtime environment

- `LCARS_SSH_HOST` - required SSH hostname or address
- `LCARS_SSH_USER` - required SSH username
- `LCARS_SSH_KEY_PATH` - required in-container private key path
- `LCARS_SSH_KNOWN_HOSTS_PATH` - required in-container `known_hosts` path
- `LCARS_HTTP_PORT` - optional, defaults to `1701`
- `LCARS_SESSION_IDLE_TTL_SECONDS` - optional, defaults to `1800`

## Behavior notes

- SSH host verification is strict
- mounted key and `known_hosts` should be read-only
- each browser tab keeps its own reconnectable shell session set
- idle backend-managed sessions are cleaned up after 30 minutes by default
