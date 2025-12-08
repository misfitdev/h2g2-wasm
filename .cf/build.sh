#!/bin/bash
set -e
# Cloudflare Pages build wrapper
# This script is called when .cf/ is set as the build root
# It delegates to the main build script in the repo root
export H2G2_CLOUDFLARE_BUILD=1
cd "$(dirname "$0")/.."
exec bash ./build.sh "$@"
