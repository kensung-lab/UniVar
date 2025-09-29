#!/usr/bin/env nextflow
/* ****************************************************************** *
 *                      Exomiser Workflow                             *
 *                      Version:   1.0.2                              *
 * ****************************************************************** */

/* ****************************************************************** *
 *                Required Parameters (no default)                    *
 * proband_id            To identify the proband in the pedigree file *
 * ped_path              path to the pedigree file                    *
 * hpo_path              path to the HPO file                         *
 * access_group          access group of this sample                  *
 * exomiser_run          the name of this run                         *
 * vcf_files             the path of those vcf files                  *
 * mongo_base_url        the base url of the mongo database           *
 * database_name         the name of the database                     *
 * variant_import_tool   the path of the variant import tool          *
 * data_dir              the path of the data directory               *
 * ****************************************************************** */

/* ****************************************************************** *
 *                      Default Parameters                            *
 * exomiser_version      the version of exomiser                      *
 * exomiser_template     the path of the exomiser template file       *
 * exomiser_properties   the path of the exomiser properties file     *
 * exomiser_local_dir    the path of the exomiser local directory     *
 * liftover_path         the path of the liftover chain file          *
 * exomiser_result_dir   the path of the exomiser result directory    *
 * user_group            the expected owner of the output files       *
 * ****************************************************************** */
params.exomiser_version = '14.1.0'
params.exomiser_template = "${params.data_dir}/annotation/tools-data/common/exomiser/config/exomiser.yml.m4"
params.exomiser_properties = "${params.data_dir}/annotation/tools-data/common/exomiser/config/exomiser.properties"
params.exomiser_local_dir = "${params.data_dir}/annotation/tools-data/common/exomiser/databases"
params.liftover_path = "${params.data_dir}/annotation/tools-data/common/hg38ToHg19.over.chain.gz"
params.exomiser_result_dir = "${params.data_dir}/annotation/samples/exomiser_result"
params.user_group = '1020:1002' 

// Concatenate snp and sv vcf files
process concat_vcfs {
    cpus 8
    container 'bcftools:1.21'
    publishDir "data/results/concat_vcfs", mode: 'copy'
    
    input:
    path(vcf_files, arity: '1..*') 
    
    output:
    path 'concat.vcf.gz'

    script:
    """
        # Function to extract caller name from filename
        extract_caller_name() {
            local file="\$1"
            local filename=\$(basename "\$file")
            local filename_no_ext="\${filename%.vcf.gz}"
            local caller_name="\${filename_no_ext##*.}"
            
            if [ "\$caller_name" = "\$filename_no_ext" ]; then
                caller_name=""
            else
                caller_name="\${caller_name#.}"
            fi
            
            echo "\$caller_name"
        }

        # Function to get samples from VCF
        get_samples() {
            local file="\$1"
            bcftools query -l "\$file" | tr '\n' ',' | sed 's/,\$//'
        }

        vcf_files=\$(echo "$vcf_files" | tr ' ' '\n')
        num_files=\$(echo "\$vcf_files" | wc -l)

        # Check sample consistency across all VCFs
        first_samples=""
        all_match=true
        file_counter=1
        
        echo "Checking sample consistency across VCFs..."
        for file in \$vcf_files; do
            samples=\$(get_samples "\$file")
            echo "File \$file_counter samples: \$samples"
            
            if [ -z "\$first_samples" ]; then
                first_samples="\$samples"
            elif [ "\$samples" != "\$first_samples" ]; then
                all_match=false
                echo "WARNING: Sample order mismatch detected in \$file"
            fi
            ((file_counter++))
        done

        if [ \$num_files -eq 1 ]; then
            caller_name=\$(extract_caller_name "\$vcf_files")
            bcftools index \$vcf_files --threads 8
            bcftools annotate --set-id "%CHROM\\_%POS\\_%REF\\_%ALT\\-\${caller_name}" \$vcf_files -o concat.vcf.gz
        else
            file_list=""
            counter=1
            
            if [ "\$all_match" = true ]; then
                echo "All samples match, proceeding with concatenation..."
                for file in \$vcf_files; do
                    caller_name=\$(extract_caller_name "\$file")
                    output_file="output_\${counter}.vcf.gz"
                    bcftools index \$file --threads 8
                    bcftools annotate --set-id "%CHROM\\_%POS\\_%REF\\_%ALT\\-\${caller_name}" \$file -o "\$output_file"
                    bcftools index "\$output_file" --threads 8
                    
                    file_list+=" \$output_file"
                    ((counter++))
                done
                bcftools concat -a -Oz \$file_list --threads 8 > concat.vcf.gz
            else
                echo "Sample orders differ. Reordering samples to match first VCF..."
                counter=1
                for file in \$vcf_files; do
                    caller_name=\$(extract_caller_name "\$file")
                    temp_file="temp_\${counter}.vcf.gz"
                    output_file="output_\${counter}.vcf.gz"
                    
                    # Reorder samples to match first VCF
                    bcftools view "\$file" -s "\$first_samples" -Oz -o "\$temp_file"
                    bcftools index "\$temp_file" --threads 8
                    bcftools annotate --set-id "%CHROM\\_%POS\\_%REF\\_%ALT\\-\${caller_name}" "\$temp_file" -o "\$output_file"
                    bcftools index "\$output_file" --threads 8
                    
                    file_list+=" \$output_file"
                    ((counter++))
                done
                bcftools concat -a -Oz \$file_list --threads 8 > concat.vcf.gz
            fi
        fi
        
        # Verify final sample order
        echo "Final concat.vcf.gz samples:"
        bcftools query -l concat.vcf.gz
    """
}

// run Exomiser
process exomiser {
    memory '20 GB'
    container 'exomiser-env:1.0.0'
    publishDir "data/results/exomiser", mode: 'copy'

    input:
    path concat_vcf
    path ped_file
    path hpo_file
    path exomiser_template
    path exomiser_properties
    path exomiser_local_dir
    path exomiser_result_dir
    val proband_id
    val exomiser_version
    val user_group

    output:
    path "${proband_id}.concat.variants.tsv"

    script:
    """
        #!/bin/sh
        # prepare exomiser YML
        HPO=\$(grep -v "^#" $hpo_file | awk "{print \\"'\\"\\\$0\\"'\\"}" | paste -s -d, -)
        #e.g. HPO="'HP:0001249','HP:0000028','HP:0002058','HP:0000369','HP:0001999','HP:0000729','HP:0001252','HP:0011344','HP:0011343','HP:0001263'"
    
        PED="ped.trimmed"
        grep -v "^#" $ped_file > "\$PED"
        solo=""
        [[ \$(wc -l < "\$PED") -eq 1 ]] && {
            echo "annotating solo..."
            solo="true"
        }

        EXOMISER_YML=exomiser.yml
        PROBAND_ID=\$(basename $proband_id | cut -d '_' -f1)

        _VCF=$concat_vcf
        _PED="\$PED"
        _PROBAND="\$PROBAND_ID"
        [[ "\$solo" ]] && {
            _PED=""
            _PROBAND=""
        }

        m4 \
            -D __VCF__="\$_VCF" \
            -D __PED__="\$_PED" \
            -D __PROBAND__="\$_PROBAND" \
            -D __HPO_IDS__="\$HPO" \
            -D __OUTPUTDIRPREFIX__="results/" \
            -D __OUTPUTNAMEPREFIX__="result" \
            -D __ANALYSIS_MODE__=PASS_ONLY \
            "$exomiser_template" \
            > "\$EXOMISER_YML"

        java -Xms16g -Xmx16g -XX:+UseZGC -jar "$exomiser_local_dir/exomiser-cli/exomiser-cli-${exomiser_version}.jar" \
            --analysis \$EXOMISER_YML \
            --spring.config.location="$exomiser_properties"

        mv results/result.variants.tsv "${proband_id}.concat.variants.tsv"
        cp "${proband_id}.concat.variants.tsv" $exomiser_result_dir/
        chown $user_group "$exomiser_result_dir/${proband_id}.concat.variants.tsv"
    """

}

process import_exomiser_to_db {
    container 'variant-import-tool-env:1.0.1'

    input:
    path exomiser_result
    path variant_import_tool
    path ped_file
    path liftover_path
    val access_group
    val exomiser_run
    val variant_type
    val mongo_base_url
    val database_name

    script:
    """
        #!/bin/sh
        python3 "$variant_import_tool/variant_import_tool.py" \
        "$exomiser_result" \
        "$ped_file" \
        "$mongo_base_url" "$variant_type" \
        --access-group "$access_group" \
        --database-name "$database_name" \
        --exomiser-run "$exomiser_run" \
        --liftover-path "$liftover_path"
    """
}

// Workflow block
workflow {
    // pass all parameters' vcf to concatVcfs
    concat_vcfs(Channel.fromPath(params.vcf_files).collect()) 
    // run exomiser
    exomiser(concat_vcfs.out, Channel.fromPath(params.ped_path), Channel.fromPath(params.hpo_path), Channel.fromPath(params.exomiser_template), Channel.fromPath(params.exomiser_properties), Channel.fromPath(params.exomiser_local_dir), Channel.fromPath(params.exomiser_result_dir), params.proband_id, params.exomiser_version, params.user_group)
    // import exomiser results to database
    import_exomiser_to_db(exomiser.out, Channel.fromPath(params.variant_import_tool), Channel.fromPath(params.ped_path), Channel.fromPath(params.liftover_path), params.access_group, params.exomiser_run, "exomiser", params.mongo_base_url, params.database_name)

    workflow.onError {
        println "Error: Pipeline execution stopped with the following message: ${workflow.errorMessage}"
    }
}