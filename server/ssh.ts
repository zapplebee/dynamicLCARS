import { spawn } from "node:child_process";
import type { RuntimeConfig } from "./config";

const SELECTED_SESSION_FILE = "${HOME}/.lcars-selected-session";

export type SessionSummary = {
  name: string;
  idleSeconds: number;
};

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

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

export async function runRemote(config: RuntimeConfig, command: string) {
  const child = spawn("ssh", buildSshArgs(config, command), {
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk: string) => {
    stderr += chunk;
  });

  const exitCode = await new Promise<number>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });

  if (exitCode !== 0) {
    throw new Error(stderr.trim() || stdout.trim() || "Remote SSH command failed.");
  }

  return stdout;
}

export async function listTmuxSessions(config: RuntimeConfig) {
  const output = await runRemote(config, "tmux list-sessions -F '#{session_name}\t#{session_activity}' 2>/dev/null || true");
  const nowInSeconds = Math.floor(Date.now() / 1000);

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [name, activityRaw] = line.split("\t");
      const activity = Number(activityRaw);

      return {
        name,
        idleSeconds: Number.isFinite(activity) && activity > 0 ? Math.max(0, nowInSeconds - activity) : Number.MAX_SAFE_INTEGER,
      } satisfies SessionSummary;
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function getCurrentSelectedSession(config: RuntimeConfig) {
  const output = await runRemote(config, `cat ${SELECTED_SESSION_FILE} 2>/dev/null || true`);
  const current = output.split("\n")[0]?.trim() ?? "";

  if (!current) {
    return null;
  }

  const sessions = await listTmuxSessions(config);
  return sessions.some((session) => session.name === current) ? current : null;
}

export async function ensureCurrentSelectedSession(config: RuntimeConfig) {
  const current = await getCurrentSelectedSession(config);

  if (current) {
    return current;
  }

  const sessions = await listTmuxSessions(config);
  const fallback = sessions[0]?.name ?? null;

  if (!fallback) {
    return null;
  }

  await setCurrentSelectedSession(config, fallback);
  return fallback;
}

export async function setCurrentSelectedSession(config: RuntimeConfig, session: string) {
  const quotedSession = shellQuote(session);
  const command = [
    `selected=${quotedSession}`,
    `printf '%s\\n' "$selected" > ${SELECTED_SESSION_FILE}`,
  ].join("\n");

  await runRemote(config, command);
}
