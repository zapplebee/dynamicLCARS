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

export type ShellSummary = {
  id: string;
  label: string;
};

type ManagedShellConnection = {
  shellId: string;
  label: string;
  ptyProcess: IPty | null;
  socket: TerminalSocket | null;
  buffer: string;
  lastSeenAt: number;
  execRequests: Array<{
    marker: string;
    resolve: (output: string) => void;
    reject: (error: Error) => void;
    timeoutId: ReturnType<typeof setTimeout>;
  }>;
};

type BrowserTerminalSession = {
  id: string;
  selectedShellId: string | null;
  shellOrder: string[];
  connections: Map<string, ManagedShellConnection>;
  lastSeenAt: number;
  nextShellNumber: number;
};

function buildRemoteCommand() {
  return "sh -lc 'exec ${SHELL:-/bin/bash} -l'";
}

export class TerminalSessionManager {
  private readonly sessions = new Map<string, BrowserTerminalSession>();

  constructor(private readonly config: RuntimeConfig) {}

  createSessionId() {
    return crypto.randomUUID();
  }

  ensureSession(sessionId: string) {
    const session = this.getOrCreateBrowserSession(sessionId);

    if (session.shellOrder.length === 0) {
      this.createShell(sessionId);
    }

    session.lastSeenAt = Date.now();
    return session;
  }

  listShells(sessionId: string) {
    const session = this.ensureSession(sessionId);
    return session.shellOrder
      .map((shellId) => session.connections.get(shellId))
      .filter((shell): shell is ManagedShellConnection => Boolean(shell))
      .map((shell) => ({ id: shell.shellId, label: shell.label }));
  }

  getSelectedShellId(sessionId: string) {
    return this.ensureSession(sessionId).selectedShellId;
  }

  createShell(sessionId: string) {
    const session = this.getOrCreateBrowserSession(sessionId);
    const shellId = crypto.randomUUID();
    const label = `SHELL ${session.nextShellNumber}`;

    const connection: ManagedShellConnection = {
      shellId,
      label,
      ptyProcess: null,
      socket: null,
      buffer: "",
      lastSeenAt: Date.now(),
      execRequests: [],
    };

    session.nextShellNumber += 1;
    session.shellOrder.push(shellId);
    session.connections.set(shellId, connection);

    if (!session.selectedShellId) {
      session.selectedShellId = shellId;
    }

    session.lastSeenAt = Date.now();
    return { id: shellId, label } satisfies ShellSummary;
  }

  selectShell(sessionId: string, shellId: string) {
    const session = this.ensureSession(sessionId);

    if (!session.connections.has(shellId)) {
      return null;
    }

    session.selectedShellId = shellId;
    session.lastSeenAt = Date.now();
    const shell = session.connections.get(shellId)!;
    return { id: shell.shellId, label: shell.label } satisfies ShellSummary;
  }

  attachSocket(sessionId: string, shellId: string, socket: TerminalSocket) {
    const session = this.ensureSession(sessionId);
    const connection = this.ensureConnection(session, shellId);

    if (!connection) {
      return null;
    }

    if (connection.socket && connection.socket !== socket && connection.socket.readyState === 1) {
      connection.socket.close(1012, "replaced by newer terminal client");
    }

    session.selectedShellId = shellId;
    session.lastSeenAt = Date.now();
    connection.socket = socket;
    connection.lastSeenAt = Date.now();

    if (connection.buffer) {
      socket.send(JSON.stringify({ type: "output", data: connection.buffer }));
    }

    return connection;
  }

  detachSocket(sessionId: string, shellId: string, socket: TerminalSocket) {
    const session = this.sessions.get(sessionId);
    const connection = session?.connections.get(shellId);

    if (!session || !connection || connection.socket !== socket) {
      return;
    }

    connection.socket = null;
    connection.lastSeenAt = Date.now();
    session.lastSeenAt = Date.now();
  }

  writeInput(sessionId: string, shellId: string, data: string) {
    const session = this.sessions.get(sessionId);
    const connection = session?.connections.get(shellId);

    connection?.ptyProcess?.write(data);

    if (session && connection) {
      session.lastSeenAt = Date.now();
      connection.lastSeenAt = Date.now();
    }
  }

  async execInShell(sessionId: string, shellId: string, command: string) {
    const session = this.ensureSession(sessionId);
    const connection = this.ensureConnection(session, shellId);

    if (!connection?.ptyProcess) {
      throw new Error("Shell is unavailable.");
    }

    const marker = `__LCARS_DONE_${crypto.randomUUID()}__`;

    return await new Promise<string>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        connection.execRequests = connection.execRequests.filter((request) => request.marker !== marker);
        reject(new Error("Timed out waiting for shell command output."));
      }, 15000);

      connection.execRequests.push({ marker, resolve, reject, timeoutId });
      connection.ptyProcess?.write(`${command}; printf '${marker}:%s\n' "$?"\n`);
    });
  }

  resize(sessionId: string, shellId: string, cols: number, rows: number) {
    const session = this.sessions.get(sessionId);
    const connection = session?.connections.get(shellId);

    if (!session || !connection?.ptyProcess) {
      return;
    }

    connection.ptyProcess.resize(cols, rows);
    connection.lastSeenAt = Date.now();
    session.lastSeenAt = Date.now();
  }

  touchSession(sessionId: string) {
    const session = this.sessions.get(sessionId);

    if (session) {
      session.lastSeenAt = Date.now();
    }
  }

  cleanupExpiredSessions() {
    const now = Date.now();

    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastSeenAt < this.config.sessionIdleTtlMs) {
        continue;
      }

      for (const connection of session.connections.values()) {
        connection.socket?.close(1001, "idle timeout");
        connection.ptyProcess?.kill();
      }

      this.sessions.delete(sessionId);
    }
  }

  private getOrCreateBrowserSession(sessionId: string) {
    const existing = this.sessions.get(sessionId);

    if (existing) {
      return existing;
    }

    const session: BrowserTerminalSession = {
      id: sessionId,
      selectedShellId: null,
      shellOrder: [],
      connections: new Map(),
      lastSeenAt: Date.now(),
      nextShellNumber: 1,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  private ensureConnection(session: BrowserTerminalSession, shellId: string) {
    const connection = session.connections.get(shellId);

    if (!connection) {
      return null;
    }

    if (connection.ptyProcess) {
      return connection;
    }

    const ptyProcess = pty.spawn("ssh", ["-tt", ...buildSshArgs(this.config, buildRemoteCommand())], {
      name: "xterm-256color",
      cols: 120,
      rows: 40,
      cwd: process.cwd(),
      env: process.env,
    });

    connection.ptyProcess = ptyProcess;

    ptyProcess.onData((chunk) => {
      connection.lastSeenAt = Date.now();
      session.lastSeenAt = Date.now();
      connection.buffer = `${connection.buffer}${chunk}`.slice(-MAX_BUFFER_LENGTH);
      this.resolveExecRequests(connection);

      if (connection.socket && connection.socket.readyState === 1) {
        connection.socket.send(JSON.stringify({ type: "output", data: chunk }));
      }
    });

    ptyProcess.onExit(() => {
      for (const request of connection.execRequests) {
        clearTimeout(request.timeoutId);
        request.reject(new Error("Shell exited before command completed."));
      }

      connection.execRequests = [];
      connection.ptyProcess = null;
      connection.socket = null;
    });

    return connection;
  }

  private resolveExecRequests(connection: ManagedShellConnection) {
    if (connection.execRequests.length === 0) {
      return;
    }

    for (const request of [...connection.execRequests]) {
      const markerIndex = connection.buffer.lastIndexOf(request.marker);

      if (markerIndex === -1) {
        continue;
      }

      const markerLineEnd = connection.buffer.indexOf("\n", markerIndex);

      if (markerLineEnd === -1) {
        continue;
      }

      const output = connection.buffer.slice(0, markerIndex).trim();
      connection.buffer = connection.buffer.slice(markerLineEnd + 1);
      connection.execRequests = connection.execRequests.filter((entry) => entry.marker !== request.marker);
      clearTimeout(request.timeoutId);
      request.resolve(output);
    }
  }
}
