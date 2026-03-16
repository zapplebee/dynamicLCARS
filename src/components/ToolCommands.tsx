import Commands from "./Commands";
import Button from "./Button";

export type ToolRoute = "shell" | "port-forwarding" | "diff-viewer" | "gh-issues" | "http-proxy";

type ToolCommandsProps = {
  selectedTool: ToolRoute;
  onSelectTool: (tool: ToolRoute) => void;
};

const TOOLS: Array<{ id: ToolRoute; label: string; color: "color2" | "color3" | "color4" | "color6" | "color8" }> = [
  { id: "shell", label: "SHELL", color: "color2" },
  { id: "port-forwarding", label: "PORT FORWARDING", color: "color3" },
  { id: "diff-viewer", label: "DIFF VIEWER", color: "color4" },
  { id: "gh-issues", label: "GH ISSUES", color: "color6" },
  { id: "http-proxy", label: "HTTP PROXY", color: "color8" },
];

function ToolCommands({ selectedTool, onSelectTool }: ToolCommandsProps) {
  return (
    <Commands side="left">
      {TOOLS.map((tool) => (
        <Button
          key={tool.id}
          shape="rect"
          color={tool.color}
          active={selectedTool === tool.id}
          onClick={() => onSelectTool(tool.id)}
        >
          {tool.label}
        </Button>
      ))}
    </Commands>
  );
}

export default ToolCommands;
