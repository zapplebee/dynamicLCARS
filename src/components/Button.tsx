import type { CSSProperties, ReactNode } from "react";
import {
  BUTTON_COLORS,
  LABEL_BOTTOM,
  LABEL_FONT_SIZE,
  LABEL_RIGHT,
  LABEL_SCALE_X,
} from "../theme";
import type { ButtonColor, ButtonShape } from "../types";

type ButtonProps = {
  shape: ButtonShape;
  color: ButtonColor;
  gridWidth?: number;
  gridHeight?: number;
  active?: boolean;
  children?: ReactNode;
};

function Button({
  shape,
  color,
  gridWidth = 1,
  gridHeight = 1,
  active = false,
  children,
}: ButtonProps) {
  const tone = active ? BUTTON_COLORS.color7 : BUTTON_COLORS[color];
  const className = `lcars-button ${shape === "rounded" ? "lcars-button--rounded" : "lcars-button--rect"}`;
  const style: CSSProperties = {
    gridColumn: `span ${gridWidth}`,
    gridRow: `span ${gridHeight}`,
    backgroundColor: tone,
    fontSize: `${LABEL_FONT_SIZE}px`,
  };

  return (
    <div className={className} style={style}>
      {children ? (
        <span
          className="lcars-button__label"
          style={{
            right: `${LABEL_RIGHT[shape]}px`,
            bottom: `${LABEL_BOTTOM}px`,
            transform: `scaleX(${LABEL_SCALE_X})`,
          }}
        >
          {children}
        </span>
      ) : null}
    </div>
  );
}

export default Button;
