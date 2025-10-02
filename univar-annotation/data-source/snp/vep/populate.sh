#!/bin/bash
set -euo pipefail

GIT_REPO=https://github.com/Ensembl/VEP_plugins
RELEASE=release/115


echo "Fetching VEP plugins from git repo..."
rm -rf plugins
git clone --depth=1 \
    --branch="$RELEASE" \
    "$GIT_REPO" plugins


echo "Copying in-house VEP plugins..."
cp -af custom-vep-plugins/* plugins/


# echo "Packing into squashfs..."
# mksquashfs plugins plugins.squashfs \
#     -noappend \
#     -all-root \
#     -e .git


# echo "Cleaning up..."
# rm -rf plugins


#end
