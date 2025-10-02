#!/bin/bash
set -euo pipefail

for type in exomes genomes; do
    mkdir $type 
    for chr in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 X Y; do
        wget -c --xattr https://storage.googleapis.com/gcp-public-data--gnomad/release/4.1/vcf/${type}/gnomad.${type}.v4.1.sites.chr${chr}.vcf.bgz
        wget -c --xattr https://storage.googleapis.com/gcp-public-data--gnomad/release/4.1/vcf/${type}/gnomad.${type}.v4.1.sites.chr${chr}.vcf.bgz.tbi
    done
    ls | grep .vcf.bgz$ > vcf_files.txt
    bcftools concat --threads 48 -f vcf_files.txt -Oz > gnomad.${type}.v4.1.sites.vcf.bgz
    tabix -p vcf gnomad.${type}.v4.1.sites.vcf.bgz
done
