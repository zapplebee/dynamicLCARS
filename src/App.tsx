import Button from "./components/Button";
import Commands from "./components/Commands";
import Elbow from "./components/Elbow";
import Grid from "./components/Grid";
import Matrix from "./components/Matrix";
import Tabs from "./components/Tabs";
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
        <Button shape="rounded" color="color1">R2 C2</Button>
        <Button shape="rounded" color="color2">R2 C3</Button>
        <Button shape="rounded" color="color3">R2 C4</Button>
        <Button shape="rounded" color="color4">R2 C5</Button>
        <Button shape="rounded" color="color6">R2 C6</Button>
        <Button shape="rounded" color="color1">R2 C7</Button>

        <Button shape="rounded" color="color2">R3 C2</Button>
        <Button shape="rounded" color="color3">R3 C3</Button>
        <Button shape="rounded" color="color4">R3 C4</Button>
        <Button shape="rounded" color="color6">R3 C5</Button>
        <Button shape="rounded" color="color1">R3 C6</Button>
        <Button shape="rounded" color="color2">R3 C7</Button>

        <Button shape="rounded" color="color3">R4 C2</Button>
        <Button shape="rounded" color="color4">R4 C3</Button>
        <Button shape="rounded" color="color6">R4 C4</Button>
        <Button shape="rounded" color="color1">R4 C5</Button>
        <Button shape="rounded" color="color2">R4 C6</Button>
        <Button shape="rounded" color="color3">R4 C7</Button>

        <Button shape="rounded" color="color4">R5 C2</Button>
        <Button shape="rounded" color="color6">R5 C3</Button>
        <Button shape="rounded" color="color1">R5 C4</Button>
        <Button shape="rounded" color="color2">R5 C5</Button>
        <Button shape="rounded" color="color3">R5 C6</Button>
        <Button shape="rounded" color="color4">R5 C7</Button>

        <Button shape="rounded" color="color6">R6 C2</Button>
        <Button shape="rounded" color="color1">R6 C3</Button>
        <Button shape="rounded" color="color2">R6 C4</Button>
        <Button shape="rounded" color="color3">R6 C5</Button>
        <Button shape="rounded" color="color4">R6 C6</Button>
        <Button shape="rounded" color="color6">R6 C7</Button>

        <Button shape="rounded" color="color1">R7 C2</Button>
        <Button shape="rounded" color="color2">R7 C3</Button>
        <Button shape="rounded" color="color3">R7 C4</Button>
        <Button shape="rounded" color="color4">R7 C5</Button>
        <Button shape="rounded" color="color6">R7 C6</Button>
        <Button shape="rounded" color="color1">R7 C7</Button>

        <Button shape="rounded" color="color2">R8 C2</Button>
        <Button shape="rounded" color="color3">R8 C3</Button>
        <Button shape="rounded" color="color4">R8 C4</Button>
        <Button shape="rounded" color="color6">R8 C5</Button>
        <Button shape="rounded" color="color1">R8 C6</Button>
        <Button shape="rounded" color="color2">R8 C7</Button>

        <Button shape="rounded" color="color3">R9 C2</Button>
        <Button shape="rounded" color="color4">R9 C3</Button>
        <Button shape="rounded" color="color6">R9 C4</Button>
        <Button shape="rounded" color="color1">R9 C5</Button>
        <Button shape="rounded" color="color2">R9 C6</Button>
        <Button shape="rounded" color="color3">R9 C7</Button>
      </Matrix>

      <Commands>
        <Button shape="rect" color="color1">COMMAND 1</Button>
        <Button shape="rect" color="color2">COMMAND 2</Button>
        <Button shape="rect" color="color3">COMMAND 3</Button>
        <Button shape="rect" color="color4">COMMAND 4</Button>
        <Button shape="rect" color="color5">COMMAND 5</Button>
        <Button shape="rect" color="color6">COMMAND 6</Button>
      </Commands>
    </Grid>
  );
}

export default App;
