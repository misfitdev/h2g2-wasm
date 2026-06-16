#!/usr/bin/env bash
# Production build entrypoint (used by `npm run build` and Cloudflare Pages).
# Toolchain is provisioned by mise (see mise.toml); the build steps live in the
# justfile. This shim keeps the existing `bash ./build.sh` contract working.
set -euo pipefail
cd "$(dirname "$0")"

# Provision tools in a fresh CI environment (no-op locally if already active).
if command -v mise >/dev/null 2>&1; then
    eval "$(mise activate bash --shims)"
    mise install
fi

exec just build
