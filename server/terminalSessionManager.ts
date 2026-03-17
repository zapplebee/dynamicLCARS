import crypto from "node:crypto";
import process from "node:process";
import pty, { type IPty } from "node-pty";
import type { RuntimeConfig } from "./config";
import { buildSshArgs } from "./ssh";

const MAX_BUFFER_LENGTH = 64_000;

type TerminalSocket = {
  readyState: number;
  send: (data: string) => void;
  close: (code?: number, reason?: string) => void;
};

type ManagedTerminalConnection = {
  sessionName: string;
  ptyProcess: IPty | null;
  socket: TerminalSocket | null;
  buffer: string;
  lastSeenAt: number;
};

type BrowserTerminalSession = {
  id: string;
  selectedSession: string | null;
  lastSeenAt: number;
  connections: Map<string, ManagedTerminalConnection>;
};

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `"'"'`)}'`;
}

function buildRemoteCommand(sessionName: string) {
  const script = [
    `LCARS_SESSION=${shellQuote(sessionName)}`,
    'exec tmux attach-session -t "$LCARS_SESSION" || exec ${SHELL:-/bin/bash} -l',
  ].join("; ");

  return `sh -lc ${shellQuote(script)}`;
}

export class TerminalSessionManager {
  private readonly sessions = new Map<string, BrowserTerminalSession>();

  constructor(private readonly config: RuntimeConfig) {}

  createSessionId() {
    return crypto.randomUUID();
  }

  getSelectedSession(sessionId: string) {
    return this.sessions.get(sessionId)?.selectedSession ?? null;
  }

  touchSession(sessionId: string) {
    const session = this.sessions.get(sessionId);

    if (session) {
      session.lastSeenAt = Date.now();
    }
  }

  setSelectedSession(sessionId: string, selectedSession: string | null) {
    const session = this.getOrCreateBrowserSession(sessionId, selectedSession);
    session.selectedSession = selectedSession;
    session.lastSeenAt = Date.now();
    return session.selectedSession;
  }

  syncSessionPool(sessionId: string, sessionNames: string[], selectedSession: string | null) {
    const browserSession = this.getOrCreateBrowserSession(sessionId, selectedSession);
    const nextNames = new Set(sessionNames);

    browserSession.selectedSession = selectedSession ?? browserSession.selectedSession;
    browserSession.lastSeenAt = Date.now();

    for (const sessionName of sessionNames) {
      this.ensureConnection(browserSession, sessionName);
    }

    for (const [sessionName, connection] of browserSession.connections) {
      if (nextNames.has(sessionName)) {
        continue;
      }

      connection.socket?.close(1012, "tmux session removed");
      connection.ptyProcess?.kill();
      browserSession.connections.delete(sessionName);
    }

    return browserSession;
  }

  attachSocket(sessionId: string, sessionName: string, socket: TerminalSocket) {
    const browserSession = this.getOrCreateBrowserSession(sessionId, sessionName);
    const connection = this.ensureConnection(browserSession, sessionName);

    if (connection.socket && connection.socket !== socket && connection.socket.readyState === 1) {
      connection.socket.close(1012, "replaced by newer terminal client");
    }

    browserSession.selectedSession = sessionName;
    browserSession.lastSeenAt = Date.now();
    connection.socket = socket;
    connection.lastSeenAt = Date.now();

    if (connection.buffer) {
      socket.send(JSON.stringify({ type: "output", data: connection.buffer }));
    }

    return connection;
  }

  detachSocket(sessionId: string, sessionName: string, socket: TerminalSocket) {
    const browserSession = this.sessions.get(sessionId);
    const connection = browserSession?.connections.get(sessionName);

    if (!browserSession || !connection || connection.socket !== socket) {
      return;
    }

    connection.socket = null;
    connection.lastSeenAt = Date.now();
    browserSession.lastSeenAt = Date.now();
  }

  writeInput(sessionId: string, sessionName: string, data: string) {
    const browserSession = this.sessions.get(sessionId);
    const connection = browserSession?.connections.get(sessionName);

    connection?.ptyProcess?.write(data);

    if (browserSession && connection) {
      browserSession.lastSeenAt = Date.now();
      connection.lastSeenAt = Date.now();
    }
  }

  resize(sessionId: string, sessionName: string, cols: number, rows: number) {
    const browserSession = this.sessions.get(sessionId);
    const connection = browserSession?.connections.get(sessionName);

    if (!browserSession || !connection?.ptyProcess) {
      return;
    }

    connection.ptyProcess.resize(cols, rows);
    connection.lastSeenAt = Date.now();
    browserSession.lastSeenAt = Date.now();
  }

  cleanupExpiredSessions() {
    const now = Date.now();

    for (const [sessionId, browserSession] of this.sessions) {
      if (now - browserSession.lastSeenAt < this.config.sessionIdleTtlMs) {
        continue;
      }

      for (const connection of browserSession.connections.values()) {
        connection.socket?.close(1001, "idle timeout");
        connection.ptyProcess?.kill();
      }

      this.sessions.delete(sessionId);
    }
  }

  private getOrCreateBrowserSession(sessionId: string, selectedSession: string | null) {
    const existing = this.sessions.get(sessionId);

    if (existing) {
      if (selectedSession) {
        existing.selectedSession = selectedSession;
      }

      return existing;
    }

    const nextSession: BrowserTerminalSession = {
      id: sessionId,
      selectedSession,
      lastSeenAt: Date.now(),
      connections: new Map(),
    };

    this.sessions.set(sessionId, nextSession);
    return nextSession;
  }

  private ensureConnection(browserSession: BrowserTerminalSession, sessionName: string) {
    const existing = browserSession.connections.get(sessionName);

    if (existing?.ptyProcess) {
      return existing;
    }

    const connection: ManagedTerminalConnection = existing ?? {
      sessionName,
      ptyProcess: null,
      socket: null,
      buffer: "",
      lastSeenAt: Date.now(),
    };

    connection.sessionName = sessionName;
    connection.lastSeenAt = Date.now();

    const ptyProcess = pty.spawn("ssh", ["-tt", ...buildSshArgs(this.config, buildRemoteCommand(sessionName))], {
      name: "xterm-256color",
      cols: 120,
      rows: 40,
      cwd: process.cwd(),
      env: process.env,
    });

    connection.ptyProcess = ptyProcess;

    ptyProcess.onData((chunk) => {
      connection.lastSeenAt = Date.now();
      browserSession.lastSeenAt = Date.now();
      connection.buffer = `${connection.buffer}${chunk}`.slice(-MAX_BUFFER_LENGTH);

      if (connection.socket && connection.socket.readyState === 1) {
        connection.socket.send(JSON.stringify({ type: "output", data: chunk }));
      }
    });

    ptyProcess.onExit(() => {
      connection.ptyProcess = null;
      connection.socket = null;
    });

    browserSession.connections.set(sessionName, connection);
    return connection;
  }
}
