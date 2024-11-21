import filtersSlider from "@/models/variants-table/filter/common/filters_slider.json";

const FILTERS_DEFAULT = {
  /** Location text search **/
  geneLocationSearchText : "",

  /** scenario **/  /** SNV & SV **/
  scenario: 'none',
  scenarioSelected: 'none',

  /** frequency **/  /** SNV & SV **/
  highest_af: 5,
  gnomad_af:5,
  gnomad_eas_af:5,
  gnomadv3_af_eas:5,
  gnomadv3_af:5,
  dgv_gold_outer:5,
  dgv_gold_inner:5,
  hkbc:5,
  one_kg_eas:5,
  one_kg_sur_eas:5,
  one_kg:5,
  one_kg_sur:5,

  /** quality **/  /** SV **/
  pass_filter: [],
  quality: 30,   //Should be empty string, if equal 30 will filter out SNV only

  /** impact > both **/
  highest_splice_ai: 5,
  spliceai_pred_ds_ag	: 5,
  spliceai_pred_ds_al : 5,
  spliceai_pred_ds_dg	: 5,
  spliceai_pred_ds_dl	: 5,

  /** impact > snv **/
  snv_type: null,
  is_coding: null,
  is_exonic: null,
  impactHighClick: false,
  impactHighSelected : [],
  impactMedClick: false,
  impactMedSelected : [],
  impactLowClick: false,
  impactLowSelected : [],
  impactModifierClick: false,
  impactModifierSelected : [],
  hkgi_high_impact: null,

  /** impact > sv **/
  sv_type: null,
  p_lof : [],


  /** pathogenicity **/  /** SNV except Clinical Interpretation  **/
  is_pathogenic : null,  /** SV **/
  clnsig : [],
  revel: 9,
  cadd_phred: 1,
  constraint_mis_z : 5,
  constraint_syn_z: 5,
  constraint_oe_lof_upper: 4,
  constraint_oe_mis_upper: 4,
  PolyphenPredClick: false,
  polyphen_pred: [],
  siftPredClick: false,
  sift_pred: [],
  polyphen_score: 5,
  sift_score: 5,
  clingen_hi: [],
  clingen_ts: [],

  /** repeats **/     /** SV **/
  is_repeat : null,

  /** prioritization **/       /** SNV **/
  highest_exomiser_scombi: 1,
  exomiser_ad_exgenescombi: 1,
  exomiser_ar_exgenescombi: 1,
  exomiser_xd_exgenescombi: 1,
  exomiser_xr_exgenescombi: 1,
  exomiser_mt_exgenescombi: 1,
  highest_exomiser_spheno: 1,
  exomiser_ad_exgenespheno: 1,
  exomiser_ar_exgenespheno: 1,
  exomiser_xd_exgenespheno: 1,
  exomiser_xr_exgenespheno: 1,
  exomiser_mt_exgenespheno: 1,

  highest_exomiser_gene_combined_score: 1,
  highest_exomiser_gene_pheno_score: 1,

  /** others **/      /** SV **/
  is_read : null,
  note: null,
  variant_type: null,
  len: 3,
  caller: null,


  /** slider custom input control **/
  slider : filtersSlider
}

export default FILTERS_DEFAULT