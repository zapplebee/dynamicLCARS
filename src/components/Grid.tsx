import type { ReactNode } from "react";
import { CELL_GAP, CELL_HEIGHT, CELL_WIDTH, STAGE_INSET } from "../theme";

type GridProps = {
  width: number;
  height: number;
  children: ReactNode;
};

function Grid({ width, height, children }: GridProps) {
  return (
    <main className="lcars-shell">
      <div className="lcars-stage" style={{ width: `${width}px`, height: `${height}px` }}>
        <div
          className="lcars-stage-grid"
          style={{
            width: `${width - (STAGE_INSET * 2)}px`,
            height: `${height - (STAGE_INSET * 2)}px`,
            margin: `${STAGE_INSET}px`,
            gridTemplateColumns: `repeat(8, ${CELL_WIDTH}px)`,
            gridTemplateRows: `repeat(8, ${CELL_HEIGHT}px)`,
            gap: `${CELL_GAP}px`,
          }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}

export default Grid;
