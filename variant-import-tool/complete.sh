#!/bin/sh
CONTROL_FILE_PATH=$1
export VCF_FILE_NAME=$(jq -r '.vcf_file_name' $CONTROL_FILE_PATH)
export PED_FILE_NAME=$(jq -r '.ped_file_name' $CONTROL_FILE_PATH)
export VARIANT_TYPE=complete

# run snp pipeline
docker compose -f ./docker-compose.snp.yaml up --build
