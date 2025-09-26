#!/bin/bash

VEP_VERSION=113
URL=https://ftp.ensembl.org/pub/release-${VEP_VERSION}/fasta/homo_sapiens/dna/Homo_sapiens.GRCh38.dna.primary_assembly.fa.gz

filename=${URL##*/}

echo "Downloading..."
wget --xattr -O "$filename" "$URL"

echo "Recompressing..."
gunzip < "$filename" | bgzip > "$filename.new"
touch --reference="$filename" "$filename.new"
mv -f "$filename.new" "$filename"

echo "Indexing..."
samtools faidx "$filename"


#end
