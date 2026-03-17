import process from "node:process";

const DEFAULT_HTTP_PORT = 3002;
const DEFAULT_IDLE_TTL_SECONDS = 1800;

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable ${name}.`);
  }

  return value;
}

function readNumberEnv(name: string, fallback: number) {
  const raw = process.env[name]?.trim();

  if (!raw) {
    return fallback;
  }

  const value = Number(raw);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive number.`);
  }

  return value;
}

export type RuntimeConfig = {
  httpPort: number;
  sshHost: string;
  sshUser: string;
  sshKeyPath: string;
  sshKnownHostsPath: string;
  sessionIdleTtlMs: number;
};

export function loadConfig(): RuntimeConfig {
  return {
    httpPort: readNumberEnv("LCARS_HTTP_PORT", DEFAULT_HTTP_PORT),
    sshHost: readRequiredEnv("LCARS_SSH_HOST"),
    sshUser: readRequiredEnv("LCARS_SSH_USER"),
    sshKeyPath: readRequiredEnv("LCARS_SSH_KEY_PATH"),
    sshKnownHostsPath: readRequiredEnv("LCARS_SSH_KNOWN_HOSTS_PATH"),
    sessionIdleTtlMs: readNumberEnv("LCARS_SESSION_IDLE_TTL_SECONDS", DEFAULT_IDLE_TTL_SECONDS) * 1000,
  };
}
