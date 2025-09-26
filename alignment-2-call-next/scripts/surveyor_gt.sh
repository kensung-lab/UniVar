#!/bin/sh

if [ $# -lt 6 ];then
    echo "usage: $0 N_THREADS in_vcf_file out_vcf_file bam_file workdir reference  "
    exit 1
fi

mkdir -p $(pwd)/$3

python ~/software/SurVeyor/surveyor.py genotype --threads $* ~/software/ai_model/SurVeyor/trained-model
