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

SRC=http://dgv.tcag.ca/dgv/docs

FILE=DGV.GS.hg38.gff3
VERSION=20160615

INNER_HEADER=$(cat << EOM
#title=Dgv_gold_inner															
#assembly=GRCh38															
#matchVariantsBy=position															
#CHROM	POS	REF	ALT	END	SVTYPE	SVTYPE_details	ID	variant_sub_type	outer_start	inner_start	inner_end	outer_end	inner_rank	num_samples	Frequency
#categories	.	.	.	.	.	.	.	.	.	.	.	.	.	.	.
#descriptions	.	.	.	.	.	.	.	.	.	.	.	.	.	.	.
#type	.	.	.	.	string	string	string	string	string	string	string	string	string	string	string
EOM
)

OUTER_HEADER=$(cat << EOM
#title=Dgv_gold_outer															
#assembly=GRCh38															
#matchVariantsBy=position															
#CHROM	POS	REF	ALT	END	SVTYPE	SVTYPE_details	ID	variant_sub_type	outer_start	inner_start	inner_end	outer_end	inner_rank	num_samples	Frequency
#categories	.	.	.	.	.	.	.	.	.	.	.	.	.	.	.
#descriptions	.	.	.	.	.	.	.	.	.	.	.	.	.	.	.
#type	.	.	.	.	string	string	string	string	string	string	string	string	string	string	string
EOM
)

wget -O "$FILE" "$SRC/$FILE"

perl -pe 's/ID=([^;]+);(.*?variant_sub_type=([^;]+);)?(.*?outer_start=([^;]+);)?(.*?inner_start=([^;]+);)?(.*?inner_end=([^;]+);)?(.*?outer_end=([^;]+);)?(.*?inner_rank=([^;]+);)?(.*?num_samples=([^;]+);)?(.*?Frequency=([^;]+);)?.*$/$1\t$3\t$5\t$7\t$9\t$11\t$13\t$15\t$17/' \
 "$FILE" > "${FILE}.tmp"

awk -vOFS="\t" '{print $1,$12,"N","<"$2">",$13,$2,$3,$9,$10,$11,$12,$13,$14,$15,$16,$17 }' "${FILE}.tmp" | awk '! seen[$0]++' | sort -k1,1 -k2,2n > DGV.GS.hg38.${VERSION}.inner.tsv

awk -vOFS="\t" '{$2=$10;$5=$13; print $0}' DGV.GS.hg38.${VERSION}.inner.tsv | sort -k1,1 -k2,2n > DGV.GS.hg38.${VERSION}.outer.tsv

cat <(echo "$INNER_HEADER") DGV.GS.hg38.${VERSION}.inner.tsv > DGV.GS.hg38.${VERSION}.inner.txt
cat <(echo "$OUTER_HEADER") DGV.GS.hg38.${VERSION}.outer.tsv > DGV.GS.hg38.${VERSION}.outer.txt

docker run --rm --user $(id -u):$(id -g) -v $PWD:$PWD -v $NIVANA_REF:$NIVANA_REF -w $PWD nirvana-env dotnet /usr/src/Nirvana/SAUtils.dll customvar \
    -r $NIVANA_REF -i DGV.GS.hg38.${VERSION}.inner.txt -o ./
docker run --rm --user $(id -u):$(id -g) -v $PWD:$PWD -v $NIVANA_REF:$NIVANA_REF -w $PWD nirvana-env dotnet /usr/src/Nirvana/SAUtils.dll customvar \
    -r $NIVANA_REF -i DGV.GS.hg38.${VERSION}.outer.txt -o ./

rm "$FILE" "${FILE}.tmp" DGV.GS.hg38.${VERSION}.*.tsv