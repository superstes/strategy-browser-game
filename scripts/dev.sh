#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")/../"

PATH_FE="$(pwd)/src/frontend"
PATH_BE="$(pwd)/src/backend"

trap 'kill $BGPID; exit' INT
python3 scripts/dev_statics.py "$PATH_BE" &
BGPID=$!

if ! [ -d "${PATH_FE}/node_modules/" ]
then
  npm install
fi

cd "$PATH_FE"
npx vite --host
