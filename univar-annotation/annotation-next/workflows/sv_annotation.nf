#!/usr/bin/env nextflow
/* ************************************************************** *
 *                      SV Annotation Workflow                    *
 *                      Version:   1.0.0                          *
 * ************************************************************** */

/* ************************************************************** *
 *                      Import Section                            *
 * ************************************************************** */
include { import_data_to_db } from './annotation_to_db.nf'
// also require its required parameters
/* ************************************************************** *
 *                Required Parameters (no default)                *
 * output_filename       the name of the output file without ext  *
 * data_dir              the path of the data directory           *
 * ************************************************************** */

/* ************************************************************** *
 *                      Default Parameters                        *
 * nirvana_path          the path of the nirvana folder located   *
 * annotated_path        the path of the annotated folder located *
 * variant_type          the type of the data to database         *
 * ************************************************************** */
params.nirvana_path = "${params.data_dir}/annotation/tools-data/sv/nirvana"
params.annotated_path = "${params.data_dir}/annotation/samples/annotated"
params.variant_type = 'sv_json'

// Workflow block
workflow SV_ANNOTATION {
    take:
    sv_file

    main:
    if (sv_file) {
        get_output_name(sv_file)

        nirvana_input = sv_file
            .combine(get_output_name.out.output_name)
            .filter { vcf, name -> vcf.name == "${name}.vcf.gz" }
            .map { vcf, name -> tuple(vcf, name) }

        nirvana(
            nirvana_input.map { it[0] },
            params.nirvana_path,
            params.annotated_path,
            nirvana_input.map { it[1] },
        )

        // Debugging
        import_data_to_db(
            nirvana.out,
            params.variant_type,
            Channel.value('useless'),
        )
    }
    else {
        nirvana(
            params.in_vcf_file,
            Channel.fromPath(params.nirvana_path),
            Channel.fromPath(params.annotated_path),
            params.output_filename,
        )
        import_data_to_db(
            nirvana.out,
            params.variant_type,
            Channel.value('useless'),
        )
    }

    emit:
    complete = import_data_to_db.out.complete_import.collect() // Emit completion signals
}

process get_output_name {
    input:
    path input_vcf

    output:
    stdout emit: output_name

    script:
    """
        filename=\$(basename ${input_vcf})
        echo "\${filename%.vcf.gz}" | tr -d '\n'
    """
}

// Define the process for running vep
process nirvana {
    container 'nirvana-env:1.0.1'
    containerOptions "--volume ${nirvana_path}:${nirvana_path} --volume ${annotated_path}:${annotated_path}"
    tag "${json_file_name}"

    input:
    path input_vcf
    val nirvana_path
    val annotated_path
    val json_file_name

    output:
    path "${json_file_name}.json.gz"

    script:
    """
        info_tags=\$(zgrep -w '^##INFO=<ID' "${input_vcf}" | perl -pe 's/^##INFO=<ID=([^,]+).+\$/\$1/g' | sed -z 's/\\n/,/g;s/,\$//')

        dotnet /usr/src/Nirvana/Nirvana.dll -c ${nirvana_path}/Cache/GRCh38/Both -r ${nirvana_path}/Homo_sapiens.GRCh38.Nirvana.dat \
        --sd ${nirvana_path}/SupplementaryAnnotation/GRCh38 --sd ${nirvana_path}/custom_anno \
        -i ${input_vcf} --vcf-info="\$info_tags" --ins-window-size=150 --bnd-window-size=150 -o output

        output_json="${annotated_path}/${json_file_name}.json.gz"
        cp output.json.gz \$output_json
        mv output.json.gz "${json_file_name}.json.gz"
    """
}
