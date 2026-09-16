# H2G2 Web

React + Vite terminal UI for the Hitchhiker's Guide to the Galaxy game. The
game engine runs as WebAssembly, compiled from the Rust crates at the repo
root (`encrusted/`, `wasm/`).

Run everything through the root [`justfile`](../../justfile) rather than
`npm` directly, since the WASM build has to run first:

```bash
just dev        # dev server with hot reload
just build      # full production build -> apps/web/dist
just test-web   # this app's vitest suite
just lint       # eslint
```

See the root [README.md](../../README.md) and [docs/](../../docs) for
project-wide setup and architecture.
