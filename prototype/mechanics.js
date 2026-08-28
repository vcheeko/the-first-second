(function attachFirstSecondMechanics(root, factory) {
  "use strict";

  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.FirstSecondMechanics = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  "use strict";

  const INITIAL_SECONDS = 300;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function stabilityFor(seconds) {
    if (seconds <= 0) return 0;
    const ratio = seconds / INITIAL_SECONDS;
    return Math.round(clamp(Math.pow(ratio, 0.72) * 100, 0, 100));
  }

  function bandFor(seconds) {
    // Experimental v0.3 thresholds only — not canonical game balance.
    if (seconds <= 0) return "zero";
    if (seconds <= 30) return "boundary";
    if (seconds <= 75) return "critical";
    if (seconds <= 150) return "unstable";
    return "stable";
  }

  function stateFor(band) {
    switch (band) {
      case "unstable":
        return ["PHYSICAL / UNSTABLE", "Matter remains coherent, but local rules begin to drift."];
      case "critical":
        return ["METAPHASE", "Identity is no longer fully represented by ordinary matter."];
      case "boundary":
        return ["LIGHT / INFORMATION", "Local physical form is weak. Cross-simulation structure becomes detectable."];
      case "zero":
        return ["UNRESOLVED", "No canonical outcome. The local simulation can no longer describe your state with confidence."];
      default:
        return ["PHYSICAL", "Matter is coherent. Local physics dominates perception."];
    }
  }

  function signalFor(band) {
    switch (band) {
      case "unstable":
        return "A contradiction appears at the edge of perception. The world still explains it away.";
      case "critical":
        return "Memory mismatch detected: an event is remembered before it occurs locally.";
      case "boundary":
        return "FOREIGN CLOCK DETECTED. Another simulation layer may be resolving nearby.";
      case "zero":
        return "0 SECONDS. Boundary state reached. Outcome intentionally unresolved in v0.3.";
      default:
        return "Reality is stable. No cross-simulation signal detected.";
    }
  }

  return Object.freeze({
    INITIAL_SECONDS,
    clamp,
    stabilityFor,
    bandFor,
    stateFor,
    signalFor
  });
});
