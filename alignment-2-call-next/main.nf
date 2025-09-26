#!/usr/bin/env nextflow
/* ******************************************************************* *
 *                    Alignment to Calling Workflow                    *
 *                      Version:   0.0.25                              *
 * ******************************************************************* */

/* ******************************************************************* *
 *                Required Parameters (no default)                     *
 * data_dir              the path of the data directory                *
 * tools_path            the path of the tools directory               *
 * project_name          name of the project                           *
 * ******************************************************************* */

/* ******************************************************************* *
 *                      Default Parameters                             *
 * number_of_process     the default number of process                 *
 * fasta_path            the path to the fasta file                    *
 * alignment_path        the directory to store the bam result         *
 * univar_flag           flag to indicate this sample is to UniVar     *
 * univar_cram_path      the path to univar cram                       *
 * ******************************************************************* */
params.number_of_process = 32
params.cnv_cut_off = 5000
params.fasta_path = "${params.data_dir}/alignment/common/GRCh38_no_alt_analysis_set.fasta"
params.cnv_common_path = "${params.data_dir}/alignment/common/cnvkit"
params.alignment_path = "${params.data_dir}/alignment/samples/result"
params.univar_flag = false
params.univar_cram_path = "${params.data_dir}/alignment/samples/result/univar/cram"

/* ******************************************************************* *
 *                      Optional Parameters                            *
 * folder_fastq          path containing FASTQ files                   *
 * bam_path              the path of bam file(s) from merge_bams       *
 * ped_file              PED file defining family relationships        *
 * unique_string         the unique string(s) from merge_bams          *
 * ******************************************************************* */
params.folder_fastq = null
params.bam_path = null
params.ped_file = null
params.unique_string = null
params.r_env_path = null

/* ******************************************************************* *
 *                           Workflow Block                            *
 * ******************************************************************* */

workflow {
    def family_map = params.ped_file ? loadPedMap(params.ped_file) : [:]

    if (params.folder_fastq && (!params.bam_path || !params.unique_string)) {
        ch_read_pairs = Channel.fromPath("${params.folder_fastq}/*_{1,2}.{fq.gz,fastq.gz}", checkIfExists: true)
            .map { file ->
                def parts = file.name.split('_')
                def sample_type = parts[-2] == 'somatic' ? 'somatic' : 'germline'
                if (parts.size() == 2 && sample_type == 'germline' || parts.size() == 3 && sample_type == 'somatic') {
                    def sample_id = parts[0]
                    return tuple(sample_id, "mock_machine_code", "LA", sample_type, file)
                }
                else if (parts.size() == 4 && sample_type == 'germline' || parts.size() == 5 && sample_type == 'somatic') {
                    def machine_code = parts[0]
                    def lane = parts[1]
                    def sample_id = parts[2]
                    return tuple(sample_id, machine_code, lane, sample_type, file)
                }
                else if (parts.size() == 5 && sample_type == 'germline' || parts.size() == 6 && sample_type == 'somatic') {
                    def sample_id = parts[0]
                    def machine_code = parts[2]
                    def lane = parts[3]
                    return tuple(sample_id, machine_code, lane, sample_type, file)
                }
                else {
                    error("Invalid FASTQ filename format: ${file.name}. Expected 5 (germline) or 6 (somatic) parts, got ${parts.size()}.")
                }
            }
            .groupTuple(by: [0, 1, 2, 3])
            .map { sample_id, machine_code, lane, sample_type, files ->
                tuple(sample_id, machine_code, lane, sample_type, files.sort { it.name.contains('_1.') ? 0 : 1 })
            }

        bwa(ch_read_pairs, params.fasta_path, params.tools_path, params.number_of_process)

        // // Apply BQSR per lane
        // bqsr(
        //     bwa.out.aligned_bams,
        //     params.fasta_path,
        //     params.tools_path,
        //     params.alignment_path,
        //     params.number_of_process,
        //     params.project_name,
        // )

        ch_grouped_bams = bwa.out.aligned_bams
            .map { sample_id, _machine_code, _lane, sample_type, bam, bai ->
                tuple(sample_id, sample_type, tuple(bam, bai))
            }
            .groupTuple(by: [0, 1])
            .map { sample_id, sample_type, bam_bai_pairs ->
                def bams = bam_bai_pairs.collect { it[0] }
                def bais = bam_bai_pairs.collect { it[1] }
                tuple(sample_id, sample_type, bams, bais)
            }

        merge_bams(ch_grouped_bams, params.alignment_path, params.number_of_process, params.project_name)
        ch_input_bams = merge_bams.out.merge_output
    }
    else if (params.bam_path && params.unique_string) {
        def bam_files = params.bam_path instanceof String ? [params.bam_path] : params.bam_path
        def unique_strings = params.unique_string instanceof String ? [params.unique_string] : params.unique_string
        ch_input_bams = Channel.fromList(bam_files.zip(unique_strings))
            .map { bam_path, unique ->
                def bai_path = "${bam_path}.bai"
                def unique_file = file("${unique}.txt")
                unique_file.text = unique
                def sample_type = unique.contains('_somatic') ? 'somatic' : 'germline'
                [file(bam_path), file(bai_path), unique_file, sample_type]
            }
    }
    else {
        error("Must provide either folder_fastq or both bam_path and unique_string.")
    }

    cram(ch_input_bams.map { bam, bai, unique, sample_type -> tuple(bam, bai, unique.text.trim(), sample_type) }, params.fasta_path, params.alignment_path, params.number_of_process, params.project_name, params.univar_cram_path)
    qc_cov(ch_input_bams.map { bam, bai, unique, sample_type -> tuple(bam, bai, unique.text.trim(), sample_type) }, params.tools_path, params.fasta_path, params.alignment_path, params.number_of_process, params.project_name)
    qc_coverage(ch_input_bams.map { bam, bai, unique, sample_type -> tuple(bam, bai, unique.text.trim(), sample_type) }, params.alignment_path, params.number_of_process, params.project_name)
    qc_bam2bed(ch_input_bams.map { bam, bai, unique, sample_type -> tuple(bam, bai, unique.text.trim(), sample_type) }, params.tools_path, params.alignment_path, params.project_name)

    ch_bams_for_calling = ch_input_bams.map { bam, bai, unique, sample_type ->
        def sample_id = unique.text.tokenize('___')[0]
        tuple(sample_id, sample_type, bam, bai, unique.text)
    }

    ch_sample_groups = ch_bams_for_calling
        .groupTuple(by: 0)
        .map { sample_id, sample_types, bams, bais, uniques ->
            tuple(sample_id, sample_types, bams, bais, uniques)
        }

    // Germline BAMs
    ch_germline_bams = ch_bams_for_calling
        .filter { it[1] == 'germline' }
        .map { sample_id, _sample_type, bam, bai, unique ->
            tuple(sample_id, bam, bai, unique)
        }

    // Somatic BAMs (Normal-Tumor Pairs)
    ch_somatic_single = ch_sample_groups
        .filter { _sample_id, sample_types, _bams, _bais, _uniques -> sample_types.contains('somatic') && sample_types.contains('germline') && sample_types.size() == 2 }
        .map { sample_id, sample_types, bams, bais, uniques ->
            def somatic_idx = sample_types.indexOf('somatic')
            def germline_idx = sample_types.indexOf('germline')
            tuple(sample_id, bams[somatic_idx], bais[somatic_idx], uniques[somatic_idx], bams[germline_idx], bais[germline_idx], uniques[germline_idx])
        }

    // Somatic-Only BAMs (Tumor-Only)
    ch_somatic_only = ch_bams_for_calling
        .filter { it[1] == 'somatic' }
        .join(ch_sample_groups, by: 0)
        .filter { _sample_id, _type, _bam, _bai, _unique, types, _bams, _bais, _uniques -> !types.contains('germline') }
        .map { sample_id, _type, bam, bai, unique, _types, _bams, _bais, _uniques ->
            tuple(sample_id, bam, bai, unique)
        }

    // Germline Calling
    ch_germline_grouped = ch_germline_bams
        .map { sample_id, bam, bai, unique ->
            def family_id = family_map[sample_id] ? family_map[sample_id].family_id : sample_id
            tuple(family_id, tuple(sample_id, bam, bai, unique))
        }
        .groupTuple(by: 0)
        .map { family_id, samples ->
            def ped_order = family_map.findAll { it.value.family_id == family_id }.collect { it.key }
            def sorted_samples = samples.sort { a, b -> ped_order.indexOf(a[0]) <=> ped_order.indexOf(b[0]) }
            tuple(family_id, sorted_samples)
        }

    ch_germline_grouped
        .branch { _family_id, samples ->
            single: samples.size() == 1
            joint: samples.size() > 1
        }
        .set { germline_branched }

    sv_calling(germline_branched.single.map { _family_id, samples -> samples[0] }, params.tools_path, Channel.fromPath(params.alignment_path), params.fasta_path, params.number_of_process, params.project_name)
    snp_calling(germline_branched.single.map { _family_id, samples -> samples[0] }, params.tools_path, Channel.fromPath(params.alignment_path), params.number_of_process, params.project_name)
    cnv_calling(germline_branched.single.map { _family_id, samples -> samples[0] }, Channel.fromPath(params.alignment_path), Channel.fromPath(params.r_env_path), params.fasta_path, params.cnv_common_path, snp_calling.out.snp_vcf, params.number_of_process, params.project_name, params.cnv_cut_off)

    germline_branched.joint
        .branch { _family_id, samples ->
            with_parents: samples.size() >= 2 && samples.size() <= 3 && isTrioOrDuo(samples, family_map)
            standard: samples.size() > 1
        }
        .set { joint_branched }

    joint_snp_calling_with_parents(joint_branched.with_parents, params.tools_path, Channel.fromPath(params.alignment_path), params.number_of_process, params.project_name, family_map)
    joint_snp_calling_standard(joint_branched.standard, params.tools_path, Channel.fromPath(params.alignment_path), params.number_of_process, params.project_name)
    joint_sv_calling(joint_branched.with_parents.mix(joint_branched.standard), params.tools_path, Channel.fromPath(params.alignment_path), params.fasta_path, params.number_of_process, params.project_name)
    joint_cnv_calling(joint_branched.with_parents.mix(joint_branched.standard), params.tools_path, Channel.fromPath(params.alignment_path), Channel.fromPath(params.r_env_path), params.fasta_path, params.cnv_common_path, joint_snp_calling_with_parents.out.snp_vcf.mix(joint_snp_calling_standard.out.snp_vcf), params.number_of_process, params.project_name, params.cnv_cut_off)
    // denovo_gear(joint_branched.with_parents, Channel.fromPath(params.tools_path), Channel.fromPath(params.alignment_path), Channel.fromPath(params.fasta_path), params.number_of_process, params.project_name, family_map)

    // merge_vcf_germline(
    //     joint_branched.with_parents,
    //     denovo_gear.out.denovo_vcf,
    //     joint_snp_calling_with_parents.out.snp_vcf,
    //     Channel.fromPath(params.tools_path),
    //     Channel.fromPath(params.fasta_path),
    //     params.alignment_path,
    //     params.number_of_process,
    //     params.project_name,
    // )

    // Somatic Calling (Normal-Tumor)
    somatic_snp_deepsomatic(ch_somatic_single, params.fasta_path, params.tools_path, params.alignment_path, params.number_of_process, params.project_name)
    somatic_denovo_gear(ch_somatic_single, params.fasta_path, params.tools_path, params.alignment_path, params.number_of_process, params.project_name)
    somatic_sv_manta(ch_somatic_single, params.fasta_path, params.tools_path, params.alignment_path, params.number_of_process, params.project_name)
    somatic_cnv_cnvkit(ch_somatic_single, params.fasta_path, params.tools_path, params.alignment_path, params.number_of_process, params.project_name)
    somatic_loh_facets(ch_somatic_single, params.fasta_path, params.tools_path, params.alignment_path, params.number_of_process, params.project_name)

    merge_vcf_somatic(
        ch_somatic_single.map { sample_id, _tb, _tbai, tu, _nb, _nbai, _nu -> tuple(sample_id, [tu]) },
        somatic_denovo_gear.out.denovo_vcf,
        somatic_snp_deepsomatic.out.snp_vcf,
        params.tools_path,
        params.alignment_path,
        params.project_name,
    )

    // Somatic-Only Calling
    somatic_only_snp_deepsomatic(ch_somatic_only, params.fasta_path, params.tools_path, params.alignment_path, params.number_of_process, params.project_name)
    somatic_only_sv_manta(ch_somatic_only, params.fasta_path, params.tools_path, params.alignment_path, params.number_of_process, params.project_name)
    somatic_only_cnv_cnvkit(ch_somatic_only, params.fasta_path, params.tools_path, params.alignment_path, params.number_of_process, params.project_name)
    somatic_only_purecn(ch_somatic_only, params.fasta_path, params.tools_path, params.alignment_path, params.number_of_process, params.project_name)

    wait_all_completed(
        sv_calling.out.sv_calling_success.mix(
            joint_sv_calling.out.sv_calling_success,
            somatic_sv_manta.out.sv_calling_success,
            somatic_only_sv_manta.out.sv_calling_success,
        ),
        snp_calling.out.snp_calling_success.mix(
            joint_snp_calling_with_parents.out.snp_calling_success,
            joint_snp_calling_standard.out.snp_calling_success,
            somatic_snp_deepsomatic.out.snp_calling_success,
            somatic_only_snp_deepsomatic.out.snp_calling_success,
        ),
        cnv_calling.out.cnv_calling_success.mix(
            joint_cnv_calling.out.cnv_calling_success
        ),
        cram.out.cram_success,
        qc_cov.out.qc_cov_success,
        qc_coverage.out.qc_coverage_success,
        qc_bam2bed.out.qc_bam2bed_success,
        somatic_cnv_cnvkit.out.cnv_success.mix(
            somatic_only_cnv_cnvkit.out.cnv_success
        ),
        somatic_loh_facets.out.loh_success.mix(
            somatic_only_purecn.out.loh_success
        ),
        ch_input_bams.map { _bam, _bai, unique, _sample_type -> unique.text },
        params.alignment_path,
        params.project_name,
    )
}

process bwa {
    cpus params.number_of_process
    tag "${sample_id}_${machine_code}_${lane}_${sample_type}"

    input:
    tuple val(sample_id), val(machine_code), val(lane), val(sample_type), path(reads)
    val fasta_path
    val tools_path
    val threads

    output:
    tuple val(sample_id), val(machine_code), val(lane), val(sample_type), path("${sample_id}_${machine_code}_${lane}_${sample_type}.dedup.bam"), path("${sample_id}_${machine_code}_${lane}_${sample_type}.dedup.bam.bai"), emit: aligned_bams

    script:
    """
    PLATFORM=\$(python ${tools_path}/get_fastq_platform.py \$(readlink -f ${reads[0]}))
    bwa mem -t ${threads} -R '@RG\\tID:${sample_id}_${machine_code}_${lane}_${sample_type}\\tPL:\\\${PLATFORM}\\tSM:${sample_id}' \$(readlink -f ${fasta_path}) \$(readlink -f ${reads[0]}) \$(readlink -f ${reads[1]}) > ${sample_id}_${machine_code}_${lane}_${sample_type}.sam 
    samtools sort -@${threads} -n ${sample_id}_${machine_code}_${lane}_${sample_type}.sam -o ${sample_id}_${machine_code}_${lane}_${sample_type}.sort_n.bam

    samtools fixmate -@${threads} -m ${sample_id}_${machine_code}_${lane}_${sample_type}.sort_n.bam ${sample_id}_${machine_code}_${lane}_${sample_type}.fixmate.bam && rm -f ${sample_id}_${machine_code}_${lane}_${sample_type}.bam ${sample_id}_${machine_code}_${lane}_${sample_type}.sam
    samtools sort -@${threads} ${sample_id}_${machine_code}_${lane}_${sample_type}.fixmate.bam -o ${sample_id}_${machine_code}_${lane}_${sample_type}.srt.bam && rm -f ${sample_id}_${machine_code}_${lane}_${sample_type}.sort_n.bam
    samtools markdup -@${threads} ${sample_id}_${machine_code}_${lane}_${sample_type}.srt.bam ${sample_id}_${machine_code}_${lane}_${sample_type}.dedup.bam
    samtools index -@${threads} ${sample_id}_${machine_code}_${lane}_${sample_type}.dedup.bam
    rm -f ${sample_id}_${machine_code}_${lane}_${sample_type}.fixmate.bam ${sample_id}_${machine_code}_${lane}_${sample_type}.srt.bam
    """
}

process bqsr {
    cpus params.number_of_process
    tag "${sample_id}_${machine_code}_${lane}_${sample_type}"

    input:
    tuple val(sample_id), val(machine_code), val(lane), val(sample_type), path(bam), path(bai)
    val fasta_path
    val tools_path
    val alignment_path
    val number_of_process
    val project_name

    output:
    tuple val(sample_id), val(machine_code), val(lane), val(sample_type), path("${sample_id}_${machine_code}_${lane}_${sample_type}.recal.bam"), path("${sample_id}_${machine_code}_${lane}_${sample_type}.recal.bam.bai"), emit: recal_bams
    stdout emit: bqsr_success

    script:
    """
    ${tools_path}/run_bqsr.sh ${bam} ${sample_id}_${machine_code}_${lane}_${sample_type} ${fasta_path}
    samtools index -@ ${number_of_process} ${sample_id}_${machine_code}_${lane}_${sample_type}.recal.bam
    echo "BQSR completed for ${sample_id}_${machine_code}_${lane}_${sample_type}"
    """
}


process merge_bams {
    cpus params.number_of_process
    tag "${sample_id}_${sample_type}"

    input:
    tuple val(sample_id), val(sample_type), path(bams), path(bais)
    val alignment_path
    val threads
    val project_name

    output:
    tuple path("${sample_id}_${sample_type}.srt.bam"), path("${sample_id}_${sample_type}.srt.bam.bai"), path("${sample_id}_${sample_type}.unique.txt"), val(sample_type), emit: merge_output

    script:
    def bam_count = bams.size()
    def output_subdir = sample_type == 'germline' ? 'germline' : 'somatic'
    """
    if [ ${bam_count} -gt 1 ]; then
        samtools merge -@${threads} ${sample_id}_${sample_type}.merged.bam ${bams.join(' ')} 2> ${sample_id}_${sample_type}.stderr.merge.txt
        samtools sort -@${threads} ${sample_id}_${sample_type}.merged.bam -o ${sample_id}_${sample_type}.srt.bam && rm -f ${sample_id}_${sample_type}.merged.bam
        samtools index -@${threads} ${sample_id}_${sample_type}.srt.bam
    else
        cp ${bams[0]} ${sample_id}_${sample_type}.srt.bam
        cp ${bais[0]} ${sample_id}_${sample_type}.srt.bam.bai
        samtools index -@${threads} ${sample_id}_${sample_type}.srt.bam
    fi
    

    unix_timestamp=\$(date +%s)
    random_string=\$(tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c 16)
    sha1_hash=\$(echo -n "\$random_string" | openssl dgst -sha1 | cut -d' ' -f2)
    first_12_chars=\${sha1_hash:0:12}
    unique_string="${sample_id}___${sample_type}-\${unix_timestamp}-\${first_12_chars}"

    mkdir -p ${alignment_path}/${project_name}/${output_subdir}/bam/\${unique_string}
    cp ${sample_id}_${sample_type}.srt.bam ${alignment_path}/${project_name}/${output_subdir}/bam/\${unique_string}/\${unique_string}.bam
    cp ${sample_id}_${sample_type}.srt.bam.bai ${alignment_path}/${project_name}/${output_subdir}/bam/\${unique_string}/\${unique_string}.bam.bai
    printf "%s" "\${unique_string}" > ${sample_id}_${sample_type}.unique.txt
    """
}

process cram {
    cpus params.number_of_process
    tag "${unique.tokenize('___')[0]}_${sample_type}"

    input:
    tuple path(bam), path(bai), val(unique), val(sample_type)
    path fasta_path
    val alignment_path
    val number_of_process
    val project_name
    val univar_cram_path

    output:
    stdout emit: cram_success

    script:
    def output_subdir = sample_type == 'germline' ? 'germline' : 'somatic'
    """
    mkdir -p ${alignment_path}/${project_name}/${output_subdir}/cram
    samtools view -@ ${number_of_process} -C -T \$(readlink -f ${fasta_path}) -o ${alignment_path}/${project_name}/${output_subdir}/cram/${unique}.cram ${bam}
    samtools index -@ ${number_of_process} ${alignment_path}/${project_name}/${output_subdir}/cram/${unique}.cram
    if [ "${univar_cram_path}" != "${alignment_path}" ]; then 
        mkdir -p ${univar_cram_path}/${output_subdir}
        ln -sf ${alignment_path}/${project_name}/${output_subdir}/cram/${unique}.cram ${univar_cram_path}/${output_subdir}/${unique}.cram
        ln -sf ${alignment_path}/${project_name}/${output_subdir}/cram/${unique}.cram.crai ${univar_cram_path}/${output_subdir}/${unique}.cram.crai
    fi
    echo "BAM to CRAM completed for ${unique} (${sample_type})"
    """
}

process qc_cov {
    cpus params.number_of_process
    tag "${unique.tokenize('___')[0]}_${sample_type}"

    input:
    tuple path(bam), path(bai), val(unique), val(sample_type)
    path tools_path
    val fasta_path
    val alignment_path
    val number_of_process
    val project_name

    output:
    stdout emit: qc_cov_success

    script:
    def output_subdir = sample_type == 'germline' ? 'germline' : 'somatic'
    """
    mkdir -p ${alignment_path}/${project_name}/${output_subdir}/qc/${unique}
    ${tools_path}/cal_bin_cov.py -i ${bam} -t ${number_of_process} -o ${alignment_path}/${project_name}/${output_subdir}/qc/${unique}/${unique}.1M.cov -r ${fasta_path}
    python ${tools_path}/plot_cov.py -i ${alignment_path}/${project_name}/${output_subdir}/qc/${unique}/${unique}.1M.cov -o ${alignment_path}/${project_name}/${output_subdir}/qc/${unique}/${unique}_cov.png
    echo "QC COV completed for ${unique} (${sample_type})"
    """
}

process qc_coverage {
    cpus 1
    tag "${unique.tokenize('___')[0]}_${sample_type}"

    input:
    tuple path(bam), path(bai), val(unique), val(sample_type)
    val alignment_path
    val number_of_process
    val project_name

    output:
    stdout emit: qc_coverage_success

    script:
    def output_subdir = sample_type == 'germline' ? 'germline' : 'somatic'
    """
    mkdir -p ${alignment_path}/${project_name}/${output_subdir}/qc/${unique}
    samtools coverage -o ${alignment_path}/${project_name}/${output_subdir}/qc/${unique}/${unique}.txt ${bam}
    echo "QC coverage completed for ${unique} (${sample_type})"
    """
}

process qc_bam2bed {
    cpus 1
    tag "${unique.tokenize('___')[0]}_${sample_type}"

    input:
    tuple path(bam), path(bai), val(unique), val(sample_type)
    path tools_path
    val alignment_path
    val project_name

    output:
    stdout emit: qc_bam2bed_success

    script:
    def output_subdir = sample_type == 'germline' ? 'germline' : 'somatic'
    """
    mkdir -p ${alignment_path}/${project_name}/${output_subdir}/qc/${unique}
    ${tools_path}/xq_bam2bed ${bam} ${alignment_path}/${project_name}/${output_subdir}/qc/${unique}/${unique}.bed
    ${tools_path}/size_histo.pl ${alignment_path}/${project_name}/${output_subdir}/qc/${unique}/${unique}.bed > ${alignment_path}/${project_name}/${output_subdir}/qc/${unique}/${unique}.histo
    python ${tools_path}/plot_ins_size.py -i ${alignment_path}/${project_name}/${output_subdir}/qc/${unique}/${unique}.histo -o ${alignment_path}/${project_name}/${output_subdir}/qc/${unique}/${unique}_ins.png
    echo "QC bam2bed completed for ${unique} (${sample_type})"
    """
}

/* ******************************************************************* *
 *                        Calling Process Block                        *
 * ******************************************************************* */

process cnv_calling {
    cpus params.number_of_process
    tag "${unique.tokenize('___')[0]}_germline"

    input:
    tuple val(proband_id), path(bam), path(bai), val(unique)
    path alignment_path
    path r_env_path
    path fasta_path
    path cnv_common_path
    tuple val(_test), path(snp_vcf_path)
    val number_of_process
    val project_name
    val cnv_cut_off

    output:
    stdout emit: cnv_calling_success
    tuple val(proband_id), path("${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cnvkit.pass.vcf.gz"), emit: cnv_vcf

    script:
    """
    mkdir -p ${alignment_path}/${project_name}/germline/cnv/${unique}/logs ${alignment_path}/${project_name}/germline/cnv/${unique}/images
    # use R environment
    source ${r_env_path}
    conda activate r

    # Run initial cnvkit coverage commands
    cnvkit.py coverage -o ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.targetcoverage.cnn ${bam} ${cnv_common_path}/20160622.allChr.pilot_mask.ge1k.target.bed -p ${number_of_process}
    cnvkit.py coverage -o ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.antitargetcoverage.cnn ${bam} ${cnv_common_path}/20160622.allChr.pilot_mask.ge1k.antitarget.bed -p ${number_of_process}
    cnvkit.py sex ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.targetcoverage.cnn -o ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.sex.tsv
    bcftools view -m2 -M2 -v snps --threads ${number_of_process} -T ${cnv_common_path}/20160622.allChr.pilot_mask.ge1k.target.bed -Oz -o ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.snp.norm.vcf.gz ${snp_vcf_path}
    bcftools index -t ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.snp.norm.vcf.gz --threads ${number_of_process}

    # Parse sex from the .sex.tsv file
    SEX=\$(awk -F'\\t' 'NR==2 {print \$2}' ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.sex.tsv)

    # Select reference file based on sex
    if [ "\$SEX" = "Female" ]; then
        REF_FILE="${cnv_common_path}/gender/female/cnv_files/1000genome_EAS_47_female.cnn"
        CNV_SEX="female"
    elif [ "\$SEX" = "Male" ]; then
        REF_FILE="${cnv_common_path}/gender/male/cnv_files/1000genome_EAS_53_male.cnn"
        CNV_SEX="male"
    else
        REF_FILE="${cnv_common_path}/gender/both/cnv_files/1000genome_EAS_100.cnn"
        CNV_SEX="female"
    fi

    # Run cnvkit call with the selected reference
    cnvkit.py fix -o ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cnr ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.targetcoverage.cnn ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.antitargetcoverage.cnn \$REF_FILE -i ${proband_id}
    cnvkit.py segment --threshold 1e-8 -m hmm-germline --processes ${number_of_process} ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cnr -o ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cns
    cnvkit.py segmetrics --segments ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cns --ci -o ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.stats.cns ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cnr
    cnvkit.py call ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.stats.cns -y -x \$CNV_SEX --purity 0 --filter cn -v ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.snp.norm.vcf.gz -o ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.call.cns
    perl -ne \'chop(\$_); @line=split("\\t",\$_); if (length(\$line[5])==0) {\$line[5]=-1;} if (length(\$line[7])==0) {\$line[7]=-1;} if (length(\$line[8])==0) {\$line[8]=-1;} print join("\\t",@line)."\\n";\' ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.call.cns > ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.final.cns

    Rscript ${cnv_common_path}/plot_1panel.r --gender \$SEX --cutoff ${cnv_cut_off} --data ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cnr --seg ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.final.cns --oprefix ${alignment_path}/${project_name}/germline/cnv/${unique}/images/${unique}
    cnvkit.py export vcf ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.call.cns -x \$CNV_SEX -i ${proband_id} -o ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cnvkit.vcf

    bgzip ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cnvkit.vcf
    bcftools index -t ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cnvkit.vcf.gz --threads ${number_of_process}
    if [ "\$SEX" = "Male" ]; then
        bcftools view --include "INFO/SVLEN>${cnv_cut_off}" -Oz -o ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cnvkit.pass.vcf.gz ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cnvkit.vcf.gz
    else
        bcftools view -r chr1,chr2,chr3,chr4,chr5,chr6,chr7,chr8,chr9,chr10,chr11,chr12,chr13,chr14,chr15,chr16,chr17,chr18,chr19,chr20,chr21,chr22,chrX --include "INFO/SVLEN>${cnv_cut_off}" -Oz -o ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cnvkit.pass.vcf.gz ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cnvkit.vcf.gz
    fi
    bcftools index -t ${alignment_path}/${project_name}/germline/cnv/${unique}/${unique}.cnvkit.pass.vcf.gz --threads ${number_of_process}

    echo "Single CNV Calling Completed for ${proband_id} (germline)"
    """
}

process joint_cnv_calling {
    cpus params.number_of_process
    tag "${family_id}_germline"

    input:
    tuple val(family_id), val(samples)
    path tools_path
    path alignment_path
    path r_env_path
    path fasta_path
    path cnv_common_path
    tuple val(_family_id), path(combined_snp_vcf)
    val number_of_process
    val project_name
    val cnv_cut_off

    output:
    stdout emit: cnv_calling_success
    tuple val(family_id), path("${alignment_path}/${project_name}/germline/cnv/${samples[0][3]}/${samples[0][3]}.cnvkit.final.vcf.gz"), emit: cnv_vcf

    script:
    def output_dir = "${alignment_path}/${project_name}/germline/cnv/${samples[0][3]}"
    def temp_dir = "${alignment_path}/${project_name}/germline/cnv/${samples[0][3]}/temp"
    def sample_ids = samples.collect { it[0] }

    def tsv_content = samples
        .collect { sample ->
            def sample_id = sample[0]
            def unique = sample[3]
            "${sample_id}\t${output_dir}/${unique}.cnvkit.pass.vcf.gz"
        }
        .join('\n')

    """
    mkdir -p ${output_dir}/logs ${output_dir}/images ${output_dir}/temp
    # use R environment
    source ${r_env_path}
    conda activate r

    # Extract SNP VCF for each sample
    ${sample_ids.collect { sample_id ->
        "bcftools view -s ${sample_id} ${combined_snp_vcf} -Oz -o ${temp_dir}/${sample_id}.snp.vcf.gz && bcftools index -t ${temp_dir}/${sample_id}.snp.vcf.gz"
    }.join(' && ')}

    # Filter SNPs
    ${sample_ids.collect { sample_id ->
        "bcftools view -m2 -M2 -v snps --threads ${number_of_process} -T ${cnv_common_path}/20160622.allChr.pilot_mask.ge1k.target.bed -Oz -o ${temp_dir}/${sample_id}.snp.norm.vcf.gz ${temp_dir}/${sample_id}.snp.vcf.gz && bcftools index -t ${temp_dir}/${sample_id}.snp.norm.vcf.gz --threads ${number_of_process}"
    }.join(' && ')}

    # Use both reference for joint (mixed sexes)
    REF_FILE="${cnv_common_path}/gender/both/cnv_files/1000genome_EAS_100.cnn"

    # Post-process each sample
    ${samples.collect { sample ->
        def sample_id = sample[0]
        def bam = sample[1]
        def unique = sample[3]
        """

        cnvkit.py coverage -o ${temp_dir}/${sample_id}.targetcoverage.cnn ${bam} ${cnv_common_path}/20160622.allChr.pilot_mask.ge1k.target.bed -p ${number_of_process}
        cnvkit.py coverage -o ${temp_dir}/${sample_id}.antitargetcoverage.cnn ${bam} ${cnv_common_path}/20160622.allChr.pilot_mask.ge1k.antitarget.bed -p ${number_of_process}
        cnvkit.py sex ${temp_dir}/${sample_id}.targetcoverage.cnn -o ${temp_dir}/${sample_id}.sex.tsv

        # Parse sex from the .sex.tsv file
        SEX=\$(awk -F'\\t' 'NR==2 {print \$2}' ${temp_dir}/${sample_id}.sex.tsv)

        # Select reference file based on sex
        if [ "\$SEX" = "Female" ]; then
            REF_FILE="${cnv_common_path}/gender/female/cnv_files/1000genome_EAS_47_female.cnn"
            CNV_SEX="female"
        elif [ "\$SEX" = "Male" ]; then
            REF_FILE="${cnv_common_path}/gender/male/cnv_files/1000genome_EAS_53_male.cnn"
            CNV_SEX="male"
        else
            REF_FILE="${cnv_common_path}/gender/both/cnv_files/1000genome_EAS_100.cnn"
            CNV_SEX="female"
        fi

        # Run cnvkit call with the selected reference
        cnvkit.py fix -o ${temp_dir}/${sample_id}.cnr ${temp_dir}/${sample_id}.targetcoverage.cnn ${temp_dir}/${sample_id}.antitargetcoverage.cnn \$REF_FILE -i ${sample_id}
        cnvkit.py segment --threshold 1e-8 -m hmm-germline --processes ${number_of_process} ${temp_dir}/${sample_id}.cnr -o ${temp_dir}/${sample_id}.cns
        cnvkit.py segmetrics --segments ${temp_dir}/${sample_id}.cns --ci -o ${temp_dir}/${sample_id}.stats.cns ${temp_dir}/${sample_id}.cnr
        cnvkit.py call ${temp_dir}/${sample_id}.stats.cns -y -x \$CNV_SEX --purity 0 --filter cn -v ${temp_dir}/${sample_id}.snp.norm.vcf.gz -o ${temp_dir}/${sample_id}.call.cns
        perl -ne \'chop(\$_); @line=split("\\t",\$_); if (length(\$line[5])==0) {\$line[5]=-1;} if (length(\$line[7])==0) {\$line[7]=-1;} if (length(\$line[8])==0) {\$line[8]=-1;} print join("\\t",@line)."\\n";\' ${temp_dir}/${sample_id}.call.cns > ${temp_dir}/${sample_id}.final.cns

        Rscript ${cnv_common_path}/plot_1panel.r --gender \$SEX --cutoff ${cnv_cut_off} --data ${temp_dir}/${sample_id}.cnr --seg ${temp_dir}/${sample_id}.final.cns --oprefix ${output_dir}/images/${unique}
        cnvkit.py export vcf ${temp_dir}/${sample_id}.call.cns -x \$CNV_SEX -i ${sample_id} -o ${output_dir}/${unique}.cnvkit.vcf

        bgzip -@ ${number_of_process} ${output_dir}/${unique}.cnvkit.vcf
        bcftools index -t ${output_dir}/${unique}.cnvkit.vcf.gz --threads ${number_of_process}
        if [ "\$SEX" = "Male" ]; then
            bcftools view --include "INFO/SVLEN>${cnv_cut_off}" -Oz -o ${output_dir}/${unique}.cnvkit.pass.vcf.gz ${output_dir}/${unique}.cnvkit.vcf.gz
        else
            bcftools view -r chr1,chr2,chr3,chr4,chr5,chr6,chr7,chr8,chr9,chr10,chr11,chr12,chr13,chr14,chr15,chr16,chr17,chr18,chr19,chr20,chr21,chr22,chrX --include "INFO/SVLEN>${cnv_cut_off}" -Oz -o ${output_dir}/${unique}.cnvkit.pass.vcf.gz ${output_dir}/${unique}.cnvkit.vcf.gz
        fi
        bcftools index -t ${output_dir}/${unique}.cnvkit.pass.vcf.gz --threads ${number_of_process}
        """
    }.join('\n')}

    # Merge VCFs
    echo -e "${tsv_content}" > ${temp_dir}/samples.tsv
    ${tools_path}/clusterer ${temp_dir}/samples.tsv ${fasta_path} -o ${output_dir}/${samples[0][3]}.cnvkit.final -t ${number_of_process} > ${output_dir}/logs/${samples[0][3]}.cnv.cluster.log 2>&1
    bcftools index -t ${output_dir}/${samples[0][3]}.cnvkit.final.vcf.gz --threads ${number_of_process}

    echo "Joint CNV Calling Completed for ${family_id} (germline)"
    """
}

process sv_calling {
    cpus params.number_of_process
    tag "${unique.tokenize('___')[0]}_germline"

    input:
    tuple val(proband_id), path(bam), path(bai), val(unique)
    path tools_path
    path alignment_path
    path fasta_path
    val number_of_process
    val project_name

    output:
    stdout emit: sv_calling_success
    tuple val(proband_id), path("${alignment_path}/${project_name}/germline/sv/${unique}/${unique}.SurVeyor.vcf.gz"), emit: sv_vcf

    script:
    """
    mkdir -p ${alignment_path}/${project_name}/germline/sv/${unique}/logs ${alignment_path}/${project_name}/germline/sv/${unique}/sv_temp
    ${tools_path}/surveyor.sh ${number_of_process} \$(readlink -f ${bam}) ${alignment_path}/${project_name}/germline/sv/${unique}/sv_temp \$(readlink -f ${fasta_path}) --samplename ${proband_id} > ${alignment_path}/${project_name}/germline/sv/${unique}/logs/${unique}.sv.1.call.log 2>&1
 
    bcftools view -i 'COUNT(FT[*]=\"PASS\") = N_SAMPLES && COUNT(GT[*] != \"0/0\") > 0 && COUNT(GT[*] != \"./.\") > 0' ${alignment_path}/${project_name}/germline/sv/${unique}/sv_temp/calls-genotyped-deduped.vcf.gz -Oz -o ${alignment_path}/${project_name}/germline/sv/${unique}/${unique}.SurVeyor.vcf.gz
    echo "Single SV Calling Completed for ${proband_id} (germline)"
    """
}

process joint_sv_calling {
    cpus params.number_of_process
    tag "${family_id}_germline"

    input:
    tuple val(family_id), val(samples)
    path tools_path
    path alignment_path
    path fasta_path
    val number_of_process
    val project_name

    output:
    stdout emit: sv_calling_success
    tuple val(family_id), path("${alignment_path}/${project_name}/germline/sv/${samples[0][3]}/${samples[0][3]}.SurVeyor.final.vcf.gz"), emit: sv_vcf

    script:
    def proband_unique = samples[0][3]
    def proband_id = samples[0][0]
    def output_dir = "${alignment_path}/${project_name}/germline/sv/${proband_unique}"
    def temp_dir = "${output_dir}/sv_temp"
    def fasta = "\$(readlink -f ${fasta_path})"

    // Proband processing
    def proband_bam = samples[0][1]
    def proband_cmd = """
    mkdir -p ${temp_dir}/${proband_unique}
    ${tools_path}/surveyor.sh ${number_of_process} \$(readlink -f ${proband_bam}) ${temp_dir} ${fasta} --samplename ${proband_id} > ${output_dir}/logs/${proband_unique}.sv.1.call.log 2>&1
    bcftools view -i 'COUNT(FT[*]=\"PASS\") = N_SAMPLES && COUNT(GT[*] != \"0/0\") > 0 && COUNT(GT[*] != \"./.\") > 0' ${temp_dir}/calls-genotyped-deduped.vcf.gz -Oz -o ${alignment_path}/${project_name}/germline/sv/${proband_unique}/${proband_unique}.solo.vcf.gz
    tabix -p vcf ${alignment_path}/${project_name}/germline/sv/${proband_unique}/${proband_unique}.solo.vcf.gz
    """

    // Non-proband samples depend on proband VCF
    def non_proband_cmds = samples[1..-1]
        .collect { sample ->
            def sample_id = sample[0]
            def bam = sample[1]
            def unique = sample[3]
            """
            mkdir -p ${temp_dir}/${unique}/result
            ${tools_path}/surveyor_gt.sh ${number_of_process} ${alignment_path}/${project_name}/germline/sv/${proband_unique}/${proband_unique}.solo.vcf.gz \$(readlink -f ${bam}) ${temp_dir}/${unique} ${fasta} --samplename ${sample_id} > ${output_dir}/logs/${unique}.sv.1.log 2>&1
            cp ${temp_dir}/${unique}/genotyped.deduped.vcf.gz ${alignment_path}/${project_name}/germline/sv/${proband_unique}/${unique}.solo.vcf.gz
            tabix -p vcf ${alignment_path}/${project_name}/germline/sv/${proband_unique}/${unique}.solo.vcf.gz
            """
        }
        .join('\n')

    def tsv_content = samples
        .collect { sample ->
            def sample_id = sample[0]
            def unique = sample[3]
            "${sample_id}\t${alignment_path}/${project_name}/germline/sv/${proband_unique}/${unique}.solo.vcf.gz"
        }
        .join('\n')

    """
    mkdir -p ${output_dir}/logs ${temp_dir}
    ${proband_cmd}
    ${non_proband_cmds}
    echo -e "${tsv_content}" > ${temp_dir}/samples.tsv
    ${tools_path}/clusterer ${temp_dir}/samples.tsv ${fasta} -o ${output_dir}/${proband_unique}.SurVeyor.final -t ${number_of_process} > ${output_dir}/logs/${proband_unique}.sv.cluster.log 2>&1
    tabix -p vcf ${output_dir}/${proband_unique}.SurVeyor.final.vcf.gz
    echo "Joint SV Calling Completed for ${family_id} (germline)"
    """
}

process snp_calling {
    cpus params.number_of_process
    tag "${unique.tokenize('___')[0]}_germline"

    input:
    tuple val(proband_id), path(bam), path(bai), val(unique)
    path tools_path
    path alignment_path
    val number_of_process
    val project_name

    output:
    stdout emit: snp_calling_success
    tuple val(proband_id), path("${alignment_path}/${project_name}/germline/snp/${unique}/${unique}.final.vcf.gz"), emit: snp_vcf

    script:
    """
    mkdir -p ${alignment_path}/${project_name}/germline/snp/${unique}/logs
    ${tools_path}/deepvariant_gpu.sh ${number_of_process} ${bam} ${alignment_path}/${project_name}/germline/snp/${unique} ${unique} > ${alignment_path}/${project_name}/germline/snp/${unique}/logs/${unique}.log 2>&1
    echo "default ${proband_id}" > samples.txt
    bcftools reheader -s samples.txt ${alignment_path}/${project_name}/germline/snp/${unique}/${unique}.vcf.gz -o ${alignment_path}/${project_name}/germline/snp/${unique}/${unique}.renamed.vcf.gz
    bcftools view -i 'FILTER=\"PASS\" && QUAL>10' ${alignment_path}/${project_name}/germline/snp/${unique}/${unique}.renamed.vcf.gz -Oz -o ${alignment_path}/${project_name}/germline/snp/${unique}/${unique}.final.vcf.gz
    echo "Single SNP Calling Completed for ${proband_id} (germline)"
    """
}

process joint_snp_calling_with_parents {
    cpus params.number_of_process
    tag "${family_id}_germline"

    input:
    tuple val(family_id), val(samples)
    path tools_path
    path alignment_path
    val number_of_process
    val project_name
    val family_map

    output:
    stdout emit: snp_calling_success
    tuple val(family_id), path("${alignment_path}/${project_name}/germline/snp/${samples[0][3]}/${samples[0][3]}.deeptrio.vcf.gz"), emit: snp_vcf

    script:
    def proband_unique = samples[0][3]
    def proband_id = proband_unique.tokenize('___')[0]
    def output_dir = "${alignment_path}/${project_name}/germline/snp/${proband_unique}"
    def temp_dir = "${output_dir}/temp"
    def child_bam = samples[0][1]
    def father_bam = samples.find { it[0] == family_map[samples[0][0]]?.paternal_id }?.getAt(1) ?: ""
    def mother_bam = samples.find { it[0] == family_map[samples[0][0]]?.maternal_id }?.getAt(1) ?: ""
    def bams = "${child_bam} ${father_bam} ${mother_bam}".trim()

    """
    mkdir -p ${output_dir}/logs ${temp_dir}/logs
    ${tools_path}/deepvariant_joint_calling_gpu.sh ${number_of_process} ${bams} ${temp_dir}/${proband_id} > ${output_dir}/logs/${proband_unique}.log 2>&1
    ${tools_path}/glnexus_cli \\
        --config DeepVariant_unfiltered \\
        --dir ${output_dir}/glnexus_cache \\
        --threads ${number_of_process} \\
        ${temp_dir}/*.g.vcf.gz \\
        > ${output_dir}/${proband_unique}.trio.bcf
    bcftools view ${output_dir}/${proband_unique}.trio.bcf | bgzip -@ ${number_of_process} -c > ${output_dir}/${proband_unique}.trio.vcf.gz
    bcftools view -i 'QUAL>10' ${output_dir}/${proband_unique}.trio.vcf.gz -Oz -o ${output_dir}/${proband_unique}.deeptrio.vcf.gz
    tabix -p vcf ${output_dir}/${proband_unique}.deeptrio.vcf.gz
    echo "Joint SNP Calling (Trio/Duo) Completed for ${family_id} (germline)"
    """
}

process joint_snp_calling_standard {
    cpus params.number_of_process
    tag "${family_id}_germline"

    input:
    tuple val(family_id), val(samples)
    path tools_path
    path alignment_path
    val number_of_process
    val project_name

    output:
    stdout emit: snp_calling_success
    tuple val(family_id), path("${alignment_path}/${project_name}/germline/snp/${samples[0][3]}/${samples[0][3]}.final.vcf.gz"), emit: snp_vcf

    script:
    def proband_unique = samples[0][3]
    def output_dir = "${alignment_path}/${project_name}/germline/snp/${proband_unique}"
    def temp_dir = "${output_dir}/temp"

    def deepvariant_commands = samples
        .collect { sample ->
            def bam = sample[1]
            def unique = sample[3]
            """
            ${tools_path}/deepvariant_gpu.sh ${number_of_process} ${bam} ${temp_dir} ${unique} > ${output_dir}/logs/${unique}.log 2>&1
            """
        }
        .join('\n')

    """
    mkdir -p ${output_dir}/logs ${temp_dir}
    ${deepvariant_commands}
    ${tools_path}/glnexus_cli \\
        --config DeepVariantWGS \\
        --dir ${output_dir}/glnexus_cache \\
        --threads ${number_of_process} \\
        ${temp_dir}/*.g.vcf.gz \\
        > ${output_dir}/${proband_unique}.merged.bcf
    bcftools view ${output_dir}/${proband_unique}.merged.bcf | bgzip -@ ${number_of_process} -c > ${output_dir}/${proband_unique}.merged.vcf.gz
    bcftools view -i 'QUAL>10' ${output_dir}/${proband_unique}.merged.vcf.gz -Oz -o ${output_dir}/${proband_unique}.final.vcf.gz
    echo "Joint SNP Calling (Standard) Completed for ${family_id} (germline)"
    """
}

process denovo_gear {
    container 'denovogear-env:latest'
    cpus params.number_of_process
    tag "${family_id}_germline_denovo"

    input:
    tuple val(family_id), val(samples)
    path tools_path
    path alignment_path
    path fasta_path
    val number_of_process
    val project_name
    val family_map

    output:
    tuple val(family_id), path("${alignment_path}/${project_name}/germline/snp/${samples[0][3]}/${samples[0][3]}.denovoGear.vcf.gz"), emit: denovo_vcf
    stdout emit: denovo_success

    script:
    def proband_unique = samples[0][3]
    def output_dir = "${alignment_path}/${project_name}/germline/snp/${proband_unique}"
    def proband_id = samples[0][0]
    def proband_bam = samples[0][1]
    def father_bam = samples.find { it[0] == family_map[proband_id]?.paternal_id }?.getAt(1) ?: ""
    def mother_bam = samples.find { it[0] == family_map[proband_id]?.maternal_id }?.getAt(1) ?: ""
    def pat_id = family_map[proband_id]?.paternal_id ?: ""
    def mat_id = family_map[proband_id]?.maternal_id ?: ""

    """
    mkdir -p ${output_dir}/logs ${output_dir}/denovo
    echo "DEBUG: proband_id=${proband_id}, proband_bam=${proband_bam}" > ${output_dir}/logs/${proband_unique}.denovogear.debug.log
    echo "DEBUG: pat_id=${pat_id}, father_bam=${father_bam}" >> ${output_dir}/logs/${proband_unique}.denovogear.debug.log
    echo "DEBUG: mat_id=${mat_id}, mother_bam=${mother_bam}" >> ${output_dir}/logs/${proband_unique}.denovogear.debug.log
    if [ -z "${father_bam}" ] || [ -z "${mother_bam}" ]; then
        echo "ERROR: Missing father or mother BAM file" >> ${output_dir}/logs/${proband_unique}.denovogear.debug.log
        exit 1
    fi
    echo "##PEDNG v1.0" > ${proband_unique}.ped
    echo "#Individual Father Mother Sex Samples" >> ${proband_unique}.ped
    echo "${pat_id} . . male =" >> ${proband_unique}.ped
    echo "${mat_id} . . female =" >> ${proband_unique}.ped
    echo "${proband_id} ${pat_id} ${mat_id} ${family_map[proband_id]?.sex == '1' ? 'male' : 'female'} =" >> ${proband_unique}.ped
    
    dng call --model=autosomal -p ${proband_unique}.ped ${proband_bam} ${father_bam} ${mother_bam} --fasta ${fasta_path} --rgtag SM > ${output_dir}/denovo/${proband_unique}.denovo.vcf 2> ${output_dir}/logs/${proband_unique}.denovogear.error.log
    bgzip -@ ${number_of_process} ${output_dir}/denovo/${proband_unique}.denovo.vcf
    mv ${output_dir}/denovo/${proband_unique}.denovo.vcf.gz ${output_dir}/${proband_unique}.denovoGear.vcf.gz
    echo "DenovoGear Calling Completed for ${family_id} (germline)"
    """
}

process somatic_denovo_gear {
    container 'denovogear-env:latest'
    errorStrategy 'ignore'
    cpus params.number_of_process
    tag "${sample_id}_somatic_denovo"

    input:
    tuple val(sample_id), path(tumor_bam), path(tumor_bai), val(tumor_unique), path(normal_bam), path(normal_bai), val(normal_unique)
    path fasta_path
    path tools_path
    val alignment_path
    val number_of_process
    val project_name

    output:
    tuple val(sample_id), path("${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.denovoGear.vcf.gz"), emit: denovo_vcf
    stdout emit: denovo_success

    script:
    """
    mkdir -p ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/logs ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/denovo
    echo "##PEDNG v1.0" > ${tumor_unique}.ped
    echo "#Individual Father Mother Sex Samples" >> ${tumor_unique}.ped
    echo "${sample_id}_normal . . unknown =" >> ${tumor_unique}.ped
    echo "${sample_id}_tumor ${sample_id}_normal . unknown =" >> ${tumor_unique}.ped

    dng call --model=somatic -p ${tumor_unique}.ped ${tumor_bam} ${normal_bam} --fasta ${fasta_path} --rgtag SM > ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/denovo/${tumor_unique}.denovo.vcf 2> ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/logs/${tumor_unique}.denovogear.error.log
    bgzip -@ ${number_of_process} ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/denovo/${tumor_unique}.denovo.vcf
    bcftools view -i 'QUAL>30' ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/denovo/${tumor_unique}.denovo.vcf.gz -Oz -o ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/denovo/${tumor_unique}.denovo.filtered.vcf.gz
    mv ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/denovo/${tumor_unique}.denovo.filtered.vcf.gz ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.denovoGear.vcf.gz
    tabix -p vcf ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.denovoGear.vcf.gz
    echo "Somatic denovoGear Calling Completed for ${sample_id}"
    """
}

process merge_vcf_germline {
    cpus params.number_of_process
    tag "${family_id}_germline_merge"

    // Publish the final combined VCF to the desired directory
    publishDir "${alignment_path}/${project_name}/germline/snp/${samples[0][3]}", mode: 'copy', pattern: "${samples[0][3]}.combined.vcf.gz"
    publishDir "${alignment_path}/${project_name}/germline/snp/${samples[0][3]}", mode: 'copy', pattern: "${samples[0][3]}.combined.vcf.gz.tbi"

    input:
    tuple val(family_id), val(samples)
    tuple val(_denovo_family_id), path(denovo_vcf)
    tuple val(_deeptrio_family_id), path(deeptrio_vcf)
    path tools_path
    path fasta_path
    val alignment_path
    val number_of_process
    val project_name

    output:
    stdout emit: merge_vcf_success
    tuple val(family_id), path("${samples[0][3]}.combined.vcf.gz"), emit: merged_vcf
    path "${samples[0][3]}.combined.vcf.gz.tbi"

    script:
    def proband_unique = samples[0][3]
    """
    mkdir -p logs
    echo '##INFO=<ID=SOURCE,Number=1,Type=String,Description="Source of the variant call">' > header.txt
    bcftools view -i 'QUAL>30' ${denovo_vcf} -Oz -o ${proband_unique}.denovo_filtered.vcf.gz
    tabix -p vcf ${deeptrio_vcf}
    tabix -p vcf ${proband_unique}.denovo_filtered.vcf.gz
    zcat ${deeptrio_vcf} | sed -E '/^#/!s/(\\S+\\t){7}\\S*/&;SOURCE=DeepTrio/' | bcftools annotate -h header.txt -Oz -o ${proband_unique}.deeptrio_annotated.vcf.gz
    zcat ${proband_unique}.denovo_filtered.vcf.gz | sed -E '/^#/!s/(\\S+\\t){7}\\S*/&;SOURCE=denovoGear/' | bcftools annotate -h header.txt -Oz -o ${proband_unique}.denovo_annotated.vcf.gz
    bcftools norm --threads ${number_of_process} -f ${fasta_path} -Oz -o ${proband_unique}.deeptrio_norm.vcf.gz ${proband_unique}.deeptrio_annotated.vcf.gz
    bcftools norm --threads ${number_of_process} -c x -f ${fasta_path} -Oz -o ${proband_unique}.denovo_norm.vcf.gz ${proband_unique}.denovo_annotated.vcf.gz
    tabix -p vcf ${proband_unique}.deeptrio_norm.vcf.gz
    tabix -p vcf ${proband_unique}.denovo_norm.vcf.gz
    bcftools merge --threads ${number_of_process} -m all ${proband_unique}.deeptrio_annotated.vcf.gz ${proband_unique}.denovo_annotated.vcf.gz -Oz -o ${proband_unique}.merged_tmp.vcf.gz
    tabix -p vcf ${proband_unique}.merged_tmp.vcf.gz
    bcftools annotate --threads ${number_of_process} -a ${proband_unique}.merged_tmp.vcf.gz -c 'INFO/SOURCE=DeepTrio_denovoGear' -i 'SOURCE="DeepTrio" && SOURCE="denovoGear"' ${proband_unique}.merged_tmp.vcf.gz -Oz -o ${proband_unique}.combined.vcf.gz
    tabix -p vcf ${proband_unique}.combined.vcf.gz
    echo "Germline VCF Merge Completed for ${family_id}"
    """
}

process merge_vcf_somatic {
    cpus params.number_of_process
    errorStrategy 'ignore'
    tag "${sample_id}_somatic_merge"

    input:
    tuple val(sample_id), val(samples)
    tuple val(_denovo_sample_id), path(denovo_vcf)
    tuple val(_deepsomatic_sample_id), path(deepsomatic_vcf)
    path tools_path
    val alignment_path
    val project_name

    output:
    stdout emit: merge_vcf_success
    tuple val(sample_id), path("${alignment_path}/${project_name}/somatic/snp/${samples[0]}/${samples[0]}.combined.vcf.gz"), emit: merged_vcf

    script:
    def tumor_unique = samples[0]
    def output_dir = "${alignment_path}/${project_name}/somatic/snp/${tumor_unique}"

    """
    mkdir -p ${output_dir}/logs
    bcftools annotate -a ${deepsomatic_vcf} -c 'INFO/SOURCE=deepSomatic' ${deepsomatic_vcf} -Oz -o ${output_dir}/${tumor_unique}.deepsomatic_annotated.vcf.gz
    bcftools annotate -a ${denovo_vcf} -c 'INFO/SOURCE=denovoGear' ${denovo_vcf} -Oz -o ${output_dir}/${tumor_unique}.denovo_annotated.vcf.gz
    bcftools merge -m all ${output_dir}/${tumor_unique}.deepsomatic_annotated.vcf.gz ${output_dir}/${tumor_unique}.denovo_annotated.vcf.gz -Oz -o ${output_dir}/${tumor_unique}.merged_tmp.vcf.gz
    bcftools annotate -a ${output_dir}/${tumor_unique}.merged_tmp.vcf.gz -c 'INFO/SOURCE=deepSomatic_denovoGear' -i 'SOURCE="deepSomatic" && SOURCE="denovoGear"' ${output_dir}/${tumor_unique}.merged_tmp.vcf.gz -Oz -o ${output_dir}/${tumor_unique}.combined.vcf.gz
    tabix -p vcf ${output_dir}/${tumor_unique}.combined.vcf.gz
    echo "Somatic VCF Merge Completed for ${sample_id}"
    """
}

process somatic_snp_deepsomatic {
    cpus params.number_of_process
    errorStrategy 'ignore'
    tag "${sample_id}_somatic"

    input:
    tuple val(sample_id), path(tumor_bam), path(tumor_bai), val(tumor_unique), path(normal_bam), path(normal_bai), val(normal_unique)
    path fasta_path
    path tools_path
    val alignment_path
    val number_of_process
    val project_name

    output:
    tuple val(sample_id), path("${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.deepsomatic.vcf.gz"), emit: snp_vcf
    tuple val(sample_id), path("${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.deepsomatic.g.vcf.gz"), emit: snp_gvcf
    stdout emit: snp_calling_success

    script:
    """
    mkdir -p ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/logs
    ${tools_path}/deepsomatic_gpu.sh ${number_of_process} ${tumor_bam} ${alignment_path}/${project_name}/somatic/snp/${tumor_unique} ${tumor_unique} ${normal_bam} > ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/logs/${tumor_unique}.log 2>&1
    bcftools view -i 'FILTER=\"PASS\" && QUAL>10' ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.deepsomatic.vcf.gz -Oz -o ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.filtered.vcf.gz
    mv ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.filtered.vcf.gz ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.deepsomatic.vcf.gz
    tabix -p vcf ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.deepsomatic.vcf.gz
    tabix -p vcf ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.deepsomatic.g.vcf.gz
    echo "Somatic SNP purporting (deepSomatic) Completed for ${sample_id}"
    """
}

process somatic_sv_manta {
    cpus params.number_of_process
    errorStrategy 'ignore'
    tag "${sample_id}_somatic"

    input:
    tuple val(sample_id), path(tumor_bam), path(tumor_bai), val(tumor_unique), path(normal_bam), path(normal_bai), val(normal_unique)
    path fasta_path
    path tools_path
    val alignment_path
    val number_of_process
    val project_name

    output:
    tuple val(sample_id), path("${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/${tumor_unique}.manta.vcf.gz"), emit: sv_vcf
    stdout emit: sv_calling_success

    script:
    """
    mkdir -p ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/logs
    ${tools_path}/manta/bin/configManta.py \\
        --tumorBam ${tumor_bam} \\
        --normalBam ${normal_bam} \\
        --referenceFasta \$(readlink -f ${fasta_path}) \\
        --runDir ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/manta
    ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/manta/runWorkflow.py \\
        -m local \\
        -j ${number_of_process} \\
        > ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/logs/manta.log 2>&1
    mv ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/manta/results/variants/somaticSV.vcf.gz \\
       ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/${tumor_unique}.manta.vcf.gz
    tabix -p vcf ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/${tumor_unique}.manta.vcf.gz
    echo "Somatic SV Calling (Manta) Completed for ${sample_id}"
    """
}

process somatic_cnv_cnvkit {
    cpus params.number_of_process
    errorStrategy 'ignore'
    tag "${sample_id}_somatic"

    input:
    tuple val(sample_id), path(tumor_bam), path(tumor_bai), val(tumor_unique), path(normal_bam), path(normal_bai), val(normal_unique)
    path fasta_path
    path tools_path
    val alignment_path
    val number_of_process
    val project_name

    output:
    tuple val(sample_id), path("${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/${tumor_unique}.cnvkit.cns"), emit: cnv_calls
    stdout emit: cnv_success

    script:
    """
    mkdir -p ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/logs
    ${tools_path}/cnvkit.py access \$(readlink -f ${fasta_path}) -o ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/access.bed
    ${tools_path}/cnvkit.py autobin ${tumor_bam} ${normal_bam} -m wgs -g ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/access.bed
    ${tools_path}/cnvkit.py reference ${normal_bam} \\
        -f \$(readlink -f ${fasta_path}) \\
        -o ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/reference.cnn \\
        > ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/logs/reference.log 2>&1
    ${tools_path}/cnvkit.py batch ${tumor_bam} \\
        -r ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/reference.cnn \\
        -p ${number_of_process} \\
        -d ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique} \\
        > ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/logs/batch.log 2>&1
    mv ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/*.cns \\
       ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/${tumor_unique}.cnvkit.cns
    echo "Somatic CNV Calling (CNVkit) Completed for ${sample_id}"
    """
}

process somatic_loh_facets {
    cpus params.number_of_process
    errorStrategy 'ignore'
    tag "${sample_id}_somatic"

    input:
    tuple val(sample_id), path(tumor_bam), path(tumor_bai), val(tumor_unique), path(normal_bam), path(normal_bai), val(normal_unique)
    path fasta_path
    path tools_path
    val alignment_path
    val number_of_process
    val project_name

    output:
    tuple val(sample_id), path("${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/${tumor_unique}.facets.rds"), emit: loh_segments
    stdout emit: loh_success

    script:
    """
    mkdir -p ${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/logs
    ${tools_path}/snp-pileup \\
        -g \\
        -q 20 \\
        -Q 20 \\
        location_of_knownsite \\
        ${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/snp_pileup.csv \\
        ${normal_bam} \\
        ${tumor_bam} \\
        > ${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/logs/snp_pileup.log 2>&1
    Rscript -e "library(facets); \\
        pileup <- readSnpMatrix('${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/snp_pileup.csv'); \\
        fit <- facetsSuite(pileup, cval=100, genome='hg38', seed=1234); \\
        saveRDS(fit, '${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/${tumor_unique}.facets.rds');" \\
        > ${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/logs/facets.log 2>&1
    echo "Somatic LOH Analysis (FACETS) Completed for ${sample_id}"
    """
}

process somatic_only_snp_deepsomatic {
    cpus params.number_of_process
    errorStrategy 'ignore'
    tag "${sample_id}_somatic_only"

    input:
    tuple val(sample_id), path(tumor_bam), path(tumor_bai), val(tumor_unique)
    path fasta_path
    path tools_path
    val alignment_path
    val number_of_process
    val project_name

    output:
    tuple val(sample_id), path("${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.deepsomatic.tumor_only.vcf.gz"), emit: snp_vcf
    stdout emit: snp_calling_success

    script:
    """
    mkdir -p ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/logs
    ${tools_path}/run_deepsomatic \\
        --ref \$(readlink -f ${fasta_path}) \\
        --tumor_reads ${tumor_bam} \\
        --output_vcf ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.deepsomatic.tumor_only.vcf.gz \\
        --num_shards ${number_of_process} \\
        --model_type WGS \\
        --min_base_quality 10 \\
        --min_mapping_quality 30 \\
        --qual_filter 10 \\
        --log_dir ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/logs
    bcftools view -i 'FILTER=\"PASS\" && QUAL>10' ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.deepsomatic.tumor_only.vcf.gz -Oz -o ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.filtered.vcf.gz
    mv ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.filtered.vcf.gz ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.deepsomatic.tumor_only.vcf.gz
    tabix -p vcf ${alignment_path}/${project_name}/somatic/snp/${tumor_unique}/${tumor_unique}.deepsomatic.tumor_only.vcf.gz
    echo "Somatic-Only SNP/Indel Calling (deepSomatic) Completed for ${sample_id}"
    """
}

process somatic_only_sv_manta {
    cpus params.number_of_process
    errorStrategy 'ignore'
    tag "${sample_id}_somatic_only"

    input:
    tuple val(sample_id), path(tumor_bam), path(tumor_bai), val(tumor_unique)
    path fasta_path
    path tools_path
    val alignment_path
    val number_of_process
    val project_name

    output:
    tuple val(sample_id), path("${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/${tumor_unique}.manta.tumor_only.vcf.gz"), emit: sv_vcf
    stdout emit: sv_calling_success

    script:
    """
    mkdir -p ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/logs
    ${tools_path}/manta/bin/configManta.py \\
        --tumorBam ${tumor_bam} \\
        --referenceFasta \$(readlink -f ${fasta_path}) \\
        --runDir ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/manta
    ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/manta/runWorkflow.py \\
        -m local \\
        -j ${number_of_process} \\
        > ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/logs/manta.log 2>&1
    mv ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/manta/results/variants/tumorSV.vcf.gz \\
       ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/${tumor_unique}.manta.tumor_only.vcf.gz
    tabix -p vcf ${alignment_path}/${project_name}/somatic/sv/${tumor_unique}/${tumor_unique}.manta.tumor_only.vcf.gz
    echo "Somatic-Only SV Calling (Manta) Completed for ${sample_id}"
    """
}

process somatic_only_cnv_cnvkit {
    cpus params.number_of_process
    errorStrategy 'ignore'
    tag "${sample_id}_somatic_only"

    input:
    tuple val(sample_id), path(tumor_bam), path(tumor_bai), val(tumor_unique)
    path fasta_path
    path tools_path
    val alignment_path
    val number_of_process
    val project_name

    output:
    tuple val(sample_id), path("${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/${tumor_unique}.cnvkit.tumor_only.cns"), emit: cnv_calls
    stdout emit: cnv_success

    script:
    """
    mkdir -p ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/logs
    ${tools_path}/cnvkit.py access \$(readlink -f ${fasta_path}) -o ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/access.bed
    ${tools_path}/cnvkit.py autobin ${tumor_bam} -m wgs -g ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/access.bed
    ${tools_path}/cnvkit.py batch ${tumor_bam} \\
        -r !!!!!!!don'tknowwhattowrite \\
        -p ${number_of_process} \\
        -d ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique} \\
        > ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/logs/batch.log 2>&1
    mv ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/*.cns \\
       ${alignment_path}/${project_name}/somatic/cnv/${tumor_unique}/${tumor_unique}.cnvkit.tumor_only.cns
    echo "Somatic-Only CNV Calling (CNVkit) Completed for ${sample_id}"
    """
}

process somatic_only_purecn {
    cpus params.number_of_process
    errorStrategy 'ignore'
    tag "${sample_id}_somatic_only"

    input:
    tuple val(sample_id), path(tumor_bam), path(tumor_bai), val(tumor_unique)
    path fasta_path
    path tools_path
    val alignment_path
    val number_of_process
    val project_name

    output:
    tuple val(sample_id), path("${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/${tumor_unique}.purecn.rds"), emit: loh_segments
    stdout emit: loh_success

    script:
    """
    mkdir -p ${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/logs
    ${tools_path}/gatk Mutect2 \\
        -R \$(readlink -f ${fasta_path}) \\
        -I ${tumor_bam} \\
        -O ${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/${tumor_unique}.vcf.gz \\
        --germline-resource location_of_known_site \\
        --threads ${number_of_process}
    Rscript -e "library(PureCN); \\
        runAbsoluteCN(vcf='${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/${tumor_unique}.vcf.gz', \\
                      tumor.bam='${tumor_bam}', \\
                      genome='hg38', \\
                      output.dir='${alignment_path}/${project_name}/somatic/loh/${tumor_unique}', \\
                      prefix='${tumor_unique}.purecn');" \\
        > ${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/logs/purecn.log 2>&1
    mv ${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/${tumor_unique}.purecn.rds \\
       ${alignment_path}/${project_name}/somatic/loh/${tumor_unique}/${tumor_unique}.purecn.rds
    echo "Somatic-Only LOH/Purity Analysis (PureCN) Completed for ${sample_id}"
    """
}

process wait_all_completed {
    cpus 1
    tag "completion_check"

    input:
    val sv_success
    val snp_success
    val germline_cnv_success
    // val denovo_success
    // val merge_vcf_success
    val cram_success
    val qc_cov_success
    val qc_coverage_success
    val qc_bam2bed_success
    // val bqsr_success
    val cnv_success
    val loh_success
    val unique_ids
    val alignment_path
    val project_name

    output:
    path "${alignment_path}/${project_name}/${project_name}_completed.txt"

    script:
    """
    mkdir -p ${alignment_path}/${project_name}
    echo "All processes completed successfully for project ${project_name}" > ${alignment_path}/${project_name}/${project_name}_completed.txt
    echo "Unique IDs processed: ${unique_ids.join(', ')}" >> ${alignment_path}/${project_name}/${project_name}_completed.txt
    echo "SV calling completed: ${sv_success.join(', ')}" >> ${alignment_path}/${project_name}/${project_name}_completed.txt
    echo "CNV calling completed: ${cnv_success.join(', ')}" >> ${alignment_path}/${project_name}/${project_name}_completed.txt
    echo "SNP calling completed: ${snp_success.join(', ')}" >> ${alignment_path}/${project_name}/${project_name}_completed.txt
    echo "CRAM conversion completed: ${cram_success.join(', ')}" >> ${alignment_path}/${project_name}/${project_name}_completed.txt
    echo "QC coverage completed: ${qc_cov_success.join(', ')}" >> ${alignment_path}/${project_name}/${project_name}_completed.txt
    echo "QC coverage metrics completed: ${qc_coverage_success.join(', ')}" >> ${alignment_path}/${project_name}/${project_name}_completed.txt
    echo "QC BAM to BED completed: ${qc_bam2bed_success.join(', ')}" >> ${alignment_path}/${project_name}/${project_name}_completed.txt
    echo "CNV calling completed: ${cnv_success.join(', ')}" >> ${alignment_path}/${project_name}/${project_name}_completed.txt
    echo "LOH analysis completed: ${loh_success.join(', ')}" >> ${alignment_path}/${project_name}/${project_name}_completed.txt
    """
}

/* ******************************************************************* *
 *                           Function Block                            *
 * ******************************************************************* */

def loadPedMap(ped_file) {
    def family_map = [:]
    Channel.fromPath(ped_file)
        .splitText()
        .filter { line -> !line.startsWith('#') }
        .map { line ->
            def cols = line.trim().split(/\s+/)
            if (cols.size() >= 6) {
                def (fam_id, ind_id, pat_id, mat_id, sex, pheno) = cols[0..5]
                family_map[ind_id] = [family_id: fam_id, paternal_id: pat_id, maternal_id: mat_id, sex: sex, phenotype: pheno]
            }
            else {
                log.error("Invalid PED line: ${line}")
            }
        }
    return family_map
}

def isTrioOrDuo(samples, family_map) {
    def sample_ids = samples.collect { it[0] }
    def proband_id = samples[0][0]
    def father_id = family_map[proband_id]?.paternal_id
    def mother_id = family_map[proband_id]?.maternal_id

    if (samples.size() == 3) {
        return sample_ids.contains(father_id) && sample_ids.contains(mother_id)
    }
    else if (samples.size() == 2) {
        return sample_ids.contains(father_id) || sample_ids.contains(mother_id)
    }
    return false
}
