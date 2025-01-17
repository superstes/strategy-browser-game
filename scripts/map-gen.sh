#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/../"
PATH_BE="$(pwd)/src/backend"

echo '### Running map-generator.. ###'
python3 "${PATH_BE}/map_generator/main.py"
