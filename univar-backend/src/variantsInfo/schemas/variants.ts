import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type VariantsDocument = HydratedDocument<Variants>;
export const VARIANTS_MODEL_NAME = 'Variants';

@Schema({ collection: 'variants', strict: false })
export class Variants {
  @Prop()
  aa_change?: string;

  @Prop()
  allelic_depths?: number[][];

  @Prop()
  alt: string;

  @Prop()
  cadd_phred?: number;

  @Prop()
  cadd_raw?: number;

  @Prop()
  ccds?: string;

  @Prop()
  cgd_agegroup?: string;

  @Prop()
  cgd_allelicconditions?: string;

  @Prop()
  cgd_comments?: string;

  @Prop()
  cgd_condition?: string;

  @Prop()
  cgd_entrezid?: string;

  @Prop()
  cgd_gene?: string;

  @Prop()
  cgd_hgncid?: string;

  @Prop()
  cgd_inheritance?: string;

  @Prop()
  cgd_interventioncategories?: string;

  @Prop()
  cgd_interventionrationale?: string;

  @Prop()
  cgd_manifestationcategories?: string;

  @Prop()
  cgd_references?: string;

  @Prop()
  chrom: string;

  @Prop()
  clndisdb?: string;

  @Prop()
  clndisdbincl?: string;

  @Prop()
  clndn?: string;

  @Prop()
  clndnincl?: string;

  @Prop()
  clnhgvs?: string;

  @Prop()
  clnid?: string;

  @Prop()
  clnrevstat?: string;

  @Prop()
  clnsig?: string;

  @Prop()
  clnsigconf?: string;

  @Prop()
  clnsigincl?: string;

  @Prop()
  clnvc?: string;

  @Prop()
  clnvcso?: string;

  @Prop()
  clnvi?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  constraint_v2_mis_z?: number | number[];

  @Prop()
  constraint_v2_oe_lof?: number;

  @Prop()
  constraint_v2_oe_lof_lower?: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  constraint_v2_oe_lof_upper?: number | number[];

  @Prop()
  constraint_v2_oe_mis?: number;

  @Prop()
  constraint_v2_oe_mis_lower?: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  constraint_v2_oe_mis_upper?: number | number[];

  @Prop()
  constraint_v2_oe_syn?: number;

  @Prop()
  constraint_v2_oe_syn_lower?: number;

  @Prop()
  constraint_v2_oe_syn_upper?: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  constraint_v2_pli?: number | string | number[] | string[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  constraint_v2_syn_z?: number | number[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  constraint_v4_mis_z?: number | number[];

  @Prop()
  constraint_v4_oe_lof?: number;

  @Prop()
  constraint_v4_oe_lof_lower?: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  constraint_v4_oe_lof_upper?: number | number[];

  @Prop()
  constraint_v4_oe_mis?: number;

  @Prop()
  constraint_v4_oe_mis_lower?: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  constraint_v4_oe_mis_upper?: number | number[];

  @Prop()
  constraint_v4_oe_syn?: number;

  @Prop()
  constraint_v4_oe_syn_lower?: number;

  @Prop()
  constraint_v4_oe_syn_upper?: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  constraint_v4_pli?: number | string | number[] | string[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  constraint_v4_syn_z?: number | number[];

  @Prop()
  domains?: string;

  @Prop()
  effect?: string;

  @Prop()
  end: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  ensembl_gene_id?: string | string[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  ensembl_transcript_id?: string | string[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  entrez_gene_id?: string | string[];

  @Prop()
  existing_inframe_oorfs?: string;

  @Prop()
  existing_outofframe_oorfs?: string;

  @Prop()
  existing_uorfs?: string;

  @Prop()
  existing_variation?: string;

  @Prop()
  exomiser_ad_exgenescombi?: number;

  @Prop()
  exomiser_ad_exgenespheno?: number;

  @Prop()
  exomiser_ad_exgenesvar?: number;

  @Prop()
  exomiser_ar_exgenescombi?: number;

  @Prop()
  exomiser_ar_exgenespheno?: number;

  @Prop()
  exomiser_ar_exgenesvar?: number;

  @Prop()
  exomiser_mt_exgenescombi?: number;

  @Prop()
  exomiser_mt_exgenespheno?: number;

  @Prop()
  exomiser_mt_exgenesvar?: number;

  @Prop()
  exomiser_xd_exgenescombi?: number;

  @Prop()
  exomiser_xd_exgenespheno?: number;

  @Prop()
  exomiser_xd_exgenesvar?: number;

  @Prop()
  exomiser_xr_exgenescombi?: number;

  @Prop()
  exomiser_xr_exgenespheno?: number;

  @Prop()
  exomiser_xr_exgenesvar?: number;

  @Prop()
  highest_exomiser_scombi?: number;

  @Prop()
  flaglrg?: string;

  @Prop()
  gene_pheno?: string;

  @Prop()
  gene_symbol?: string;

  @Prop()
  genotype_qualities?: number[][];

  @Prop()
  genotypes_index?: number[][];

  @Prop()
  gnomadv2e_af?: number;

  @Prop()
  gnomadv2e_afr_af?: number;

  @Prop()
  gnomadv2e_amr_af?: number;

  @Prop()
  gnomadv2e_asj_af?: number;

  @Prop()
  gnomadv2e_eas_af?: number;

  @Prop()
  gnomadv2e_fin_af?: number;

  @Prop()
  gnomadv2e_nfe_af?: number;

  @Prop()
  gnomadv2e_oth_af?: number;

  @Prop()
  gnomadv2e_sas_af?: number;

  @Prop()
  gnomadv2g_af?: number;

  @Prop()
  gnomadv2g_afr_af?: number;

  @Prop()
  gnomadv2g_amr_af?: number;

  @Prop()
  gnomadv2g_asj_af?: number;

  @Prop()
  gnomadv2g_eas_af?: number;

  @Prop()
  gnomadv2g_fin_af?: number;

  @Prop()
  gnomadv2g_nfe_af?: number;

  @Prop()
  gnomadv2g_oth_af?: number;

  @Prop()
  gnomadv2g_sas_af?: number;

  @Prop()
  gnomadv3g_af?: number;

  @Prop()
  gnomadv3g_afr_af?: number;

  @Prop()
  gnomadv3g_amr_af?: number;

  @Prop()
  gnomadv3g_asj_af?: number;

  @Prop()
  gnomadv3g_eas_af?: number;

  @Prop()
  gnomadv3g_fin_af?: number;

  @Prop()
  gnomadv3g_mid_af?: number;

  @Prop()
  gnomadv3g_nfe_af?: number;

  @Prop()
  gnomadv3g_oth_af?: number;

  @Prop()
  gnomadv3g_sas_af?: number;

  @Prop()
  gnomadv4e_af?: number;

  @Prop()
  gnomadv4e_afr_af?: number;

  @Prop()
  gnomadv4e_amr_af?: number;

  @Prop()
  gnomadv4e_asj_af?: number;

  @Prop()
  gnomadv4e_eas_af?: number;

  @Prop()
  gnomadv4e_fin_af?: number;

  @Prop()
  gnomadv4e_mid_af?: number;

  @Prop()
  gnomadv4e_nfe_af?: number;

  @Prop()
  gnomadv4e_oth_af?: number;

  @Prop()
  gnomadv4e_sas_af?: number;

  @Prop()
  gnomadv4g_af?: number;

  @Prop()
  gnomadv4g_afr_af?: number;

  @Prop()
  gnomadv4g_amr_af?: number;

  @Prop()
  gnomadv4g_asj_af?: number;

  @Prop()
  gnomadv4g_eas_af?: number;

  @Prop()
  gnomadv4g_fin_af?: number;

  @Prop()
  gnomadv4g_mid_af?: number;

  @Prop()
  gnomadv4g_nfe_af?: number;

  @Prop()
  gnomadv4g_oth_af?: number;

  @Prop()
  gnomadv4g_sas_af?: number;

  @Prop()
  gnomadv2_sv_af?: number;

  @Prop()
  gnomadv2_sv_afr_af?: number;

  @Prop()
  gnomadv2_sv_amr_af?: number;

  @Prop()
  gnomadv2_sv_eas_af?: number;

  @Prop()
  gnomadv2_sv_eur_af?: number;

  @Prop()
  gnomadv2_sv_oth_af?: number;

  @Prop()
  gnomadv4_sv_af?: number;

  @Prop()
  gnomadv4_sv_afr_af?: number;

  @Prop()
  gnomadv4_sv_ami_af?: number;

  @Prop()
  gnomadv4_sv_amr_af?: number;

  @Prop()
  gnomadv4_sv_asj_af?: number;

  @Prop()
  gnomadv4_sv_eas_af?: number;

  @Prop()
  gnomadv4_sv_fin_af?: number;

  @Prop()
  gnomadv4_sv_mid_af?: number;

  @Prop()
  gnomadv4_sv_nfe_af?: number;

  @Prop()
  gnomadv4_sv_oth_af?: number;

  @Prop()
  gnomadv4_sv_sas_af?: number;

  @Prop()
  han_sv_af?: number;

  @Prop()
  hgvsc?: string;

  @Prop()
  hgvsp?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  impact?: string | string[];

  @Prop()
  impact_severity?: string;

  @Prop()
  is_coding?: number;

  @Prop()
  is_exonic?: number;

  @Prop()
  lof?: string;

  @Prop()
  lof_filter?: string;

  @Prop()
  lof_flags?: string;

  @Prop()
  lof_info?: string;

  @Prop()
  mane_plus_clinical?: string;

  @Prop()
  mane_select?: string;

  @Prop()
  ncbi_ids?: string[];

  @Prop()
  pass_filter?: string;

  @Prop()
  pheno?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  polyphen_pred?: string | string[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  polyphen_score?: number | number[];

  @Prop()
  quality?: number;

  @Prop()
  ref?: string;

  @Prop()
  refseq_match?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  revel?: number | number[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  sift_pred?: string | string[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  sift_score?: number | number[];

  @Prop()
  source?: string;

  @Prop()
  spliceai_pred_dp_ag?: number;

  @Prop()
  spliceai_pred_dp_al?: number;

  @Prop()
  spliceai_pred_dp_dg?: number;

  @Prop()
  spliceai_pred_dp_dl?: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  spliceai_pred_ds_ag?: number | number[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  spliceai_pred_ds_al?: number | number[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  spliceai_pred_ds_dg?: number | number[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  spliceai_pred_ds_dl?: number | number[];

  @Prop()
  spliceai_pred_symbol?: string;

  @Prop()
  start: number;

  @Prop()
  type?: string;

  @Prop()
  variant_id?: string;

  @Prop()
  variant_type: string;

  @Prop()
  is_read?: string[];

  @Prop()
  highest_af?: number;

  @Prop()
  p_lof?: string;

  @Prop()
  is_pathogenic?: boolean;

  @Prop()
  is_repeat?: boolean;

  @Prop()
  scenario?: string[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  gene_objs?: any[];

  @Prop()
  sv_id?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  note?: any[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  related_variants?: any[];

  @Prop()
  hg19_chrom?: string;

  @Prop()
  hg19_start?: number;

  @Prop()
  hg19_strand?: string;

  @Prop()
  hg19_end?: number;

  @Prop()
  caller?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  afs?: any[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  exts?: any[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  intpns?: any[];

  @Prop()
  len?: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  highest_af_info?: any;

  @Prop()
  copy_num_genotype?: number[];

  @Prop()
  copy_num_genotype_qual?: number[];

  @Prop()
  remm?: number;

  @Prop()
  am_pathogenicity?: number;

  @Prop()
  am_class?: string;

  @Prop()
  supp?: number;
}

export const VariantsSchema = SchemaFactory.createForClass(Variants);
