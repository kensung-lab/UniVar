#!/bin/sh
CONTROL_FILE_PATH=$1
export VCF_FILE_NAME=$(jq -r '.vcf_file_name' $CONTROL_FILE_PATH)
export PED_FILE_NAME=$(jq -r '.ped_file_name' $CONTROL_FILE_PATH)
export VARIANT_TYPE=$(jq -r '.variant_type' $CONTROL_FILE_PATH)
export JSON_FILE_NAME=$(echo "$VCF_FILE_NAME" | sed 's/\.vcf\.gz$/.json.gz/')
docker compose -f ./docker-compose.nirvana.yaml up --build && \
  docker compose -f ./docker-compose.sv.yaml up --build