#!/usr/bin/env python3
import gzip
import sys
import re

def get_platform(fastq_path):
    with gzip.open(fastq_path, 'rt') as f:
        header = f.readline().strip()
        # MGI/DNBSEQ patterns
        if re.search(r'DNBSEQ|MGISEQ|F5VHLQ1', header):
            return 'DNBSEQ'
        # Illumina patterns
        if re.search(r'ILLUMINA|HiSeq|NovaSeq|MiSeq', header, re.IGNORECASE):
            return 'ILLUMINA'
        # Other platforms (extend as needed)
        if re.search(r'PacBio|Sequel', header, re.IGNORECASE):
            return 'PACBIO'
        if re.search(r'ONT|MinION|PromethION', header, re.IGNORECASE):
            return 'NANOPORE'
        # Fallback for MGI data
        return 'DNBSEQ'

if __name__ == '__main__':
    fastq_path = sys.argv[1]
    print(get_platform(fastq_path))
