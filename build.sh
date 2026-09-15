#!/usr/bin/env bash
# Production build entrypoint (used by `npm run build` and Cloudflare Pages).
# Toolchain is provisioned by mise (see mise.toml); the build steps live in the
# justfile. This shim keeps the existing `bash ./build.sh` contract working.
set -euo pipefail
cd "$(dirname "$0")"

# Cloudflare Pages builders ship only node/npm, so bootstrap mise before asking
# it for the rest of the toolchain (just, node, rust, wasm-bindgen).
if ! command -v mise >/dev/null 2>&1; then
    curl -fsSL https://mise.run | sh
    export PATH="$HOME/.local/bin:$PATH"
fi

eval "$(mise activate bash --shims)"
mise install

# rustup targets are outside mise's remit.
rustup target add wasm32-unknown-unknown

exec just build
