import { useEffect, useMemo, useState } from "react";
import { COLORS, constantControls, layoutItems, screens } from "./lcarsData";

const WIDTH = 1245;
const HEIGHT = 655;
const INNER_WIDTH = 1235;
const INNER_HEIGHT = 645;
const GRID_X = 155;
const GRID_Y = 65;
const DEFAULT_SCREEN = "home";
const SEARCH = new URLSearchParams(window.location.search);
const MODE = SEARCH.get("mode");

function readHash() {
  const screen = window.location.hash.replace(/^#/, "").toLowerCase();
  return screen in screens ? screen : DEFAULT_SCREEN;
}

function getColor(className) {
  const colorClass = className.split(" ").find((name) => name in COLORS);
  return colorClass ? COLORS[colorClass] : COLORS.LCARS_color8;
}

function getTranslate(col = 1, row = 1) {
  return {
    x: (col - 1) * GRID_X,
    y: (row - 1) * GRID_Y,
  };
}

function readTuneNumber(name, fallback) {
  const value = SEARCH.get(name);
  if (value === null) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const DEFAULT_TUNE = {
  fontSize: 31,
  bottom: 5,
  scaleX: 1,
  rectRight: 5,
  roundedRight: 30,
};

const TUNER_SAMPLES = [
  { label: "HOME", shape: "rect", color: COLORS.LCARS_color7, width: 305, height: 60 },
  { label: "BRIEFING", shape: "rect", color: COLORS.LCARS_color3, width: 150, height: 60 },
  { label: "ABOUT", shape: "rect", color: COLORS.LCARS_color3, width: 150, height: 125 },
  { label: "COMMAND 6", shape: "rect", color: COLORS.LCARS_color6, width: 150, height: 60 },
  { label: "ROTATE", shape: "rounded", color: COLORS.LCARS_color3, width: 150, height: 60 },
  { label: "LOCK", shape: "rounded", color: COLORS.LCARS_color6, width: 460, height: 60 },
  { label: "COL 4", shape: "rounded", color: COLORS.LCARS_color4, width: 150, height: 255 },
  { label: "COL 1", shape: "rounded", color: COLORS.LCARS_color1, width: 150, height: 60 },
];

function App() {
  if (MODE === "tuner") {
    return <FontTuner />;
  }

  const [activeScreen, setActiveScreen] = useState(() => readHash());
  const [openButtons, setOpenButtons] = useState(() => new Set(["nav:home"]));

  useEffect(() => {
    const onHashChange = () => {
      const screen = readHash();
      setActiveScreen(screen);
      setOpenButtons(new Set([`nav:${screen}`]));
    };

    window.addEventListener("hashchange", onHashChange);
    if (!window.location.hash) {
      window.location.hash = DEFAULT_SCREEN;
    }

    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const screenItems = useMemo(() => screens[activeScreen] ?? [], [activeScreen]);

  const handleNavClick = (screenId) => {
    setOpenButtons(new Set([`nav:${screenId}`]));
    window.location.hash = screenId;
  };

  const handleScreenButtonClick = (key) => {
    setOpenButtons((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <main className="lcars-shell">
      <div className="lcars-stage">
        <svg className="lcars-overlay" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true">
          <g transform="translate(5 5)">
            {layoutItems.map((item, index) => (
              <Elbow key={`layout-${index}`} item={item} />
            ))}
          </g>
        </svg>
        <div className="lcars-grid" aria-label="LCARS Control Panel">
          {constantControls.map((item) => (
            <GridButton
              key={item.id}
              item={item}
              isOpen={openButtons.has(`nav:${item.id}`)}
              onClick={() => handleNavClick(item.id)}
            />
          ))}

          {screenItems.map((item, index) => (
            <GridButton
              key={`${activeScreen}-${index}`}
              item={item}
              isOpen={openButtons.has(`${activeScreen}:${index}`)}
              onClick={item.expandCols !== undefined || item.expandRows !== undefined ? () => handleScreenButtonClick(`${activeScreen}:${index}`) : undefined}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function FontTuner() {
  const tune = {
    fontSize: readTuneNumber("fontSize", DEFAULT_TUNE.fontSize),
    bottom: readTuneNumber("bottom", DEFAULT_TUNE.bottom),
    scaleX: readTuneNumber("scaleX", DEFAULT_TUNE.scaleX),
    rectRight: readTuneNumber("rectRight", DEFAULT_TUNE.rectRight),
    roundedRight: readTuneNumber("roundedRight", DEFAULT_TUNE.roundedRight),
  };

  return (
    <main
      className="font-tuner"
      style={{
        "--tune-font-size": `${tune.fontSize}px`,
        "--tune-bottom": `${tune.bottom}px`,
        "--tune-scale-x": tune.scaleX,
        "--tune-rect-right": `${tune.rectRight}px`,
        "--tune-rounded-right": `${tune.roundedRight}px`,
      }}
    >
      <section className="font-tuner__strip font-tuner__strip--reference" data-strip="reference">
        {TUNER_SAMPLES.map((sample) => (
          <div key={`ref-${sample.label}-${sample.width}`} className="font-tuner__sample">
            <LegacyReference sample={sample} />
          </div>
        ))}
      </section>
      <section className="font-tuner__strip font-tuner__strip--candidate" data-strip="candidate">
        {TUNER_SAMPLES.map((sample) => (
          <div key={`dom-${sample.label}-${sample.width}`} className="font-tuner__sample">
            <DomSample sample={sample} />
          </div>
        ))}
      </section>
    </main>
  );
}

function DomSample({ sample }) {
  return (
    <div
      className={`lcars-button lcars-button--tuner ${sample.shape === "rounded" ? "lcars-button--rounded" : "lcars-button--rect"}`}
      style={{
        "--button-color": sample.color,
        width: `${sample.width}px`,
        height: `${sample.height}px`,
      }}
    >
      <span className="lcars-button__label">{sample.label}</span>
    </div>
  );
}

function LegacyReference({ sample }) {
  const viewWidth = sample.width + 20;
  const viewHeight = sample.height + 20;

  return (
    <svg
      className="font-tuner__svg"
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      width={viewWidth}
      height={viewHeight}
      aria-hidden="true"
    >
      <g transform="translate(10 10)">
        {sample.shape === "rounded" ? (
          <LegacyRounded sample={sample} />
        ) : (
          <LegacyRect sample={sample} />
        )}
      </g>
    </svg>
  );
}

function LegacyRect({ sample }) {
  return (
    <g>
      <rect width={sample.width} height={sample.height} fill={sample.color} />
      <text
        x={sample.width - 5}
        y={sample.height - 5}
        fill="black"
        fontFamily="lcarsregular"
        fontSize="32"
        textAnchor="end"
      >
        {sample.label}
      </text>
    </g>
  );
}

function LegacyRounded({ sample }) {
  const rightCapOffset = sample.width - 150;
  const labelOffset = sample.width - 150;

  return (
    <g>
      <path
        fill={sample.color}
        d="M 30 0 C 13.431458 0 0 13.431458 0 30 C 0 46.568542 13.431458 60 30 60 L 120 60 C 136.56854 60 150 46.568542 150 30 C 150 13.431458 136.56854 0 120 0 L 30 0 z"
      />
      {rightCapOffset > 0 ? (
        <>
          <rect x="75" y="0" width={rightCapOffset} height={sample.height} fill={sample.color} />
          <path
            fill={sample.color}
            transform={`translate(${rightCapOffset} 0)`}
            d="M 30 0 C 13.431458 0 0 13.431458 0 30 C 0 46.568542 13.431458 60 30 60 L 120 60 C 136.56854 60 150 46.568542 150 30 C 150 13.431458 136.56854 0 120 0 L 30 0 z"
          />
        </>
      ) : null}
      <text
        x={120 + labelOffset}
        y={sample.height - 5}
        fill="black"
        fontFamily="lcarsregular"
        fontSize="32"
        textAnchor="end"
      >
        {sample.label}
      </text>
    </g>
  );
}

function GridButton({ item, isOpen, onClick }) {
  const interactive = typeof onClick === "function";
  const tone = isOpen ? COLORS.LCARS_color7 : getColor(item.className);
  const expandCols = isOpen ? (item.expandCols ?? 0) : 0;
  const expandRows = isOpen ? (item.expandRows ?? 0) : 0;
  const width = 150 + (GRID_X * expandCols);
  const height = (60 * item.height) + (5 * (item.height - 1)) + (GRID_Y * expandRows);
  const isAbsolute = item.row % 1 !== 0 || item.height % 1 !== 0;
  const className = [
    "lcars-button",
    item.shape === "rounded" ? "lcars-button--rounded" : "lcars-button--rect",
    interactive ? "lcars-button--interactive" : "",
    isAbsolute ? "lcars-button--absolute" : "",
    isOpen ? "is-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const style = !isAbsolute
    ? {
        "--button-color": tone,
        gridColumn: `${item.col} / span 1`,
        gridRow: `${item.row} / span ${item.height}`,
        width: `${width}px`,
        height: `${height}px`,
      }
    : {
        "--button-color": tone,
        left: `${((item.col ?? 1) - 1) * GRID_X}px`,
        top: `${((item.row ?? 1) - 1) * GRID_Y}px`,
        width: `${width}px`,
        height: `${height}px`,
      };

  const Tag = interactive ? "button" : "div";

  return (
    <Tag className={className} onClick={onClick} style={style} type={interactive ? "button" : undefined}>
      {item.label ? <span className="lcars-button__label">{item.label}</span> : null}
    </Tag>
  );
}

function Elbow({ item }) {
  let x = (item.col - 1) * GRID_X;
  const y = ((item.row - 1) * GRID_Y) + 30;
  let scaleX = 1;
  let scaleY = 1;

  if (item.shape === "elbow_bottom_right" || item.shape === "elbow_top_right") {
    x -= 5;
    scaleX = -1;
  }

  if (item.shape === "elbow_bottom_left" || item.shape === "elbow_bottom_right") {
    scaleY = -1;
  }

  return (
    <g transform={`translate(${x} ${y}) scale(${scaleX} ${scaleY})`}>
      <path
        fill={getColor(item.className)}
        d="m 75,0 c -41.421356,0 -75,33.57864 -75,75.00002 l 0,20 150,0 0,-27.5 c 0,-20.7107 16.78932,-37.50002 37.5,-37.50002 l 0,-30 z"
      />
      <rect width="275" height="30" x="187" y="0" fill={getColor(item.className)} />
    </g>
  );
}

export default App;
