import type { RuntimeConfig } from "./config";

export function buildSshArgs(config: RuntimeConfig, remoteCommand?: string) {
  const args = [
    "-i",
    config.sshKeyPath,
    "-o",
    "IdentitiesOnly=yes",
    "-o",
    "StrictHostKeyChecking=yes",
    "-o",
    `UserKnownHostsFile=${config.sshKnownHostsPath}`,
    `${config.sshUser}@${config.sshHost}`,
  ];

  if (remoteCommand) {
    args.push(remoteCommand);
  }

  return args;
}
