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

echo '### Update Imports ###'

function patch_js_imports() {
  src="$1"
  dst="$2"
  sed -i "s|${src}|${dst}|g" "${PATH_FE}/js/"*.js
  sed -i "s|${src}|${dst}|g" "${PATH_FE}/js/map/"*.js
  sed -i "s|${src}|${dst}|g" "${PATH_FE}/js/util/"*.js
}

URL_NODE_MOD="https://${DEMO_DOMAIN}/node_modules"

patch_js_imports "as THREE from 'three'" "as THREE from '${URL_NODE_MOD}/three/src/Three.js'"
patch_js_imports "from 'three/examples" "from '${URL_NODE_MOD}/three/examples"
patch_js_imports "from 'dat.gui'" "from '${URL_NODE_MOD}/dat.gui/src/dat/index.js'"