import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const root = "/home/zac/github.com/zapplebee/dynamicLCARS";
const screenshotPath = path.join(root, "font-search-shot.png");

const strip = {
  left: 80,
  top: 20,
  width: 1280,
  height: 340,
  gap: 24,
};

const initial = {
  fontSize: 34,
  bottom: -1,
  scaleX: 0.96,
  rectRight: 5,
  roundedRight: 30,
};

const searchSpec = {
  fontSize: { min: 30, max: 38, coarse: 1, fine: 0.25 },
  bottom: { min: -4, max: 4, coarse: 1, fine: 0.25 },
  scaleX: { min: 0.9, max: 1.02, coarse: 0.02, fine: 0.005 },
  rectRight: { min: 0, max: 12, coarse: 1, fine: 0.25 },
  roundedRight: { min: 20, max: 40, coarse: 1, fine: 0.25 },
};

async function screenshot(params) {
  const url = new URL("http://127.0.0.1:5173/");
  url.searchParams.set("mode", "tuner");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  await execFileAsync("firefox", [
    "--headless",
    "--screenshot",
    screenshotPath,
    "--window-size",
    "1440,900",
    url.toString(),
  ]);
}

async function score(params) {
  await screenshot(params);
  const image = sharp(screenshotPath);
  const referenceBuffer = await image
    .clone()
    .extract({
      left: strip.left,
      top: strip.top,
      width: strip.width,
      height: strip.height,
    })
    .raw()
    .toBuffer();

  const candidateBuffer = await image
    .clone()
    .extract({
      left: strip.left,
      top: strip.top + strip.height + strip.gap,
      width: strip.width,
      height: strip.height,
    })
    .raw()
    .toBuffer();

  let total = 0;
  for (let index = 0; index < referenceBuffer.length; index += 1) {
    total += Math.abs(referenceBuffer[index] - candidateBuffer[index]);
  }
  return total;
}

function roundTo(value, step) {
  return Math.round(value / step) * step;
}

function* range(min, max, step) {
  const epsilon = step / 10;
  for (let value = min; value <= max + epsilon; value += step) {
    yield Number(roundTo(value, step).toFixed(4));
  }
}

async function searchOne(name, current, step, radius) {
  const spec = searchSpec[name];
  const min = Math.max(spec.min, current[name] - radius);
  const max = Math.min(spec.max, current[name] + radius);
  let bestParams = current;
  let bestScore = await score(current);

  for (const value of range(min, max, step)) {
    const candidate = { ...current, [name]: value };
    const candidateScore = await score(candidate);
    if (candidateScore < bestScore) {
      bestScore = candidateScore;
      bestParams = candidate;
    }
  }

  return { params: bestParams, score: bestScore };
}

async function main() {
  let best = { ...initial };
  let bestScore = await score(best);
  console.log("initial", best, bestScore);

  for (const [name, spec] of Object.entries(searchSpec)) {
    const coarse = await searchOne(name, best, spec.coarse, spec.coarse * 4);
    best = coarse.params;
    bestScore = coarse.score;
    console.log("coarse", name, best[name], bestScore);
  }

  let improved = true;
  while (improved) {
    improved = false;
    for (const [name, spec] of Object.entries(searchSpec)) {
      const fine = await searchOne(name, best, spec.fine, spec.coarse);
      if (fine.score < bestScore) {
        best = fine.params;
        bestScore = fine.score;
        improved = true;
        console.log("fine", name, best[name], bestScore);
      }
    }
  }

  console.log("best", JSON.stringify(best), bestScore);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
