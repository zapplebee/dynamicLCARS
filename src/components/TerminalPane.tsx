const wettyPassword = import.meta.env.VITE_WETTY_SSH_PASS;
const wettySrc = wettyPassword
  ? `/wetty/ssh/zac?pass=${encodeURIComponent(wettyPassword)}`
  : "/wetty";

function TerminalPane() {
  return (
    <div className="lcars-terminal-pane">
      <iframe
        className="lcars-terminal-pane__frame"
        src={wettySrc}
        title="Subspace terminal"
      />
    </div>
  );
}

export default TerminalPane;
