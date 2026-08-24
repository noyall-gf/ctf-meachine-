#!/usr/bin/env bash
set -e

echo "=== ShopNest CTF Setup ==="
echo "This script will download Node.js v22.13.0 and install project dependencies."

NODE_VERSION="22.13.0"
ARCH="x64"

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    ARCH="arm64"  # Default to arm64 for newer Macs
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi

NODE_TAR="node-v${NODE_VERSION}-${OS}-${ARCH}.tar.xz"
NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/${NODE_TAR}"
NODE_DIR="$(pwd)/node-v${NODE_VERSION}-${OS}-${ARCH}"

echo "Downloading Node.js v${NODE_VERSION}..."
if ! curl -fsSL "$NODE_URL" -o "$NODE_TAR"; then
    echo "Failed to download Node.js. Check your internet connection."
    exit 1
fi

echo "Extracting Node.js..."
tar -xf "$NODE_TAR"
rm "$NODE_TAR"

echo "Installing dependencies..."
export PATH="${NODE_DIR}/bin:$PATH"

node --version
npm --version

npm ci --legacy-peer-deps

echo ""
echo "=== Setup Complete ==="
echo "Starting CTF application..."
PORT=${PORT:-3000}
echo "Visit: http://localhost:$PORT"
echo ""

export PATH="${NODE_DIR}/bin:$PATH"
npm run dev -- --port $PORT
