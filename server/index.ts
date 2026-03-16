const API_PORT = Number(Bun.env.LCARS_API_PORT ?? "3002");
const NYX_HOST = Bun.env.NYX_HOST ?? "192.168.1.238";
const NYX_USER = Bun.env.NYX_USER ?? "zac";
const SSH_PASSWORD = Bun.env.TMUX_SSH_PASS ?? Bun.env.WETTY_SSH_PASS ?? "";
const SSH_ASKPASS = new URL("../ops/ssh/askpass.sh", import.meta.url).pathname;
const SELECTED_SESSION_FILE = "${HOME}/.lcars-selected-session";
const VIEW_TTY_FILE = "${HOME}/.lcars-view-tty";

type SessionSummary = {
  name: string;
  idleSeconds: number;
};

type SessionListResponse = {
  sessions: SessionSummary[];
};

type CurrentSessionResponse = {
  currentSession: string | null;
};

type SelectRequest = {
  session?: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

async function runRemote(command: string) {
  const sshArgs = [
    "ssh",
    "-o",
    "StrictHostKeyChecking=accept-new",
    `${NYX_USER}@${NYX_HOST}`,
    command,
  ];

  let commandLine = sshArgs;
  let env = process.env;

  if (SSH_PASSWORD) {
    commandLine = ["setsid", ...sshArgs];
    env = {
      ...process.env,
      DISPLAY: "lcars:0",
      LCARS_SSH_PASS: SSH_PASSWORD,
      SSH_ASKPASS,
      SSH_ASKPASS_REQUIRE: "force",
    };
  }

  const processHandle = Bun.spawn(commandLine, {
    env,
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(processHandle.stdout).text(),
    new Response(processHandle.stderr).text(),
    processHandle.exited,
  ]);

  if (exitCode !== 0) {
    throw new Error(stderr.trim() || stdout.trim() || "Remote tmux command failed.");
  }

  return stdout;
}

async function listAllSessions() {
  const output = await runRemote("tmux list-sessions -F '#{session_name}\t#{session_activity}' 2>/dev/null || true");
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

async function getCurrentSession() {
  const output = await runRemote(`cat ${SELECTED_SESSION_FILE} 2>/dev/null || true`);
  const current = output.split("\n")[0]?.trim() ?? "";

  if (!current) {
    return null;
  }

  const sessions = await listAllSessions();
  return sessions.some((session) => session.name === current) ? current : null;
}

async function setSelectedSession(session: string) {
  const quotedSession = shellQuote(session);
  const command = [
    `selected=${quotedSession}`,
    `printf '%s\n' "$selected" > ${SELECTED_SESSION_FILE}`,
    `if [ -f ${VIEW_TTY_FILE} ]; then`,
    `  viewer_tty=$(cat ${VIEW_TTY_FILE})`,
    `  if [ -n "$viewer_tty" ] && tmux list-clients -F '#{client_tty}' | grep -Fx -- "$viewer_tty" >/dev/null 2>&1; then`,
    `    tmux switch-client -c "$viewer_tty" -t "$selected"`,
    `  fi`,
    `fi`,
  ].join("\n");

  await runRemote(command);
}

async function handleSessions() {
  const sessions = await listAllSessions();
  const body: SessionListResponse = {
    sessions,
  };

  return json(body);
}

async function handleCurrent() {
  const currentSession = await getCurrentSession();
  const body: CurrentSessionResponse = {
    currentSession,
  };

  return json(body);
}

async function handleSelect(request: Request) {
  const body = (await request.json()) as SelectRequest;
  const session = body.session?.trim();

  if (!session) {
    return json({ error: "Session is required." }, 400);
  }

  const sessions = await listAllSessions();

  if (!sessions.some((entry) => entry.name === session)) {
    return json({ error: "Unknown tmux session." }, 404);
  }

  await setSelectedSession(session);
  return json({ currentSession: session });
}

Bun.serve({
  port: API_PORT,
  async fetch(request) {
    const url = new URL(request.url);

    try {
      if (request.method === "GET" && url.pathname === "/api/tmux/sessions") {
        return await handleSessions();
      }

      if (request.method === "GET" && url.pathname === "/api/tmux/current") {
        return await handleCurrent();
      }

      if (request.method === "POST" && url.pathname === "/api/tmux/select") {
        return await handleSelect(request);
      }

      if (request.method === "GET" && url.pathname === "/api/health") {
        return json({ ok: true });
      }

      return json({ error: "Not found." }, 404);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected tmux bridge error.";
      return json({ error: message }, 500);
    }
  },
});

console.log(`LCARS tmux bridge listening on http://127.0.0.1:${API_PORT}`);
