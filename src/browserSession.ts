export const TERMINAL_SESSION_STORAGE_KEY = "lcars-terminal-session-id";

export function readStoredTerminalSessionId() {
  return window.sessionStorage.getItem(TERMINAL_SESSION_STORAGE_KEY);
}

export function storeTerminalSessionId(sessionId: string) {
  window.sessionStorage.setItem(TERMINAL_SESSION_STORAGE_KEY, sessionId);
}
