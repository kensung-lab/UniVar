#!/bin/bash

# Pre requisites
# 1. Install wget
# 2. Install python3
# 3. Install pip install xlsx2csv
set -euo pipefail

log() {
    echo "  " "$@"
}

#==========================VERSION INFO================================#
ENSEMBL_VERSION=115
MANE_VERSION=1.4
GNOMAD_LATEST_VERSION=4.1
GNOMAD_V2_VERSION=2.1.1
#==========================VERSION INFO================================#

#==========================ENSEMBL ENTREZ================================#
ENSEMBL_ENTREZ_URL=https://ftp.ensembl.org/pub/release-$ENSEMBL_VERSION/tsv/homo_sapiens/
ENSEMBL_ENTREZ_FILE=Homo_sapiens.GRCh38.$ENSEMBL_VERSION.entrez.tsv.gz

log "Downloading ensembl entrez..."
wget -c --xattr -O "$ENSEMBL_ENTREZ_FILE" "$ENSEMBL_ENTREZ_URL/$ENSEMBL_ENTREZ_FILE"
gzip -d $ENSEMBL_ENTREZ_FILE
log "Completed download ensembl entrez"
#==========================ENSEMBL ENTREZ================================#

#==========================ENSEMBL GENE================================#
log "Downloading ensembl gff3..."
ENSEMBL_GFF3_URL=https://ftp.ensembl.org/pub/release-$ENSEMBL_VERSION/gff3/homo_sapiens
ENSEMBL_GFF3_FILE=Homo_sapiens.GRCh38.$ENSEMBL_VERSION.gff3.gz

wget -c --xattr -O "$ENSEMBL_GFF3_FILE" "$ENSEMBL_GFF3_URL/$ENSEMBL_GFF3_FILE"

# Gene
# sed to remove hyphen+digit in gene symbol (no need the id part)
zcat $ENSEMBL_GFF3_FILE | awk 'BEGIN{FS=OFS="\t"} {if($3=="mRNA"){print "chr"$1, $4 - 1, $5, $7, $9}}' | \
 perl -pe 's/ID=transcript:([^;]+);(?:.*Parent=gene:([^;]+);)?(?:.*Name=([^;]+);)?(?:.*tag=([^;]+);)?(?:.*version=(.+))?$/$1\t$2\t$3\t$4\t$5/' | \
 sed -r $"s/-[0-9]+\t/\t/" | \
 awk -v OFS='\t' -F '\t' '{if($8~/canonical/){isCan[$0]=1}else{isCan[$0]=0}; \
 if($8~/MANE_Select/){isMane[$0]=1}else{isMane[$0]=0}; \
 if($8~/MANE_Plus_Clinical/){isManeP[$0]=1}else{isManeP[$0]=0}; \
 print $1,$2,$3,$4,$5"."$9,$6,$7,isCan[$0],isMane[$0],isManeP[$0]}' | \
 cat <(echo -e "#CHROM\tSTART\tEND\tSTRAND\tTRANSCRIPT_ID\tGENE_ID\tGENE\tIS_CANONICAL\tIS_MANE_SELECT\tIS_MANE_PLUS_CLINICAL") - > ${ENSEMBL_GFF3_FILE%.gff3.gz}.gene.bed

rm $ENSEMBL_GFF3_FILE
log "Completed convert to ensembl gene"
#==========================ENSEMBL GENE================================#


#==========================MANE================================#
log "Downloading mane..."
MANE_URL=https://ftp.ncbi.nlm.nih.gov/refseq/MANE/MANE_human/release_$MANE_VERSION
MANE_FILE=MANE.GRCh38.v$MANE_VERSION.summary.txt.gz 

wget -c --xattr -O "$MANE_FILE" "$MANE_URL/$MANE_FILE"
gzip -d $MANE_FILE
log "Completed download mane"
#==========================MANE================================#

#==========================pHI pTS================================#
log "Downloading pHI pTS..."
PHI_PTS_URL=https://pmc.ncbi.nlm.nih.gov/articles/instance/9742861/bin
PHI_PTS_FILE=NIHMS1819123-supplement-14.xlsx
PHI_PTS_OUTPUT=pHI.pTS.gene.35917817.tsv

# below link may not work, sometime need to download manually
wget -c --xattr -O "$PHI_PTS_FILE" --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "$PHI_PTS_URL/$PHI_PTS_FILE"
xlsx2csv -d tab "$PHI_PTS_FILE" temp.tsv
sed ':a;N;$!ba;s/\n/ /' temp.tsv | sed ':a;N;$!ba;s/\n/ /' | sed 's/"//g' > $PHI_PTS_OUTPUT
rm $PHI_PTS_FILE temp.tsv
log "Completed download pHI pTS"
#==========================pHI pTS================================#

#==========================ClinGen Gene================================#
log "Downloading ClinGen Gene..."
CLINGEN_URL=https://ftp.clinicalgenome.org/
CLINGEN_FILE=ClinGen_gene_curation_list_GRCh38.tsv

wget -c --xattr -O "$CLINGEN_FILE" "$CLINGEN_URL/$CLINGEN_FILE"
cp $CLINGEN_FILE temp.tsv
sed 's/#Gene Symbol/Gene Symbol/' temp.tsv | sed -e '/^#/d' > $CLINGEN_FILE
rm temp.tsv
log "Completed download ClinGen Gene"
#==========================ClinGen Gene================================#

#==========================Gnomad LoF Latest Metrics================================#
log "Downloading Gnomad LoF Latest Metrics..."
GNOMAD_LOF_V4_METRICS_URL=https://storage.googleapis.com/gcp-public-data--gnomad/release/$GNOMAD_LATEST_VERSION/constraint
GNOMAD_LOF_V4_METRICS_FILE=gnomad.v$GNOMAD_LATEST_VERSION.constraint_metrics.tsv

wget -c --xattr -O "$GNOMAD_LOF_V4_METRICS_FILE" "$GNOMAD_LOF_V4_METRICS_URL/$GNOMAD_LOF_V4_METRICS_FILE"
log "Completed download Gnomad LoF Latest Metrics"
#==========================Gnomad LoF Latest Metrics================================#

#==========================Gnomad LoF V2 Metrics================================#
log "Downloading Gnomad LoF V2 Metrics..."
GNOMAD_LOF_V2_METRICS_URL=https://storage.googleapis.com/gcp-public-data--gnomad/release/$GNOMAD_V2_VERSION/constraint
GNOMAD_LOF_V2_METRICS_FILE=gnomad.v$GNOMAD_V2_VERSION.lof_metrics.by_transcript.txt.bgz

wget -c --xattr -O "$GNOMAD_LOF_V2_METRICS_FILE" "$GNOMAD_LOF_V2_METRICS_URL/$GNOMAD_LOF_V2_METRICS_FILE"
bgzip -d $GNOMAD_LOF_V2_METRICS_FILE
log "Completed download Gnomad LoF V2 Metrics"
#==========================Gnomad LoF V2 Metrics================================#

#==========================EXTRA REFSEQ================================#
log "Downloading EXTRA REFSEQ..."
EXTRA_REFSEQ_URL=https://genome.ucsc.edu/cgi-bin/hgTables
EXTRA_REFSEQ_FILE=Galaxy1-UCSC_Main_on_Human_wgEncodeGencodeRefSeqV47_genome.tabular
FORM_DATA="hgsid=2459816127_rOsPfYCL7HZQKyji6d4WJhApd749&jsh_pageVertPos=0&clade=mammal&org=Human&db=hg38&hgta_group=genes&hgta_track=refSeqComposite&hgta_table=wgEncodeGencodeRefSeqV47&position=chr14%3A95%2C086%2C244-95%2C158%2C010&hgta_regionType=genome&hgta_outputType=primaryTable&boolshad.sendToGalaxy=0&boolshad.sendToGreat=0&hgta_outFileName=&hgta_outSep=tab&hgta_compressType=none&hgta_doTopSubmit=Get+output"

wget -c --xattr --post-data "$FORM_DATA" -O "$EXTRA_REFSEQ_FILE" "$EXTRA_REFSEQ_URL/$EXTRA_REFSEQ_FILE"
log "Completed download EXTRA REFSEQ"
#==========================EXTRA REFSEQ================================#


#end
