#!/bin/bash
set -euo pipefail

for x in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 X Y; do
    wget -c --xattr https://storage.googleapis.com/gcp-public-data--gnomad/release/3.1.2/vcf/genomes/gnomad.genomes.v3.1.2.sites.chr${x}.vcf.bgz
    wget -c --xattr https://storage.googleapis.com/gcp-public-data--gnomad/release/3.1.2/vcf/genomes/gnomad.genomes.v3.1.2.sites.chr${x}.vcf.bgz.tbi
done

ls | grep .vcf.bgz$ > vcf_files.txt

bcftools concat --threads 48 -f vcf_files.txt -Oz > gnomad.genomes.v3.1.2.sites.vcf.bgz
tabix -p vcf gnomad.genomes.v3.1.2.sites.vcf.bgz