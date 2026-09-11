# encrusted (h2g2 fork)

> **Fork notice.** This is a vendored, modified copy of [DeMille/encrusted](https://github.com/demille/encrusted)
> (a z-machine interpreter for Infocom-era games; upstream frozen at 2019-02-24).
> In this repo it is used **only as a Rust library** by the workspace `wasm/`
> crate, which compiles it to WebAssembly for the `apps/web` terminal UI. It has
> diverged substantially from upstream for our needs; see the summary below.

## Our changes vs upstream

- **Library only, no terminal binary.** Removed the terminal entrypoints
  (`main.terminal.rs`, `main.web.rs`), the terminal UI (`ui_terminal.rs`), the
  interactive `run` loop, and the entire interactive debugger/cheat command
  family (`debug_*`, `handle_debug_command`, `is_debug_command`,
  `print_command_help`). The crate now exposes `[lib]` only.
- **WASM bridge via wasm-bindgen.** The engine is consumed by the workspace
  `wasm/` crate through `wasm-bindgen` (upstream used `wasm-ffi`). `ui_web.rs`
  was adapted to emit tokens/HTML for the React terminal (`js_message`,
  ASCII-art output path).
- **Embedded game.** `game.rs` embeds the Hitchhiker's Guide story file
  (`h2g2.z3`) via `include_bytes!`; the engine is built around that one game
  rather than loading an arbitrary file.
- **Invisiclues hint system.** `hints.rs` + `data/invisiclues.json` add the
  original ~1,800-hint progressive Invisiclues, surfaced through the UI.
- **ASCII art.** `ascii_art.rs` + a `print_ascii_art` UI path render per-room
  ASCII art.
- **Save-state security.** `save_security.rs` (`get_save_state`,
  `derive_secret_key`) wraps Quetzal base64 saves with an integrity header so
  tampered/foreign save blobs are rejected.
- **Modernized engine.** Clippy/idiom fixes across the shared files
  (e.g. dropped `Box<Object>` indirection, `to_string` renamed to
  `to_display_string`).
- **Removed upstream's bundled web playground** (its React 16 / d3 / redux app
  and npm package); the real frontend lives in `apps/web`.

## About

A z-machine interpreter for Infocom-era text adventure games, written in Rust
and compiled to WebAssembly (`wasm32-unknown-unknown`).

## Build & test

This crate is part of the h2g2 workspace and is not built standalone. From the
repo root (tooling is provisioned by `mise`):

```sh
just build      # builds the wasm/ crate (which depends on this) and the web app
just test-rust  # runs this crate's tests
```

Or directly: `cargo test` in this directory.

## Notes

- Only supports v3 zcode files.
- Saves in the Quetzal format (wrapped with our integrity header; see
  `save_security.rs`).

## License

MIT, per upstream [DeMille/encrusted](https://github.com/demille/encrusted).
