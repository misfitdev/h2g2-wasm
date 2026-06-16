# H2G2: Hitchhiker's Guide to the Galaxy - Terminal Game

A web-based adaptation of the classic Hitchhiker's Guide to the Galaxy text adventure game. The game logic is implemented in Rust and compiled to WebAssembly for browser execution, while the user interface is a retro terminal emulator built with React and custom CSS.

**Live**: https://h2g2-wasm.pages.dev/

## Project Structure

```
h2g2/
├── apps/web/              # React + Vite web application (terminal UI)
├── encrusted/            # Rust library (core game engine)
├── wasm/                 # WebAssembly build of the Rust library
├── build.sh              # Build entrypoint for Cloudflare Pages (delegates to `just build`)
├── wrangler.toml         # Cloudflare Pages configuration
├── mise.toml             # Toolchain + environment (Node, Rust, wasm-bindgen)
└── justfile              # Task runner (run `just` to list recipes)
```

## Prerequisites

Tools are pinned and provisioned by [mise](https://mise.jdx.dev). Install mise and
[just](https://github.com/casey/just), then run `just setup` to provision everything:

- **Node.js** 25.2.1 (pinned in `mise.toml`)
- **Rust** stable + `wasm32-unknown-unknown` target (pinned in `mise.toml`)
- **wasm-bindgen-cli** 0.2.106 (pinned in `mise.toml`)

## Setup & Development

### Quick Start

```bash
# Provision the toolchain (Node, Rust, wasm32 target, wasm-bindgen) and install web deps
just setup

# Start dev server (http://localhost:5173)
just dev
```

### Full Build (all components)

```bash
# Build wasm crate -> bindings -> web UI, output to apps/web/dist
just build
```

## Available Commands

Run `just` with no arguments to list every recipe. Common ones:

- `just setup` - Provision tools (via mise) and install web deps
- `just dev` - Start the web dev server
- `just build` - Full production build (wasm + bindings + web UI)
- `just test` - Run all tests (Rust + web)
- `just lint` - Lint the web app
- `just clean` - Remove build artifacts, caches, and dependencies

The recipes wrap the underlying tools below.

### Web Application (apps/web)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build (output: `dist/`)
- `npm run build:dev` - Create development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally
- `npm run test` - Run TypeScript tests (36 tests)
- `npm run test:ui` - Run tests with UI

### Rust Game Engine (encrusted)
- `cargo build --release` - Build release library
- `cargo test` - Run Rust tests (25 tests covering game logic, save/load, hints)
- `cargo clean` - Clean build artifacts

### WASM (wasm)
- `cargo build --target wasm32-unknown-unknown --release` - Build WebAssembly
- Uses wasm-bindgen to generate JS bindings automatically

## Technologies

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite 7** - Fast build tool
- **CSS Modules** - Scoped styling
- **Glass TTY VT220** - Retro terminal font
- **Custom CSS** - Terminal effects (scanlines, CRT glow, phosphor text)

### Backend
- **Rust** - Game engine and core logic
- **WebAssembly** - Browser-compatible binary format
- **wasm-bindgen** - JS ↔ WASM interop

### Tools & Infrastructure
- **mise** - Toolchain and environment manager (Node.js, Rust, wasm-bindgen)
- **just** - Task runner (see `justfile`)
- **Cloudflare Pages** - Deployment platform

## Key Features

### Game Engine
- Full Hitchhiker's Guide to the Galaxy gameplay
- Save/load game state
- Undo/redo support
- ASCII art for room descriptions

### UI
- Retro terminal aesthetic with authentic VT220 font
- Scanline effect and CRT glow
- Control bar (undo, redo, save, load, clear)
- Debug panel (shows location, git hash, WASM checksum)

### Hint System
- Semantic tagging with three levels:
  - **act:** story phase/area tags (earth_arthur, vogon_ship, dark, etc.)
  - **loc:** specific game locations (bedroom, porch, front_of_house, etc.)
  - **puz:** puzzle/topic tags for soft filtering
- Progressive hint levels (progressively more helpful)
- Easter egg smiley face (☺) to access meta/general hints
- ~1800 hints from original Infocom Invisiclues

## Testing

### TypeScript Tests (36 tests)
```bash
cd apps/web
npm run test
```
Tests cover:
- Terminal UI component behavior
- Hint modal interactions
- Save/load dialog functionality
- Control bar functionality

### Rust Tests (25 tests)
```bash
cd encrusted
cargo test --release
```
Tests cover:
- Game initialization and core logic
- Location and state management
- Save/load cycles
- Hint system scoring and matching
- UI output handling

## Deployment

### Cloudflare Pages

The project is configured to deploy to Cloudflare Pages automatically on git push.

**Configuration:**
- Build command: `bash ./build.sh` (provisions tools via mise, then runs `just build`)
- Build output: `apps/web/dist/`
- Tool versions: pinned in `mise.toml`

**Build process:**
1. `build.sh` provisions the toolchain via mise (if needed)
2. `just build` builds Rust → WebAssembly
3. Fixes WASM JS bindings for browser (sed post-processing)
4. Runs `npm install && npm run build` for web app
5. Output deployed to `apps/web/dist/`

**Files:**
- `wrangler.toml` - Cloudflare Pages config
- `package.json` - Root stub (satisfies pre-build dependency detection)
- `mise.toml` - Toolchain version pins

### Local Deployment Testing

```bash
# Build exactly as Cloudflare would
bash ./build.sh

# Serve the dist folder
just preview
```

## Development Workflow

### Making Changes

1. **Feature/fix**: Edit code in `apps/web/src/` or `encrusted/src/`
2. **Test locally**: `just dev` (web) or `just test-rust` (Rust)
3. **Build**: `just build`
4. **Commit**: `git add . && git commit -m "..."`
5. **Deploy**: Push to GitHub → Cloudflare Pages auto-deploys

### WASM Changes

If you modify Rust code, rebuild the bindings and web app:
```bash
just build

# Or just regenerate the wasm bindings
just bindgen
```

The `bindgen` recipe automatically:
- Runs `wasm-bindgen` to generate JS bindings
- Fixes the generated bindings for browser (replaces `'env'` import with `'../env-shim.js'`)
- Copies WASM binary to web public folder

## Architecture Notes

### WASM Interop
- `apps/web/src/env-shim.js` - Provides browser environment for WASM imports
- `apps/web/src/hooks/useWasm.ts` - React hook managing WASM lifecycle
- `apps/web/src/wasm/h2g2_wasm.js` - Auto-generated wasm-bindgen bindings (git-ignored)

### Hint System
- Rust implementation: `encrusted/src/rust/hints.rs`
- Tag-based scoring: soft filters for relevance, hard filters for must-match tags
- ~1800 hints stored in: `encrusted/data/invisiclues.json`
- React UI: `apps/web/src/components/HintModal.tsx`

### Game State
- Managed entirely in WASM (Rust)
- JavaScript calls Rust functions via WASM exports
- Rust sends messages back to JavaScript via `env-shim` bridge
- Save data encoded as base64 for portability

## License

See LICENSE file in the encrusted directory.
