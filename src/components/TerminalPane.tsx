type TerminalPaneProps = {
  selectedSession: string | null;
};

const wettyPassword = import.meta.env.VITE_WETTY_SSH_PASS;
const wettySrc = wettyPassword
  ? `/wetty/ssh/zac?pass=${encodeURIComponent(wettyPassword)}`
  : "/wetty";

function TerminalPane({ selectedSession }: TerminalPaneProps) {
  return (
    <div className="lcars-terminal-pane">
      <div className="lcars-terminal-pane__chrome">
        <span className="lcars-terminal-pane__label">Shell</span>
        <span className="lcars-terminal-pane__session">{selectedSession ?? "Awaiting tmux session"}</span>
      </div>
      <iframe
        className="lcars-terminal-pane__frame"
        src={wettySrc}
        title="Subspace terminal"
      />
    </div>
  );
}

export default TerminalPane;
