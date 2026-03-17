import { FitAddon } from "@xterm/addon-fit";
import { useEffect, useMemo, useRef, useState } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { ensureTerminalSessionId } from "../browserSession";

type TerminalPaneProps = {
  selectedShell: string | null;
};

function TerminalPane({ selectedShell }: TerminalPaneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState("CONNECTING");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sessionLabel = useMemo(() => selectedShell ?? "Awaiting shell", [selectedShell]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      const sessionId = await ensureTerminalSessionId();

      if (!cancelled) {
        setSessionId(sessionId);
      }
    }

    void bootstrapSession().catch(() => {
      if (!cancelled) {
        setConnectionState("OFFLINE");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hostRef.current || terminalRef.current) {
      return;
    }

    const terminal = new Terminal({
      cursorBlink: true,
      fontFamily: "monospace",
      fontSize: 15,
      theme: {
        background: "#060913",
        foreground: "#f7d89c",
        cursor: "#ffcc66",
      },
    });
    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);
    terminal.open(hostRef.current);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitRef.current = fitAddon;

    const handleResize = () => {
      fitAddon.fit();

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: "resize",
          cols: terminal.cols,
          rows: terminal.rows,
        }));
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      socketRef.current?.close();
      terminal.dispose();
      terminalRef.current = null;
      fitRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }

    if (!sessionId || !selectedShell) {
      setConnectionState(sessionId ? "AWAITING SHELL" : "CONNECTING");
      terminalRef.current.reset();
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${window.location.host}/terminal/ws?sessionId=${encodeURIComponent(sessionId)}&shellId=${encodeURIComponent(selectedShell)}`);
    socketRef.current = socket;
    setConnectionState("CONNECTING");

    const terminal = terminalRef.current;
    const fitAddon = fitRef.current;
    terminal.reset();

    const inputDisposable = terminal.onData((data) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "input", data }));
      }
    });

    socket.addEventListener("open", () => {
      setConnectionState("ONLINE");
      fitAddon?.fit();
      socket.send(JSON.stringify({
        type: "resize",
        cols: terminal.cols,
        rows: terminal.rows,
      }));
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as { type: string; data?: string };

      if (message.type === "output" && typeof message.data === "string") {
        terminal.write(message.data);
      }
    });

    socket.addEventListener("close", () => {
      setConnectionState("SESSION OFFLINE");
    });

    socket.addEventListener("error", () => {
      setConnectionState("OFFLINE");
    });

    const heartbeatId = window.setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 15000);

    return () => {
      inputDisposable.dispose();
      window.clearInterval(heartbeatId);
      socket.close();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [selectedShell, sessionId]);

  return (
    <div className="lcars-terminal-pane">
      <div className="lcars-terminal-pane__chrome">
        <span className="lcars-terminal-pane__label">Shell</span>
        <span className="lcars-terminal-pane__session">{sessionLabel}</span>
        <span className="lcars-terminal-pane__status">{connectionState}</span>
      </div>
      <div ref={hostRef} className="lcars-terminal-pane__terminal" aria-label="Subspace terminal" />
    </div>
  );
}

export default TerminalPane;
