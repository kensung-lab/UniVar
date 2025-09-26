#!/bin/bash

set -euo pipefail

# XML table of contents
URL_PREFIX=https://annotations.nirvana.illumina.com

TARGET_CACHE=(
    ab0cf104f39708eabd07b8cb67e149ba-Cache/27/GRCh38/Both.polyphen.ndb
    ab0cf104f39708eabd07b8cb67e149ba-Cache/27/GRCh38/Both.sift.ndb
    ab0cf104f39708eabd07b8cb67e149ba-Cache/27/GRCh38/Both.transcripts.ndb
)

TARGET_REF=(
    d95867deadfe690e40f42068d6b59df8-References/7/Homo_sapiens.GRCh38.Nirvana.dat
)

TARGET_SUPP=(
    0f1a75daaa53c0ea4503dd41ec19be396eba4093-GnomAD-SV/2/GRCh38/gnomAD_SV_2.1.nsi
    7b447a9966cce3f2fa2a6ec669a8c53-GNOMAD-LCR/1/GRCh38/gnomAD_LCR_2.1.lcr
    97e4ccd531ec8c93b5a5d55203dd639da4683471-DECIPHER/1/GRCh38/DECIPHER_201509.nsi
    990351a8d9fd3f9a6f7a45726d7f2c55-FusionCatcher/3/FusionCatcher_1.33.gfs
)

declare -A local_dir 
local_dir=( ["CACHE"]="Cache/GRCh38" ["REF"]="References" ["SUPP"]="SupplementaryAnnotation/GRCh38" )

for asset_type in CACHE REF SUPP; do
    mkdir -p "${local_dir[${asset_type}]}"
    
    file_list=TARGET_$asset_type[@]
    file_list=(${!file_list})

    for f in "${file_list[@]}"; do
        filename=$(basename "$f")
        wget -O "${local_dir[${asset_type}]}/$filename" "$URL_PREFIX/$f"
    done
done 