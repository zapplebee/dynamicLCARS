import type { CSSProperties, ReactNode } from "react";

type PaneProps = {
  gridWidth?: number;
  gridHeight?: number;
  children?: ReactNode;
};

function Pane({ gridWidth = 1, gridHeight = 1, children }: PaneProps) {
  const style: CSSProperties = {
    gridColumn: `span ${gridWidth}`,
    gridRow: `span ${gridHeight}`,
  };

  return (
    <section className="lcars-pane" style={style}>
      {children}
    </section>
  );
}

export default Pane;
