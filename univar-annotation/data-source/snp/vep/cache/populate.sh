#!/bin/bash
set -euo pipefail

VEP_VERSION=115
URL=https://ftp.ensembl.org/pub/release-${VEP_VERSION}/variation/indexed_vep_cache/homo_sapiens_merged_vep_${VEP_VERSION}_GRCh38.tar.gz

tarball="${URL##*/}"
basename="${tarball%.tar.gz}"
# sq="$basename.squashfs"

echo "Downloading..."
wget --xattr -O "$tarball" "$URL"

echo "Extracting..."
dir="$basename.tmp"
mkdir "$dir"
tar xf "$tarball" -C "$dir"
mv "$dir"/homo_sapiens_merged homo_sapiens_merged 

# echo "Generating squashfs..."
# mksquashfs "$dir" "$sq" -all-root

echo "Cleaning up..."
rm -rf "$tarball" "$dir"

#end
