import { useCallback, useEffect, useMemo, useState } from "react";
import { readStoredTerminalSessionId } from "../browserSession";
import Commands from "./Commands";
import Button from "./Button";

const IDLE_THRESHOLD_SECONDS = 30;

type SessionSummary = {
  name: string;
  idleSeconds: number;
};

type SessionsResponse = {
  sessions: SessionSummary[];
};

type CurrentResponse = {
  currentSession: string | null;
};

type SelectResponse = {
  currentSession: string;
};

type SessionCommandsProps = {
  currentSession: string | null;
  onCurrentSessionChange: (session: string | null) => void;
};

function SessionCommands({ currentSession, onCurrentSessionChange }: SessionCommandsProps) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingSession, setPendingSession] = useState<string | null>(null);

  const loadState = useCallback(async (showLoading: boolean) => {
    const sessionId = readStoredTerminalSessionId();

    if (showLoading) {
      setLoading(true);
    }

    try {
      const [sessionsResponse, currentResponse] = await Promise.all([
        fetch(sessionId ? `/api/tmux/sessions?sessionId=${encodeURIComponent(sessionId)}` : "/api/tmux/sessions"),
        fetch("/api/tmux/current"),
      ]);

      if (!sessionsResponse.ok || !currentResponse.ok) {
        throw new Error("Unable to reach nyx tmux bridge.");
      }

      const sessionsData = (await sessionsResponse.json()) as SessionsResponse;
      const currentData = (await currentResponse.json()) as CurrentResponse;

      setSessions(sessionsData.sessions);
      onCurrentSessionChange(currentData.currentSession);
      setError(null);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to reach nyx tmux bridge.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [onCurrentSessionChange]);

  useEffect(() => {
    void loadState(true);

    const intervalId = window.setInterval(() => {
      void loadState(false);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadState]);

  const selectSession = useCallback(async (session: string) => {
    setPendingSession(session);

    try {
      const response = await fetch("/api/tmux/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session, sessionId: readStoredTerminalSessionId() }),
      });

      if (!response.ok) {
        throw new Error("Unable to switch the nyx viewer.");
      }

      const data = (await response.json()) as SelectResponse;
      onCurrentSessionChange(data.currentSession);
      setError(null);
      await loadState(false);
    } catch (selectError) {
      const message = selectError instanceof Error ? selectError.message : "Unable to switch the nyx viewer.";
      setError(message);
    } finally {
      setPendingSession(null);
    }
  }, [loadState, onCurrentSessionChange]);

  const activeSession = useMemo(() => {
    if (!currentSession) {
      return null;
    }

    return sessions.some((session) => session.name === currentSession) ? currentSession : null;
  }, [currentSession, sessions]);

  const statusLabel = useMemo(() => {
    if (error && sessions.length === 0) {
      return "OFFLINE";
    }

    if (loading && sessions.length === 0) {
      return "SYNCING";
    }

    if (sessions.length === 0) {
      return "NO TMUX";
    }

    return null;
  }, [error, loading, sessions]);

  return (
    <Commands side="right">
      {statusLabel ? (
        <Button shape="rect" color={statusLabel === "OFFLINE" ? "color5" : "color8"}>
          {statusLabel}
        </Button>
      ) : null}

      {sessions.map((session) => {
        const isPending = pendingSession === session.name;
        const isActive = activeSession === session.name;
        const isIdle = session.idleSeconds > IDLE_THRESHOLD_SECONDS;
        const color = isIdle ? "color6" : "color1";

        return (
          <Button
            key={session.name}
            shape="rect"
            color={color}
            active={isActive}
            onClick={() => void selectSession(session.name)}
            disabled={isPending}
          >
            {session.name}
          </Button>
        );
      })}
    </Commands>
  );
}

export default SessionCommands;
