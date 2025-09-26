#!/bin/bash
set -euo pipefail

log() {
    echo "  " "$@"
}

populate_hpo() {
    VERSION=v2025-01-16
    URL_PREFIX=https://github.com/obophenotype/human-phenotype-ontology/releases/download/${VERSION}
    FILE=hp.json

    log "Downloading... HPO"
    wget -c --xattr "$URL_PREFIX/$FILE"
}

populate_hpo

#end