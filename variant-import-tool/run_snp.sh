#!/bin/sh
CONTROL_FILE_PATH=$1
export VCF_FILE_NAME=$(jq -r '.vcf_file_name' $CONTROL_FILE_PATH)
export PED_FILE_NAME=$(jq -r '.ped_file_name' $CONTROL_FILE_PATH)
export VARIANT_TYPE=$(jq -r '.variant_type' $CONTROL_FILE_PATH)

# run SD pipeline
tmpdir=$(mktemp)
IN=./data/raw/$VCF_FILE_NAME OUT=./data/annotated/$VCF_FILE_NAME /home/sdlee/univar/pipeline/scripts/annotate-lite

# run snp pipeline
docker compose -f ./docker-compose.snp.yaml up --build
