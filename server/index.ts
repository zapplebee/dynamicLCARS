import process from "node:process";
import { readFile } from "node:fs/promises";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { loadConfig } from "./config";
import { TerminalSessionManager } from "./terminalSessionManager";

type BootstrapResponse = {
  sessionId: string;
};

type ShellRequest = {
  sessionId?: string;
  shellId?: string;
};

const config = loadConfig();
const terminalSessions = new TerminalSessionManager(config);

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.get("/api/health", (c) => c.json({ ok: true }));

app.get("/api/session/bootstrap", (c) => {
  const existingSessionId = c.req.query("sessionId")?.trim();
  const sessionId = existingSessionId || terminalSessions.createSessionId();
  terminalSessions.ensureSession(sessionId);

  const body: BootstrapResponse = { sessionId };
  return c.json(body);
});

app.get("/api/shells", (c) => {
  const sessionId = c.req.query("sessionId")?.trim();

  if (!sessionId) {
    return c.json({ error: "Terminal session id is required." }, 400);
  }

  const shells = terminalSessions.listShells(sessionId);
  const currentShellId = terminalSessions.getSelectedShellId(sessionId);
  return c.json({ shells, currentShellId });
});

app.post("/api/shells", async (c) => {
  const body = (await c.req.json()) as ShellRequest;
  const sessionId = body.sessionId?.trim();

  if (!sessionId) {
    return c.json({ error: "Terminal session id is required." }, 400);
  }

  const shell = terminalSessions.createShell(sessionId);
  terminalSessions.selectShell(sessionId, shell.id);
  return c.json({ shell, currentShellId: shell.id });
});

app.post("/api/shells/select", async (c) => {
  const body = (await c.req.json()) as ShellRequest;
  const sessionId = body.sessionId?.trim();
  const shellId = body.shellId?.trim();

  if (!sessionId || !shellId) {
    return c.json({ error: "Terminal session id and shell id are required." }, 400);
  }

  const shell = terminalSessions.selectShell(sessionId, shellId);

  if (!shell) {
    return c.json({ error: "Unknown shell." }, 404);
  }

  return c.json({ currentShellId: shell.id });
});

app.get("/terminal/ws", upgradeWebSocket((c) => {
  const sessionId = c.req.query("sessionId")?.trim();
  const shellId = c.req.query("shellId")?.trim();

  if (!sessionId || !shellId) {
    throw new Error("Terminal session id and shell id are required.");
  }

  terminalSessions.ensureSession(sessionId);

  if (!terminalSessions.selectShell(sessionId, shellId)) {
    throw new Error("Unknown shell.");
  }

  return {
    onOpen(_, websocket) {
      terminalSessions.attachSocket(sessionId, shellId, websocket);
    },
    onMessage(event) {
      const message = JSON.parse(typeof event.data === "string" ? event.data : "{}") as {
        type: string;
        data?: string;
        cols?: number;
        rows?: number;
      };

      if (message.type === "input" && typeof message.data === "string") {
        terminalSessions.writeInput(sessionId, shellId, message.data);
      }

      if (message.type === "resize" && typeof message.cols === "number" && typeof message.rows === "number") {
        terminalSessions.resize(sessionId, shellId, message.cols, message.rows);
      }

      if (message.type === "ping") {
        terminalSessions.touchSession(sessionId);
      }
    },
    onClose(_, websocket) {
      terminalSessions.detachSocket(sessionId, shellId, websocket);
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
}, () => {
  console.log(`LCARS server listening on http://127.0.0.1:${config.httpPort}`);
});

injectWebSocket(server);
