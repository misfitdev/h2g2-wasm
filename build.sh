#!/bin/bash
set -euo pipefail

echo "===================================="
echo "H2G2 Build Script"
echo "===================================="
echo ""

# Change to repo root (handle both normal runs and Cloudflare .cf/ build root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -d "$SCRIPT_DIR/.." ] && [ "$(basename "$SCRIPT_DIR")" = ".cf" ]; then
    # Running from .cf/ build root - go to parent
    REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else
    # Normal run from repo root
    REPO_ROOT="$SCRIPT_DIR"
fi
cd "$REPO_ROOT"
echo "Repository root: $REPO_ROOT"
echo ""

echo "Setting up asdf version manager..."
if ! command -v asdf >/dev/null 2>&1; then
    echo "Installing asdf..."
    git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.14.0
    export PATH="$HOME/.asdf/shims:$HOME/.asdf/bin:$PATH"
else
    export PATH="$HOME/.asdf/shims:$HOME/.asdf/bin:$PATH"
fi

echo "Adding asdf plugins..."
asdf plugin add moonrepo https://github.com/moonrepo/asdf-moonrepo.git 2>/dev/null || true
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git 2>/dev/null || true

# Use Cloudflare-specific .tool-versions if running from Cloudflare build, otherwise use root
TOOL_VERSIONS_FILE="$REPO_ROOT/.tool-versions"
CF_DIR="$REPO_ROOT/.cf"

if [ "${H2G2_CLOUDFLARE_BUILD:-0}" = "1" ] && [ -f "$CF_DIR/.tool-versions" ]; then
    echo "Using Cloudflare-specific .tool-versions (nodejs 22.16.0)..."
    TOOL_VERSIONS_FILE="$CF_DIR/.tool-versions"
elif [ -f "$REPO_ROOT/.tool-versions" ]; then
    echo "Using root .tool-versions (nodejs 25.2.1)..."
fi

if [ -f "$TOOL_VERSIONS_FILE" ]; then
    echo "Installing tools from .tool-versions..."
    asdf install
fi

echo ""
echo "Ensuring Rust toolchain is available..."
if ! command -v rustup >/dev/null 2>&1; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs -o rustup-init.sh
    chmod +x rustup-init.sh
    ./rustup-init.sh -y --default-toolchain stable --profile minimal
    rm -f rustup-init.sh
fi

export PATH="$HOME/.cargo/bin:$PATH"

echo "Adding wasm32 target..."
rustup target add wasm32-unknown-unknown

echo "Ensuring wasm-bindgen CLI matches crate version..."
if ! command -v wasm-bindgen >/dev/null 2>&1; then
    echo "Installing wasm-bindgen-cli..."
    cargo install wasm-bindgen-cli --version 0.2.106
fi

echo ""
echo "Building WASM crate..."
cd "$REPO_ROOT/wasm"
cargo build --target wasm32-unknown-unknown --release
echo "Running wasm-bindgen..."
wasm-bindgen target/wasm32-unknown-unknown/release/h2g2_wasm.wasm \
  --out-dir ../apps/web/src/wasm \
  --target web
echo "Copying WASM to public..."
cp ../apps/web/src/wasm/h2g2_wasm_bg.wasm ../apps/web/public/h2g2_wasm_bg.wasm
cd "$REPO_ROOT"

echo ""
echo "Building web UI..."
cd "$REPO_ROOT/apps/web"
npm ci
npm run build
cd "$REPO_ROOT"

echo ""
echo "===================================="
echo "Build complete!"
echo "Output directory: apps/web/dist"
echo "===================================="

# Verify output exists
if [ -d "apps/web/dist" ]; then
    echo "✓ dist directory exists"
    ls -lh apps/web/dist | head -10
else
    echo "✗ ERROR: dist directory not found!"
    exit 1
fi
