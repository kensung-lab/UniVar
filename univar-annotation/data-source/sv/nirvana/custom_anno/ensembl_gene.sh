#!/bin/bash
set -euo pipefail

## Below is the list of docker images that required for this script
## 1. bedtools-env:latest
## 2. nirvana-env:latest

# Check if file (Homo_sapiens.GRCh38.Nirvana.dat) is provided
# Please ensure the data directory must contain below files
if [ -z "$1" ]; then
    echo "Error: path/to/Homo_sapiens.GRCh38.Nirvana.dat is required."
    exit 1
fi

SRC=https://ftp.ensembl.org/pub/release-110/gff3/homo_sapiens
FILE=Homo_sapiens.GRCh38.110.gff3.gz

NIVANA_REF=$1

wget -O "$FILE" "$SRC/$FILE"

# Gene
# sed to remove hyphen+digit in gene symbol (no need the id part)
zcat $FILE | awk 'BEGIN{FS=OFS="\t"} {if($3=="mRNA"){print "chr"$1, $4 - 1, $5, $7, $9}}' | \
 perl -pe 's/ID=transcript:([^;]+);(?:.*Parent=gene:([^;]+);)?(?:.*Name=([^;]+);)?(?:.*tag=([^;]+);)?(?:.*version=(.+))?$/$1\t$2\t$3\t$4\t$5/' | \
 sed -r $"s/-[0-9]+\t/\t/" | \
 awk -v OFS='\t' -F '\t' '{if($8~/canonical/){isCan[$0]=1}else{isCan[$0]=0}; \
 if($8~/MANE_Select/){isMane[$0]=1}else{isMane[$0]=0}; \
 if($8~/MANE_Plus_Clinical/){isManeP[$0]=1}else{isManeP[$0]=0}; \
 print $1,$2,$3,$4,$5"."$9,$6,$7,isCan[$0],isMane[$0],isManeP[$0]}' | \
 cat <(echo -e "#CHROM\tSTART\tEND\tSTRAND\tTRANSCRIPT_ID\tGENE_ID\tGENE\tIS_CANONICAL\tIS_MANE_SELECT\tIS_MANE_PLUS_CLINICAL") - > ${FILE%.gff3.gz}.gene.bed

# CDS
zcat $FILE | awk 'BEGIN{FS=OFS="\t"} {if($3=="CDS"){print "chr"$1, $4 - 1, $5, $9, $7}}' | perl -pe 's/ID=.+transcript:([^;]+);.*\t(.+$)/$1\t$2/' > ${FILE%.gff3.gz}.CDS.bed

# Exon
zcat $FILE | awk 'BEGIN{FS=OFS="\t"} {if($3=="exon"){print "chr"$1, $4 - 1, $5, $9, $7}}' | perl -pe 's/Parent=transcript:([^;]+);.*rank=([^;]+);.*\t(.+$)/$1\t$2\t$3/'  > ${FILE%.gff3.gz}.exon.bed

docker run --rm --user $(id -u):$(id -g) -v .:/data -w /data bedtools-env bedtools intersect -a ${FILE%.gff3.gz}.exon.bed -b ${FILE%.gff3.gz}.CDS.bed -wa -wb | awk '$4==$10' | cut -f1-6 > ${FILE%.gff3.gz}.exon.coding.bed

awk  -v OFS='\t' 'FNR==NR {a[$4,$5]; next} ($4,$5) in a { print $0, "1"} !(($4,$5) in a) {print $0, "0"}' ${FILE%.gff3.gz}.exon.coding.bed ${FILE%.gff3.gz}.exon.bed | \
 grep -f <(cut -f5 ${FILE%.gff3.gz}.gene.bed | cut -d '.' -f1) | cut --complement -f6 > ${FILE%.gff3.gz}.exon.col_coding.bed

tail -n+2 ${FILE%.gff3.gz}.exon.col_coding.bed | awk -F '\t' -v OFS='\t' '{ $2=$2+1 OFS "."; print }' | sort -k1,1 -k2,2n > ${FILE%.gff3.gz}.exon.custom_anno.body.txt

tail -n+2 ${FILE%.gff3.gz}.gene.bed | awk -F '\t' -v OFS='\t' '{ $2=$2+1 OFS "."; print }' | cut -f1-6 |  cut --complement -f5  | sort -k1,1 -k2,2n > ${FILE%.gff3.gz}.gene.custom_anno.body.txt

cat <<EOT > ${FILE%.gff3.gz}.exon.custom_anno.header.txt
#title=ensembl_exon						
#assembly=GRCh38						
#matchVariantsBy=position						
#CHROM	POS	REF	END	ENST_ID	EXON_ID	IS_CODING
#categories	.	.	.	.	.	.
#descriptions	.	.	.	.	.	.
#type	.	.	.	string	number	number
EOT

cat <<EOT > ${FILE%.gff3.gz}.gene.custom_anno.header.txt
#title=ensembl_gene				
#assembly=GRCh38				
#matchVariantsBy=position				
#CHROM	POS	REF	END	ENST_ID
#categories	.	.	.	.
#descriptions	.	.	.	.
#type	.	.	.	string
EOT

cat ${FILE%.gff3.gz}.gene.custom_anno.header.txt ${FILE%.gff3.gz}.gene.custom_anno.body.txt > ${FILE%.gff3.gz}.gene.custom_anno.txt
cat ${FILE%.gff3.gz}.exon.custom_anno.header.txt ${FILE%.gff3.gz}.exon.custom_anno.body.txt > ${FILE%.gff3.gz}.exon.custom_anno.txt


docker run --rm --user $(id -u):$(id -g) -v $PWD:$PWD -v $NIVANA_REF:$NIVANA_REF -w $PWD nirvana-env dotnet /usr/src/Nirvana/SAUtils.dll customvar -r $NIVANA_REF -i ${FILE%.gff3.gz}.gene.custom_anno.txt -o ./
docker run --rm --user $(id -u):$(id -g) -v $PWD:$PWD -v $NIVANA_REF:$NIVANA_REF -w $PWD nirvana-env dotnet /usr/src/Nirvana/SAUtils.dll customvar -r $NIVANA_REF -i ${FILE%.gff3.gz}.exon.custom_anno.txt -o ./

# clean up
rm $FILE ${FILE%.gff3.gz}.CDS.bed ${FILE%.gff3.gz}.exon.bed ${FILE%.gff3.gz}.exon.coding.bed ${FILE%.gff3.gz}.exon.col_coding.bed \
 ${FILE%.gff3.gz}.gene.custom_anno.header.txt ${FILE%.gff3.gz}.gene.custom_anno.body.txt ${FILE%.gff3.gz}.exon.custom_anno.header.txt ${FILE%.gff3.gz}.exon.custom_anno.body.txt