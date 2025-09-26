#!/usr/bin/env nextflow
/* ************************************************************** *
 *                SNP Annotation Workflow                         *
 *                Version:   1.0.0                                *
 * ************************************************************** */

/* ************************************************************** *
 *                      Import Section                            *
 * ************************************************************** */
include { IMPORT_DATA_TO_DB } from './annotation_to_db.nf'
// also require its required parameters

/* ************************************************************** *
 *                Required Parameters (no default)                *
 * data_dir              the path of the data directory           *
 * ************************************************************** */

/* ************************************************************** *
 *                Default Parameters                              *
 * asset_path            the path of the assets file              *
 * vcfanno_template      the path of the vcfanno template file    *
 * chrXYh2d_script       the path of the chrXYh2d script          *
 * annotated_path        the path of the annotated folder located *
 * variant_type          the type of the data to database         *
 * regions_path          the exon bed file path                   *
 * ************************************************************** */
params.asset_path = "${params.data_dir}/annotation/tools-data/snp"
params.vcfanno_template = "${params.data_dir}/annotation/tools-data/snp/vcfanno/vcfanno-conf6.toml.m4"
params.chrXYh2d_script = "${params.data_dir}/annotation/tools-data/snp/vcfanno/chrXYh2d.pl"
params.annotated_path = "${params.data_dir}/annotation/samples/annotated"
params.variant_type = 'snp_vcf'
params.regions_path = "${params.data_dir}/annotation/tools-data/snp/mane/MANE.GRCh38.v1.4.ensembl_genomic.exon_flanked100.bed.gz"

// Workflow block
workflow SNP_ANNOTATION {
    take:
    snp_file

    main:
    if (snp_file) {
        extract_exon(snp_file, Channel.fromPath(params.regions_path), Channel.fromPath(params.regions_path + '.tbi'))
        vep(Channel.fromPath(params.asset_path + '/vep'), extract_exon.out)
        vcfanno(vep.out.vcf, Channel.fromPath(params.vcfanno_template), Channel.fromPath(params.asset_path + '/vcfanno/clinvar'))
        finalize(vcfanno.out, Channel.fromPath(params.chrXYh2d_script), Channel.fromPath(params.annotated_path), snp_file.map { file -> file.getName() })
        IMPORT_DATA_TO_DB(finalize.out.vcf, params.variant_type, Channel.value('useless'))
    }
    else {
        extract_exon(Channel.fromPath(params.in_vcf_file), Channel.fromPath(params.regions_path), Channel.fromPath(params.regions_path + '.tbi'))
        vep(Channel.fromPath(params.asset_path + '/vep'), extract_exon.out)
        vcfanno(vep.out.vcf, Channel.fromPath(params.vcfanno_template), Channel.fromPath(params.asset_path + '/vcfanno/clinvar'))
        finalize(vcfanno.out, Channel.fromPath(params.chrXYh2d_script), Channel.fromPath(params.annotated_path), Channel.fromPath(params.in_vcf_file).map { file -> file.getName() })
        IMPORT_DATA_TO_DB(finalize.out.vcf, params.variant_type, Channel.value('useless'))
    }

    emit:
    complete = IMPORT_DATA_TO_DB.out.complete_import // Emit completion signals
}

// Define the process to filter only exon left
process extract_exon {
    publishDir "data/filtered", mode: 'copy'

    input:
    path in_vcf
    path regions_file
    path regions_idx_file

    output:
    path "${in_vcf.name.replace('.vcf.gz', '_exon_flank100.vcf.gz')}", emit: vcf

    script:
    """
    docker run --rm \\
        -v "\$(readlink -f ${regions_file})":/work/regions.bed.gz:ro \\
        -v "\$(readlink -f ${in_vcf})":/work/input.vcf.gz:ro \\
        -v "\$PWD":/work/output \\
        --user \$(id -u):\$(id -g) \\
        bedtools-env:1.0.0 \\
        /bin/sh -c \\
        "bedtools intersect -wa -header -a /work/input.vcf.gz -b /work/regions.bed.gz | bgzip -l 1 > /work/output/${in_vcf.name.replace('.vcf.gz', '_exon_flank100.vcf.gz')}"
    """
}

// Define the process for running vep
process vep {
    publishDir "data/temp", mode: 'copy'

    input:
    path vep_data
    path in_vcf_file

    output:
    path 'vep.vcf.gz', emit: vcf
    path 'vep.warnings.txt', optional: true

    script:
    """
    #!/bin/bash
    tmp=./
    mkdir -p "\$tmp"
    trap 'rm -rf "\$tmp"' RETURN
    docker run --rm \
            -v "\$(readlink ${vep_data})":/opt/vep-data:ro \
            -v "\$(readlink ${in_vcf_file})":/inputs/in.vcf.gz:ro \
            -v "\$tmp":/data \
            --user \$(id -u):\$(id -g) \
        ensemblorg/ensembl-vep:release_113.3 \
        vep \
        --cache \
        --merged \
        --offline \
        --dir_cache /opt/vep-data/cache \
        --fasta /opt/vep-data/fasta/Homo_sapiens.GRCh38.dna.primary_assembly.fa.gz \
        --vcf \
        --everything \
        --verbose \
        --no_stats \
        --buffer_size 250000 \
        -i /inputs/in.vcf.gz \
        --format vcf \
        --output_file "/data/vep.vcf.gz" --compress_output bgzip \
        --warning_file "/data/vep.warnings.txt" \
        --force_overwrite \
        --fork 64 \
        --assembly GRCh38 \
        --dir_plugins /opt/vep-data/plugins \
        --plugin REVEL,/opt/vep-data/plugin-data/revel/new_tabbed_revel_grch38.tsv.gz \
        --plugin UTRAnnotator,file=/opt/vep-data/plugin-data/UTRAnnotator/uORF_5UTR_GRCh38_PUBLIC.txt \
        --plugin FlagLRG,/opt/vep-data/plugin-data/FlagLRG/list_LRGs_transcripts_xrefs.txt \
        --plugin CADD,/opt/vep-data/plugin-data/CADD/whole_genome_SNVs.tsv.gz \
        --plugin SpliceAI,snv=/opt/vep-data/plugin-data/SpliceAI/genome_scores_v1.3/spliceai_scores.raw.snv.hg38.vcf.gz,indel=/opt/vep-data/plugin-data/SpliceAI/genome_scores_v1.3/spliceai_scores.raw.indel.hg38.vcf.gz \
        --plugin cgd,/opt/vep-data/plugin-data/CGD/CGD_cleaned.txt \
        --plugin ReMM,/opt/vep-data/plugin-data/ReMM/ReMM.v0.4.hg38.tsv.gz \
        --plugin AlphaMissense,file=/opt/vep-data/plugin-data/AlphaMissense/AlphaMissense_hg38.tsv.gz \
        --custom /opt/vep-data/gnomad/gnomadv2/gnomad.exomes.r2.1.1.sites.liftover_grch38.vcf.bgz,gnomadv2e,vcf,exact,0,AF,AF_afr,AF_amr,AF_asj,AF_eas,AF_fin,AF_nfe,AF_oth,AF_sas \
        --custom /opt/vep-data/gnomad/gnomadv2/gnomad.genomes.r2.1.1.sites.liftover_grch38.vcf.bgz,gnomadv2g,vcf,exact,0,AF,AF_afr,AF_amr,AF_asj,AF_eas,AF_fin,AF_nfe,AF_oth,AF_sas \
        --custom /opt/vep-data/gnomad/gnomadv3/gnomad.genomes.v3.1.2.sites.vcf.bgz,gnomadv3g,vcf,exact,0,AF,AF_afr,AF_amr,AF_ami,AF_asj,AF_eas,AF_fin,AF_mid,AF_nfe,AF_oth,AF_sas \
        --custom /opt/vep-data/CoLoRSdb/CoLoRSdb.GRCh38.v1.2.0.deepvariant.glnexus.vcf.gz,colorsdb,vcf,exact,0,AF,NS
    """
}

process vcfanno {
    publishDir "data/temp", mode: 'copy'

    input:
    path vep_vcf_file
    path vcfanno_template
    path clinvar_dir

    output:
    path 'vcfanno.vcf.gz'

    script:
    """
        conf=./vcfanno-conf6.toml

        m4 \
        -D __CLINVAR_DIR__=/data/clinvar \
        -D __CLINVAR_VERSION__=20250330 \
        "${vcfanno_template}" \
        > "\$conf" 

        docker run --rm \
            -v "\$(readlink ${clinvar_dir})":/data/clinvar:ro \
            -v "\$(readlink ${vep_vcf_file})":/var/in.vcf.gz:ro \
            -v "\$conf":/var/conf.toml \
            vcfanno:alpine-321 \
            -p "\$(nproc)" \
            /var/conf.toml \
            /var/in.vcf.gz \
          | bgzip -l 1 > "vcfanno.vcf.gz"
    """
}

process finalize {
    publishDir "data/result", mode: 'copy'

    input:
    path vcfanno_vcf_file
    path chrXYh2d_script
    path annotated_path
    val vcf_file_name

    output:
    path "${vcf_file_name}", emit: vcf
    path "${vcf_file_name}.tbi", emit: index

    script:
    """
        tmp=temp
        mkdir -p "\$tmp"
        trap 'rm -rf "\$tmp"' RETURN
        
        # extract headers
        set +o pipefail
        zcat "\$(readlink -f ${vcfanno_vcf_file})" |\
            awk '/^#/,/^#CHROM/ { print; next}  {exit 0}' > "\$tmp/headers"
        set -o pipefail

        # convert all hemizygous GT to haploid GT for display
        zcat "\$(readlink -f ${vcfanno_vcf_file})" |\
            grep -v '^#' |\
            awk '\$5 !~ /,/' | "\$(readlink -f ${chrXYh2d_script})" |\
            cat "\$tmp/headers" - |\
            bgzip -l 1 > output.vcf.gz
        mv output.vcf.gz ${vcf_file_name}
        tabix -f ${vcf_file_name}
        cp ${vcf_file_name} ${annotated_path}/${vcf_file_name}
        cp ${vcf_file_name}.tbi ${annotated_path}/${vcf_file_name}.tbi
    """
}
