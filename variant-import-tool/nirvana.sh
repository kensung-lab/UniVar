#!/bin/bash
# ghcr.io/hkgi-bioinformatics/nirvana-env:1.0.0

input_vcf="/app/data/raw/$VCF_FILE_NAME"
info_tags=$(zgrep -w '^##INFO=<ID' "$input_vcf" | perl -pe 's/^##INFO=<ID=([^,]+).+$/$1/g' | sed -z 's/\n/,/g;s/,$//')

dotnet /usr/src/Nirvana/Nirvana.dll -c /nirvana_data/download/Cache/GRCh38/Both -r /nirvana_data/download/References/Homo_sapiens.GRCh38.Nirvana.dat \
 --sd /nirvana_data/download/SupplementaryAnnotation/GRCh38 --sd /nirvana_data/custom_anno \
 -i $input_vcf --vcf-info="$info_tags" --ins-window-size=150 --bnd-window-size=150 -o output

output_json="/app/data/annotated/$JSON_FILE_NAME"
cp output.json.gz $output_json
chown 1003:1002 $output_json