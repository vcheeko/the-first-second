const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const mechanics = require("../prototype/mechanics.js");

class FakeElement {
  constructor(id = "") {
    this.id = id;
    this.textContent = "";
    this.style = {};
    this.className = "";
    this.children = [];
    this.listeners = new Map();
    this.classList = {
      add: (...names) => {
        const current = new Set(this.className.split(/\s+/).filter(Boolean));
        for (const name of names) current.add(name);
        this.className = [...current].join(" ");
      }
    };
  }

  addEventListener(name, handler) {
    this.listeners.set(name, handler);
  }

  prepend(child) {
    this.children.unshift(child);
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
  }

  get lastChild() {
    return this.children.at(-1) ?? null;
  }

  set innerHTML(value) {
    if (value === "") this.children = [];
  }
}

function createHarness() {
  const ids = [
    "masterTime",
    "playerSeconds",
    "stability",
    "stabilityBar",
    "state",
    "stateDescription",
    "boundaryStatus",
    "field",
    "signal",
    "log",
    "minus10",
    "minus50",
    "pause",
    "reset"
  ];

  const elements = Object.fromEntries(ids.map((id) => [id, new FakeElement(id)]));
  const intervals = [];

  const document = {
    getElementById(id) {
      return elements[id] ?? null;
    },
    createElement() {
      return new FakeElement();
    }
  };

  const window = {
    FirstSecondMechanics: mechanics,
    setInterval(handler, milliseconds) {
      intervals.push({ handler, milliseconds });
      return intervals.length;
    }
  };

  return { elements, intervals, document, window };
}

test("browser prototype initializes from the same tested mechanics module", () => {
  const harness = createHarness();
  const source = fs.readFileSync(path.resolve(__dirname, "../prototype/app.js"), "utf8");

  vm.runInNewContext(source, {
    window: harness.window,
    document: harness.document,
    console
  });

  assert.equal(harness.elements.masterTime.textContent, "1 s");
  assert.equal(harness.elements.playerSeconds.textContent, "300 s");
  assert.equal(harness.elements.stability.textContent, "100%");
  assert.equal(harness.elements.state.textContent, "PHYSICAL");
  assert.equal(harness.elements.pause.textContent, "PAUSE");
  assert.equal(harness.elements.log.children.length, 1);
  assert.equal(harness.intervals.length, 1);
  assert.equal(harness.intervals[0].milliseconds, 1000);
});

test("prototype controls use bounded mechanics and update rendered state", () => {
  const harness = createHarness();
  const source = fs.readFileSync(path.resolve(__dirname, "../prototype/app.js"), "utf8");

  vm.runInNewContext(source, {
    window: harness.window,
    document: harness.document,
    console
  });

  const minus50 = harness.elements.minus50.listeners.get("click");
  const pause = harness.elements.pause.listeners.get("click");
  const reset = harness.elements.reset.listeners.get("click");

  assert.equal(typeof minus50, "function");
  assert.equal(typeof pause, "function");
  assert.equal(typeof reset, "function");

  for (let i = 0; i < 10; i += 1) minus50();
  assert.equal(harness.elements.playerSeconds.textContent, "0 s");
  assert.equal(harness.elements.state.textContent, "UNRESOLVED");
  assert.match(harness.elements.signal.textContent, /Outcome intentionally unresolved in v0\.3/);

  pause();
  assert.equal(harness.elements.pause.textContent, "RESUME");

  reset();
  assert.equal(harness.elements.playerSeconds.textContent, "300 s");
  assert.equal(harness.elements.state.textContent, "PHYSICAL");
  assert.equal(harness.elements.pause.textContent, "PAUSE");
});
