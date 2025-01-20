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

SRC_IMP="as THREE from 'three'"
DST_IMP="as THREE from 'https://${DEMO_DOMAIN}/node_modules/three/src/Three.js'"

sed -i "s|${SRC_IMP}|${DST_IMP}|g" "${PATH_FE}/js/"*.js
sed -i "s|${SRC_IMP}|${DST_IMP}|g" "${PATH_FE}/js/map/"*.js
sed -i "s|${SRC_IMP}|${DST_IMP}|g" "${PATH_FE}/js/util/"*.js
