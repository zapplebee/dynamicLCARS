import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import YAML from "yaml";

const pipeline = YAML.parse(readFileSync(new URL("../.vela.yml", import.meta.url), "utf8"));

function getStep(name) {
  const step = pipeline.steps.find((entry) => entry.name === name);
  assert.ok(step, `expected step '${name}' to exist`);
  return step;
}

test("cypress only runs for PRs and main pushes", () => {
  const waitStep = getStep("wait-for-services");
  const cypressStep = getStep("cypress");

  assert.deepEqual(waitStep.ruleset?.event, ["push", "pull_request"]);
  assert.deepEqual(waitStep.ruleset?.branch, ["main"]);

  assert.deepEqual(cypressStep.ruleset?.event, ["push", "pull_request"]);
  assert.deepEqual(cypressStep.ruleset?.branch, ["main"]);
});

test("publish push only runs from main", () => {
  const publishStep = getStep("publish-push");

  assert.equal(publishStep.ruleset?.event, "push");
  assert.equal(publishStep.ruleset?.branch, "main");
});

test("validate ci config step runs before branch-specific validation", () => {
  const validateStep = getStep("validate-ci-config");

  assert.match(validateStep.commands[0], /npm run test:ci-config/);
});
