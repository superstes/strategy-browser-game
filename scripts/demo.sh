#!/usr/bin/env bash

if [ -z "$1" ]
then
  echo 'You need to supply the demo-domain!'
  exit 1
fi

DEMO_DOMAIN="$1"

set -euo pipefail

cd "$(dirname "$0")"
PATH_BASE="$(pwd)/.."
PATH_FE="${PATH_BASE}/src/frontend"
PATH_BE="${PATH_BASE}/src/backend"

echo '### Testing for nodeJS ###'
node -v >/dev/null

echo '### Downloading dependencies ###'
bash init-lib.sh

echo '### Downloading node-modules ###'
cd "$PATH_FE"

if ! [ -d "${PATH_FE}/node_modules/" ]
then
  npm install
fi

echo '### Setup HTML ###'
mkdir -p "${PATH_BASE}/demo"
cp "${PATH_FE}/demo.html" "${PATH_BASE}/demo/index.html"

echo '### Update Imports ###'

function patch_js_imports() {
  src="$1"
  dst="$2"
  sed -i "s|${src}|${dst}|g" "${PATH_FE}/js/"*.js
  sed -i "s|${src}|${dst}|g" "${PATH_FE}/js/"*/*.js
}

patch_js_imports "http://localhost:5173" "https://${DEMO_DOMAIN}"

echo '### Generating map ###'
cd "$PATH_BASE"
VENV_PATH='/tmp/.sup-game-venv'

python3 -m virtualenv "$VENV_PATH" >/dev/null
source "${VENV_PATH}/bin/activate"
pip install -r "${PATH_BE}/map_generator/requirements.txt" >/dev/null
GAME_MAP_EXPORT_IMG=0 bash scripts/map-gen.sh >/dev/null
