#!/bin/sh

set -eu

export DEBIAN_FRONTEND=noninteractive

if ! command -v ssh >/dev/null 2>&1 || ! command -v script >/dev/null 2>&1 || ! command -v python3 >/dev/null 2>&1; then
  if [ "$(id -u)" -ne 0 ]; then
    echo "ssh, script, and python3 must already be installed when not running as root"
    exit 1
  fi

  apt-get update >/dev/null
  apt-get install -y --no-install-recommends ca-certificates curl unzip python3 make g++ openssh-client util-linux >/dev/null
fi

export BUN_INSTALL=/root/.bun
export PATH="$BUN_INSTALL/bin:$PATH"

if ! command -v bun >/dev/null 2>&1; then
  if [ "$(id -u)" -ne 0 ]; then
    echo "bun must already be installed when not running as root"
    exit 1
  fi

  curl -fsSL https://bun.sh/install | bash >/dev/null
fi

ssh_host=${LCARS_SSH_HOST:-ssh-fixture}
ssh_port=${LCARS_SSH_PORT:-22}
ssh_user=${LCARS_SSH_USER:-lcars}
ssh_key_path=${LCARS_SSH_KEY_PATH:-$VELA_WORKSPACE/tests/fixtures/ssh/id_ed25519}
ssh_known_hosts_path=${LCARS_SSH_KNOWN_HOSTS_PATH:-$VELA_WORKSPACE/tests/fixtures/ssh/known_hosts}

cd "$VELA_WORKSPACE"
chmod 600 "$ssh_key_path"
chmod 644 "$ssh_known_hosts_path"

bun install --frozen-lockfile >/dev/null
bun run build:binary >/dev/null

LCARS_SSH_HOST="$ssh_host" \
LCARS_SSH_PORT="$ssh_port" \
LCARS_SSH_USER="$ssh_user" \
LCARS_SSH_KEY_PATH="$ssh_key_path" \
LCARS_SSH_KNOWN_HOSTS_PATH="$ssh_known_hosts_path" \
LCARS_HTTP_PORT=1702 \
LCARS_DISABLE_TTY_ECHO=1 \
LCARS_SESSION_IDLE_TTL_SECONDS=1800 \
"$VELA_WORKSPACE/dist-bin/dynamic-lcars" > /tmp/dynamic-lcars-binary.log 2>&1 &

binary_pid=$!

cleanup() {
  kill "$binary_pid" >/dev/null 2>&1 || true
  wait "$binary_pid" >/dev/null 2>&1 || true
}

trap cleanup EXIT

for i in $(seq 1 60); do
  if curl -sf http://127.0.0.1:1702/api/health >/dev/null; then
    break
  fi

  if [ "$i" -eq 60 ]; then
    cat /tmp/dynamic-lcars-binary.log
    echo "binary health endpoint never became ready"
    exit 1
  fi

  sleep 1
done

python3 - <<'PY'
import json, os, urllib.request

base = 'http://127.0.0.1:1702'
session = json.loads(urllib.request.urlopen(f'{base}/api/session/bootstrap').read().decode())['sessionId']
shells = json.loads(urllib.request.urlopen(f'{base}/api/shells?sessionId={session}').read().decode())
shell_id = shells['currentShellId']

payload = json.dumps({
    'sessionId': session,
    'shellId': shell_id,
    'command': 'printf BINARY_OK',
}).encode()

request = urllib.request.Request(
    f'{base}/api/shells/exec',
    data=payload,
    headers={'Content-Type': 'application/json'},
)
response = json.loads(urllib.request.urlopen(request, timeout=20).read().decode())

if 'BINARY_OK' not in response.get('output', ''):
    raise SystemExit(f"unexpected shell output: {response}")
PY
