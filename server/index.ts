import process from "node:process";
import { readFile } from "node:fs/promises";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { loadConfig } from "./config";
import { getCurrentSelectedSession, listTmuxSessions, setCurrentSelectedSession } from "./ssh";
import { TerminalSessionManager } from "./terminalSessionManager";

type SelectRequest = {
  session?: string;
  sessionId?: string;
};

type BootstrapResponse = {
  sessionId: string;
};

const config = loadConfig();
const terminalSessions = new TerminalSessionManager(config);

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.get("/api/health", (c) => c.json({ ok: true }));

app.get("/api/session/bootstrap", (c) => {
  const existingSessionId = c.req.query("sessionId")?.trim();
  const sessionId = existingSessionId || terminalSessions.createSessionId();
  const body: BootstrapResponse = { sessionId };
  return c.json(body);
});

app.get("/api/tmux/sessions", async (c) => {
  const sessions = await listTmuxSessions(config);
  return c.json({ sessions });
});

app.get("/api/tmux/current", async (c) => {
  const currentSession = await getCurrentSelectedSession(config);
  return c.json({ currentSession });
});

app.post("/api/tmux/select", async (c) => {
  const body = (await c.req.json()) as SelectRequest;
  const session = body.session?.trim();

  if (!session) {
    return c.json({ error: "Session is required." }, 400);
  }

  const sessions = await listTmuxSessions(config);

  if (!sessions.some((entry) => entry.name === session)) {
    return c.json({ error: "Unknown tmux session." }, 404);
  }

  const sessionId = body.sessionId?.trim();
  const terminalSession = sessionId ? terminalSessions.getSessionRecord(sessionId) : null;

  await setCurrentSelectedSession(config, session, terminalSession?.viewerTty);

  if (sessionId) {
    await terminalSessions.retargetSession(sessionId, session);
  }

  return c.json({ currentSession: session });
});

app.get("/terminal/ws", upgradeWebSocket(async (c) => {
  const sessionId = c.req.query("sessionId")?.trim();

  if (!sessionId) {
    throw new Error("Terminal session id is required.");
  }

  const selectedSession = await getCurrentSelectedSession(config);
  await terminalSessions.ensureSession(sessionId, selectedSession);

  return {
    onOpen(_, websocket) {
      terminalSessions.attachSocket(sessionId, websocket);
    },
    onMessage(event) {
      const message = JSON.parse(typeof event.data === "string" ? event.data : "{}") as {
        type: string;
        data?: string;
        cols?: number;
        rows?: number;
      };

      if (message.type === "input" && typeof message.data === "string") {
        terminalSessions.writeInput(sessionId, message.data);
      }

      if (message.type === "resize" && typeof message.cols === "number" && typeof message.rows === "number") {
        terminalSessions.resize(sessionId, message.cols, message.rows);
      }

      if (message.type === "ping") {
        terminalSessions.touchSession(sessionId);
      }
    },
    onClose(_, websocket) {
      terminalSessions.detachSocket(sessionId, websocket);
    },
    onError(error) {
      console.error("terminal websocket error", error);
    },
  };
}));

if (process.env.NODE_ENV === "production") {
  app.use("/assets/*", serveStatic({ root: "./dist" }));
  app.get("*", async (c) => {
    const indexHtml = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
    return c.html(indexHtml);
  });
}

setInterval(() => {
  terminalSessions.cleanupExpiredSessions();
}, 60_000).unref();

const server = serve({
  fetch: app.fetch,
  port: config.httpPort,
}, (info) => {
  console.log(`LCARS server listening on http://127.0.0.1:${config.httpPort}`);
});

injectWebSocket(server);
