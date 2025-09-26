#!/bin/sh

if [ $# -lt 4 ];then
    echo "usage: $0 N_THREADS BAM_FILE WORKDIR REFERENCE_FASTA "
    exit 1
fi

mkdir -p $(pwd)/$3

python ~/software/SurVeyor/surveyor.py call --ml-model ~/software/ai_model/SurVeyor/trained-model --threads $*
