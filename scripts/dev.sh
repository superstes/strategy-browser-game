#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")/../"

PATH_FE="$(pwd)/src/frontend"
PATH_BE="$(pwd)/src/backend"
PATH_LIB="$(pwd)/lib"

if ! [ -f "${PATH_LIB}/noise_cli" ] || ! [ -f "${PATH_LIB}/opensimplex_cli.py" ]
then
  echo '### Downloading Dependencies.. ###'
  bash scripts/init-lib.sh
fi

echo '### Running map-generator.. ###'
python3 "${PATH_BE}/map_generator/main.py"

echo '### Starting DEV Server... ###'
trap 'kill $BGPID; exit' INT
python3 scripts/dev_statics.py "$PATH_BE" &
BGPID=$!

cd "$PATH_FE"

if ! [ -d "${PATH_FE}/node_modules/" ]
then
  npm install
fi

npx vite --host
