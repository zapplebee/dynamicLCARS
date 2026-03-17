import { useCallback, useMemo, useState } from "react";
import { ensureTerminalSessionId, readStoredTerminalSessionId } from "../browserSession";
import Button from "./Button";

type TerminalActionButtonsProps = {
  selectedShell: string | null;
};

type ActionDefinition = {
  label: string;
  color: "color1" | "color2" | "color3" | "color4" | "color6" | "color8";
  data: string;
};

const ACTIONS: ActionDefinition[] = [
  { label: "TAB", color: "color2", data: "\t" },
  { label: "ENTER", color: "color3", data: "\r" },
  { label: "UP", color: "color4", data: "\u001b[A" },
  { label: "CTRL+C", color: "color6", data: "\u0003" },
  { label: "STATUS", color: "color1", data: "git status\r" },
  { label: "GIT ADD", color: "color2", data: "git add .\r" },
  { label: "COMMIT MSG", color: "color3", data: "opencode run \"author the next commit message\"\r" },
  { label: "AUTO COMMIT", color: "color8", data: "git add . && git commit -m \"$(opencode run \"author the next commit message\")\"\r" },
];

function TerminalActionButtons({ selectedShell }: TerminalActionButtonsProps) {
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const canRunActions = useMemo(() => selectedShell !== null, [selectedShell]);

  const runAction = useCallback(async (action: ActionDefinition) => {
    if (!selectedShell) {
      return;
    }

    const sessionId = readStoredTerminalSessionId() ?? await ensureTerminalSessionId();
    setPendingAction(action.label);

    try {
      await fetch("/api/shells/input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, shellId: selectedShell, data: action.data }),
      });
    } finally {
      setPendingAction(null);
    }
  }, [selectedShell]);

  return (
    <>
      {ACTIONS.map((action) => (
        <Button
          key={action.label}
          shape="rounded"
          color={action.color}
          onClick={canRunActions ? () => void runAction(action) : undefined}
          disabled={!canRunActions || pendingAction === action.label}
        >
          {action.label}
        </Button>
      ))}
    </>
  );
}

export default TerminalActionButtons;
