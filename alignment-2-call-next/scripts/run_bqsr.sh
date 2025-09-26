#!/bin/sh

if [ $# -ne 3 ]; then
    echo "usage: $0 BAM_FILE OUTPUT_NAME FASTA_FILE"
    exit 1
fi

# Input parameters
bam_file="$1"
output_name="$2"
common_dir=<###TODO: please replace with the path contain these files>
fasta="$3"
known_sites_dbSNP=${common_dir}/dbsnp_all_20190418.vcf.gz
known_sites_mills=${common_dir}/Mills_and_1000G_gold_standard.indels.hg38.vcf.gz
# known_sites_hapmap=${common_dir}/hapmap_3.3.hg38.vcf.gz
known_sites_indel=${common_dir}/Homo_sapiens_assembly38.known_indels.vcf.gz

~/calling/tools/gatk BaseRecalibrator \
    -I $(readlink -f ${bam_file}) \
    -R $(readlink -f ${fasta}) \
    --known-sites ${known_sites_dbSNP} \
    --known-sites ${known_sites_mills} \
    --known-sites ${known_sites_indel} \
    -O ${output_name}_recal.table \
    --maximum-cycle-value 10000
~/calling/tools/gatk ApplyBQSR \
    -I $(readlink -f ${bam_file}) \
    -R $(readlink -f ${fasta}) \
    --bqsr-recal-file ${output_name}_recal.table \
    -O ${output_name}.recal.bam
