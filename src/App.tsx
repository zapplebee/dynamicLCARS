import Button from "./components/Button";
import Elbow from "./components/Elbow";
import Grid from "./components/Grid";
import Matrix from "./components/Matrix";
import Pane from "./components/Pane";
import SessionCommands from "./components/SessionCommands";
import Tabs from "./components/Tabs";
import TerminalPane from "./components/TerminalPane";
import { STAGE_HEIGHT, STAGE_WIDTH } from "./theme";

function App() {
  return (
    <Grid width={STAGE_WIDTH} height={STAGE_HEIGHT}>
      <Elbow corner="topLeft" color="color8" />
      <Elbow corner="topRight" color="color8" />
      <Elbow corner="bottomLeft" color="color8" />
      <Elbow corner="bottomRight" color="color8" />

      <Tabs>
        <Button shape="rect" color="color3">HOME</Button>
        <Button shape="rect" color="color3">BRIEFING</Button>
        <Button shape="rect" color="color3" active>SUBSPACE</Button>
        <Button shape="rect" color="color3">OFFICERS</Button>
        <Button shape="rect" color="color3" gridHeight={2}>ABOUT</Button>
      </Tabs>

      <Matrix>
        <Pane gridWidth={8} gridHeight={11}>
          <TerminalPane />
        </Pane>

        <Button shape="rounded" color="color2">C1</Button>
        <Button shape="rounded" color="color3">C2</Button>
        <Button shape="rounded" color="color4">C3</Button>
        <Button shape="rounded" color="color6">C4</Button>
        <Button shape="rounded" color="color1">C5</Button>
        <Button shape="rounded" color="color2">C6</Button>
        <Button shape="rounded" color="color3">C7</Button>
        <Button shape="rounded" color="color4">C8</Button>
      </Matrix>

      <SessionCommands />
    </Grid>
  );
}

export default App;
