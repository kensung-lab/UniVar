#!/usr/bin/env nextflow
/* ************************************************************** *
 *                      Import Data to DB Workflow                *
 *                      Version:   1.0.0                          *
 * ************************************************************** */

/* ************************************************************** *
 *                Required Parameters (no default)                *
 * db_input_file         the path of the data file                *
 * ped_path              the path to the pedigree file            *
 * mongo_base_url        the base url of the mongo database       *
 * access_group          the access group of this sample          *
 * database_name         the name of the database                 *
 * variant_import_tool   the path of the variant import tool      *
 * variant_type          the type of the data to database         *
 * backend_url           the base url of UniVar backend           *
 * vit_secret            the secret to call backend               *
 * ************************************************************** */

/* ************************************************************** *
 *                      Default Parameters                        *
 * pipeline_version         the pipeline version of this run      *
 * liftover_path            the path of the liftover file         *
 * pycivic_cache_path       the path of the pycivic cache file    *
 * ************************************************************** */
params.pipeline_version = '1.0.2'
params.liftover_path = "${params.data_dir}/annotation/tools-data/common/hg38ToHg19.over.chain.gz"
params.pycivic_cache_path = "${params.data_dir}/annotation/tools-data/common/nightly-civicpy_cache.pkl"

workflow IMPORT_DATA_TO_DB {
    take:
    annotation_result
    variant_type
    all_completed

    main:
    input_file = annotation_result ? annotation_result : params.db_input_file
    run_type = variant_type ? variant_type : params.variant_type

    import_data_to_db(input_file, run_type, all_completed)

    emit:
    complete_import = import_data_to_db.out.complete_import
}

process import_data_to_db {
    container 'variant-import-tool-env:1.0.1'
    containerOptions "--volume ${params.variant_import_tool}:/src/variant_import_tool --volume ${params.ped_path}:${params.ped_path} --volume ${params.liftover_path}:${params.liftover_path} --volume ${params.pycivic_cache_path}:/app/nightly-civicpy_cache.pkl -e BACKEND_SECRET=${params.vit_secret} -e BACKEND_BASE_URL=${params.backend_url}"

    input:
    path db_input_file
    val variant_type
    val all_completed

    output:
    stdout emit: complete_import

    script:
    """
        #!/bin/sh
        python3 /src/variant_import_tool/variant_import_tool.py \
        "${db_input_file}" \
        "${params.ped_path}" \
        "${params.mongo_base_url}" ${variant_type} \
        --access-group "${params.access_group}" \
        --database-name "${params.database_name}" \
        --pipeline-version ${params.pipeline_version} \
        --liftover-path "${params.liftover_path}"
        echo "Completed import to DB with type: ${variant_type}"
    """
}
