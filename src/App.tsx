import { useState } from "react";
import Elbow from "./components/Elbow";
import Grid from "./components/Grid";
import MainView from "./components/MainView";
import Matrix from "./components/Matrix";
import Pane from "./components/Pane";
import SessionCommands from "./components/SessionCommands";
import ToolCommands, { type ToolRoute } from "./components/ToolCommands";
import { STAGE_HEIGHT, STAGE_WIDTH } from "./theme";

function App() {
  const [selectedTool, setSelectedTool] = useState<ToolRoute>("shell");
  const [selectedShell, setSelectedShell] = useState<string | null>(null);

  return (
    <Grid width={STAGE_WIDTH} height={STAGE_HEIGHT}>
      <Elbow corner="topLeft" color="color8" />
      <Elbow corner="topRight" color="color8" />
      <Elbow corner="bottomLeft" color="color8" />
      <Elbow corner="bottomRight" color="color8" />

      <ToolCommands selectedTool={selectedTool} onSelectTool={setSelectedTool} />

      <Matrix>
        <Pane gridWidth={8} gridHeight={11}>
          <MainView selectedTool={selectedTool} selectedShell={selectedShell} />
        </Pane>
      </Matrix>

      <SessionCommands currentShell={selectedShell} onCurrentShellChange={setSelectedShell} />
    </Grid>
  );
}

export default App;
