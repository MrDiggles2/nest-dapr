#!/bin/bash

set -ex

# Install dapr if not installed
which dapr || curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash
# Install dapr runtime if not already installed
dapr version | grep -Eq "Runtime version: \d+\.\d+\.\d+" || dapr init --slim

docker compose up --wait --remove-orphans

pnpm exec nx run-many --targets=serve --parallel=100
