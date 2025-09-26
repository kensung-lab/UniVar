#!/bin/bash
set -euo pipefail

echo "Building univar-backend application"
pnpm run build

echo "Building univar-backend docker image"
docker build -t univar-backend:demo .

echo "Saving Image"
docker save -o univar-backend.tar univar-backend:demo

echo "Completed building univar-backend application"