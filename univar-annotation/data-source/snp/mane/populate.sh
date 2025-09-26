#!/bin/bash
set -euo pipefail

URL=https://ftp.ncbi.nlm.nih.gov/refseq/MANE/MANE_human/release_1.4/MANE.GRCh38.v1.4.ensembl_genomic.gff.gz
in="${URL##*/}"
out="${in%.gff.gz}.exon_flanked100.bed.gz"


echo "Downloading..."
wget --xattr -O "$in" --xattr "$URL"

echo "Converting..."
zcat "$in" |\
    awk '$3=="exon" { # exons only
             chr = $1;
             flanked_start1 = $4 - 100; # flank 100 bps
             flanked_end1 = $5 + 100;   # flank 100 bps
             match($9, /gene_name=([^;]+)/, m);
             gene_name = m[1];
             print chr, flanked_start1 - 1, flanked_end1, gene_name;
         }' FS="\t" OFS="\t" | \
    sort -k1,1 -k2,2n |\
    bedtools merge -i - -c 4 -o distinct |\
    bgzip > "$out"

tabix "$out"

echo "Cleaning up..."
rm -f "$in"

#end