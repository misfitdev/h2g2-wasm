# h2g2 task runner. Toolchain + env are managed by mise (see mise.toml).

set shell := ["bash", "-euo", "pipefail", "-c"]

web := "apps/web"

# List available recipes
_default:
    @just --list

# Provision tools and the wasm32 target, then install web deps
setup:
    mise install
    rustup target add wasm32-unknown-unknown
    cd {{web}} && npm install

# Install web dependencies
install:
    cd {{web}} && npm install

# Build the wasm crate (release)
build-wasm:
    cargo build -p h2g2-wasm --target wasm32-unknown-unknown --release

# Generate JS bindings from the wasm build into the web app
bindgen: build-wasm
    wasm-bindgen target/wasm32-unknown-unknown/release/h2g2_wasm.wasm --out-dir {{web}}/src/wasm --target web
    # `env` imports do not resolve in the browser; point them at the shim.
    cd {{web}} && sed -i.bak "s|from 'env'|from '../env-shim.js'|g" src/wasm/h2g2_wasm.js && rm -f src/wasm/h2g2_wasm.js.bak
    cp {{web}}/src/wasm/h2g2_wasm_bg.wasm {{web}}/public/h2g2_wasm_bg.wasm

# Full production build (wasm + bindings + web UI) -> apps/web/dist
build: bindgen install
    cd {{web}} && npm run build

# Development build of the web UI
build-dev: bindgen install
    cd {{web}} && npm run build:dev

# Run the web dev server
dev: bindgen install
    cd {{web}} && npm run dev

# Preview the production build
preview: install
    cd {{web}} && npm run preview

# Lint the web app
lint: install
    cd {{web}} && npm run lint

# Run all tests (Rust + web)
test: test-rust test-web

# Run Rust tests (the wasm crate is a test-less browser-only cdylib)
test-rust:
    cargo test -p encrusted

# Run web tests
test-web: install
    cd {{web}} && npm test -- --run

# Remove build artifacts, caches, and dependencies
clean:
    rm -rf target {{web}}/node_modules {{web}}/dist
    rm -f Cargo.lock {{web}}/package-lock.json
