const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  INITIAL_SECONDS,
  clamp,
  stabilityFor,
  bandFor,
  stateFor,
  signalFor
} = require("../prototype/mechanics.js");

test("v0.3 mechanics exports the intended initial Seconds value", () => {
  assert.equal(INITIAL_SECONDS, 300);
});

test("stability is bounded and monotonic across the playable range", () => {
  assert.equal(stabilityFor(0), 0);
  assert.equal(stabilityFor(INITIAL_SECONDS), 100);
  assert.equal(stabilityFor(INITIAL_SECONDS + 100), 100);

  let previous = stabilityFor(0);
  for (let seconds = 1; seconds <= INITIAL_SECONDS; seconds += 1) {
    const current = stabilityFor(seconds);
    assert.ok(current >= previous, `stability decreased at ${seconds}s`);
    assert.ok(current >= 0 && current <= 100);
    previous = current;
  }
});

test("experimental band thresholds are exact at every boundary", () => {
  const cases = [
    [-1, "zero"],
    [0, "zero"],
    [1, "boundary"],
    [30, "boundary"],
    [31, "critical"],
    [75, "critical"],
    [76, "unstable"],
    [150, "unstable"],
    [151, "stable"],
    [300, "stable"]
  ];

  for (const [seconds, expected] of cases) {
    assert.equal(bandFor(seconds), expected, `${seconds}s should be ${expected}`);
  }
});

test("zero remains intentionally unresolved rather than inventing death or teleport", () => {
  assert.deepEqual(stateFor("zero"), [
    "UNRESOLVED",
    "No canonical outcome. The local simulation can no longer describe your state with confidence."
  ]);
  assert.match(signalFor("zero"), /Outcome intentionally unresolved in v0\.3/);
});

test("clamp protects Seconds reductions from leaving the allowed interval", () => {
  assert.equal(clamp(-50, 0, INITIAL_SECONDS), 0);
  assert.equal(clamp(125, 0, INITIAL_SECONDS), 125);
  assert.equal(clamp(999, 0, INITIAL_SECONDS), INITIAL_SECONDS);
});

test("browser loads the tested mechanics module before app.js", () => {
  const html = fs.readFileSync(path.resolve(__dirname, "../prototype/index.html"), "utf8");
  const mechanicsIndex = html.indexOf('<script src="mechanics.js"></script>');
  const appIndex = html.indexOf('<script src="app.js"></script>');

  assert.ok(mechanicsIndex >= 0, "mechanics.js script tag missing");
  assert.ok(appIndex > mechanicsIndex, "app.js must load after mechanics.js");
});
