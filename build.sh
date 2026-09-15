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

# Name the tools explicitly. A bare `mise install` also resolves configs in
# parent directories, and the Cloudflare image keeps an asdf-era
# $HOME/.tool-versions whose entries mise cannot resolve. Versions still come
# from mise.toml; keep this list in step with its [tools] table.
mise install just node rust cargo:wasm-bindgen-cli

# mise.toml declares the wasm32 target, but rust toolchains installed by other
# means may not have it.
if command -v rustup >/dev/null 2>&1; then
    rustup target add wasm32-unknown-unknown
fi

exec just build
