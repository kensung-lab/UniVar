#!/bin/bash

set -euo pipefail

EXOMISER_VERSION=14.1.0
DATA_VERSION=2502
URL_PREFIX=https://data.monarchinitiative.org/exomiser
GITHUB_PREFIX=https://github.com/exomiser/Exomiser/releases/download
TEMP_URL_PREFIX=https://g-879a9f.f5dc97.75bc.dn.glob.us

REMM_URL=https://zenodo.org/record/6576087/files/ReMM.v0.4.hg38.tsv.gz

cli_url="$GITHUB_PREFIX/$EXOMISER_VERSION/exomiser-cli-${EXOMISER_VERSION}-distribution.zip"
hg38_url="$TEMP_URL_PREFIX/data/${DATA_VERSION}_hg38.zip"
phenotype_url="$TEMP_URL_PREFIX/data/${DATA_VERSION}_phenotype.zip"

echo "Downloading Exomiser files..."
wget -c --wait=5 --xattr "$cli_url" "$hg38_url" "$phenotype_url" \
     "$REMM_URL"

unzip "exomiser-cli-${EXOMISER_VERSION}-distribution.zip"
mv "exomiser-cli-${EXOMISER_VERSION}" exomiser-cli

unzip "${DATA_VERSION}_hg38.zip"

unzip "${DATA_VERSION}_phenotype.zip"
     
remm_file="${REMM_URL##*/}"
remm_file_transformed="${remm_file%.tsv.gz}.transformed.tsv.gz"
echo "Transforming ReMM scores file $remm_file ..."
zcat "$remm_file" | sed 's/^chr//' | bgzip > "$remm_file_transformed"
tabix -s1 -b2 -e2 -f "$remm_file_transformed"
mv "$remm_file_transformed" ${DATA_VERSION}_hg38/"$remm_file_transformed"


echo "Cleaning up..."
rm -f "$remm_file" "${DATA_VERSION}_hg38.zip" "${DATA_VERSION}_phenotype.zip" "exomiser-cli-${EXOMISER_VERSION}-distribution.zip" "*.sha256"