#!/bin/bash
set -euo pipefail

#srun -c 8 --mem-per-cpu 4G --pty bash -i

## Below is the list of docker images that required for this script
## 1. bcftools-env:latest
## 2. nirvana-env:latest

# Check if data_dir is provided
# Please ensure the data directory must contain below files
# 1. download files from ../download/populate.sh 
# 2. the 1kg/20130606_g1k_3202_samples_ped_population.bcf_samples.3202_2504_lr.file
# 3. the 1kg/1kg_ramesh/raw/survindel2-1.0_survclusterer-1.0_survtyper-1.0_bcftools-merge/1000G_DEL_DUP.20230319.vcf.gz
# 4. the 1kg/1kg_ramesh/raw/insurveyor-1.1.1_survtyper-0.1_survclusterer-1.0/1000G_INS.20230321.vcf.gz
if [ -z "$1" ]; then
    echo "Error: data_dir parameter is required."
    exit 1
fi

#Analytic Farm
OUTPUT_PREFIX=1kg.survtyper.3types.20230321
DATA_DIR=$1

NIVANA_REF=$DATA_DIR/nirvana/download/References/Homo_sapiens.GRCh38.Nirvana.dat

SURVINDEL_VCF=$DATA_DIR/1kg/1kg_ramesh/raw/survindel2-1.0_survclusterer-1.0_survtyper-1.0_bcftools-merge/1000G_DEL_DUP.20230319.vcf.gz
survindel_name=$(basename $SURVINDEL_VCF)
INSURVEYOR_VCF=$DATA_DIR/1kg/1kg_ramesh/raw/insurveyor-1.1.1_survtyper-0.1_survclusterer-1.0/1000G_INS.20230321.vcf.gz
insurveyor_name=$(basename $INSURVEYOR_VCF)
SAMPLE_GROUPING=$DATA_DIR/1kg/20130606_g1k_3202_samples_ped_population.bcf_samples.3202_2504_lr.file

#Replace non-PASS GT to ./. (for Survindel output only)
cat <(zgrep '#' $SURVINDEL_VCF) <(zgrep -v '#' $SURVINDEL_VCF | perl -pe 's/([0-9]|[\.])\/([0-9]|[\.]):(?!PASS)/.\/.:/g') | gzip -c > ${survindel_name%.vcf.gz}.replace_fail_GT.vcf.gz


# Fill-tags
docker run --rm --user $(id -u):$(id -g) -v $PWD:$PWD -v $DATA_DIR:$DATA_DIR -w $PWD bcftools-env \
    bcftools +fill-tags -Oz -o ${survindel_name%.vcf.gz}.replace_fail_GT.bcf_fill.vcf.gz ${survindel_name%.vcf.gz}.replace_fail_GT.vcf.gz -- -S $SAMPLE_GROUPING
docker run --rm --user $(id -u):$(id -g) -v $PWD:$PWD -v $DATA_DIR:$DATA_DIR -w $PWD bcftools-env \
    bcftools +fill-tags -Oz -o ${insurveyor_name%.vcf.gz}.bcf_fill.vcf.gz $INSURVEYOR_VCF -- -S $SAMPLE_GROUPING


# Prepare nirvana format custom anno txt file
docker run --rm --user $(id -u):$(id -g) -v $PWD:$PWD -w $PWD  bcftools-env bcftools query -i "AC_grp2504 != 0" -f \
 "%CHROM\t%POS\t%REF\t%ALT\t%END\t%INFO/SVTYPE\t%INFO/SVLEN\t%ID\t%INFO/AF_grp2504\t%INFO/NS_grp2504\t%INFO/AF_EAS2504\t%INFO/NS_EAS2504\t%INFO/IMPRECISE\t\t\n" \
 ${survindel_name%.vcf.gz}.replace_fail_GT.bcf_fill.vcf.gz > ${survindel_name%.vcf.gz}.replace_fail_GT.bcf_fill.custom_annotation.body.txt

docker run --rm --user $(id -u):$(id -g) -v $PWD:$PWD -w $PWD  bcftools-env bcftools query -i "AC_grp2504 != 0" -f \
 "%CHROM\t%POS\t%REF\t%ALT\t%END\t%INFO/SVTYPE\t%INFO/SVLEN\t%ID\t%INFO/AF_grp2504\t%INFO/NS_grp2504\t%INFO/AF_EAS2504\t%INFO/NS_EAS2504\t%INFO/IMPRECISE\t%INFO/SVINSSEQ\t%INFO/INCOMPLETE_ASSEMBLY\n" \
 ${insurveyor_name%.vcf.gz}.bcf_fill.vcf.gz > ${insurveyor_name%.vcf.gz}.bcf_fill.custom_annotation.body.txt

cat ${survindel_name%.vcf.gz}.replace_fail_GT.bcf_fill.custom_annotation.body.txt ${insurveyor_name%.vcf.gz}.bcf_fill.custom_annotation.body.txt |\
 sort -k1,1 -k2,2n > $OUTPUT_PREFIX.custom_annotation.body.txt

cat <<EOT > $OUTPUT_PREFIX.custom_annotation.header.txt
#title=1kg_survtyper_DelDupIns														
#assembly=GRCh38														
#matchVariantsBy=position														
#CHROM	POS	REF	ALT	END	SVTYPE	SVLEN	ID	AF_grp2504	NS_grp2504	AF_EAS2504	NS_EAS2504	IMPRECISE	SVINSSEQ	INCOMPLETE_ASSEMBLY
#categories	.	.	.	.	.	.	.	.	.	.	.	.	.	.
#descriptions	.	.	.	.	.	.	.	.	.	.	.	.	.	.
#type	.	.	.	.	string	number	string	number	number	number	number	string	string	string
EOT

cat $OUTPUT_PREFIX.custom_annotation.header.txt $OUTPUT_PREFIX.custom_annotation.body.txt > $OUTPUT_PREFIX.final.txt

# Build custom anno
docker run --rm --user $(id -u):$(id -g) -v $PWD:$PWD -v $NIVANA_REF:$NIVANA_REF -w $PWD nirvana-env dotnet /usr/src/Nirvana/SAUtils.dll customvar -r $NIVANA_REF -i $OUTPUT_PREFIX.final.txt -o ./

rm -f ${survindel_name%.vcf.gz}.replace_fail_GT.vcf.gz ${survindel_name%.vcf.gz}.replace_fail_GT.bcf_fill.vcf.gz ${insurveyor_name%.vcf.gz}.bcf_fill.vcf.gz \
 ${survindel_name%.vcf.gz}.replace_fail_GT.bcf_fill.custom_annotation.body.txt ${insurveyor_name%.vcf.gz}.bcf_fill.custom_annotation.body.txt \
 $OUTPUT_PREFIX.custom_annotation.header.txt $OUTPUT_PREFIX.custom_annotation.body.txt #$OUTPUT_PREFIX.final.txt