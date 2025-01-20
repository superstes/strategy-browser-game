#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")"
PATH_BASE="$(pwd)/.."

echo '### Testing for nodeJS ###'
node -v >/dev/null

echo '### Downloading dependencies ###'
bash init-lib.sh

echo '### Downloading node-modules ###'
PATH_FE="${PATH_BASE}/src/frontend"
cd "$PATH_FE"

if ! [ -d "${PATH_FE}/node_modules/" ]
then
  npm install
fi

echo '### Setup HTML ###'
mkdir -p "${PATH_BASE}/demo"
cp "${PATH_FE}/demo.html" "${PATH_BASE}/demo/index.html"
