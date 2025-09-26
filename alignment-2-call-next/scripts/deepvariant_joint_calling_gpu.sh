#!/bin/sh

# Function to extract suffix (Mat or Pat) from filename
get_suffix() {
    local base=$(basename "$1" .bam)
    if echo "$base" | grep -qi "Mat"; then
        echo "Mat"
    elif echo "$base" | grep -qi "Pat"; then
        echo "Pat"
    else
        echo ""  # Default if neither Mat nor Pat is found
    fi
}

# Check for correct number of arguments
if [ $# -lt 4 ] || [ $# -gt 5 ]; then
    echo "usage: $0 N_THREADS CHILD_BAM PARENT1_BAM [PARENT2_BAM] OUTPUT_PATH_PREFIX"
    echo "  - PARENT2_BAM is optional"
    echo "  - OUTPUT_PATH_PREFIX should be a full path with prefix (e.g., /path/to/output/prefix)"
    exit 1
fi

# Assign parameters based on number of arguments
N_THREADS=$1
CHILD_BAM=$2
PARENT1_BAM=$3

if [ $# -eq 5 ]; then
    PARENT2_BAM=$4
    OUTPUT_PATH_PREFIX=$5
else
    PARENT2_BAM=""
    OUTPUT_PATH_PREFIX=$4
fi

# Extract output directory and prefix
OUTPUT_DIR=$(dirname "$OUTPUT_PATH_PREFIX")
prefix=$(basename "$OUTPUT_PATH_PREFIX")
sample_id=${prefix%%___*}

fastapath=<### replace with the path contain fasta>

# Get directory paths and filenames
child_dir=$(dirname $(readlink -f "$CHILD_BAM"))
child_bam=$(basename $(readlink -f "$CHILD_BAM"))
p1_dir=$(dirname $(readlink -f "$PARENT1_BAM"))
p1_bam=$(basename $(readlink -f "$PARENT1_BAM"))

# Get suffix for parent1
p1_suffix=$(get_suffix "$PARENT1_BAM")

# Handle optional parent2
if [ ! -z "$PARENT2_BAM" ]; then
    p2_dir=$(dirname $(readlink -f "$PARENT2_BAM"))
    p2_bam=$(basename $(readlink -f "$PARENT2_BAM"))
    # Get suffix for parent2
    p2_suffix=$(get_suffix "$PARENT2_BAM")
fi

# Create output directory
mkdir -p "$OUTPUT_DIR/intermediate_results_dir"

# Build the base Singularity command with all bind mounts
CMD="singularity run --nv \
    -B $(readlink -f "$OUTPUT_DIR"):/data/result \
    -B $child_dir:/data/bam/child \
    -B $p1_dir:/data/bam/parent1 \
    -B $fastapath:/data/common"

# Add parent2 bind mount if provided
if [ ! -z "$PARENT2_BAM" ]; then
    CMD="$CMD \
    -B $p2_dir:/data/bam/parent2"
fi

# Add the container image and internal command
CMD="$CMD \
    docker://google/deepvariant:deeptrio-1.8.0-gpu \
    /opt/deepvariant/bin/deeptrio/run_deeptrio \
    --model_type WGS \
    --ref /data/common/GRCh38_no_alt_analysis_set.fasta \
    --reads_child /data/bam/child/$child_bam \
    --reads_parent1 /data/bam/parent1/$p1_bam \
    --output_vcf_child /data/result/${prefix}.vcf.gz \
    --output_vcf_parent1 /data/result/${prefix}${p1_suffix}.vcf.gz \
    --output_gvcf_child /data/result/${prefix}.g.vcf.gz \
    --output_gvcf_parent1 /data/result/${prefix}${p1_suffix}.g.vcf.gz \
    --sample_name_child ${sample_id} \
    --sample_name_parent1 ${sample_id%P}${p1_suffix} \
    --num_shards $N_THREADS \
    --logging_dir=/data/result/logs \
    --intermediate_results_dir /data/result/intermediate_results_dir"

# Add parent2 runtime parameters if provided
if [ ! -z "$PARENT2_BAM" ]; then
    CMD="$CMD \
    --reads_parent2 /data/bam/parent2/$p2_bam \
    --output_vcf_parent2 /data/result/${prefix}${p2_suffix}.vcf.gz \
    --output_gvcf_parent2 /data/result/${prefix}${p2_suffix}.g.vcf.gz \
    --sample_name_parent2 ${sample_id%P}${p2_suffix}"
fi

echo $CMD
# Execute the command
eval $CMD
