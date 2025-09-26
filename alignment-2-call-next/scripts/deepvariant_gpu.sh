#!/bin/sh 

if [ $# -ne 4 ];then
    echo "usage: $0 N_THREADS BAM_FILE WORKDIR OUTPUT_NAME "
    exit 1
fi

dirpath=$(dirname $(readlink -f "$2"))
bam=$(basename $(readlink -f "$2"))
fastapath=<#### replace with the path contain fasta>

mkdir -p ${3}/intermediate_results_dir


singularity run --nv \
    -B $(readlink -f "$3"):/data/result \
    -B "$dirpath":/data/bam \
    -B "$fastapath":/data/common \
    docker://google/deepvariant:latest-gpu  \
    /opt/deepvariant/bin/run_deepvariant \
    --model_type WGS \
    --ref /data/common/GRCh38_no_alt_analysis_set.fasta  \
    --reads /data/bam/$bam \
    --output_vcf /data/result/${4}.vcf.gz \
    --output_gvcf /data/result/${4}.g.vcf.gz \
    --num_shards $1 \
    --logging_dir=/data/result/logs\
    --intermediate_results_dir /data/result/intermediate_results_dir
 
