#!/bin/bash
set -euo pipefail

## Below is the list of docker images that required for this script
## 1. bcftools-env:latest
## 2. nirvana-env:latest

# Check if data_dir is provided
# Please ensure the data directory must contain below files
# 1. download files from ../download/populate.sh 
if [ -z "$1" ]; then
    echo "Error: data_dir parameter is required."
    exit 1
fi
DATA_DIR=$1

NIVANA_REF=$DATA_DIR/annotation/tools-data/sv/nirvana/References/Homo_sapiens.GRCh38.Nirvana.dat

FASTA=$DATA_DIR/annotation/tools-data/snp/vep/fasta/Homo_sapiens.GRCh38.dna.primary_assembly.fa.gz

SRC=https://kircherlab.bihealth.org/download/CADD-SV/v1.1

FILE=prescored_variants.tsv.gz
VERSION=v1.1

wget $SRC/$FILE


# Output TSV file
OUTPUT_TSV="CADD_SV_custom_annotation.tsv"

# Write the TSV header
cat <<EOF > "$OUTPUT_TSV"
#title=cadd_sv_custom
#assembly=GRCh38
#matchVariantsBy=allele
#CHROM	POS	REF	ALT	END	TYPE CADD
#categories	.	.	.	.	.	.
#descriptions	.	.	.	.	.	.
#type	.	.	.	.	string	number
EOF


# Process the tsv.gz file
# Skip comments, extract columns, and get REF base from FASTA
zcat "$FILE" | awk -F'\t' -v fasta="$FASTA" '
BEGIN {
    # Command to extract one base from FASTA
    faidx_cmd = "samtools faidx " fasta
}
!/^##/ {
    if ($1 == "#Chrom") {
        # Store header indices
        for (i=1; i<=NF; i++) {
            if ($i == "#Chrom") chrom_idx=i;
            if ($i == "Start") start_idx=i;
            if ($i == "End") end_idx=i;
            if ($i == "Type") type_idx=i;
            if ($i == "CADD-SV_PHRED-score") cadd_idx=i;
        }
    } else {
        # Get REF base at CHROM:POS
        chrom = $chrom_idx
        pos = $start_idx
        cmd = faidx_cmd " " chrom ":" pos "-" pos
        ref = "."
        if (cmd | getline seq > 0) {
            ref = toupper(seq)
        }
        close(cmd)
        # Transform data: CHROM POS REF ALT END TYPE CADD
        printf "%s\t%s\t%s\t<%s>\t%s\t%s\t%s\n",
            chrom, pos, ref, $type_idx, $end_idx, $type_idx, $cadd_idx
    }
}' >> "$OUTPUT_TSV"

# Build custom anno
docker run --rm --user $(id -u):$(id -g) -v $PWD:$PWD -v $NIVANA_REF:$NIVANA_REF -w $PWD nirvana-env dotnet /usr/src/Nirvana/SAUtils.dll customvar -r $NIVANA_REF -i $OUTPUT_TSV -o ./

rm $OUTPUT_TSV