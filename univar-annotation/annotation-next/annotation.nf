#!/usr/bin/env nextflow
/* ***************************************************** *
 *                Annotation Workflow                    *
 *                Version:   1.0.0                       *
 * ***************************************************** */

/* ***************************************************** *
 *                   Import Section                      *
 * ***************************************************** */
include { SNP_ANNOTATION } from './workflows/snp_annotation'
include { SV_ANNOTATION } from './workflows/sv_annotation'
include { IMPORT_DATA_TO_DB } from './workflows/annotation_to_db'
/* ************************************************************** *
 *                Required Parameters (no default)                *
 * database_name         the name of the database                 *
 * backend_url           the base url of UniVar backend           *
 * nf_secret             the secret to call backend               *
 * ************************************************************** */
 
 /* ************************************************************** *
  *                Optional Parameters                             *
  * in_snp_file           the path of the input snp file           *
  * in_sv_files           the path of the input sv files           *
  * ************************************************************** */
params.in_snp_file = null
params.in_sv_files = null

workflow {
    def secret = params.nf_secret
    def backend_url = params.backend_url
    def database_name = params.database_name

    if (params.in_snp_file) {
        SNP_ANNOTATION(channel.fromPath(params.in_snp_file))
    }

    if (params.in_sv_files) {
        SV_ANNOTATION(channel.fromPath(params.in_sv_files))
    }

    wait_all_complete(params.in_snp_file ? SNP_ANNOTATION.out : '', params.in_sv_files ? SV_ANNOTATION.out : '')

    IMPORT_DATA_TO_DB(params.in_snp_file ? params.in_snp_file : params.in_sv_files[0], "complete", wait_all_complete.out.all_completed)

    workflow.onError {
        notify_backend(secret, backend_url, database_name)
    }
}


process wait_all_complete {
    input:
    val snp_annotated
    val sv_annotated_complete_ch

    output:
    stdout emit: all_completed

    script:
    """
        echo "SNP and SV workflow completed"
    """
}

def notify_backend(secret, backend_url, database_name) {

    log.info("workflow error message: ${workflow.errorMessage}")
    def notify_backend_cmd = ["./notify_backend.sh", "${secret}", "${backend_url}", "${database_name}"]
    notify_backend_cmd.execute()
}
