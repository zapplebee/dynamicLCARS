import type { RuntimeConfig } from "./config";

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

export function buildSshArgs(config: RuntimeConfig, remoteCommand?: string) {
  const args = [
    "-i",
    config.sshKeyPath,
    "-p",
    String(config.sshPort),
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

export function buildSshCommand(config: RuntimeConfig, remoteCommand?: string) {
  return ["ssh", ...buildSshArgs(config, remoteCommand)].map(shellQuote).join(" ");
}
