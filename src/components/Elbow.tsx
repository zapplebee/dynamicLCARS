import {
  BUTTON_COLORS,
  ELBOW_HEIGHT,
  ELBOW_WIDTH,
} from "../theme";
import type { CSSProperties } from "react";
import type { ButtonColor, ElbowCorner } from "../types";

type ElbowProps = {
  corner: ElbowCorner;
  color: ButtonColor;
};

function Elbow({ corner, color }: ElbowProps) {
  const geometry = getElbowGeometry(corner);
  const style: CSSProperties = {};

  return (
    <div className={`lcars-elbow lcars-elbow--${corner}`} style={style}>
      <svg
        viewBox={`0 0 ${ELBOW_WIDTH} ${ELBOW_HEIGHT}`}
        width={ELBOW_WIDTH}
        height={ELBOW_HEIGHT}
        style={{
          left: geometry.offsetLeft,
          top: geometry.offsetTop,
        }}
        aria-hidden="true"
      >
        <path fill={BUTTON_COLORS[color]} d={geometry.path} />
        <rect
          width="275"
          height="30"
          x={geometry.rect.x}
          y={geometry.rect.y}
          fill={BUTTON_COLORS[color]}
        />
      </svg>
    </div>
  );
}

function getElbowGeometry(corner: ElbowCorner) {
  switch (corner) {
    case "topLeft":
      return {
        offsetLeft: 0,
        offsetTop: 0,
        path: "M 75 0 C 33.578644 0 0 33.57864 0 75.00002 L 0 95.00002 L 150 95.00002 L 150 67.50002 C 150 46.78932 166.78932 30 187.5 30 L 187.5 0 Z",
        rect: { x: 187, y: 0 },
      };
    case "topRight":
      return {
        offsetLeft: -312,
        offsetTop: 0,
        path: "M 387 0 C 428.421356 0 462 33.57864 462 75.00002 L 462 95.00002 L 312 95.00002 L 312 67.50002 C 312 46.78932 295.21068 30 274.5 30 L 274.5 0 Z",
        rect: { x: 0, y: 0 },
      };
    case "bottomLeft":
      return {
        offsetLeft: 0,
        offsetTop: 0,
        path: "M 75 95 C 33.578644 95 0 61.42138 0 19.99998 L 0 0 L 150 0 L 150 27.5 C 150 48.2107 166.78932 64.99998 187.5 64.99998 L 187.5 95 Z",
        rect: { x: 187, y: 65 },
      };
    case "bottomRight":
      return {
        offsetLeft: -312,
        offsetTop: 0,
        path: "M 387 95 C 428.421356 95 462 61.42138 462 19.99998 L 462 0 L 312 0 L 312 27.5 C 312 48.2107 295.21068 64.99998 274.5 64.99998 L 274.5 95 Z",
        rect: { x: 0, y: 65 },
      };
  }
}

export default Elbow;
