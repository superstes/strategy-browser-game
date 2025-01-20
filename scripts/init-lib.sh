#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/../lib/"

rm -f noise_cli
LATEST_RELEASE="$(curl 'https://api.github.com/repos/O-X-L/opensimplex/releases/latest' 2>/dev/null | jq -r '.tag_name')"
wget "https://github.com/O-X-L/opensimplex/releases/download/${LATEST_RELEASE}/noise_cli_linux_amd64-CGO0.tar.gz" >/dev/null 2>/dev/null
tar -xzvf noise_cli_linux_amd64-CGO0.tar.gz >/dev/null
mv noise_cli_linux_amd64-CGO0 noise_cli

rm -f opensimplex_cli.py
wget "https://raw.githubusercontent.com/O-X-L/opensimplex/refs/tags/${LATEST_RELEASE}/opensimplex_cli.py" >/dev/null 2>/dev/null
