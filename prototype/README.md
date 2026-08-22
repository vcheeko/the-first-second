# Prototype v0.3 — First Playable Experiment

This browser prototype tests the first mechanically important idea in THE FIRST SECOND:

> **More seconds increase local stability. Fewer seconds expose the player to anomalies and possible simulation boundaries.**

## What is implemented

- master time beginning from the First Second reference;
- a separate player-seconds countdown;
- experimental stability calculation;
- physical, unstable, metaphase, and light/information presentation states;
- anomaly and boundary signals;
- observation log;
- `0 seconds` as an unresolved boundary condition rather than automatic game over;
- test controls to accelerate the experiment.

## Important

The thresholds (`150`, `75`, `30`, `0`) and the initial `300 seconds` are **experimental prototype values only**. They are not canonical balance decisions.

The canonical mechanic is defined in [`../SECONDS_SYSTEM.md`](../SECONDS_SYSTEM.md).

## Run locally

No build step or dependencies are required. Open `index.html` in a modern browser.

The prototype intentionally uses plain HTML, CSS, and JavaScript so the mechanics can be tested before choosing a final game engine or technical architecture.

Copyright © 2026 Miha Tavčar. All rights reserved.
