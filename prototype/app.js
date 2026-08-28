(() => {
  "use strict";

  const mechanics = window.FirstSecondMechanics;
  if (!mechanics) {
    throw new Error("FIRST_SECOND_MECHANICS_MISSING");
  }

  const {
    INITIAL_SECONDS,
    clamp,
    stabilityFor,
    bandFor,
    stateFor,
    signalFor
  } = mechanics;

  const els = {
    masterTime: document.getElementById("masterTime"),
    playerSeconds: document.getElementById("playerSeconds"),
    stability: document.getElementById("stability"),
    stabilityBar: document.getElementById("stabilityBar"),
    state: document.getElementById("state"),
    stateDescription: document.getElementById("stateDescription"),
    boundaryStatus: document.getElementById("boundaryStatus"),
    field: document.getElementById("field"),
    signal: document.getElementById("signal"),
    log: document.getElementById("log"),
    minus10: document.getElementById("minus10"),
    minus50: document.getElementById("minus50"),
    pause: document.getElementById("pause"),
    reset: document.getElementById("reset")
  };

  let masterTime = 1;
  let playerSeconds = INITIAL_SECONDS;
  let paused = false;
  let lastBand = "stable";
  let zeroLogged = false;

  function log(message) {
    const item = document.createElement("li");
    item.textContent = `[T+${masterTime}s] ${message}`;
    els.log.prepend(item);

    while (els.log.children.length > 8) {
      els.log.removeChild(els.log.lastChild);
    }
  }

  function render() {
    const stability = stabilityFor(playerSeconds);
    const band = bandFor(playerSeconds);
    const [state, description] = stateFor(band);

    els.masterTime.textContent = `${masterTime.toLocaleString()} s`;
    els.playerSeconds.textContent = `${playerSeconds.toLocaleString()} s`;
    els.stability.textContent = `${stability}%`;
    els.stabilityBar.style.width = `${stability}%`;
    els.state.textContent = state;
    els.stateDescription.textContent = description;
    els.signal.textContent = signalFor(band);

    els.field.className = "field";
    if (band !== "stable") els.field.classList.add("unstable");
    if (band === "critical") els.field.classList.add("critical", "metaphase");
    if (band === "boundary") els.field.classList.add("critical", "boundary", "light");
    if (band === "zero") els.field.classList.add("critical", "boundary", "metaphase");

    els.boundaryStatus.textContent = band === "stable"
      ? "BOUNDARY HIDDEN"
      : band === "unstable"
        ? "ANOMALY TRACE"
        : band === "critical"
          ? "BOUNDARY SIGNAL"
          : band === "boundary"
            ? "BOUNDARY VISIBLE"
            : "LOCAL MODEL FAILED";

    if (band !== lastBand) {
      const events = {
        unstable: "Local stability fell far enough for the first anomaly trace to appear.",
        critical: "Player identity entered a metaphase-compatible state.",
        boundary: "A possible cross-simulation boundary became observable.",
        zero: "Player seconds reached zero. No automatic death or teleport rule was applied.",
        stable: "Local reality restabilized."
      };
      log(events[band]);
      lastBand = band;
    }

    if (band === "zero" && !zeroLogged) {
      zeroLogged = true;
    }
  }

  function reduceSeconds(amount) {
    playerSeconds = clamp(playerSeconds - amount, 0, INITIAL_SECONDS);
    render();
  }

  function reset() {
    masterTime = 1;
    playerSeconds = INITIAL_SECONDS;
    paused = false;
    lastBand = "stable";
    zeroLogged = false;
    els.pause.textContent = "PAUSE";
    els.log.innerHTML = "";
    log("Simulation initialized at the foundational First Second reference.");
    render();
  }

  els.minus10.addEventListener("click", () => reduceSeconds(10));
  els.minus50.addEventListener("click", () => reduceSeconds(50));
  els.pause.addEventListener("click", () => {
    paused = !paused;
    els.pause.textContent = paused ? "RESUME" : "PAUSE";
    log(paused ? "Local countdown paused for observation." : "Local countdown resumed.");
  });
  els.reset.addEventListener("click", reset);

  window.setInterval(() => {
    masterTime += 1;
    if (!paused && playerSeconds > 0) {
      playerSeconds -= 1;
    }
    render();
  }, 1000);

  reset();
})();
