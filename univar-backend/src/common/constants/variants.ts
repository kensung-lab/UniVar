export const SV_TYPE_FILTER_NAME = 'sv_type';
export const SNV_TYPE_FILTER_NAME = 'snv_type';

export const IS_READ_COLUMN_NAME = 'is_read';
export const CLINGEN_HI_COLUMN_NAME = 'clingen_hi';
export const CLINGEN_TS_COLUMN_NAME = 'clingen_ts';
export const SCENARIO_COLUMN_NAME = 'scenario';
export const GENE_OBJS_COLUMN_NAME = 'gene_objs';
export const NOTE_COLUMN_NAME = 'note';

export const EXPORT_GENOTYPES_COLUMN_NAME = 'samples_genotypes';

export const SNV_ONLY_FILTERS = [
  'pass_filter',
  'quality',
  SNV_TYPE_FILTER_NAME,
  'is_coding',
  'is_exonic',
  'impact',
  'revel',
  'polyphen_pred',
  'sift_pred',
  'polyphen_score',
  'sift_score',
  'clnsig',
  'highest_splice_ai',
  'spliceai_pred_ds_ag',
  'spliceai_pred_ds_al',
  'spliceai_pred_ds_dg',
  'spliceai_pred_ds_dl',
  'cadd_phred',
  'am_class',
  'am_pathogenicity',
  'gnomadv2e_af',
  'gnomadv2e_afr_af',
  'gnomadv2e_amr_af',
  'gnomadv2e_asj_af',
  'gnomadv2e_eas_af',
  'gnomadv2e_fin_af',
  'gnomadv2e_nfe_af',
  'gnomadv2e_oth_af',
  'gnomadv2e_sas_af',
  'gnomadv2g_af',
  'gnomadv2g_afr_af',
  'gnomadv2g_amr_af',
  'gnomadv2g_asj_af',
  'gnomadv2g_eas_af',
  'gnomadv2g_fin_af',
  'gnomadv2g_nfe_af',
  'gnomadv2g_oth_af',
  'gnomadv2g_sas_af',
  'gnomadv3g_af',
  'gnomadv3g_afr_af',
  'gnomadv3g_amr_af',
  'gnomadv3g_asj_af',
  'gnomadv3g_eas_af',
  'gnomadv3g_fin_af',
  'gnomadv3g_mid_af',
  'gnomadv3g_nfe_af',
  'gnomadv3g_oth_af',
  'gnomadv3g_sas_af',
  'gnomadv4e_af',
  'gnomadv4e_afr_af',
  'gnomadv4e_amr_af',
  'gnomadv4e_asj_af',
  'gnomadv4e_eas_af',
  'gnomadv4e_fin_af',
  'gnomadv4e_mid_af',
  'gnomadv4e_nfe_af',
  'gnomadv4e_oth_af',
  'gnomadv4e_sas_af',
  'gnomadv4g_af',
  'gnomadv4g_afr_af',
  'gnomadv4g_amr_af',
  'gnomadv4g_asj_af',
  'gnomadv4g_eas_af',
  'gnomadv4g_fin_af',
  'gnomadv4g_mid_af',
  'gnomadv4g_nfe_af',
  'gnomadv4g_oth_af',
  'gnomadv4g_sas_af',
];

export const SV_AF_FILTERS = [
  'dgv_gold_outer',
  'dgv_gold_inner',
  'one_kg_eas',
  'one_kg_sur_eas',
  'one_kg',
  'one_kg_sur',
];

export const SV_SPECICAL_AF_FILTERS = [
  'gnomadv2_sv_af',
  'gnomadv2_sv_afr_af',
  'gnomadv2_sv_amr_af',
  'gnomadv2_sv_eas_af',
  'gnomadv2_sv_eur_af',
  'gnomadv2_sv_oth_af',
  'gnomadv4_sv_af',
  'gnomadv4_sv_afr_af',
  'gnomadv4_sv_ami_af',
  'gnomadv4_sv_amr_af',
  'gnomadv4_sv_asj_af',
  'gnomadv4_sv_eas_af',
  'gnomadv4_sv_fin_af',
  'gnomadv4_sv_mid_af',
  'gnomadv4_sv_nfe_af',
  'gnomadv4_sv_oth_af',
  'gnomadv4_sv_sas_af',
  'han_sv_af',
];

export const SV_ONLY_FILTERS = [
  'p_lof',
  SV_TYPE_FILTER_NAME,
  'gene_objs',
  'len',
  'is_pathogenic',
  'is_repeat',
  'caller',
  ...SV_AF_FILTERS,
  ...SV_SPECICAL_AF_FILTERS,
];

export const CONSTRAINT_FILTERS = [
  'constraint_v2_pli',
  'constraint_v2_oe_lof',
  'constraint_v2_oe_lof_lower',
  'constraint_v2_oe_lof_upper',
  'constraint_v2_mis_z',
  'constraint_v2_oe_mis',
  'constraint_v2_oe_mis_lower',
  'constraint_v2_oe_mis_upper',
  'constraint_v2_syn_z',
  'constraint_v2_oe_syn',
  'constraint_v2_oe_syn_lower',
  'constraint_v2_oe_syn_upper',
  'constraint_v4_pli',
  'constraint_v4_oe_lof',
  'constraint_v4_oe_lof_lower',
  'constraint_v4_oe_lof_upper',
  'constraint_v4_mis_z',
  'constraint_v4_oe_mis',
  'constraint_v4_oe_mis_lower',
  'constraint_v4_oe_mis_upper',
  'constraint_v4_syn_z',
  'constraint_v4_oe_syn',
  'constraint_v4_oe_syn_lower',
  'constraint_v4_oe_syn_upper',
];

export const SPECIAL_HANDLE_FILTERS = [
  IS_READ_COLUMN_NAME,
  NOTE_COLUMN_NAME,
  CLINGEN_HI_COLUMN_NAME,
  CLINGEN_TS_COLUMN_NAME,
  SCENARIO_COLUMN_NAME,
  'gene_objs.gene_filter',
  'univar_high_impact',
  'highest_exomiser_gene_combined_score',
  'highest_exomiser_gene_pheno_score',
  ...CONSTRAINT_FILTERS,
];

export const NOT_INCLUDE_LIST = [
  'highest_exomiser_scombi',
  '__v',
  'sample',
  'scenario',
  'gt_types',
];

export const BASE_VARIANT_SPECIAL_HANDLE_KEY = [
  NOTE_COLUMN_NAME,
  'constraint_v2_pli',
  'constraint_v4_pli',
  'impact',
  'caller',
  ...NOT_INCLUDE_LIST,
];

export const RESPONSE_VARIANT_SPECIAL_HANDLE_KEY = [
  IS_READ_COLUMN_NAME,
  GENE_OBJS_COLUMN_NAME,
  'hg19_chrom',
  'hg19_start',
  'hg19_strand',
  'hg19_end',
  'allelic_depths',
  'genotypes_index',
  'genotype_qualities',
  'afs',
  'exts',
  'intpns',
  'exons',
  'highest_af_info',
  'afs',
  '_id',
];

export const EXPORT_TSV_VARIANT_SPECIAL_HANDLE_KEY = [
  GENE_OBJS_COLUMN_NAME,
  'gene_symbol',
  'ensembl_gene_id',
  'entrez_gene_id',
  'genotypes_index',
  'allelic_depths',
  'impact',
  'impact_so',
  ...CONSTRAINT_FILTERS,
  'polyphen_pred',
  'sift_pred',
  'polyphen_score',
  'sift_score',
  'spliceai_pred_ds_ag',
  'spliceai_pred_ds_al',
  'spliceai_pred_ds_dg',
  'spliceai_pred_ds_dl',
  'revel',
  'is_coding',
  'is_exonic',
];

export const EXOMISER_COLUMN_LIST = [
  'highest_gene_symbol',
  'highest_moi',
  'highest_exomiser_acmg_classification',
  'highest_exomiser_acmg_evidence',
  'highest_exomiser_acmg_disease_id',
  'highest_exomiser_acmg_disease_name',
  'highest_exomiser_gene_combined_score',
  'highest_exomiser_gene_pheno_score',
  'highest_exomiser_gene_variant_score',
];

export const SPECIAL_HANDLE_SORT = [
  'gene_symbol',
  'ensembl_gene_id',
  'entrez_gene_id',
  'ensembl_transcript_id',
  'pathogenic',
  'source',
  'chrom',
  'start',
  ...EXOMISER_COLUMN_LIST,
];

export const ARRAY_SORT_LIST = [
  'polyphen_pred',
  'sift_pred',
  'polyphen_score',
  'sift_score',
  'spliceai_pred_ds_ag',
  'spliceai_pred_ds_al',
  'spliceai_pred_ds_dg',
  'spliceai_pred_ds_dl',
  'impact',
  ...CONSTRAINT_FILTERS,
];

export const GENE_DB_VERSION_NAME = 'gene_db_version';
export const VCF_HEADER_NAME = 'vcf_header';

export const VERSION_INFO = 'version_info';
export const EXPORT_MESSAGE_BATCH_SIZE = 1000;

export enum ExportType {
  tsv = 'TSV',
  vcf = 'VCF',
}

export const IMPACT_SEVERITY_HIGH = 'HIGH';
export const IMPACT_SEVERITY_MODERATE = 'MODERATE';

export const CLN_SIG_PATHOGENIC = [
  'Pathogenic',
  'Pathogenic,_drug_response,_protective,_risk_factor',
  'Pathogenic,_protective',
  'Pathogenic,_risk_factor',
  'Pathogenic/Likely_pathogenic',
  'Likely_pathogenic',
];

export const SCENARIO_LIST = [
  '0', // dominant
  '1', // recessive
  '2', // de_novo
  '3', // compound_het
  '4', // x_linked
];
