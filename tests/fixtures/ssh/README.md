# CI SSH fixtures

These files are CI-only fixtures for the Vela end-to-end pipeline.

- `id_ed25519` and `id_ed25519.pub` are the client keypair used by `dynamicLCARS` to log into the ephemeral SSH fixture.
- `ssh_host_ed25519_key` and `ssh_host_ed25519_key.pub` are the fixed host keys used by the SSH fixture service.
- `known_hosts` pins the `ssh-fixture` host key so the app can run with strict host checking enabled.
- `sshd_config` keeps the ephemeral test server locked to key-based auth for the `lcars` fixture user.

Do not reuse these keys outside CI.
