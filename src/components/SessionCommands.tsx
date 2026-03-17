import { useCallback, useEffect, useMemo, useState } from "react";
import { ensureTerminalSessionId, readStoredTerminalSessionId } from "../browserSession";
import Commands from "./Commands";
import Button from "./Button";

type ShellSummary = {
  id: string;
  label: string;
};

type ShellsResponse = {
  shells: ShellSummary[];
  currentShellId: string | null;
};

type SessionCommandsProps = {
  currentShell: string | null;
  onCurrentShellChange: (shellId: string | null) => void;
};

function SessionCommands({ currentShell, onCurrentShellChange }: SessionCommandsProps) {
  const [shells, setShells] = useState<ShellSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const loadState = useCallback(async () => {
    const sessionId = await ensureTerminalSessionId();

    try {
      const response = await fetch(`/api/shells?sessionId=${encodeURIComponent(sessionId)}`);

      if (!response.ok) {
        throw new Error("Unable to reach the shell manager.");
      }

      const data = (await response.json()) as ShellsResponse;
      setShells(data.shells);
      onCurrentShellChange(data.currentShellId);
      setError(null);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to reach the shell manager.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [onCurrentShellChange]);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  const createShell = useCallback(async () => {
    const sessionId = await ensureTerminalSessionId();

    setPendingAction("create");

    try {
      const response = await fetch("/api/shells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error("Unable to create a new shell.");
      }

      const data = (await response.json()) as { shell: ShellSummary; currentShellId: string };
      setShells((existing) => [...existing, data.shell]);
      onCurrentShellChange(data.currentShellId);
      setError(null);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Unable to create a new shell.";
      setError(message);
    } finally {
      setPendingAction(null);
    }
  }, [onCurrentShellChange]);

  const selectShell = useCallback(async (shellId: string) => {
    const sessionId = readStoredTerminalSessionId() ?? await ensureTerminalSessionId();

    setPendingAction(shellId);

    try {
      const response = await fetch("/api/shells/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, shellId }),
      });

      if (!response.ok) {
        throw new Error("Unable to switch shells.");
      }

      const data = (await response.json()) as { currentShellId: string };
      onCurrentShellChange(data.currentShellId);
      setError(null);
    } catch (selectError) {
      const message = selectError instanceof Error ? selectError.message : "Unable to switch shells.";
      setError(message);
    } finally {
      setPendingAction(null);
    }
  }, [onCurrentShellChange]);

  const statusLabel = useMemo(() => {
    if (error && shells.length === 0) {
      return "OFFLINE";
    }

    if (loading && shells.length === 0) {
      return "SYNCING";
    }

    return null;
  }, [error, loading, shells]);

  return (
    <Commands side="right">
      <Button shape="rect" color="color8" onClick={() => void createShell()} disabled={pendingAction === "create"}>
        + SHELL
      </Button>

      {statusLabel ? (
        <Button shape="rect" color={statusLabel === "OFFLINE" ? "color5" : "color8"}>
          {statusLabel}
        </Button>
      ) : null}

      {shells.map((shell) => (
        <Button
          key={shell.id}
          shape="rect"
          color="color1"
          active={currentShell === shell.id}
          onClick={() => void selectShell(shell.id)}
          disabled={pendingAction === shell.id}
        >
          {shell.label}
        </Button>
      ))}
    </Commands>
  );
}

export default SessionCommands;
