import type { ButtonColor, ButtonShape } from "./types";

export const STAGE_WIDTH = 1245;
export const STAGE_HEIGHT = 655;
export const STAGE_INSET = 5;
export const CELL_WIDTH = 150;
export const CELL_HEIGHT = 60;
export const CELL_GAP = 5;

export const BUTTON_COLORS: Record<ButtonColor, string> = {
  color1: "#9999cc",
  color2: "#9999ff",
  color3: "#cc99cc",
  color4: "#cc6699",
  color5: "#cc6666",
  color6: "#ff9966",
  color7: "#ff9900",
  color8: "#ffcc66",
};

export const LABEL_FONT_SIZE = 31;
export const LABEL_BOTTOM = 5;
export const LABEL_SCALE_X = 1;
export const LABEL_RIGHT: Record<ButtonShape, number> = {
  rect: 5,
  rounded: 30,
};

export const ELBOW_WIDTH = 462;
export const ELBOW_HEIGHT = 95;
