import crypto from "node:crypto";
import process from "node:process";
import pty, { type IPty } from "node-pty";
import type { RuntimeConfig } from "./config";
import { buildSshArgs } from "./ssh";

const VIEWER_TTY_MARKER = "__LCARS_VIEWER_TTY__:";
const MAX_BUFFER_LENGTH = 64_000;

export type TerminalSessionRecord = {
  id: string;
  selectedSession: string | null;
  viewerTty: string | null;
  lastSeenAt: number;
};

type ManagedTerminalSession = TerminalSessionRecord & {
  ptyProcess: IPty | null;
  socket: TerminalSocket | null;
  buffer: string;
  outputPrefix: string;
};

type TerminalSocket = {
  readyState: number;
  send: (data: string) => void;
  close: (code?: number, reason?: string) => void;
};

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function buildRemoteCommand(selectedSession: string | null) {
  const attachScript = selectedSession
    ? `exec tmux attach-session -t ${shellQuote(selectedSession)}`
    : "first_session=$(tmux list-sessions -F '#{session_name}' 2>/dev/null | sort | head -n 1); if [ -n \"$first_session\" ]; then exec tmux attach-session -t \"$first_session\"; else exec ${SHELL:-/bin/bash} -l; fi";

  const script = [
    'viewer_tty="${SSH_TTY:-$(tty)}"',
    `printf '${VIEWER_TTY_MARKER}%s\\r\\n' "$viewer_tty"`,
    attachScript,
  ].join("; ");

  return `sh -lc ${shellQuote(script)}`;
}

export class TerminalSessionManager {
  private readonly sessions = new Map<string, ManagedTerminalSession>();

  constructor(private readonly config: RuntimeConfig) {}

  createSessionId() {
    return crypto.randomUUID();
  }

  getSession(sessionId: string) {
    return this.sessions.get(sessionId) ?? null;
  }

  getSessionRecord(sessionId: string): TerminalSessionRecord | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      selectedSession: session.selectedSession,
      viewerTty: session.viewerTty,
      lastSeenAt: session.lastSeenAt,
    };
  }

  touchSession(sessionId: string) {
    const session = this.sessions.get(sessionId);

    if (session) {
      session.lastSeenAt = Date.now();
    }
  }

  async ensureSession(sessionId: string, selectedSession: string | null) {
    const existing = this.sessions.get(sessionId);

    if (existing && existing.ptyProcess) {
      existing.selectedSession = selectedSession ?? existing.selectedSession;
      existing.lastSeenAt = Date.now();
      return existing;
    }

    const nextSession: ManagedTerminalSession = existing ?? {
      id: sessionId,
      selectedSession,
      viewerTty: null,
      lastSeenAt: Date.now(),
      ptyProcess: null,
      socket: null,
      buffer: "",
      outputPrefix: "",
    };

    nextSession.selectedSession = selectedSession;
    nextSession.lastSeenAt = Date.now();
    nextSession.viewerTty = null;
    nextSession.buffer = "";
    nextSession.outputPrefix = "";

    const args = [
      "-tt",
      ...buildSshArgs(this.config, buildRemoteCommand(selectedSession)),
    ];

    const ptyProcess = pty.spawn("ssh", args, {
      name: "xterm-256color",
      cols: 120,
      rows: 40,
      cwd: process.cwd(),
      env: process.env,
    });

    nextSession.ptyProcess = ptyProcess;

    ptyProcess.onData((chunk) => {
      nextSession.lastSeenAt = Date.now();
      const rendered = this.consumeOutput(nextSession, chunk);

      if (rendered.length === 0) {
        return;
      }

      nextSession.buffer = `${nextSession.buffer}${rendered}`.slice(-MAX_BUFFER_LENGTH);

      if (nextSession.socket && nextSession.socket.readyState === 1) {
        nextSession.socket.send(JSON.stringify({ type: "output", data: rendered }));
      }
    });

    ptyProcess.onExit(() => {
      nextSession.ptyProcess = null;
      nextSession.socket = null;
      nextSession.viewerTty = null;
    });

    this.sessions.set(sessionId, nextSession);
    return nextSession;
  }

  attachSocket(sessionId: string, socket: TerminalSocket) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    session.socket = socket;
    session.lastSeenAt = Date.now();

    if (session.buffer) {
      socket.send(JSON.stringify({ type: "output", data: session.buffer }));
    }

    return session;
  }

  detachSocket(sessionId: string, socket: TerminalSocket) {
    const session = this.sessions.get(sessionId);

    if (session?.socket === socket) {
      session.socket = null;
      session.lastSeenAt = Date.now();
    }
  }

  writeInput(sessionId: string, data: string) {
    const session = this.sessions.get(sessionId);
    session?.ptyProcess?.write(data);
    if (session) {
      session.lastSeenAt = Date.now();
    }
  }

  resize(sessionId: string, cols: number, rows: number) {
    const session = this.sessions.get(sessionId);

    if (!session?.ptyProcess) {
      return;
    }

    session.ptyProcess.resize(cols, rows);
    session.lastSeenAt = Date.now();
  }

  async retargetSession(sessionId: string, selectedSession: string | null) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    session.selectedSession = selectedSession;
    session.lastSeenAt = Date.now();
    return session;
  }

  cleanupExpiredSessions() {
    const now = Date.now();

    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastSeenAt < this.config.sessionIdleTtlMs) {
        continue;
      }

      session.socket?.close();
      session.ptyProcess?.kill();
      this.sessions.delete(sessionId);
    }
  }

  private consumeOutput(session: ManagedTerminalSession, chunk: string) {
    const next = `${session.outputPrefix}${chunk}`;
    const lines = next.split(/\r?\n/);
    session.outputPrefix = lines.pop() ?? "";

    const renderedLines = lines.filter((line) => {
      if (line.startsWith(VIEWER_TTY_MARKER)) {
        session.viewerTty = line.slice(VIEWER_TTY_MARKER.length).trim() || null;
        return false;
      }

      return true;
    });

    const suffix = chunk.endsWith("\n") || chunk.endsWith("\r") ? "" : session.outputPrefix;
    if (suffix && !suffix.startsWith(VIEWER_TTY_MARKER)) {
      session.outputPrefix = suffix;
    } else if (suffix.startsWith(VIEWER_TTY_MARKER)) {
      session.viewerTty = suffix.slice(VIEWER_TTY_MARKER.length).trim() || null;
      session.outputPrefix = "";
    }

    const rendered = renderedLines.join("\r\n");

    if (chunk.endsWith("\n") || chunk.endsWith("\r")) {
      return rendered ? `${rendered}\r\n` : "";
    }

    return rendered;
  }
}
