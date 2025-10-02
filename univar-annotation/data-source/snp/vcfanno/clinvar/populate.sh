#!/bin/bash
set -euo pipefail

SRC=https://ftp.ncbi.nlm.nih.gov/pub/clinvar/vcf_GRCh38
DEST=vcf_GRCh38
VERSION=20250928

FILES=(
    clinvar_$VERSION.vcf.gz.md5
    clinvar_$VERSION.vcf.error.txt
    clinvar_$VERSION.vcf.gz.tbi
    clinvar_$VERSION.vcf.gz
)

mkdir -p "$DEST"

for f in "${FILES[@]}"; do
    wget --xattr -O "$DEST/$f" --xattr "$SRC/$f"
done

#end
