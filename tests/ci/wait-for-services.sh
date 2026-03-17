#!/bin/sh

set -eu

apk add --no-cache curl openssh-client >/dev/null

chmod 600 "$VELA_WORKSPACE/tests/fixtures/ssh/id_ed25519"
chmod 644 "$VELA_WORKSPACE/tests/fixtures/ssh/known_hosts"

echo "Waiting for ssh-fixture..."
for i in $(seq 1 90); do
  if ssh -i "$VELA_WORKSPACE/tests/fixtures/ssh/id_ed25519" \
    -o BatchMode=yes \
    -o StrictHostKeyChecking=yes \
    -o UserKnownHostsFile="$VELA_WORKSPACE/tests/fixtures/ssh/known_hosts" \
    lcars@ssh-fixture "printf SSH_READY" 2>/dev/null | grep -q SSH_READY; then
    echo "ssh-fixture ready"
    break
  fi

  if [ "$i" -eq 90 ]; then
    echo "ssh-fixture never ready"
    exit 1
  fi

  sleep 2
done

echo "Waiting for dynamic-lcars..."
for i in $(seq 1 120); do
  if curl -sf http://dynamic-lcars:3002/api/health >/dev/null; then
    echo "dynamic-lcars ready"
    break
  fi

  if [ "$i" -eq 120 ]; then
    echo "dynamic-lcars never ready"
    exit 1
  fi

  sleep 2
done
