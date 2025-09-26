#!/bin/bash
set -euo pipefail

log() {
    echo "  " "$@"
}

URL=https://search.clinicalgenome.org/kb/gene-validity/download


log "Downloading clinicalgenome gene..."
filename=$(wget -c --xattr -N --content-disposition "$URL" 2>&1 | grep "Saving to" --line-buffered | sed -r 's/Saving to: ‘(.*)’/\1/')
date=$(echo "$filename" | sed 's/.*-\([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]\)\..*/\1/')
sed -i "s/CLINGEN_GENE_DISEASE_VERSION='[^']*'/CLINGEN_GENE_DISEASE_VERSION='$date'/" ../config.py
sed -i "s/Clingen-Gene-Disease-Summary-[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/Clingen-Gene-Disease-Summary-${date}/" ../config.py
log "Completed update the clinicalgenome gene version to : '$date'"
#end
