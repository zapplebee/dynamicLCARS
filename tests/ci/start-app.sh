#!/bin/sh

set -eu

export DEBIAN_FRONTEND=noninteractive
export BUN_INSTALL=/root/.bun
export PATH="$BUN_INSTALL/bin:$PATH"

apt-get update >/dev/null
apt-get install -y --no-install-recommends ca-certificates curl unzip python3 make g++ openssh-client >/dev/null

if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash >/dev/null
fi

cd "$VELA_WORKSPACE"
chmod 600 "$VELA_WORKSPACE/tests/fixtures/ssh/id_ed25519"
chmod 644 "$VELA_WORKSPACE/tests/fixtures/ssh/known_hosts"
bun install --frozen-lockfile
bun run build

exec env \
  NODE_ENV=production \
  LCARS_SSH_HOST=ssh-fixture \
  LCARS_SSH_USER=lcars \
  LCARS_SSH_KEY_PATH="$VELA_WORKSPACE/tests/fixtures/ssh/id_ed25519" \
  LCARS_SSH_KNOWN_HOSTS_PATH="$VELA_WORKSPACE/tests/fixtures/ssh/known_hosts" \
  LCARS_HTTP_PORT=1701 \
  LCARS_DISABLE_TTY_ECHO=1 \
  LCARS_SESSION_IDLE_TTL_SECONDS=1800 \
  node dist-server/index.js
