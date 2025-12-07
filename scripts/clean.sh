#!/bin/bash

echo "Cleaning Moon cache..."
rm -rf .moon/cache .moon/notarized.json .moon/cache.json

echo "Cleaning build artifacts..."
rm -rf encrusted/target wasm/target apps/web/node_modules apps/web/dist

echo "Cleaning lock files..."
rm -rf Cargo.lock encrusted/Cargo.lock apps/web/package-lock.json

echo "✨ Clean complete!"
