import { styleForAF, styleForSpliceAI, columnForAF } from '@/utils/variants-table/columns/columns-utils';
import { Dark } from 'quasar';

export const CHROM_COLUMN = {
  name: 'chrom',
  required: true,
  label: 'Chr',
  align: 'center',
  field: row => row.chrom,
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true,
  isFrozen: true,
  remark: 'The chromosome on which the variant resides (VCF CHROM field).',
};

export const START_COLUMN = {
  name: 'start',
  required: true,
  label: 'Start',
  align: 'center',
  field: row => row.start,
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true,
  isFrozen: true,
  remark : 'The 1-based start position. (VCF POS field).',
};

export const END_COLUMN = {
  name: 'end',
  required: true,
  label: 'End',
  align: 'center',
  field: row => row.end,
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true,
  isFrozen: true,
  remark : 'The 1-based end position. (VCF POS field. yet inferred based on the size of the variant).',
};

export const LOCATION_COLUMN = {
  name: 'location',
  required: true,
  label: 'Location',
  align: 'center',
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: false,
  remark: 'Chromosome: start-end position',
  width: 180
};

export const REF_COLUMN = {
  name: 'ref',
  required: true,
  label: 'Ref',
  align: 'center',
  field: row => row.ref,
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true,
  remark: 'Reference allele (VCF REF field).',
  width: 30,
};

export const ALT_COLUMN = {
  name: 'alt',
  required: true,
  label: 'Alt',
  align: 'center',
  field: row => row.alt,
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true,
  remark: 'Alternate allele for the variant(VCG ALT field).',
  width: 70,
};

export const GENOTYPES_COLUMN = {
  name: 'samples_genotypes',
  required: true,
  label: 'Samples genotypes',
  align: 'center',
  field: row => row.genotypes_index ? row.genotypes_index : '',
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true,
  remark: 'A view of the genotype of each selected sample.'
};

export const GENE_COLUMN = {
  name: 'gene_symbol',
  required: true,
  label: 'Gene',
  align: 'center',
  field: row => row.gene_objs ? row.gene_objs : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: true,
  remark: 'The gene symbol (not unique). Clicking on it opens a lookup window that shows the unique gene identifiers.',
};


export const HGVSC_COLUMN = {
  name: 'hgvsc',
  required: true,
  label: 'HGVSc',
  align: 'center',
  field: row => row.hgvsc ? row.hgvsc : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  remark: 'The HGVS coding sequence name.',
  groupBreak: true
};

export const HGVSP_COLUMN = {
  name: 'hgvsp',
  required: true,
  label: 'HGVSp',
  align: 'center',
  field: row => row.hgvsp ? row.hgvsp : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: true,
  remark: 'The HGVS protein sequence name.'
};

export const QUALITY_COLUMN = {
  name: 'quality',
  required: true,
  label: 'Quality',
  align: 'center',
  field: row => row.quality ? row.quality : '',
  format: val => `${val}`,
  sortable: true,
  category: "quality",
  isShow: false,
  remark: 'Quality score for the assertion made in ALT (VCF QUAL field).',
};

export const IMPACT_COLUMN = {
  name: 'impact',
  required: true,
  label: 'Effect',
  align: 'center',
  field: row => row.impact ? typeof row.impact == 'object' ? row.impact[0] : row.impact : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: true,
  remark: "Consequence type of the variant and it is defined by SO terms. Applied to all germline variants and somatic mutations stored in the Ensembl databases."
};

export const EXISTING_VARIATION_COLUMN = {
  name: 'existing_variation',
  required: true,
  label: 'Existing variation',
  align: 'center',
  field: row => row.existing_variation ? row.existing_variation : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  remark: ''
};

export const MANE_SELECT_COLUMN = {
  name: 'mane_select',
  required: true,
  label: 'MANE select',
  align: 'center',
  field: row => row.mane_select ? row.mane_select : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  remark: 'The Matched Annotation from NCBI and EMBL-EBI is a collaboration between Ensembl/GENCODE and RefSeq.',
};

export const REVEL_COLUMN = {
  name: 'revel',
  required: true,
  label: 'Revel',
  align: 'center',
  field: row => row.revel == null || row.revel == undefined || row.revel == -1 ? '' : typeof row.revel == 'number' || typeof row.revel == 'string' ? row.revel : row.revel[0],
  format: val => `${val}`,
  style: row => row.revel && row.revel >= 0.773 ? {color: '#db5d59','font-weight': 'bold'} : row.revel && row.revel <= 0.183 ? {color: '#09b8ff','font-weight': 'bold'} : {color: '#777777'},
  sortable: true,
  category: "effect",
  isShow: true,
  remark: "Rare Exome Variant Ensemble Learner (REVEL) predicts the pathogenicity of missense variants and score ranging from 0 to 1. Higher scores are more deleterious."
};

export const GNOMAD_V2E_AF_COLUMN = columnForAF('gnomadv2e_af', 'gnomAD v2 Exome AF');
export const GNOMAD_V2E_AFR_AF_COLUMN = columnForAF('gnomadv2e_afr_af', 'gnomAD v2 Exome AF - African/African American');
export const GNOMAD_V2E_AMR_AF_COLUMN = columnForAF('gnomadv2e_amr_af', 'gnomAD v2 Exome AF - Latino/Admixed American');
export const GNOMAD_V2E_ASJ_AF_COLUMN = columnForAF('gnomadv2e_asj_af', 'gnomAD v2 Exome AF - Ashkenazi Jewish');
export const GNOMAD_V2E_EAS_AF_COLUMN = columnForAF('gnomadv2e_eas_af', 'gnomAD v2 Exome AF - East Asian');
export const GNOMAD_V2E_FIN_AF_COLUMN = columnForAF('gnomadv2e_fin_af', 'gnomAD v2 Exome AF - Finnish');
export const GNOMAD_V2E_NFE_AF_COLUMN = columnForAF('gnomadv2e_nfe_af', 'gnomAD v2 Exome AF - Non-Finnish European');
export const GNOMAD_V2E_OTH_AF_COLUMN = columnForAF('gnomadv2e_oth_af', 'gnomAD v2 Exome AF - Other');
export const GNOMAD_V2E_SAS_AF_COLUMN = columnForAF('gnomadv2e_sas_af', 'gnomAD v2 Exome AF - South Asian');
export const GNOMAD_V2G_AF_COLUMN = columnForAF('gnomadv2g_af', 'gnomAD v2 Genome AF');
export const GNOMAD_V2G_AFR_AF_COLUMN = columnForAF('gnomadv2g_afr_af', 'gnomAD v2 Genome AF - African/African American');
export const GNOMAD_V2G_AMR_AF_COLUMN = columnForAF('gnomadv2g_amr_af', 'gnomAD v2 Genome AF - Latino/Admixed American');
export const GNOMAD_V2G_ASJ_AF_COLUMN = columnForAF('gnomadv2g_asj_af', 'gnomAD v2 Genome AF - Ashkenazi Jewish');
export const GNOMAD_V2G_EAS_AF_COLUMN = columnForAF('gnomadv2g_eas_af', 'gnomAD v2 Genome AF - East Asian');
export const GNOMAD_V2G_FIN_AF_COLUMN = columnForAF('gnomadv2g_fin_af', 'gnomAD v2 Genome AF - Finnish');
export const GNOMAD_V2G_NFE_AF_COLUMN = columnForAF('gnomadv2g_nfe_af', 'gnomAD v2 Genome AF - Non-Finnish European');
export const GNOMAD_V2G_OTH_AF_COLUMN = columnForAF('gnomadv2g_oth_af', 'gnomAD v2 Genome AF - Other');
export const GNOMAD_V2G_SAS_AF_COLUMN = columnForAF('gnomadv2g_sas_af', 'gnomAD v2 Genome AF - South Asian');
export const GNOMAD_V3G_AF_COLUMN = columnForAF('gnomadv3g_af', 'gnomAD v3 Genome AF');
export const GNOMAD_V3G_AFR_AF_COLUMN = columnForAF('gnomadv3g_afr_af', 'gnomAD v3 Genome AF - African/African American');
export const GNOMAD_V3G_AMR_AF_COLUMN = columnForAF('gnomadv3g_amr_af', 'gnomAD v3 Genome AF - Latino/Admixed American');
export const GNOMAD_V3G_ASJ_AF_COLUMN = columnForAF('gnomadv3g_asj_af', 'gnomAD v3 Genome AF - Ashkenazi Jewish');
export const GNOMAD_V3G_EAS_AF_COLUMN = columnForAF('gnomadv3g_eas_af', 'gnomAD v3 Genome AF - East Asian');
export const GNOMAD_V3G_FIN_AF_COLUMN = columnForAF('gnomadv3g_fin_af', 'gnomAD v3 Genome AF - Finnish');
export const GNOMAD_V3G_MID_AF_COLUMN = columnForAF('gnomadv3g_mid_af', 'gnomAD v3 Genome AF - Mid-eastern');
export const GNOMAD_V3G_NFE_AF_COLUMN = columnForAF('gnomadv3g_nfe_af', 'gnomAD v3 Genome AF - Non-Finnish European');
export const GNOMAD_V3G_OTH_AF_COLUMN = columnForAF('gnomadv3g_oth_af', 'gnomAD v3 Genome AF - Other');
export const GNOMAD_V3G_SAS_AF_COLUMN = columnForAF('gnomadv3g_sas_af', 'gnomAD v3 Genome AF - South Asian');
export const GNOMAD_V4E_AF_COLUMN = columnForAF('gnomadv4e_af', 'gnomAD v4 Exome AF');
export const GNOMAD_V4E_AFR_AF_COLUMN = columnForAF('gnomadv4e_afr_af', 'gnomAD v4 Exome AF - African/African American');
export const GNOMAD_V4E_AMR_AF_COLUMN = columnForAF('gnomadv4e_amr_af', 'gnomAD v4 Exome AF - Latino/Admixed American');
export const GNOMAD_V4E_ASJ_AF_COLUMN = columnForAF('gnomadv4e_asj_af', 'gnomAD v4 Exome AF - Ashkenazi Jewish');
export const GNOMAD_V4E_EAS_AF_COLUMN = columnForAF('gnomadv4e_eas_af', 'gnomAD v4 Exome AF - East Asian');
export const GNOMAD_V4E_FIN_AF_COLUMN = columnForAF('gnomadv4e_fin_af', 'gnomAD v4 Exome AF - Finnish');
export const GNOMAD_V4E_MID_AF_COLUMN = columnForAF('gnomadv4e_mid_af', 'gnomAD v4 Exome AF - Mid-eastern');
export const GNOMAD_V4E_NFE_AF_COLUMN = columnForAF('gnomadv4e_nfe_af', 'gnomAD v4 Exome AF - Non-Finnish European');
export const GNOMAD_V4E_OTH_AF_COLUMN = columnForAF('gnomadv4e_oth_af', 'gnomAD v4 Exome AF - Other');
export const GNOMAD_V4E_SAS_AF_COLUMN = columnForAF('gnomadv4e_sas_af', 'gnomAD v4 Exome AF - South Asian');
export const GNOMAD_V4G_AF_COLUMN = columnForAF('gnomadv4g_af', 'gnomAD v4 Genome AF');
export const GNOMAD_V4G_AFR_AF_COLUMN = columnForAF('gnomadv4g_afr_af', 'gnomAD v4 Genome AF - African/African American');
export const GNOMAD_V4G_AMR_AF_COLUMN = columnForAF('gnomadv4g_amr_af', 'gnomAD v4 Genome AF - Latino/Admixed American');
export const GNOMAD_V4G_ASJ_AF_COLUMN = columnForAF('gnomadv4g_asj_af', 'gnomAD v4 Genome AF - Ashkenazi Jewish');
export const GNOMAD_V4G_EAS_AF_COLUMN = columnForAF('gnomadv4g_eas_af', 'gnomAD v4 Genome AF - East Asian');
export const GNOMAD_V4G_FIN_AF_COLUMN = columnForAF('gnomadv4g_fin_af', 'gnomAD v4 Genome AF - Finnish');
export const GNOMAD_V4G_MID_AF_COLUMN = columnForAF('gnomadv4g_mid_af', 'gnomAD v4 Genome AF - Mid-eastern');
export const GNOMAD_V4G_NFE_AF_COLUMN = columnForAF('gnomadv4g_nfe_af', 'gnomAD v4 Genome AF - Non-Finnish European');
export const GNOMAD_V4G_OTH_AF_COLUMN = columnForAF('gnomadv4g_oth_af', 'gnomAD v4 Genome AF - Other');
export const GNOMAD_V4G_SAS_AF_COLUMN = columnForAF('gnomadv4g_sas_af', 'gnomAD v4 Genome AF - South Asian');
export const GNOMAD_V2_SV_AF_COLUMN = columnForAF('gnomadv2_sv_af', 'gnomAD v2 SV AF');
export const GNOMAD_V2_SV_AFR_AF_COLUMN = columnForAF('gnomadv2_sv_afr_af', 'gnomAD v2 SV AF - African/African American');
export const GNOMAD_V2_SV_AMR_AF_COLUMN = columnForAF('gnomadv2_sv_amr_af', 'gnomAD v2 SV AF - Latino/Admixed American');
export const GNOMAD_V2_SV_EAS_AF_COLUMN = columnForAF('gnomadv2_sv_eas_af', 'gnomAD v2 SV AF - East Asian');
export const GNOMAD_V2_SV_EUR_AF_COLUMN = columnForAF('gnomadv2_sv_eur_af', 'gnomAD v2 SV AF - European');
export const GNOMAD_V2_SV_OTH_AF_COLUMN = columnForAF('gnomadv2_sv_oth_af', 'gnomAD v2 SV AF - Other');
export const GNOMAD_V4_SV_AF_COLUMN = columnForAF('gnomadv4_sv_af', 'gnomAD v4 SV AF');
export const GNOMAD_V4_SV_AFR_AF_COLUMN = columnForAF('gnomadv4_sv_afr_af', 'gnomAD v4 SV AF - African/African American');
export const GNOMAD_V4_SV_AMI_AF_COLUMN = columnForAF('gnomadv4_sv_ami_af', 'gnomAD v4 SV AF - Amish');
export const GNOMAD_V4_SV_AMR_AF_COLUMN = columnForAF('gnomadv4_sv_amr_af', 'gnomAD v4 SV AF - Latino/Admixed American');
export const GNOMAD_V4_SV_ASJ_AF_COLUMN = columnForAF('gnomadv4_sv_asj_af', 'gnomAD v4 SV AF - Ashkenazi Jewish');
export const GNOMAD_V4_SV_EAS_AF_COLUMN = columnForAF('gnomadv4_sv_eas_af', 'gnomAD v4 SV AF - East Asian');
export const GNOMAD_V4_SV_FIN_AF_COLUMN = columnForAF('gnomadv4_sv_fin_af', 'gnomAD v4 SV AF - Finnish');
export const GNOMAD_V4_SV_MID_AF_COLUMN = columnForAF('gnomadv4_sv_mid_af', 'gnomAD v4 SV AF - Mid-eastern');
export const GNOMAD_V4_SV_NFE_AF_COLUMN = columnForAF('gnomadv4_sv_nfe_af', 'gnomAD v4 SV AF - Non-Finnish European');
export const GNOMAD_V4_SV_OTH_AF_COLUMN = columnForAF('gnomadv4_sv_oth_af', 'gnomAD v4 SV AF - Other');
export const GNOMAD_V4_SV_SAS_AF_COLUMN = columnForAF('gnomadv4_sv_sas_af', 'gnomAD v4 SV AF - South Asian');
export const HAN_SV_AF_COLUMN = columnForAF('han_sv_af', '945 Han Chinese SV AF');


export const V2_MIS_Z_COLUMN = {
  name: 'constraint_v2_mis_z',
  required: true,
  label: 'gnomADv2 Z-score mis',
  align: 'center',
  field: row => row.constraint_v2_mis_z ? typeof row.constraint_v2_mis_z == 'object' ? row.constraint_v2_mis_z[0] : row.constraint_v2_mis_z : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv2 Z-score for missense variants in gene, ranging from -5 to 0. Higher (more +ve) Z-score indicates that the transcript is more constrained of such variation."
};
export const V4_MIS_Z_COLUMN = {
  name: 'constraint_v4_mis_z',
  required: true,
  label: 'gnomADv4 Z-score mis',
  align: 'center',
  field: row => row.constraint_v4_mis_z ? typeof row.constraint_v4_mis_z == 'object' ? row.constraint_v4_mis_z[0] : row.constraint_v4_mis_z : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv4 Z-score for missense variants in gene, ranging from -5 to 0. Higher (more +ve) Z-score indicates that the transcript is more constrained of such variation."
};
export const V2_OE_LOF_UPPER_COLUMN = {
  name: 'constraint_v2_oe_lof_upper',
  required: true,
  label: 'gnomADv2 O/E LoF upper',
  align: 'center',
  field: row => row.constraint_v2_oe_lof_upper && (typeof row.constraint_v2_oe_lof_upper !== 'object' || row.constraint_v2_oe_lof_upper.length > 0) ? typeof row.constraint_v2_oe_lof_upper == 'object' ? row.constraint_v2_oe_lof_upper[0] : row.constraint_v2_oe_lof_upper : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv2 Upper bound of 90% confidence interval for O/E ratio for pLoF variants. Lower values indicate that the transcript is more constrained of such variation,  < 0.35 is the recommended threshold for measuring LoF intolerance."
};
export const V4_OE_LOF_UPPER_COLUMN = {
  name: 'constraint_v4_oe_lof_upper',
  required: true,
  label: 'gnomADv4 O/E LoF upper',
  align: 'center',
  field: row => row.constraint_v4_oe_lof_upper && (typeof row.constraint_v4_oe_lof_upper !== 'object' || row.constraint_v4_oe_lof_upper.length > 0) ? typeof row.constraint_v4_oe_lof_upper == 'object' ? row.constraint_v4_oe_lof_upper[0] : row.constraint_v4_oe_lof_upper : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv4 Upper bound of 90% confidence interval for O/E ratio for pLoF variants. Lower values indicate that the transcript is more constrained of such variation,  < 0.35 is the recommended threshold for measuring LoF intolerance."
};
export const CLNSIG_COLUMN = {
  name: 'clnsig',
  required: true,
  label: 'ClinVar Classification',
  align: 'center',
  field: row => row.clnsig ? row.clnsig : '',
  format: val => `${val}`,
  style: row => row.clnsig && row.clnsig.toLowerCase().includes('pathogenic') ? {color: 'red', 'font-weight': 'bold'} : Dark.isActive ? {color: 'white'} : {color: 'black'},
  sortable: true,
  category: "evidence",
  isShow: true,
  cellRenderer: 'formatShowTooltip',
  remark: "Clinical significance for this single variant."
};
export const CLNSIG_CONF_COLUMN = {
  name: 'clnsigconf',
  required: true,
  label: 'ClinVar conf',
  align: 'center',
  field: row => row.clnsigconf ? row.clnsigconf : '',
  format: val => `${val}`,
  style: row => row.clnsigconf && row.clnsigconf.toLowerCase().includes('pathogenic') ? {color: 'red', 'font-weight': 'bold'} : Dark.isActive ? {color: 'white'} : {color: 'black'},
  sortable: true,
  category: "evidence",
  isShow: false,
  cellRenderer: 'formatShowTooltip',
  remark: "Conflicting clinical significance for this single variant."
};
export const CLNVAR_ID_COLUMN = {
  name: 'clnid',
  required: true,
  label: 'ClinVar ID',
  align: 'center',
  field: row => row.clnid ? row.clnid : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: true,
};
export const CGD_AGE_GROUP_COLUMN = {
  name: 'cgd_agegroup',
  required: true,
  label: 'CGD Agegroup',
  align: 'center',
  field: row => row.cgd_agegroup ? row.cgd_agegroup : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  groupBreak: true
};
export const CGD_INHERITANCE_COLUMN = {
  name: 'cgd_inheritance',
  required: true,
  label: 'CGD Inheritance',
  align: 'center',
  field: row => row.cgd_inheritance ? row.cgd_inheritance : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
};
export const CGD_MANIFEST_CAT_COLUMN = {
  name: 'cgd_manifestationcategories',
  required: true,
  label: 'CGD Manifestationcategories',
  align: 'center',
  field: row => row.cgd_manifestationcategories ? row.cgd_manifestationcategories : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
};
export const EXOMISER_AD_EXGEN_SCOMBI_COLUMN = {
  name: 'exomiser_ad_exgenescombi',
  required: true,
  label: 'ExomAD SCombi',
  align: 'center',
  field: row => row.exomiser_ad_exgenescombi,
  sortable: true,
  category: "prioritization",
  isShow: false,
  remark: 'Exomiser gene combined score of autosomal dominant inheritance, score ranging from 0 (benign) to 1 (pathogenic).',
  cellRenderer: 'formatScientific'
};
export const EXOMISER_AR_EXGEN_SCOMBI_COLUMN = {
  name: 'exomiser_ar_exgenescombi',
  required: true,
  label: 'ExomAR SCombi',
  align: 'center',
  field: row => row.exomiser_ar_exgenescombi,
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatScientific',
  remark: 'Exomiser gene combined score of autosomal recessive inhertiance, score ranging from 0 (benign) to 1 (pathogenic).'
};
export const EXOMISER_XD_EXGEN_SCOMBI_COLUMN = {
  name: 'exomiser_xd_exgenescombi',
  required: true,
  label: 'ExomXD SCombi',
  align: 'center',
  field: row => row.exomiser_xd_exgenescombi,
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatScientific',
  remark: 'Exomiser gene combined score of X-linked dominant inheritance, score ranging from 0 (benign) to 1 (pathogenic).',
};
export const EXOMISER_XR_EXGEN_SCOMBI_COLUMN = {
  name: 'exomiser_xr_exgenescombi',
  required: true,
  label: 'ExomXR SCombi',
  align: 'center',
  field: row => row.exomiser_xr_exgenescombi,
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatScientific',
  remark: 'Exomiser gene combined score of X-linked recessive inheritance, score ranging from 0 (benign) to 1 (pathogenic).',
};
export const VARINAT_TYPE_COLUMN = {
  name: 'variant_type',
  required: true,
  label: 'Variant type',
  align: 'center',
  field: row => row.variant_type,
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: false,
  remark: 'Small variant / Structural variant'
};
export const ALLELIC_DEPTHS_COLUMN = {
  name: 'allelic_depths',
  required: true,
  label: 'Allelic depths',
  align: 'center',
  field: row => row.allelic_depths ? row.allelic_depths : '',
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: false,
};
export const GENOTYPE_QTY_COLUMN = {
  name: 'genotypeQty',
  required: true,
  label: 'Genotype quality',
  align: 'center',
  field: row => row.genotype_qualities,
  format: val => `${val}`,
  sortable: true,
  category: "quality",
  isShow: false
};
export const CALLER_COLUMN = {
  name: 'caller',
  required: true,
  label: 'Caller',
  align: 'center',
  field: row => row.caller ? row.caller : '',
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: false,
  remark: "The caller of SV"
};

/* genomic and genetic data */
export const ENSEMBL_TRANSCRIPT_COLUMN = {
  name: 'ensembl_transcript_id',
  required: true,
  label: 'Transcript Ensembl',
  align: 'center',
  field: row => row.ensembl_transcript_id ? row.ensembl_transcript_id : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false
};
export const ENSEMBL_GENE_COLUMN = {
  name: 'ensembl_gene_id',
  required: true,
  label: 'Gene Ensembl',
  align: 'center',
  field: row => row.ensembl_gene_id,
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  remark: 'The gene ID in Ensembl.'
};
export const ENTREZ_GENE_COLUMN = {
  name: 'entrez_gene_id',
  required: true,
  label: 'Gene Entrez',
  align: 'center',
  field: row => row.entrez_gene_id,
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  remark: 'The gene ID in Entrez (NCBI).'
};
export const V2_OE_SYN_COLUMN = {
  name: 'constraint_v2_oe_syn',
  required: true,
  label: 'gnomADv2 O/E syn',
  align: 'center',
  field: row => row.constraint_v2_oe_syn ? row.constraint_v2_oe_syn : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: 'gnomADv2 Observed over expected ratio for synonmous variants in transcript (Obs syn divided by Exp syn). O/E is in a range from 0 to 1. Lower values indicate that the transcript is more constrained of such variation.',
  groupBreak: true
};
export const V4_OE_SYN_COLUMN = {
  name: 'constraint_v4_oe_syn',
  required: true,
  label: 'gnomADv4 O/E syn',
  align: 'center',
  field: row => row.constraint_v4_oe_syn ? row.constraint_v4_oe_syn : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: 'gnomADv4 Observed over expected ratio for synonmous variants in transcript (Obs syn divided by Exp syn). O/E is in a range from 0 to 1. Lower values indicate that the transcript is more constrained of such variation.',
  groupBreak: true
};
export const V2_OE_SYN_LOWER_COLUMN = {
  name: 'constraint_v2_oe_syn_lower',
  required: true,
  label: 'gnomADv2 O/E syn lower',
  align: 'center',
  field: row => row.constraint_v2_oe_syn_lower ? row.constraint_v2_oe_syn_lower : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: 'gnomADv2 Lower bound of 90% confidence interval for o/e ratio for synonymous variants.'
};
export const V4_OE_SYN_LOWER_COLUMN = {
  name: 'constraint_v4_oe_syn_lower',
  required: true,
  label: 'gnomADv4 O/E syn lower',
  align: 'center',
  field: row => row.constraint_v4_oe_syn_lower ? row.constraint_v4_oe_syn_lower : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: 'gnomADv4 Lower bound of 90% confidence interval for o/e ratio for synonymous variants.'
};
export const V2_OE_SYN_UPPER_COLUMN = {
  name: 'constraint_v2_oe_syn_upper',
  required: true,
  label: 'gnomADv2 O/E syn upper',
  align: 'effect',
  field: row => row.constraint_v2_oe_syn_upper ? row.constraint_v2_oe_syn_upper : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: 'gnomADv2 Upper bound of 90% confidence interval for O/E ratio for synonymous variants. Lower values indicates that the transcript is more constrained of such variation.'
};
export const V4_OE_SYN_UPPER_COLUMN = {
  name: 'constraint_v4_oe_syn_upper',
  required: true,
  label: 'gnomADv4 O/E syn upper',
  align: 'effect',
  field: row => row.constraint_v4_oe_syn_upper ? row.constraint_v4_oe_syn_upper : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: 'gnomADv4 Upper bound of 90% confidence interval for O/E ratio for synonymous variants. Lower values indicates that the transcript is more constrained of such variation.'
};
export const V2_PLI_COLUMN = {
  name: 'constraint_v2_pli',
  required: true,
  label: 'gnomADv2 pLI',
  align: 'center',
  field: row => row.constraint_v2_pli ? row.constraint_v2_pli : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: 'gnomADv2 pLI scores calculated from ExAC, ranging from 0 to 1.  >= 0.9 indicates that the transcript is more constrained of such variation.'
};
export const V4_PLI_COLUMN = {
  name: 'constraint_v4_pli',
  required: true,
  label: 'gnomADv4 pLI',
  align: 'center',
  field: row => row.constraint_v4_pli ? row.constraint_v4_pli : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: 'gnomADv4 pLI scores calculated from ExAC, ranging from 0 to 1.  >= 0.9 indicates that the transcript is more constrained of such variation.'
};
export const V2_SYN_Z_COLUMN = {
  name: 'constraint_v2_syn_z',
  required: true,
  label: 'gnomADv2 Z-score syn',
  align: 'center',
  field: row => row.constraint_v2_syn_z ? typeof row.constraint_v2_syn_z == 'object' ? row.constraint_v2_syn_z[0] : row.constraint_v2_syn_z : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: 'gnomADv2 Z-score for synonymous variants in gene, ranging from -5 to 5. Higher (more +ve) Z-score indicates that the transcript is more constrained of such variation. Extreme values of Z-score syn indicate likely data quality issues.'
};
export const V4_SYN_Z_COLUMN = {
  name: 'constraint_v4_syn_z',
  required: true,
  label: 'gnomADv4 Z-score syn',
  align: 'center',
  field: row => row.constraint_v4_syn_z ? typeof row.constraint_v4_syn_z == 'object' ? row.constraint_v4_syn_z[0] : row.constraint_v4_syn_z : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: 'gnomADv4 Z-score for synonymous variants in gene, ranging from -5 to 5. Higher (more +ve) Z-score indicates that the transcript is more constrained of such variation. Extreme values of Z-score syn indicate likely data quality issues.'
};
export const EXOMISER_AD_EXGEN_SPHENO_COLUMN = {
  name: 'exomiser_ad_exgenespheno',
  required: true,
  label: 'ExomAD SPheno',
  align: 'center',
  field: row => row.exomiser_ad_exgenespheno,
  sortable: true,
  category: "prioritization",
  isShow: false,
  remark: 'Exomiser gene phenotype score of autosomal dominant inheritance, score ranging from 0 (benign) to 1 (pathogenic).',
  cellRenderer: 'formatScientific'
};
export const EXOMISER_AD_EXGEN_VAR_COLUMN = {
  name: 'exomiser_ad_exgenesvar',
  required: true,
  label: 'ExomAD SVar',
  align: 'center',
  field: row => row.exomiser_ad_exgenesvar,
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatScientific',
  remark: 'Exomiser gene variant score of autosomal dominant inheritance, score ranging from 0 (benign) to 1 (pathogenic).'
};
export const EXOMISER_AR_EXGEN_SPHENO_COLUMN = {
  name: 'exomiser_ar_exgenespheno',
  required: true,
  label: 'ExomAR SPheno',
  align: 'center',
  field: row => row.exomiser_ar_exgenespheno,
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatScientific',
  remark: 'Exomiser gene phenotype score of autosomal recessive inhertiance, score ranging from 0 (benign) to 1 (pathogenic).'
};
export const EXOMISER_AR_EXGEN_VAR_COLUMN = {
  name: 'exomiser_ar_exgenesvar',
  required: true,
  label: 'ExomAR SVar',
  align: 'center',
  field: row => row.exomiser_ar_exgenesvar,
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatScientific',
  remark: 'Exomiser gene variant score of autosomal recessive innhertiance, score ranging from 0 (benign) to 1 (pathogenic).'
};
export const EXOMISER_MT_EXGEN_SCOMBI_COLUMN = {
  name: 'exomiser_mt_exgenescombi',
  required: true,
  label: 'ExomMT SCombi',
  align: 'center',
  field: row => row.exomiser_mt_exgenescombi,
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatScientific',
  remark: 'Exomiser gene combined score of mitochondrial DNA, score ranging from 0 (benign) to 1 (pathogenic).'
};
export const EXOMISER_MT_EXGEN_SPHENO_COLUMN = {
  name: 'exomiser_mt_exgenespheno',
  required: true,
  label: 'ExomMT SPheno',
  align: 'center',
  field: row => row.exomiser_mt_exgenespheno,
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatScientific',
  remark: 'Exomiser gene phenotype score of mitochondiral DNA, score ranging from 0 (benign) to 1 (pathogenic).'
};
export const CGD_ALLELIC_CONDITION_COLUMN = {
  name: 'cgd_allelicconditions',
  required: true,
  label: 'CGD Allelicconditions',
  align: 'center',
  field: row => row.cgd_allelicconditions ? row.cgd_allelicconditions : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
};
export const CGD_COMMENTS_COLUMN = {
  name: 'cgd_comments',
  required: true,
  label: 'CGD Comments',
  align: 'center',
  field: row => row.cgd_comments ? row.cgd_comments : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
};
export const CGD_CONDITION_COLUMN = {
  name: 'cgd_condition',
  required: true,
  label: 'CGD Condition',
  align: 'center',
  field: row => row.cgd_condition ? row.cgd_condition : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
};
export const CGD_ENTREZ_ID_COLUMN = {
  name: 'cgd_entrezid',
  required: true,
  label: 'CGD Entrezid',
  align: 'center',
  field: row => row.cgd_entrezid ? row.cgd_entrezid : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
};
export const CGD_GENE_COLUMN = {
  name: 'cgd_gene',
  required: true,
  label: 'CGD Gene',
  align: 'center',
  field: row => row.cgd_gene ? row.cgd_gene : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
};
export const CGD_HGNC_ID_COLUMN = {
  name: 'cgd_hgncid',
  required: true,
  label: 'CGD Hgncid',
  align: 'center',
  field: row => row.cgd_hgncid ? row.cgd_hgncid : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
};
export const CGD_INTERVENTION_CATEGORIES_COLUMN = {
  name: 'cgd_interventioncategories',
  required: true,
  label: 'CGD Interventioncategories',
  align: 'center',
  field: row => row.cgd_interventioncategories ? row.cgd_interventioncategories : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
};
export const CGD_INTERVENTION_RATIONALE_COLUMN = {
  name: 'cgd_interventionrationale',
  required: true,
  label: 'CGD Interventionrationale',
  align: 'center',
  field: row => row.cgd_interventionrationale ? row.cgd_interventionrationale : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
};
export const CGD_REFERENCES_COLUMN = {
  name: 'cgd_references',
  required: true,
  label: 'CGD References',
  align: 'center',
  field: row => row.cgd_references ? row.cgd_references : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
};
export const EXISTING_INFRAME_COLUMN = {
  name: 'existing_inframe_oorfs',
  required: true,
  label: 'InFrame count',
  align: 'center',
  field: row => row.existing_inframe_oorfs ? row.existing_inframe_oorfs : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  remark: 'The number of existing inFrame overlapping ORFs.',
};
export const EXISTING_OUTOFFRAME_COLUMN = {
  name: 'existing_outofframe_oorfs',
  required: true,
  label: 'OutFrame count',
  align: 'center',
  field: row => row.existing_outofframe_oorfs ? row.existing_outofframe_oorfs : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  remark: 'The number of existing out-of-frame overlapping ORFs.',
};
export const EXISTING_UORFS_COLUMN = {
  name: 'existing_uorfs',
  required: true,
  label: 'uORFs count',
  align: 'center',
  field: row => row.existing_uorfs ? row.existing_uorfs : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  remark: 'The number of existing uORFs with a stop codon within the 5 prime UTR.',
};
export const MANE_PLUS_CLINICAL_COLUMN = {
  name: 'mane_plus_clinical',
  required: true,
  label: 'MANE plus clinical',
  align: 'center',
  field: row => row.mane_plus_clinical ? row.mane_plus_clinical : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  remark: 'Transcripts in the MANE Plus Clinical set are additional transcripts per locus necessary to support clinical variant reporting.',
};
export const REFSEQ_MATCH_COLUMN = {
  name: 'refseq_match',
  required: true,
  label: 'RefSeq',
  align: 'center',
  field: row => row.refseq_match ? row.refseq_match : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  remark: 'The RefSeq transcript match status.',
};
export const FLAG_LRG_COLUMN = {
  name: 'flaglrg',
  required: true,
  label: 'LRG ID',
  align: 'center',
  field: row => row.flaglrg ? row.flaglrg : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  remark: 'Indicates the LRG ID matching either the RefSeq or Ensembl.',
};
export const CCDS_COLUMN = {
  name: 'ccds',
  required: true,
  label: 'CCDS',
  align: 'center',
  field: row => row.ccds ? row.ccds : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  remark: 'IDs from Consensus Conding Sequence (CCDS) for this transcript.',
};
export const DOMAINS_COLUMN = {
  name: 'domains',
  required: true,
  label: 'Domains',
  align: 'center',
  field: row => row.domains ? row.domains : '',
  format: val => `${val}`,
  sortable: true,
  category: "genomic",
  isShow: false,
  remark: 'The source and IDs of any overlapping protein domains.',
};

export const PASS_FILTER_COLUMN = {
  name: 'pass_filter',
  required: true,
  label: 'Quality filter',
  align: 'center',
  field: row => row.pass_filter ? row.pass_filter : '',
  format: val => `${val}`,
  sortable: true,
  category: "quality",
  isShow: false,
  remark: 'Quality filters passed/failed in variant calling (VCF FILTER field).',
};
export const EXOMISER_MT_EXGEN_VAR_COLUMN = {
  name: 'exomiser_mt_exgenesvar',
  required: true,
  label: 'ExomMT SVar',
  align: 'center',
  field: row => row.exomiser_mt_exgenesvar,
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatScientific',
  remark: 'Exomiser gene variant score of mitochondiral DNA, score ranging from 0 (benign) to 1 (pathogenic).',
  groupBreak: true
};
export const EXOMISER_XD_EXGEN_SPHENO_COLUMN = {
  name: 'exomiser_xd_exgenespheno',
  required: true,
  label: 'ExomXD SPheno',
  align: 'center',
  field: row => row.exomiser_xd_exgenespheno,
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatScientific',
  remark: 'Exomiser gene phenotype score of X-linked dominant inheritance, score ranging from 0 (benign) to 1 (pathogenic).',
};
export const EXOMISER_XD_EXGEN_VAR_COLUMN = {
  name: 'exomiser_xd_exgenesvar',
  required: true,
  label: 'ExomXD SVar',
  align: 'center',
  field: row => row.exomiser_xd_exgenesvar,
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatScientific',
  remark: 'Exomiser gene variant score of X-linked dominant inheritance, score ranging from 0 (benign) to 1 (pathogenic).',
};
export const EXOMISER_XR_EXGEN_SPHENO_COLUMN = {
  name: 'exomiser_xr_exgenespheno',
  required: true,
  label: 'ExomXR SPheno',
  align: 'center',
  field: row => row.exomiser_xr_exgenespheno,
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatScientific',
  remark: 'Exomiser gene phenotype score of X-linked recessive inheritance, score ranging from 0 (benign) to 1 (pathogenic).',
};
export const EXOMISER_XR_EXGEN_VAR_COLUMN = {
  name: 'exomiser_xr_exgenesvar',
  required: true,
  label: 'ExomXR SVar',
  align: 'center',
  field: row => row.exomiser_xr_exgenesvar,
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatScientific',
  remark: 'Exomiser gene variant score of X-linked recessive inheritance, score ranging from 0 (benign) to 1 (pathogenic).',
};

/* New Exomiser fields */
export const EXOMISER_GENE_SYMBOL = {
  name: 'highest_gene_symbol',
  required: true,
  label: 'Exomiser Gene Symbol',
  align: 'center',
  field: row => row.exomiser_info?.highest_gene_symbol ? row.exomiser_info?.highest_gene_symbol : "",
  sortable: true,
  category: "prioritization",
  isShow: false,
  remark: '',
};
export const EXOMISER_MOI = {
  name: 'highest_moi',
  required: true,
  label: 'Exomiser MOI',
  align: 'center',
  field: row => row.exomiser_info?.highest_moi ? row.exomiser_info?.highest_moi : "",
  sortable: true,
  category: "prioritization",
  isShow: true,
  remark: '',
};
export const EXOMISER_GENE_COMBINED_SCORE = {
  name: 'highest_exomiser_gene_combined_score',
  required: true,
  label: 'Exomiser Gene Combined Score',
  align: 'center',
  field: row => row.exomiser_info?.highest_exomiser_gene_combined_score ? row.exomiser_info?.highest_exomiser_gene_combined_score : "",
  sortable: true,
  category: "prioritization",
  isShow: true,
  cellRenderer: 'formatFrequency',
  remark: '',
};
export const EXOMISER_GENE_PHENO_SCORE = {
  name: 'highest_exomiser_gene_pheno_score',
  required: true,
  label: 'Exomiser Gene Pheno Score',
  align: 'center',
  field: row => row.exomiser_info?.highest_exomiser_gene_pheno_score ? row.exomiser_info?.highest_exomiser_gene_pheno_score : "",
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatFrequency',
  remark: '',
};
export const EXOMISER_GENE_VARIANT_SCORE = {
  name: 'highest_exomiser_gene_variant_score',
  required: true,
  label: 'Exomiser Gene Variant Score',
  align: 'center',
  field: row => row.exomiser_info?.highest_exomiser_gene_variant_score ? row.exomiser_info?.highest_exomiser_gene_variant_score : "",
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatFrequency',
  remark: '',
};
export const EXOMISER_ACMG_DISEASE_NAME = {
  name: 'highest_exomiser_acmg_disease_name',
  required: true,
  label: 'Exomiser ACMG Disease Name',
  align: 'center',
  field: row => row.exomiser_info?.highest_exomiser_acmg_disease_name ? row.exomiser_info?.highest_exomiser_acmg_disease_name : "",
  sortable: true,
  category: "prioritization",
  isShow: false,
  remark: '',
};
export const EXOMISER_ACMG_CLASSIFICATION = {
  name: 'highest_exomiser_acmg_classification',
  required: true,
  label: 'Exomiser ACMG Classification',
  align: 'center',
  field: row => row.exomiser_info?.highest_exomiser_acmg_classification ? row.exomiser_info?.highest_exomiser_acmg_classification : "",
  sortable: true,
  category: "prioritization",
  isShow: false,
  remark: '',
};
export const EXOMISER_ACMG_EVIDENCE = {
  name: 'highest_exomiser_acmg_evidence',
  required: true,
  label: 'Exomiser ACMG Evidence',
  align: 'center',
  field: row => row.exomiser_info?.highest_exomiser_acmg_evidence ? row.exomiser_info?.highest_exomiser_acmg_evidence : "",
  sortable: true,
  category: "prioritization",
  isShow: false,
  remark: '',
};
export const EXOMISER_ACMG_DISEASE_ID = {
  name: 'highest_exomiser_acmg_disease_id',
  required: true,
  label: 'Exomiser ACMG Disease ID',
  align: 'center',
  field: row => row.exomiser_info?.highest_exomiser_acmg_disease_id ? row.exomiser_info?.highest_exomiser_acmg_disease_id : "",
  sortable: true,
  category: "prioritization",
  isShow: false,
  remark: '',
};



/* Population Frequency */
export const HIGHEST_AF_COLUMN = {
  name: 'highest_af',
  required: true,
  label: 'Highest AF',
  align: 'center',
  field: row => row.highest_af != null && row.highest_af != undefined && row.highest_af != -1 ? row.highest_af : '',
  format: val => `${val}`,
  style: row => styleForAF(row.highest_af),
  sortable: true,
  category: "frequency",
  isShow: true,
  cellRenderer: 'formatHighestFrequency'
};

export const TYPE_COLUMN = {
  name: 'type',
  required: true,
  label: 'Type',
  align: 'center',
  field: row => row.type ? row.type : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: true
};
export const AA_CHANGE_COLUMN = {
  name: 'aa_change',
  required: true,
  label: 'AA change',
  align: 'center',
  field: row => row.aa_change ? row.aa_change : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: 'Change in amino-acid (ref/alt).'
};
export const IMPACT_SEVERITY_COLUMN = {
  name: 'impact_severity',
  required: true,
  label: 'Impact severity',
  align: 'center',
  field: row => row.impact_severity ? row.impact_severity : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: true,
  remark: "The impact modifier for the consequence type and a variant that is assumed to be mostly harnless or unlikely to change rotein behaviour. "
};
export const P_LOF_COLUMN = {
  name: 'p_lof',
  required: true,
  label: 'pLof',
  align: 'center',
  field: row => row.p_lof ? row.p_lof : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: true
};
export const PATHOGENIC_COLUMN = {
  name: 'pathogenic',
  required: true,
  label: 'Reported SV Hit',
  align: 'center',
  field: row => row.is_pathogenic ? row.is_pathogenic : row.variant_type == 'small' ? '' : 'false',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false
};
export const POLYPHEN_PRED_COLUMN = {
  name: 'polyphen_pred',
  required: true,
  label: 'PolyPhen pred',
  align: 'center',
  field: row => row.polyphen_pred ? typeof row.polyphen_pred == 'object' ? row.polyphen_pred[0] : row.polyphen_pred : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "Polyphen prediction of pathogenicity."
};
export const POLYPHEN_SCORE_COLUMN = {
  name: 'polyphen_score',
  required: true,
  label: 'PolyPhen score',
  align: 'center',
  field: row => row.polyphen_score ? typeof row.polyphen_score == 'object' ? row.polyphen_score[0] : row.polyphen_score : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  cellRenderer: 'formatPvalue',
  remark: "Polyphen scores predict if missense variants are likely to affect protein function based on physical and comparative considerations, score ranging from 0 to 1. < 0.5 (deleterious), >=0.5 (tolerated)."
};
export const SIFT_PRED_COLUMN = {
  name: 'sift_pred',
  required: true,
  label: 'SIFT pred',
  align: 'center',
  field: row => row.sift_pred ? typeof row.sift_pred == 'object' ? row.sift_pred[0] : row.sift_pred : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "SIFT prediction of pathogenicity."
};
export const SIFT_SCORE_COLUMN = {
  name: 'sift_score',
  required: true,
  label: 'SIFT score',
  align: 'center',
  field: row => row.sift_score == undefined || row.sift_score == null ? '' : typeof row.sift_score == 'object' ? row.sift_score[0] != undefined && row.sift_score[0] != null ? row.sift_score[0] : '' : row.sift_score,
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: true,
  cellRenderer: 'formatScientific',
  remark: "SIFT scores predict if missense variants are likely to affect protein function based on sequence homology and the physico-chemical similarity between the alternate amino acids.  Score ranging from 0 to 1, < 0.5 indicates deleterious and >= 0.5 indicates tolerated."
};
export const CADD_PHRED_COLUMN = {
  name: 'cadd_phred',
  required: true,
  label: 'CADD scores',
  align: 'center',
  field: row => row.cadd_phred == undefined || row.cadd_phred == null || row.cadd_phred == -1 ? '' :  row.cadd_phred,
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: true,
  remark: "It is the ‘PHRED-scaled’ scores that are normalized to all potential approximately 9 billion SNVs, ranging from 0 to 99. A scaled CADD score >= 10 indicates that these SNPs are predicted to be the 10% most deleterious substitutions and >= 20 indicates the 1% most delterious.  Larger values are more deleterious. "
};
export const CADD_RAW_COLUMN = {
  name: 'cadd_raw',
  required: true,
  label: 'CADD raw',
  align: 'center',
  field: row => row.cadd_raw ? row.cadd_raw : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "The ‘raw’ scores of CDAA are the immediate output from the machine learning model. It summarizes the extent to which the variant is likely to have derived from the proxy-neutral (-ve values) or proxy-deleterious (+ve values) class. "
};
export const SPLICEAI_PRED_DP_AG_COLUMN = {
  name: 'spliceai_pred_dp_ag',
  required: true,
  label: 'Δ position of AG',
  align: 'center',
  field: row => row.spliceai_pred_dp_ag != null && row.spliceai_pred_dp_ag != undefined? row.spliceai_pred_dp_ag : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "Delta positions in the pre-mRNA being splice acceptor gain (derived from  SpliceAI). -ve values are upstream (5') of the variant, while +ve values are downstream (3') of the variant."
};
export const SPLICEAI_PRED_DP_AL_COLUMN = {
  name: 'spliceai_pred_dp_al',
  required: true,
  label: 'Δ position of AL',
  align: 'center',
  field: row => row.spliceai_pred_dp_al != null && row.spliceai_pred_dp_al != undefined? row.spliceai_pred_dp_al : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "Delta positions in the pre-mRNA being splice acceptor loss (derived from  SpliceAI). -ve values are upstream (5') of the variant, while +ve values are downstream (3') of the variant."
};
export const SPLICEAI_PRED_DP_DG_COLUMN = {
  name: 'spliceai_pred_dp_dg',
  required: true,
  label: 'Δ position of DG',
  align: 'center',
  field: row => row.spliceai_pred_dp_dg != null && row.spliceai_pred_dp_dg != undefined? row.spliceai_pred_dp_dg : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "Delta positions in the pre-mRNA being splice donor gain (derived from  SpliceAI). -ve values are upstream (5') of the variant, +ve values are downstream (3') of the variant."
};
export const SPLICEAI_PRED_DP_DL_COLUMN = {
  name: 'spliceai_pred_dp_dl',
  required: true,
  label: 'Δ position of DL',
  align: 'center',
  field: row => row.spliceai_pred_dp_dl != null && row.spliceai_pred_dp_dl != undefined? row.spliceai_pred_dp_dl : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "Delta positions in the pre-mRNA being splice donor loss (derived from  SpliceAI). -ve values are upstream (5') of the variant, +ve values are downstream (3') of the variant."
};
export const SPLICEAI_PRED_DS_AG_COLUMN = {
  name: 'spliceai_pred_ds_ag',
  required: true,
  label: 'Δ score of AG',
  align: 'center',
  field: row => row.spliceai_pred_ds_ag != null && row.spliceai_pred_ds_ag != undefined ? typeof row.spliceai_pred_ds_ag == 'object' ? row.spliceai_pred_ds_ag[0] : row.spliceai_pred_ds_ag : '',
  format: val => `${val}`,
  style: row => styleForSpliceAI(row.spliceai_pred_ds_ag),
  sortable: true,
  category: "effect",
  isShow: false,
  groupBreak: true,
  remark: ""
};
export const SPLICEAI_PRED_DS_AL_COLUMN = {
  name: 'spliceai_pred_ds_al',
  required: true,
  label: 'Δ score of AL',
  align: 'center',
  field: row => row.spliceai_pred_ds_al != null && row.spliceai_pred_ds_al != undefined ? typeof row.spliceai_pred_ds_al == 'object' ? row.spliceai_pred_ds_al[0] : row.spliceai_pred_ds_al : '',
  format: val => `${val}`,
  style: row => styleForSpliceAI(row.spliceai_pred_ds_al),
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "Delta scores of acceptor loss are in a range from 0 to 1 (derived from  SpliceAI). >= 0.2 (high ecall), >= 0.5 (recommended), >= 0.8 (high precision). "
};
export const SPLICEAI_PRED_DS_DG_COLUMN = {
  name: 'spliceai_pred_ds_dg',
  required: true,
  label: 'Δ score of DG',
  align: 'center',
  field: row => row.spliceai_pred_ds_dg != null && row.spliceai_pred_ds_dg != undefined ? typeof row.spliceai_pred_ds_dg == 'object' ? row.spliceai_pred_ds_dg[0] : row.spliceai_pred_ds_dg : '',
  format: val => `${val}`,
  style: row => styleForSpliceAI(row.spliceai_pred_ds_dg),
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "Delta scores of donor gain are in a range from 0 to 1 (derived from  SpliceAI). >= 0.2 (high ecall), >= 0.5 (recommended), >= 0.8 (high precision). "
};
export const SPLICEAI_PRED_DS_DL_COLUMN = {
  name: 'spliceai_pred_ds_dl',
  required: true,
  label: 'Δ score of DL',
  align: 'center',
  field: row => row.spliceai_pred_ds_dl != null && row.spliceai_pred_ds_dl != undefined ? typeof row.spliceai_pred_ds_dl == 'object' ? row.spliceai_pred_ds_dl[0] : row.spliceai_pred_ds_dl : '',
  format: val => `${val}`,
  style: row => styleForSpliceAI(row.spliceai_pred_ds_dl),
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "Delta scores of donor loss are in a range from 0 to 1 (derived from  SpliceAI). >= 0.2 (high ecall), >= 0.5 (recommended), >= 0.8 (high precision). "
};
export const SPLICEAI_PRED_SYMBOL_COLUMN = {
  name: 'spliceai_pred_symbol',
  required: true,
  label: 'SpliceAI symbol',
  align: 'center',
  field: row => row.spliceai_pred_symbol ? row.spliceai_pred_symbol : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: 'SpliceAI gene symbol.'
};
export const V2_OE_LOF_COLUMN = {
  name: 'constraint_v2_oe_lof',
  required: true,
  label: 'gnomADv2 O/E LoF',
  align: 'center',
  field: row => row.constraint_v2_oe_lof ? row.constraint_v2_oe_lof : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv2 Observed over expected ratio for pLoF variants in transcript (Obs LoF divided by Exp LoF). O/E is in a range from 0 to 1. Lower values indicate that the transcript is more constrained of such variation."
};
export const V4_OE_LOF_COLUMN = {
  name: 'constraint_v4_oe_lof',
  required: true,
  label: 'gnomADv4 O/E LoF',
  align: 'center',
  field: row => row.constraint_v4_oe_lof ? row.constraint_v4_oe_lof : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv4 Observed over expected ratio for pLoF variants in transcript (Obs LoF divided by Exp LoF). O/E is in a range from 0 to 1. Lower values indicate that the transcript is more constrained of such variation."
};
export const V2_OE_LOF_LOWER_COLUMN = {
  name: 'constraint_v2_oe_lof_lower',
  required: true,
  label: 'gnomADv2 O/E LoF lower',
  align: 'center',
  field: row => row.constraint_v2_oe_lof_lower ? row.constraint_v2_oe_lof_lower : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv2 Lower bound of 90% confidence interval for O/E ratio of pLoF variants."
};
export const V4_OE_LOF_LOWER_COLUMN = {
  name: 'constraint_v4_oe_lof_lower',
  required: true,
  label: 'gnomADv4 O/E LoF lower',
  align: 'center',
  field: row => row.constraint_v4_oe_lof_lower ? row.constraint_v4_oe_lof_lower : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv4 Lower bound of 90% confidence interval for O/E ratio of pLoF variants."
};
export const V2_OE_MIS_COLUMN = {
  name: 'constraint_v2_oe_mis',
  required: true,
  label: 'gnomADv2 O/E mis',
  align: 'center',
  field: row => row.constraint_v2_oe_mis ? row.constraint_v2_oe_mis : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv2 Observed over expected ratio for missense variants in transcript (Obs mis divided by Exp mis). O/E is in a range from 0 to 1. Lower values indicate that the transcript is more constrained of such variation."
};
export const V4_OE_MIS_COLUMN = {
  name: 'constraint_v4_oe_mis',
  required: true,
  label: 'gnomADv4 O/E mis',
  align: 'center',
  field: row => row.constraint_v4_oe_mis ? row.constraint_v4_oe_mis : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv4 Observed over expected ratio for missense variants in transcript (Obs mis divided by Exp mis). O/E is in a range from 0 to 1. Lower values indicate that the transcript is more constrained of such variation."
};
export const V2_OE_MIS_LOWER_COLUMN = {
  name: 'constraint_v2_oe_mis_lower',
  required: true,
  label: 'gnomADv2 O/E mis lower',
  align: 'center',
  field: row => row.constraint_v2_oe_mis_lower ? row.constraint_v2_oe_mis_lower : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv2 Lower bound of 90% confidence interval for O/E ratio for missense variants."
};
export const V4_OE_MIS_LOWER_COLUMN = {
  name: 'constraint_v4_oe_mis_lower',
  required: true,
  label: 'gnomADv4 O/E mis lower',
  align: 'center',
  field: row => row.constraint_v4_oe_mis_lower ? row.constraint_v4_oe_mis_lower : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv4 Lower bound of 90% confidence interval for O/E ratio for missense variants."
};
export const V2_OE_MIS_UPPER_COLUMN = {
  name: 'constraint_v2_oe_mis_upper',
  required: true,
  label: 'gnomADv2 O/E mis upper',
  align: 'center',
  field: row => row.constraint_v2_oe_mis_upper ? typeof row.constraint_v2_oe_mis_upper == 'object' ? row.constraint_v2_oe_mis_upper[0] : row.constraint_v2_oe_mis_upper : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv2 Upper bound of 90% confidence interval for O/E ratio for missense variants.  Lower values indicates that the transcript is more constrained of such variation."
};
export const V4_OE_MIS_UPPER_COLUMN = {
  name: 'constraint_v4_oe_mis_upper',
  required: true,
  label: 'gnomADv4 O/E mis upper',
  align: 'center',
  field: row => row.constraint_v4_oe_mis_upper ? typeof row.constraint_v4_oe_mis_upper == 'object' ? row.constraint_v4_oe_mis_upper[0] : row.constraint_v4_oe_mis_upper : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false,
  remark: "gnomADv4 Upper bound of 90% confidence interval for O/E ratio for missense variants.  Lower values indicates that the transcript is more constrained of such variation."
};


/* Evidence */
export const CLINVAR_DISEASE_DB_ID_COLUMN = {
  name: 'clndisdb',
  required: true,
  label: 'ClinVar disease DB ID',
  align: 'center',
  field: row => row.clndisdb ? row.clndisdb : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
  cellRenderer: 'formatShowTooltip',
  remark: "Tag-value pairs of disease database name and identifier."
};
export const CLINVAR_DISEASE_DB_ID_INCL_COLUMN = {
  name: 'clndisdbincl',
  required: true,
  label: 'ClinVar disease DB ID (incl)',
  align: 'center',
  field: row => row.clndisdbincl ? row.clndisdbincl : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
  cellRenderer: 'formatShowTooltip',
  remark: "For included variant: Tag-value pairs of disease database name and identifier."
};
export const CLINVAR_DISEASE_COLUMN = {
  name: 'clndn',
  required: true,
  label: 'ClinVar disease',
  align: 'center',
  field: row => row.clndn ? row.clndn : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
  cellRenderer: 'formatShowTooltip',
  remark: "ClinVar's preferred disease name for the concept specified by disease identifiers in ClinVar ID."
};
export const CLINVAR_DISEASE_INCL_COLUMN = {
  name: 'clndnincl',
  required: true,
  label: 'ClinVar disease (incl)',
  align: 'center',
  field: row => row.clndnincl ? row.clndnincl : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
  cellRenderer: 'formatShowTooltip',
  remark: "For included variant : ClinVar's preferred disease name for the concept specified by disease identifiers in ClinVar ID."
};
export const CLINVAR_HGVS_COLUMN = {
  name: 'clnhgvs',
  required: true,
  label: 'ClinVar HGVS',
  align: 'center',
  field: row => row.clnhgvs ? row.clnhgvs : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
  cellRenderer: 'formatShowTooltip',
  remark: "Reports the top-level genomic HGVS expression for the variant. "
};
export const CLINVAR_REVSTAT_COLUMN = {
  name: 'clnrevstat',
  required: true,
  label: 'ClinVar revstat',
  align: 'center',
  field: row => row.clnrevstat ? row.clnrevstat : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
  cellRenderer: 'formatShowTooltip',
  remark: "ClinVar review status for the Variation ID."
};

export const CLINVAR_SIG_IBCL_COLUMN = {
  name: 'clnsigincl',
  required: true,
  label: 'ClinVar sig (incl)',
  align: 'center',
  field: row => row.clnsigincl ? row.clnsigincl : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
  cellRenderer: 'formatShowTooltip',
  remark: "Clinical significance for a haplotype or genotype that includes this variant. Reported as pairs of VariationID:clinical significance."
};
export const CLINVAR_VARIATION_TYPE_COLUMN = {
  name: 'clnvc',
  required: true,
  label: 'ClinVar variation type',
  align: 'center',
  field: row => row.clnvc ? row.clnvc : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
  cellRenderer: 'formatShowTooltip',
  remark: "Reports the type of variation defined by ClinVar."
};
export const CLINVAR_SO_TERMS_COLUMN = {
  name: 'clnvcso',
  required: true,
  label: 'ClinVar SO terms',
  align: 'center',
  field: row => row.clnvcso ? row.clnvcso : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
  cellRenderer: 'formatShowTooltip',
  remark: "IDs from Sequence Ontology for variant type."
};
export const CLINVAR_SOURCE_COLUMN = {
  name: 'clnvi',
  required: true,
  label: 'ClinVar source',
  align: 'center',
  field: row => row.clnvi ? row.clnvi : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
  cellRenderer: 'formatShowTooltip',
  remark: "The variant's clinical sources reported as tag-value pairs of database and variant identifier."
};

export const GENE_PHENO_COLUMN = {
  name: 'gene_pheno',
  required: true,
  label: 'Gene Pheno',
  align: 'center',
  field: row => row.gene_pheno ? row.gene_pheno : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
  remark: "Indicates if existing variant is associated with a phenotype, disease or trait; multiple values correspond to multiple values in the co-located variation field.  Output values of this field: 0 (variants or genes are not link to phenotype), 1 (variants or genes link to phenotype) or null."
};

export const PHENO_COLUMN = {
  name: 'pheno',
  required: true,
  label: 'Pheno',
  align: 'center',
  field: row => row.pheno ? row.pheno : '',
  format: val => `${val}`,
  sortable: true,
  category: "evidence",
  isShow: false,
  remark: "Indicates if existing variant is associated with a phenotype, disease or trait; multiple values correspond to multiple values in the co-located variation field.  Output values of this field: 0 (variants or genes are not link to phenotype), 1 (variants or genes link to phenotype) or null."
};


export const SV_LEN_COLUMN = {
  name: 'len',
  required: true,
  label: 'SV Length',
  align: 'center',
  field: row => row.len != null && row.len != undefined ? row.len : '',
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true,
};

// Gene Columns

export const TRANSCRIPT_GENE_COLUMN = {
  name: 'gene',
  required: true,
  label: 'Gene',
  align: 'center',
  field: row => row.gene,
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true
};

export const TRANSCRIPT_ENSEMBL_GENE_COLUMN = {
  name: 'ensembl_gene_id',
  required: true,
  label: 'Gene Ensembl',
  align: 'center',
  field: row => row.ensembl_gene_id,
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true
};

export const TRANSCRIPT_ENTREZ_GENE_COLUMN = {
  name: 'entrez_gene_id',
  required: true,
  label: 'Gene Entrez',
  align: 'center',
  field: row => row.entrez_gene_id,
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true
};

export const TRANSCRIPT_ENSEMBL_TRANSCRIPT_COLUMN = {
  name: 'transcript',
  required: true,
  label: 'Transcript Ensembl',
  align: 'center',
  field: row => row.transcript,
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true
};

export const TRANSCRIPT_IS_MANE_SELECT_COLUMN = {
  name: 'is_mane_select',
  required: true,
  label: 'Is MANE Select',
  align: 'center',
  field: row => row.is_mane_select ? row.is_mane_select : 'false',
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true
};

export const TRANSCRIPT_IS_MANE_PLUS_CLINICAL_COLUMN = {
  name: 'is_mane_plus_clinical',
  required: true,
  label: 'Is MANE Plus Clinical',
  align: 'center',
  field: row => row.is_mane_plus_clinical ? row.is_mane_plus_clinical : 'false',
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true
};

export const TRANSCRIPT_IS_CANONICAL_COLUMN = {
  name: 'is_canonical',
  required: true,
  label: 'Is Canonical',
  align: 'center',
  field: row => row.is_canonical ? row.is_canonical : 'false',
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true
};

export const CLINGEN_HI_COLUMN = {
  name: 'clingen_hi',
  required: true,
  label: 'Clingen HI',
  align: 'center',
  field: row => row.clingen_hi_display ? row.clingen_hi_display : '',
  format: val => `${val}`,
  style: row => row.clingen_hi === 'no' || row.clingen_hi === 'unlikely' ? 'color: grey;' : Dark.isActive ? 'color:white;' : 'color: black',
  sortable: true,
  category: "basic",
  isShow: true
};

export const CLINGEN_TS_COLUMN = {
  name: 'clingen_ts',
  required: true,
  label: 'Clingen TS',
  align: 'center',
  field: row => row.clingen_ts_display ? row.clingen_ts_display : '',
  format: val => `${val}`,
  style: row => row.clingen_ts === 'no' || row.clingen_ts === 'unlikely' ? 'color: grey;' : Dark.isActive ? 'color:white;' : 'color: black',
  sortable: true,
  category: "basic",
  isShow: true
};

export const P_HAPLO_COLUMN = {
  name: 'p_haplo',
  required: true,
  label: 'pHaplo',
  align: 'center',
  field: row => row.p_haplo != null && row.p_haplo != undefined ? row.p_haplo : '',
  format: val => `${val}`,
  style: row => row.p_haplo && row.p_haplo >= 0.86 ? 'color: red; font-weight: bold;' : Dark.isActive ? 'color:white;' : 'color: black;',
  sortable: true,
  category: "basic",
  isShow: true
};

export const P_TRIPLO_COLUMN = {
  name: 'p_triplo',
  required: true,
  label: 'pTriplo',
  align: 'center',
  field: row => row.p_triplo != null && row.p_triplo != undefined ? row.p_triplo : '',
  format: val => `${val}`,
  style: row => row.p_triplo && row.p_triplo >= 0.94 ? 'color: red; font-weight: bold;' : Dark.isActive ? 'color:white;' : 'color: black;',
  sortable: true,
  category: "basic",
  isShow: true
};

export const TRANSCRIPT_V2_P_LI = {
  name: 'constraint_v2_pli',
  required: true,
  label: 'gnomADv2 pLI',
  align: 'center',
  field: row => row.constraint_v2_pli != null && row.constraint_v2_pli != undefined ? row.constraint_v2_pli : '',
  format: val => `${val}`,
  style: row => row.constraint_v2_pli && row.constraint_v2_pli >= 0.9 ? 'color: red; font-weight: bold;' : Dark.isActive ? 'color:white;' : 'color: black;',
  sortable: true,
  category: "basic",
  isShow: true
}

export const TRANSCRIPT_V2_LOEUF = {
  name: 'constraint_v2_oe_lof_upper',
  required: true,
  label: 'gnomADv2 LOEUF',
  align: 'center',
  field: row => row.constraint_v2_oe_lof_upper != null && row.constraint_v2_oe_lof_upper != undefined ? row.constraint_v2_oe_lof_upper : '',
  format: val => `${val}`,
  style: row => row.constraint_v2_oe_lof_upper && row.constraint_v2_oe_lof_upper <= 0.35  ? 'color: red; font-weight: bold;' : Dark.isActive ? 'color:white;' : 'color: black;',
  sortable: true,
  category: "basic",
  isShow: true
};

export const TRANSCRIPT_V4_P_LI = {
  name: 'constraint_v4_pli',
  required: true,
  label: 'gnomADv4 pLI',
  align: 'center',
  field: row => row.constraint_v4_pli != null && row.constraint_v4_pli != undefined ? row.constraint_v4_pli : '',
  format: val => `${val}`,
  style: row => row.constraint_v4_pli && row.constraint_v4_pli >= 0.9 ? 'color: red; font-weight: bold;' : Dark.isActive ? 'color:white;' : 'color: black;',
  sortable: true,
  category: "basic",
  isShow: true
}

export const TRANSCRIPT_V4_LOEUF = {
  name: 'constraint_v4_oe_lof_upper',
  required: true,
  label: 'gnomADv4 LOEUF',
  align: 'center',
  field: row => row.constraint_v4_oe_lof_upper != null && row.constraint_v4_oe_lof_upper != undefined ? row.constraint_v4_oe_lof_upper : '',
  format: val => `${val}`,
  style: row => row.constraint_v4_oe_lof_upper && row.constraint_v4_oe_lof_upper <= 0.35  ? 'color: red; font-weight: bold;' : Dark.isActive ? 'color:white;' : 'color: black;',
  sortable: true,
  category: "basic",
  isShow: true
};

export const STRAND = {
  name: 'strand',
  required: true,
  label: 'Strand',
  align: 'center',
  field: row => row.strand ? row.strand : '',
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true
};

export const TRANSCRIPT_ANNOTATION_OVERLAP = {
  name: 'annotation_overlap',
  required: true,
  label: 'Annotation Overlap',
  align: 'center',
  field: row => row.annotation_overlap != null && row.annotation_overlap != undefined ? row.annotation_overlap : '',
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true
};

export const TRANSCRIPT_RECIPROCAL_OVERLAP = {
  name: 'reciprocal_overlap',
  required: true,
  label: 'Reciprocal Overlap',
  align: 'center',
  field: row => row.reciprocal_overlap != null && row.reciprocal_overlap != undefined ? row.reciprocal_overlap : '',
  format: val => `${val}`,
  sortable: true,
  category: "basic",
  isShow: true
};


export const COPY_NUM_GENOTYPE = {
  name: 'copy_num_genotype',
  required: true,
  label: 'Copy Num',
  align: 'center',
  field: row => row.copy_num_genotype ? row.copy_num_genotype : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false
};

export const COPY_NUM_GENOTYP_QUAL = {
  name: 'copy_num_genotype_qual',
  required: true,
  label: 'Copy Num Quality',
  align: 'center',
  field: row => row.copy_num_genotype_qual != null && row.copy_num_genotype_qual != undefined ? row.copy_num_genotype_qual : '',
  format: val => `${val}`,
  sortable: true,
  category: "effect",
  isShow: false
};


export const REMM = {
  name: 'remm',
  required: true,
  label: 'REMM Score',
  align: 'center',
  field: row => row?.remm ? row?.remm : "",
  sortable: true,
  category: "prioritization",
  isShow: true,
  cellRenderer: 'formatFrequency',
  remark: '',
};

export const ALPHA_MISSENSE_PATH = {
  name: 'am_pathogenicity',
  required: true,
  label: 'Alpha Missense Pathogenicity',
  align: 'center',
  field: row => row?.am_pathogenicity ? row?.am_pathogenicity : "",
  sortable: true,
  category: "prioritization",
  isShow: false,
  cellRenderer: 'formatFrequency',
  remark: '',
};

export const ALPHA_MISSENSE_CLASS = {
  name: 'am_class',
  required: true,
  label: 'Alpha Missense Classification',
  align: 'center',
  field: row => row?.am_class ? row?.am_class : "",
  format: val => `${val}`,
  sortable: true,
  category: "prioritization",
  isShow: false,
  remark: '',
};