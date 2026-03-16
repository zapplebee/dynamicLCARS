import { useCallback, useEffect, useMemo, useState } from "react";
import Commands from "./Commands";
import Button from "./Button";

const VISIBLE_SESSION_COUNT = 6;

type SessionsResponse = {
  sessions: string[];
};

type CurrentResponse = {
  currentSession: string | null;
};

type SelectResponse = {
  currentSession: string;
};

function padSessions(sessions: string[]) {
  const padded = [...sessions];

  while (padded.length < VISIBLE_SESSION_COUNT) {
    padded.push("");
  }

  return padded.slice(0, VISIBLE_SESSION_COUNT);
}

function SessionCommands() {
  const [sessions, setSessions] = useState<string[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingSession, setPendingSession] = useState<string | null>(null);

  const loadState = useCallback(async (showLoading: boolean) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const [sessionsResponse, currentResponse] = await Promise.all([
        fetch("/api/tmux/sessions"),
        fetch("/api/tmux/current"),
      ]);

      if (!sessionsResponse.ok || !currentResponse.ok) {
        throw new Error("Unable to reach nyx tmux bridge.");
      }

      const sessionsData = (await sessionsResponse.json()) as SessionsResponse;
      const currentData = (await currentResponse.json()) as CurrentResponse;

      setSessions(sessionsData.sessions.slice(0, VISIBLE_SESSION_COUNT));
      setCurrentSession(currentData.currentSession);
      setError(null);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to reach nyx tmux bridge.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

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
        body: JSON.stringify({ session }),
      });

      if (!response.ok) {
        throw new Error("Unable to switch the nyx viewer.");
      }

      const data = (await response.json()) as SelectResponse;
      setCurrentSession(data.currentSession);
      setError(null);
      await loadState(false);
    } catch (selectError) {
      const message = selectError instanceof Error ? selectError.message : "Unable to switch the nyx viewer.";
      setError(message);
    } finally {
      setPendingSession(null);
    }
  }, [loadState]);

  const activeSession = useMemo(() => {
    if (!currentSession) {
      return null;
    }

    return sessions.includes(currentSession) ? currentSession : null;
  }, [currentSession, sessions]);

  const sessionSlots = useMemo(() => {
    if (error && sessions.length === 0) {
      return ["OFFLINE", ...Array.from({ length: VISIBLE_SESSION_COUNT - 1 }, () => "")];
    }

    if (loading && sessions.length === 0) {
      return ["SYNCING", ...Array.from({ length: VISIBLE_SESSION_COUNT - 1 }, () => "")];
    }

    if (sessions.length === 0) {
      return ["NO TMUX", ...Array.from({ length: VISIBLE_SESSION_COUNT - 1 }, () => "")];
    }

    return padSessions(sessions);
  }, [error, loading, sessions]);

  return (
    <Commands>
      {sessionSlots.map((sessionLabel, index) => {
        const isVisibleSession = sessionLabel !== "" && sessions.includes(sessionLabel);
        const isPending = pendingSession === sessionLabel;
        const isActive = isVisibleSession && activeSession === sessionLabel;
        const color = sessionLabel === "OFFLINE"
          ? "color5"
          : sessionLabel === "SYNCING" || sessionLabel === "NO TMUX" || !isVisibleSession
            ? "color8"
            : "color1";

        return (
          <Button
            key={`${sessionLabel || "empty"}-${index}`}
            shape="rect"
            color={color}
            active={isActive}
            onClick={isVisibleSession ? () => void selectSession(sessionLabel) : undefined}
            disabled={isPending}
          >
            {sessionLabel}
          </Button>
        );
      })}
    </Commands>
  );
}

export default SessionCommands;
