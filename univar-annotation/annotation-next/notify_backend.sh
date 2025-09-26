#!/bin/bash

secret=$1
backend_url=$2
database_name=$3

timestamp=$(echo "scale=0; $(date +%s%N) / 1000000" | bc)

curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer nextflow" \
  --data "{\
      \"secret\":\"$secret\",\
      \"selected_database\":\"$database_name\",\
      \"track_number\":\"pipeline:$timestamp\"\
  }" \
  "${backend_url}pipeline/pipeline-error"
