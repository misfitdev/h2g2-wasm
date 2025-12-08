#!/bin/bash
set -euo pipefail

echo "===================================="
echo "H2G2 Build Script"
echo "===================================="
echo ""

# Change to repo root
cd "$(dirname "$0")"
REPO_ROOT="$(pwd)"
echo "Repository root: $REPO_ROOT"
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
