export const COLORS = {
  LCARS_color1: "#9999cc",
  LCARS_color2: "#9999ff",
  LCARS_color3: "#cc99cc",
  LCARS_color4: "#cc6699",
  LCARS_color5: "#cc6666",
  LCARS_color6: "#ff9966",
  LCARS_color7: "#ff9900",
  LCARS_color8: "#ffcc66",
};

export const layoutItems = [
  { shape: "elbow_bottom_left", className: "LCARS_color8 static", row: 10, col: 1, height: 1 },
  { shape: "elbow_bottom_right", className: "LCARS_color8 static", row: 10, col: 9, height: 1 },
  { shape: "elbow_top_right", className: "LCARS_color8 static", row: 1, col: 9, height: 1 },
  { shape: "elbow_top_left", className: "LCARS_color8 static", row: 1, col: 1, height: 1 },
];

export const constantControls = [
  { id: "home", label: "HOME", shape: "rect", className: "LCARS_color3 static mcontrol home", row: 3, col: 1, height: 1, expandCols: 1, expandRows: 0 },
  { id: "briefing", label: "BRIEFING", shape: "rect", className: "LCARS_color3 static mcontrol briefing", row: 4, col: 1, height: 1, expandCols: 1, expandRows: 0 },
  { id: "subspace", label: "SUBSPACE", shape: "rect", className: "LCARS_color3 static mcontrol subspace", row: 5, col: 1, height: 1, expandCols: 1, expandRows: 0 },
  { id: "officers", label: "OFFICERS", shape: "rect", className: "LCARS_color3 static mcontrol officers", row: 6, col: 1, height: 1, expandCols: 1, expandRows: 0 },
  { id: "about", label: "ABOUT", shape: "rect", className: "LCARS_color3 static mcontrol about", row: 7, col: 1, height: 2, expandCols: 1, expandRows: 0 },
];

export const screens = {
  home: [
    { label: "", shape: "rect", className: "LCARS_color8", row: 2.75, col: 8, height: 6.5 },
  ],
  briefing: [],
  subspace: [
    { label: "COMMAND 1", shape: "rect", className: "LCARS_color1", row: 3, col: 8, height: 1 },
    { label: "COMMAND 2", shape: "rect", className: "LCARS_color2", row: 4, col: 8, height: 1 },
    { label: "COMMAND 3", shape: "rect", className: "LCARS_color3", row: 5, col: 8, height: 1 },
    { label: "COMMAND 4", shape: "rect", className: "LCARS_color4", row: 6, col: 8, height: 1 },
    { label: "COMMAND 5", shape: "rect", className: "LCARS_color5", row: 7, col: 8, height: 1 },
    { label: "COMMAND 6", shape: "rect", className: "LCARS_color6", row: 8, col: 8, height: 1 },
    { label: "ROTATE", shape: "rounded", className: "LCARS_color3", row: 8, col: 4, height: 1 },
    { label: "ROTATE", shape: "rounded", className: "LCARS_color3", row: 8, col: 5, height: 1 },
    { label: "ROTATE", shape: "rounded", className: "LCARS_color3", row: 8, col: 6, height: 1 },
    { label: "ROTATE", shape: "rounded", className: "LCARS_color3", row: 8, col: 7, height: 1 },
    { label: "LOCK", shape: "rounded", className: "LCARS_color6", row: 9, col: 4, height: 1, expandCols: 3, expandRows: 0 },
    { label: "LOCK", shape: "rounded", className: "LCARS_color6", row: 9, col: 5, height: 1, expandCols: 2, expandRows: 0 },
    { label: "LOCK", shape: "rounded", className: "LCARS_color6", row: 9, col: 6, height: 1, expandCols: 1, expandRows: 0 },
    { label: "LOCK", shape: "rounded", className: "LCARS_color6", row: 9, col: 7, height: 1, expandCols: 0, expandRows: 0 },
    { label: "COL 1", shape: "rounded", className: "LCARS_color1", row: 2, col: 4, height: 1, expandCols: 0, expandRows: 0 },
    { label: "COL 2", shape: "rounded", className: "LCARS_color4", row: 2, col: 5, height: 1, expandCols: 0, expandRows: 1 },
    { label: "COL 3", shape: "rounded", className: "LCARS_color1", row: 2, col: 6, height: 1, expandCols: 0, expandRows: 2 },
    { label: "COL 4", shape: "rounded", className: "LCARS_color4", row: 2, col: 7, height: 1, expandCols: 0, expandRows: 3 },
  ],
  officers: [],
  about: [],
};
