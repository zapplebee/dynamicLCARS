export const TERMINAL_SESSION_STORAGE_KEY = "lcars-terminal-session-id";

type BootstrapResponse = {
  sessionId: string;
};

export function readStoredTerminalSessionId() {
  return window.sessionStorage.getItem(TERMINAL_SESSION_STORAGE_KEY);
}

export function storeTerminalSessionId(sessionId: string) {
  window.sessionStorage.setItem(TERMINAL_SESSION_STORAGE_KEY, sessionId);
}

export async function ensureTerminalSessionId() {
  const existingSessionId = readStoredTerminalSessionId();
  const url = existingSessionId
    ? `/api/session/bootstrap?sessionId=${encodeURIComponent(existingSessionId)}`
    : "/api/session/bootstrap";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to bootstrap terminal session.");
  }

  const data = (await response.json()) as BootstrapResponse;
  storeTerminalSessionId(data.sessionId);
  return data.sessionId;
}
