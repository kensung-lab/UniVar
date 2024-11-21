import {
  NOTE_COLUMN_NAME,
  BASE_VARIANT_SPECIAL_HANDLE_KEY,
  NOT_INCLUDE_LIST,
} from 'src/common/constants';
import { Variants } from 'src/variantsInfo';

export abstract class BaseVariant {
  aa_change?: string;

  alt: string;

  cadd_phred?: number;

  cadd_raw?: number;

  ccds?: string;

  cgd_agegroup?: string;

  cgd_allelicconditions?: string;

  cgd_comments?: string;

  cgd_condition?: string;

  cgd_entrezid?: string;

  cgd_gene?: string;

  cgd_hgncid?: string;

  cgd_inheritance?: string;

  cgd_interventioncategories?: string;

  cgd_interventionrationale?: string;

  cgd_manifestationcategories?: string;

  cgd_references?: string;

  chrom: string;

  clndisdb?: string;

  clndisdbincl?: string;

  clndn?: string;

  clndnincl?: string;

  clnhgvs?: string;

  clnid?: string;

  clnrevstat?: string;

  clnsig?: string;

  clnsigconf?: string;

  clnsigincl?: string;

  clnvc?: string;

  clnvcso?: string;

  clnvi?: string;

  constraint_mis_z?: number | number[];

  constraint_oe_lof?: number;

  constraint_oe_lof_lower?: number;

  constraint_oe_lof_upper?: number | number[];

  constraint_oe_mis?: number;

  constraint_oe_mis_lower?: number;

  constraint_oe_mis_upper?: number | number[];

  constraint_oe_syn?: number;

  constraint_oe_syn_lower?: number;

  constraint_oe_syn_upper?: number;

  constraint_pli?: number | string;

  constraint_syn_z?: number | number[];

  domains?: string;

  effect?: string;

  end: number;

  existing_inframe_oorfs?: string;

  existing_outofframe_oorfs?: string;

  existing_uorfs?: string;

  existing_variation?: string;

  exomiser_ad_exgenescombi?: number;

  exomiser_ad_exgenespheno?: number;

  exomiser_ad_exgenesvar?: number;

  exomiser_ar_exgenescombi?: number;

  exomiser_ar_exgenespheno?: number;

  exomiser_ar_exgenesvar?: number;

  exomiser_mt_exgenescombi?: number;

  exomiser_mt_exgenespheno?: number;

  exomiser_mt_exgenesvar?: number;

  exomiser_xd_exgenescombi?: number;

  exomiser_xd_exgenespheno?: number;

  exomiser_xd_exgenesvar?: number;

  exomiser_xr_exgenescombi?: number;

  exomiser_xr_exgenespheno?: number;

  exomiser_xr_exgenesvar?: number;

  flaglrg?: string;

  gene_pheno?: string;

  gnomad_af?: number;

  gnomad_afr_af?: number;

  gnomad_amr_af?: number;

  gnomad_asj_af?: number;

  gnomad_eas_af?: number;

  gnomad_fin_af?: number;

  gnomad_nfe_af?: number;

  gnomad_oth_af?: number;

  gnomad_sas_af?: number;

  gnomadv3_af?: number;

  gnomadv3_af_afr?: number;

  gnomadv3_af_ami?: number;

  gnomadv3_af_amr?: number;

  gnomadv3_af_asj?: number;

  gnomadv3_af_eas?: number;

  gnomadv3_af_fin?: number;

  gnomadv3_af_mid?: number;

  gnomadv3_af_nfe?: number;

  gnomadv3_af_oth?: number;

  gnomadv3_af_sas?: number;

  gnomadv3_af_xx?: number;

  gnomadv3_af_xy?: number;

  hgvsc?: string;

  hgvsp?: string;

  impact?: string;

  impact_severity?: string;

  is_coding?: number;

  is_exonic?: number;

  lof?: string;

  lof_filter?: string;

  lof_flags?: string;

  lof_info?: string;

  mane_plus_clinical?: string;

  mane_select?: string;

  ncbi_ids?: string[];

  pass_filter?: string;

  pheno?: string;

  polyphen_pred?: string | string[];

  polyphen_score?: number | number[];

  quality?: number;

  ref?: string;

  refseq_match?: string;

  revel?: number | number[];

  sift_pred?: string | string[];

  sift_score?: number | number[];

  source?: string;

  spliceai_pred_dp_ag?: number;

  spliceai_pred_dp_al?: number;

  spliceai_pred_dp_dg?: number;

  spliceai_pred_dp_dl?: number;

  spliceai_pred_ds_ag?: number | number[];

  spliceai_pred_ds_al?: number | number[];

  spliceai_pred_ds_dg?: number | number[];

  spliceai_pred_ds_dl?: number | number[];

  spliceai_pred_symbol?: string;

  start: number;

  type?: string;

  variant_id: string;

  variant_type: string;

  highest_af?: number;

  clingen_hi?: string;

  clingen_ts?: string;

  p_lof?: string;

  is_pathogenic?: boolean;

  is_repeat?: boolean;

  sv_id?: string;

  note?: string;

  caller?: string;

  len?: number;

  copy_num_genotype?: number[];

  copy_num_genotype_qual?: number[];

  constructor(variant: Variants, userInfo) {
    if (!variant && !userInfo) {
      return;
    }
    const variantJSON = (<any>variant).toJSON();
    const variantProperties = Object.getOwnPropertyNames(variantJSON);

    for (const key of variantProperties) {
      const propertyValue = variantJSON[key];
      if (BASE_VARIANT_SPECIAL_HANDLE_KEY.includes(key)) {
        switch (key) {
          case NOTE_COLUMN_NAME:
            // TODO many need to modify this when allowing group
            if (
              variant.note?.some(
                (noteObj) => noteObj.user === userInfo.preferred_username,
              )
            ) {
              this.note = variant.note.filter(
                (noteObj) => noteObj.user === userInfo.preferred_username,
              )[0].note;
            }
            break;
          case 'constraint_pli':
            this[key] = Array.isArray(propertyValue)
              ? propertyValue.join(',')
              : propertyValue;
            break;
          case 'impact':
            this[key] = Array.isArray(propertyValue)
              ? propertyValue.join('&')
              : propertyValue;
            break;
          case 'caller':
            this[key] = propertyValue;
            break;
          default:
            if (!NOT_INCLUDE_LIST.includes(key)) {
              this[key] = propertyValue;
            }
        }
      } else {
        this[key] = propertyValue;
      }
    }
  }
}
