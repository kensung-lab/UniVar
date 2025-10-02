#!/bin/bash
set -euo pipefail

log() {
    echo "  " "$@"
}

populate_AlphaMissense() {
    echo "Downloading..."
    wget -c --xattr https://zenodo.org/records/10813168/files/AlphaMissense_hg38.tsv.gz?download=1

    mv 'AlphaMissense_hg38.tsv.gz?download=1' AlphaMissense_hg38.tsv.gz

    echo "Indexing..."
    tabix -f -s1 -b2 -e2 AlphaMissense_hg38.tsv.gz
    
}

populate_ReMM() {
    echo "Downloading..."
    wget -c --xattr https://kircherlab.bihealth.org/download/ReMM/ReMM.v0.4.hg38.tsv.gz

    echo "Indexing..."
    tabix -s1 -b2 -e2 -f  ReMM.v0.4.hg38.tsv.gz
    
}

populate_CADD() {
    URL_PREFIX=https://krishna.gs.washington.edu/download/CADD/v1.7/GRCh38
    FILES=(
        MD5SUMs
        whole_genome_SNVs.tsv.gz.tbi
        whole_genome_SNVs.tsv.gz
    )

    echo "Downloading..."
    wget -c --xattr "${FILES[@]/#/$URL_PREFIX/}"
}

populate_CGD() {
    local URL=https://research.nhgri.nih.gov/CGD/download/txt/CGD.txt.gz
    local filename=${URL##*/}
    local out_file=CGD_cleaned.txt

    log "Downloading..."
    wget -c --xattr -O "$filename" "$URL"

    log "Cleansing data..."
    zcat "$filename" | tr ';"' ',_' > "$out_file"

    log "Cleaning up..."
    rm -f "$filename"
}

populate_FlagLRG() {
    wget --xattr https://ftp.ebi.ac.uk/pub/databases/lrgex/list_LRGs_transcripts_xrefs.txt
}

populate_revel() {

    URL=https://rothsj06.dmz.hpc.mssm.edu/revel-v1.3_all_chromosomes.zip

    filename="${URL##*/}"

    echo "Downloading..."
    wget -c --xattr -O "$filename" "$URL"

    echo "Extracting and reformatting..."
    unzip -p "$filename" revel_with_transcript_ids |\
    tr "," "\t" |\
    sed '1s/.*/#&/' |\
    gzip -1 > new_tabbed_revel.tsv.gz

    zgrep -h -v '^#chr' new_tabbed_revel.tsv.gz |\
    awk '$3 != "." ' |\
    sort -k1,1 -k3,3n |\
    cat <(zcat new_tabbed_revel.tsv.gz | head -n1) - |\
    bgzip -c > new_tabbed_revel_grch38.tsv.gz

    rm -f new_tabbed_revel.tsv.gz

    echo "Indexing..."
    tabix -f -s 1 -b 3 -e 3 new_tabbed_revel_grch38.tsv.gz

    echo "Cleaning up..."
    rm -f "$filename"

}

populate_UTRAnnotator() {
    wget -c --xattr https://raw.githubusercontent.com/Ensembl/UTRannotator/master/uORF_5UTR_GRCh38_PUBLIC.txt
}

populate_constraintv2() {
    local DL_URL=https://storage.googleapis.com/gcp-public-data--gnomad/release/2.1.1/constraint
    local FILENAME=gnomad.v2.1.1.lof_metrics.by_transcript.txt.bgz

    log "Downloading Gnomad LoF V2 Metrics..."
    wget -c --xattr -O $FILENAME "$DL_URL/$FILENAME"

    log "Decompressing..."
    bgzip -d $FILENAME
}

populate_constraintv4() {
    local DL_URL=https://storage.googleapis.com/gcp-public-data--gnomad/release/4.1/constraint
    local FILENAME=gnomad.v4.1.constraint_metrics.tsv

    log "Downloading Gnomad LoF V4 Metrics..."
    wget -c --xattr -O $FILENAME "$DL_URL/$FILENAME"

    log "Decompressing..."
    bgzip -d $FILENAME
}


for x in CGD FlagLRG revel UTRAnnotator CADD AlphaMissense ReMM constraintv2 constraintv4 ; do
    echo "Populating $x..."
    mkdir -p "$x"
    (cd "$x"; eval "populate_$x")
done

