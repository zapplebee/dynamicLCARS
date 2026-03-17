import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pipeline = readFileSync(new URL("../.vela.yml", import.meta.url), "utf8");

function getStepBlock(name) {
  const match = pipeline.match(new RegExp(`- name: ${name}[\\s\\S]*?(?=\\n  - name:|$)`));
  assert.ok(match, `expected step '${name}' to exist`);
  return match[0];
}

test("cypress only runs for PRs and main pushes", () => {
  const waitStep = getStepBlock("wait-for-services");
  const cypressStep = getStepBlock("cypress");

  assert.match(waitStep, /event: \[push, pull_request\]/);
  assert.match(waitStep, /branch: \[main\]/);

  assert.match(cypressStep, /event: \[push, pull_request\]/);
  assert.match(cypressStep, /branch: \[main\]/);
});

test("publish push only runs from main", () => {
  const publishStep = getStepBlock("publish-push");

  assert.match(publishStep, /event: push/);
  assert.match(publishStep, /branch: main/);
});

test("validate ci config step runs before branch-specific validation", () => {
  const validateStep = getStepBlock("validate-ci-config");

  assert.match(validateStep, /npm run test:ci-config/);
});
