#!/bin/bash
set -euo pipefail

## Below is the list of docker images that required for this script
## 1. bcftools-env:latest
## 2. nirvana-env:latest

# Check if data_dir is provided
# Please ensure the data directory must contain below files
# 1. download files from ../download/populate.sh 
# 2. download the Han_945samples_SV.vcf.gz from https://www.biosino.org/node/download/node/data/public/OED00945268 and locate it as the variable SRC_FILE below
if [ -z "$1" ]; then
    echo "Error: data_dir parameter is required."
    exit 1
fi
DATA_DIR=$1


FILE=Han_945samples_SV.vcf.gz
SRC_FILE=$DATA_DIR/annotation/tools-data/sv/nirvana/$FILE
NIVANA_REF=$DATA_DIR/annotation/tools-data/sv/nirvana/References/Homo_sapiens.GRCh38.Nirvana.dat


# Output TSV file
OUTPUT_TSV="${FILE%.vcf.gz}_custom_annotation.tsv"

# Write the TSV header
cat <<EOF > "$OUTPUT_TSV"
#title=945_han_af
#assembly=GRCh38
#matchVariantsBy=allele
#CHROM	POS	REF	ALT	END	NS	AF	SVTYPE	SVLEN
#categories	.	.	.	.	.	.	.	.
#descriptions	.	.	.	.	.	.	.	.
#type	.	.	.	.	number	number	string	number
EOF

# Process the VCF.gz file
# - Use zcat to decompress, grep to filter out header lines, and awk to parse and transform
zcat "$SRC_FILE" | grep -v "^#" | awk -F'\t' '
{
    # Extract CHROM, POS, REF, ALT
    chrom = $1
    pos = $2
    ref = $4
    alt = $5

    # Parse INFO field (column 8)
    info = $8

    # Initialize variables
    svlen = 0
    supp = 0
    af = 0
    svtype = ""

    # Split INFO field by semicolons
    split(info, info_array, ";")
    for (i in info_array) {
        split(info_array[i], keyval, "=")
        if (keyval[1] == "SVLEN") svlen = keyval[2]
        if (keyval[1] == "SUPP") supp = keyval[2]
        if (keyval[1] == "AF") af = keyval[2]
        if (keyval[1] == "SVTYPE") svtype = keyval[2]
    }

    # Calculate END as POS + SVLEN
    end = pos + svlen

    # Print the TSV row
    printf "%s\t%s\t%s\t%s\t%d\t%s\t%s\t%s\t%s\n", chrom, pos, ref, alt, end, supp, af, svtype, svlen
}' >> "$OUTPUT_TSV"

# Build custom anno
docker run --rm --user $(id -u):$(id -g) -v $PWD:$PWD -v $NIVANA_REF:$NIVANA_REF -w $PWD nirvana-env dotnet /usr/src/Nirvana/SAUtils.dll customvar -r $NIVANA_REF -i $OUTPUT_TSV -o ./

rm $OUTPUT_TSV