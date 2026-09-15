#!/usr/bin/env bash
# Production build entrypoint (used by `npm run build` and Cloudflare Pages).
# Toolchain is provisioned by mise (see mise.toml); the build steps live in the
# justfile. This shim keeps the existing `bash ./build.sh` contract working.
set -euo pipefail
cd "$(dirname "$0")"

# Cloudflare Pages builders ship only node/npm, so bootstrap mise before asking
# it for the rest of the toolchain (just, node, rust, wasm-bindgen).
#
# Pinned and checksummed rather than `curl https://mise.run | sh`: that pipes
# mutable remote content straight into a shell, so whoever controls the script
# controls the build (CWE-494). Bump MISE_VERSION and MISE_SHA256 together.
MISE_VERSION="2026.9.8"
MISE_SHA256="ff182b17e78d2ae09b5ae3ff3c032eed061e6c2a6b2d4a03ce959d4d74c4b7dd"

if ! command -v mise >/dev/null 2>&1; then
    # Only the CI image is bootstrapped. Elsewhere, install mise yourself
    # rather than have this script fetch a binary for the wrong platform.
    if [ "$(uname -s)" != "Linux" ] || [ "$(uname -m)" != "x86_64" ]; then
        echo "build.sh: mise not found, and auto-install only covers linux-x64." >&2
        echo "Install mise (https://mise.jdx.dev) and re-run." >&2
        exit 1
    fi

    mise_bin="$(mktemp -d)/mise"
    curl -fsSL -o "$mise_bin" \
        "https://github.com/jdx/mise/releases/download/v${MISE_VERSION}/mise-v${MISE_VERSION}-linux-x64"

    if command -v sha256sum >/dev/null 2>&1; then
        echo "${MISE_SHA256}  ${mise_bin}" | sha256sum -c - >/dev/null
    else
        echo "${MISE_SHA256}  ${mise_bin}" | shasum -a 256 -c - >/dev/null
    fi

    chmod +x "$mise_bin"
    mkdir -p "$HOME/.local/bin"
    mv "$mise_bin" "$HOME/.local/bin/mise"
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
