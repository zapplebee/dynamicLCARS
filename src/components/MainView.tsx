import TerminalPane from "./TerminalPane";
import type { ToolRoute } from "./ToolCommands";

type MainViewProps = {
  selectedTool: ToolRoute;
  selectedShell: string | null;
};

const ROUTE_COPY: Record<Exclude<ToolRoute, "shell">, { title: string; detail: string }> = {
  "port-forwarding": {
    title: "Port Forwarding",
    detail: "Reserve this pane for tunnel status, listener targets, and shortcut actions.",
  },
  "diff-viewer": {
    title: "Diff Viewer",
    detail: "Reserve this pane for comparing branch state, patch previews, and focused file diffs.",
  },
  "gh-issues": {
    title: "GH Issues",
    detail: "Reserve this pane for issue triage, handoff notes, and GitHub workflow shortcuts.",
  },
  "http-proxy": {
    title: "HTTP Proxy",
    detail: "Reserve this pane for proxy routes, upstream health, and captured request diagnostics.",
  },
};

function MainView({ selectedTool, selectedShell }: MainViewProps) {
  if (selectedTool === "shell") {
    return <TerminalPane selectedShell={selectedShell} />;
  }

  const route = ROUTE_COPY[selectedTool];

  return (
    <section className="lcars-route-panel">
      <p className="lcars-route-panel__eyebrow">Client Router</p>
      <h1 className="lcars-route-panel__title">{route.title}</h1>
      <p className="lcars-route-panel__detail">{route.detail}</p>
      <div className="lcars-route-panel__status">
        <span className="lcars-route-panel__status-label">Selected shell</span>
        <span className="lcars-route-panel__status-value">{selectedShell ?? "Awaiting shell"}</span>
      </div>
    </section>
  );
}

export default MainView;
