#!/bin/sh

set -eu

apk add --no-cache bash openssh-server >/dev/null

adduser -D -s /bin/bash lcars
passwd -d lcars >/dev/null 2>&1 || true
mkdir -p /home/lcars/.ssh /run/sshd /etc/ssh

cp "$VELA_WORKSPACE/tests/fixtures/ssh/id_ed25519.pub" /home/lcars/.ssh/authorized_keys
chmod 700 /home/lcars/.ssh
chmod 600 /home/lcars/.ssh/authorized_keys
chown -R lcars:lcars /home/lcars/.ssh

cp "$VELA_WORKSPACE/tests/fixtures/ssh/ssh_host_ed25519_key" /etc/ssh/ssh_host_ed25519_key
cp "$VELA_WORKSPACE/tests/fixtures/ssh/ssh_host_ed25519_key.pub" /etc/ssh/ssh_host_ed25519_key.pub
chmod 600 /etc/ssh/ssh_host_ed25519_key
chmod 644 /etc/ssh/ssh_host_ed25519_key.pub

exec /usr/sbin/sshd -D -e -f "$VELA_WORKSPACE/tests/fixtures/ssh/sshd_config"
