# H2G2 WASM Game - Test Strategy

## Overview

This document describes the current automated test suite for the Hitchhiker's Guide to the Galaxy WASM game implementation: what exists, where it lives, and how to run it.

## Current State

- **Game Engine**: Rust-based Z-machine emulator compiled to WASM
- **UI**: React terminal interface with semantic colors
- **Features**: Game loop, save/load, hint system, ASCII art
- **Test Coverage**: 27 Rust tests (`cargo test -p encrusted`) and 125 web tests across 9 files (`npm test -- --run`), all passing

## Rust Tests (`encrusted/`)

Run from the repo root:

```bash
cargo test -p encrusted
```

- `src/lib.rs` — 4 unit tests
- `tests/common/mod.rs` — shared test harness: `MockUI`, `CaptureUI`/`CaptureUIState` for capturing game output in tests
- `tests/game_initialization.rs` — 3 tests: game creation, step execution, and command feed sequences don't panic
- `tests/hint_system.rs` — 3 tests: hint JSON loads correctly, hints match known locations, unknown locations handled gracefully
- `tests/save_load.rs` — 8 tests: save produces valid/distinct data, save data has expected security header, restore with valid/invalid data, full save/restore round-trip preserves state
- `tests/ui_output.rs` — 9 tests: output capture, flush/clear/reset behavior, status bar and output accumulate correctly across gameplay steps

## Web Tests (`apps/web/tests/`)

Run from `apps/web/`:

```bash
npm test -- --run
```

Config: `apps/web/vitest.config.ts` (jsdom environment, setup file `tests/setup.ts`).

- `GuidePane.test.tsx` — location normalization, guide entry lookup, cross-references, word-bounded alias matching, flicker behavior
- `HintModal.test.tsx` — modal rendering and hint interaction
- `SaveLoadDialog.test.tsx` — save mode, load mode, slot management, accessibility, close behavior
- `ScoreMeter.test.tsx` — rendering with and without a score
- `Splash.test.tsx` — splash screen art data and rendering
- `TerminalControls.test.tsx` — terminal control behavior
- `guideLinks.test.ts` — guide cross-reference logic
- `scoreMeter.test.ts` — `renderBar` and `milestonesCrossed` logic
- `timeline.test.ts` — timeline and improbability logic
- `setup.ts` — shared test setup (not a test file)

## Accessibility

`jest-axe` is listed in `apps/web/package.json` as a dependency but is not wired into any test — no test currently imports or invokes `axe`. Accessibility coverage today comes from targeted assertions in component tests (e.g. the `SaveLoadDialog.test.tsx` "Accessibility" block), not from automated WCAG scanning. Wiring up `jest-axe` remains a gap if broader automated a11y coverage is wanted.

## Coverage Gaps / Future Work

- No automated `axe-core`/`jest-axe` accessibility scanning (dependency present, unused)
- No end-to-end tests covering full user flows (load → play → save → hint → continue)
- No WASM FFI boundary tests from the TypeScript side (e.g. `apps/web` calling into invalid WASM state)
- No memory/performance benchmarks

## Continuous Integration

```yaml
test:
  - cargo test -p encrusted
  - npm test -- --run
  - npm run lint
  - npm run build
```

---

**Status**: Test suite implemented and passing (27 Rust tests, 125 web tests)
**Owner**: Development team
