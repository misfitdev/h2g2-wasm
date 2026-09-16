# Agent Guide

Guidance for AI coding agents (and anyone else picking this up cold) working
in the h2g2 repo. `CLAUDE.md` points Claude Code here; other agents should
read this file directly.

## What this is

A web adaptation of Hitchhiker's Guide to the Galaxy: a Rust/WASM z-machine
engine (`encrusted/`, `wasm/`) driving a React/Vite terminal UI (`apps/web/`)
styled as an authentic VT220 terminal. See `docs/ARCHITECTURE.md` for the
system design, `docs/PRODUCT.md` for product/audience, `docs/DESIGN.md` for
the visual system, `docs/TEST_PLAN.md` for testing strategy.

## Repo layout

```
Cargo.toml       # workspace root (encrusted, wasm)
encrusted/       # z-machine engine, vendored fork — see encrusted/README.md
wasm/            # wasm-bindgen cdylib bridging encrusted -> the browser
apps/web/        # React + Vite terminal UI
docs/            # architecture, design, product, test-plan docs
justfile         # task runner — run `just` to list recipes
mise.toml        # pinned toolchain (node, rust, wasm-bindgen-cli)
```

## Toolchain and tasks

Versions are pinned by `mise` (`mise.toml`); tasks are defined in the root
`justfile`. Use `just <recipe>` rather than invoking `cargo`/`npm` directly —
the recipes handle the wasm build -> bindgen -> web build ordering that raw
`npm run build` can't do on its own.

- `just setup` — provision the toolchain and install web deps
- `just dev` — web dev server
- `just build` — full production build (wasm -> bindings -> web UI)
- `just test` — Rust tests + web tests
- `just lint` — eslint
- `just clean` — remove build artifacts and caches

## Task tracking

This repo uses `bd` (beads) as the system of record for work items — not
TodoWrite, not markdown checklists. Before starting non-trivial work: `bd
ready` to find open work, `bd update <id> --claim` to claim it, `bd close
<id>` when done. Create an issue before writing code if one doesn't already
exist for the task. `bd prime` runs automatically at session start via hooks
and surfaces persistent memories — read that output.

## Code style

- JS/TS: named exports only (no default exports), `const`-by-default (no
  `var`), strict `===`/`!==`, semicolons required, 2-space indent.
- TS: avoid `any` (prefer `unknown`), avoid type assertions and non-null
  `!`, use the `private` modifier (not `#private`), no namespaces.
- HTML/CSS: lowercase, 2-space indent, semantic HTML, separation of
  concerns.
- Engine code (`encrusted/`, `wasm/`) follows idiomatic Rust; the web app
  follows idiomatic React/TS.
- New features ship with tests — this project's baseline is "automated
  confidence," not manual verification.

## Product and tone

User-facing copy (errors, help text, UI strings, in-repo docs meant for
players) should be playful and Adamsesque — witty, slightly absurd,
Douglas-Adams-style. "Don't Panic" is the guiding maxim for error/help/
loading states.

The UI is retro-modern: it leans hard into an authentic VT220 look. Modern
React components (modals, tooltips, etc.) are fine, but must be styled with
custom CSS (glow, scanlines, mono fonts) to blend into the terminal — when in
doubt, favor the retro feel over standard modern UI conventions. ASCII art
and any audio assets must stay within the phosphor-green/amber palette and
mono-spaced constraints. Glass TTY VT220 (the terminal font) has no
box-drawing glyphs — geometric/box characters fall back to a different cell
width, so ASCII art must use plain ASCII, not box-drawing Unicode.

## Testing

- Rust: `just test-rust` (or `cargo test -p encrusted` from the workspace
  root).
- Web: `just test-web` (vitest).
- Both: `just test`.
- New features require test coverage before being considered done.
