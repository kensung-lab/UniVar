#!/bin/bash
set -euo pipefail

## Below is the list of docker images that required for this script
## 1. nirvana-env:latest

# Check if file (Homo_sapiens.GRCh38.Nirvana.dat) is provided
# Please ensure the data directory must contain below files
if [ -z "$1" ]; then
    echo "Error: path/to/Homo_sapiens.GRCh38.Nirvana.dat is required."
    exit 1
fi

NIVANA_REF=$1

SRC=https://ftp.ncbi.nlm.nih.gov/pub/clinvar/tab_delimited

FILE=variant_summary.txt.gz
VERSION=20250330

NIRVANA_HEADER=$(cat << EOM
#title=clinvar_custom								
#assembly=GRCh38								
#matchVariantsBy=position								
#CHROM	POS	REF	END	Type	ClinicalSignificance	RCVaccession	ReviewStatus	VariationID
#categories	.	.	.	.	.	.	.	.
#descriptions	.	.	.	.	.	.	.	.
#type	.	.	.	string	string	string	string	number
EOM
)

wget -O "$FILE" "$SRC/$FILE"

# Basic filtering: length >= 50bp and GRCh38 
zcat "$FILE"  | sed -n '1p;/single nucleotide variant/!p' |\
 awk -F'\t' -v OFS='\t' 'NR==1 { for (i=1; i<=NF; i++) { f[$i] = i } print $0} $(f["Stop"]) - $(f["Start"]) + 1 >= 50 && $(f["Assembly"])=="GRCh38" { print $0 }'\
  > clinvar.variant_summary.GRCh38.gt50bp.${VERSION}.txt

# Generate the data file body
awk -F'\t' -v OFS='\t' 'NR==1 { for (i=1; i<=NF; i++) { f[$i] = i } } \
 NR > 1{ print "chr"$(f["Chromosome"]), $(f["Start"]), ".", $(f["Stop"]), $(f["Type"]), $(f["ClinicalSignificance"]) , \
 $(f["RCVaccession"]) , $(f["ReviewStatus"]) , $(f["VariationID"]) }' clinvar.variant_summary.GRCh38.gt50bp.${VERSION}.txt |\
  sort -k1,1 -k2,2n > clinvar.${VERSION}.custom_annotation.body.txt

cat <(echo "$NIRVANA_HEADER") clinvar.${VERSION}.custom_annotation.body.txt > clinvar.${VERSION}.custom_annotation.txt

docker run --rm --user $(id -u):$(id -g) -v $PWD:$PWD -v $NIVANA_REF:$NIVANA_REF -w $PWD nirvana-env dotnet /usr/src/Nirvana/SAUtils.dll customvar \
    -r $NIVANA_REF -i clinvar.${VERSION}.custom_annotation.txt -o ./

rm $FILE clinvar.variant_summary.GRCh38.gt50bp.${VERSION}.txt clinvar.${VERSION}.custom_annotation.body.txt
