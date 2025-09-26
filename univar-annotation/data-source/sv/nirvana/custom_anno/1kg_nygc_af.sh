#!/bin/bash
set -euo pipefail

## Below is the list of docker images that required for this script
## 1. bcftools-env:latest
## 2. nirvana-env:latest

# Check if data_dir is provided
# Please ensure the data directory must contain below files
# 1. download files from ../download/populate.sh 
# 2. the 1kg/20130606_g1k_3202_samples_ped_population.bcf_samples.3202_2504_lr.file
if [ -z "$1" ]; then
    echo "Error: data_dir parameter is required."
    exit 1
fi

SRC=https://ftp.1000genomes.ebi.ac.uk/vol1/ftp/data_collections/1000G_2504_high_coverage/working/20210124.SV_Illumina_Integration
FILE=1KGP_3202.gatksv_svtools_novelins.freeze_V3.wAF.vcf.gz

DATA_DIR=$1
NIVANA_REF=$DATA_DIR/data/nirvana/download/References/Homo_sapiens.GRCh38.Nirvana.dat

wget -O "$FILE" "$SRC/$FILE"

# Fill-tags
docker run --rm -v $PWD:$PWD -v $DATA_DIR:/data -w $PWD bcftools-env /bin/bash <<< \
    "bcftools +fill-tags $FILE -- -S /data/1kg/20130606_g1k_3202_samples_ped_population.bcf_samples.3202_2504_lr.file | \
    bcftools query -i \"AC_grp2504 != 0\" -f \"%CHROM\t%POS\t%REF\t%ALT\t%END\t%INFO/SVTYPE\t%INFO/SVLEN\t%ID\t%INFO/AF_grp2504\t%INFO/NS_grp2504\t%INFO/AF_EAS2504\t%INFO/NS_EAS2504\t%INFO/IMPRECISE\t%INFO/INSSEQ\n\" | \
    sort -k1,1 -k2,2n > ${FILE%.vcf.gz}.custom_annotation.body.txt"

cat <<EOT > ${FILE%.vcf.gz}.custom_annotation.header.txt
#title=1kg_NYGC_30x													
#assembly=GRCh38													
#matchVariantsBy=position													
#CHROM	POS	REF	ALT	END	SVTYPE	SVLEN	ID	AF_grp2504	NS_grp2504	AF_EAS2504	NS_EAS2504	IMPRECISE	SVINSSEQ
#categories	.	.	.	.	.	.	.	.	.	.	.	.	.
#descriptions	.	.	.	.	.	.	.	.	.	.	.	.	.
#type	.	.	.	.	string	number	string	number	number	number	number	string	string
EOT

cat ${FILE%.vcf.gz}.custom_annotation.header.txt ${FILE%.vcf.gz}.custom_annotation.body.txt > ${FILE%.vcf.gz}.final.txt


# Build custom anno
docker run --rm -v $PWD:$PWD -v $NIVANA_REF:$NIVANA_REF -w $PWD nirvana-env dotnet /usr/src/Nirvana/SAUtils.dll customvar -r $NIVANA_REF -i ${FILE%.vcf.gz}.final.txt -o ./

rm ${FILE%.vcf.gz}.custom_annotation.header.txt ${FILE%.vcf.gz}.custom_annotation.body.txt $FILE