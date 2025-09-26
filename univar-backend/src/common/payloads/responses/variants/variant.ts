import {
  RESPONSE_VARIANT_SPECIAL_HANDLE_KEY,
  IS_READ_COLUMN_NAME,
  GENE_OBJS_COLUMN_NAME,
  CLINGEN_HI,
  CLINGEN_TS,
} from 'src/common/constants';
import { Variants } from 'src/variantsInfo';
import { BaseVariant } from './common';
import { HighestAFInfo } from './parts';
import { UserInfo } from '../../auth';

export class Variant extends BaseVariant {
  _id: string;

  allelic_depths?: number[][];

  ensembl_gene_id?: string | string[];

  ensembl_transcript_id?: string | string[];

  entrez_gene_id?: string | string[];

  gene_symbol?: string | string[];

  genotypes_index: number[][];

  is_read?: boolean;

  gene_objs?: any[];

  genotype_qualities?: number[][];

  hg19_chrom?: string;

  hg19_start?: number;

  hg19_strand?: string;

  hg19_end?: number;

  afs?: any[];

  exts?: any[];

  intpns?: any[];

  highest_af_info?: HighestAFInfo;

  exomiser_info?: any;

  constructor(
    variant: Variants = null,
    userInfo: UserInfo = null,
    exomiser_run: string = null,
  ) {
    super(variant, userInfo);
    if (!variant && !userInfo) {
      return;
    }
    RESPONSE_VARIANT_SPECIAL_HANDLE_KEY.forEach((key) => {
      if (variant[key] != null) {
        switch (key) {
          case IS_READ_COLUMN_NAME:
            // TODO many need to modify this when allowing group
            if (variant.is_read) {
              this.is_read = variant.is_read.includes(
                userInfo.preferred_username,
              );
            }

            break;
          case GENE_OBJS_COLUMN_NAME:
            if (variant[key]) {
              const tempHighGeneList = variant[key].filter(
                (gene) => gene.is_related,
              );
              this.gene_symbol = [
                ...new Set(tempHighGeneList.map((gene) => gene.gene)),
              ];
              this.ensembl_gene_id = [
                ...new Set(
                  tempHighGeneList.map((gene) => gene.ensembl_gene_id),
                ),
              ];
              this.entrez_gene_id = [
                ...new Set(tempHighGeneList.map((gene) => gene.entrez_gene_id)),
              ];
              this.ensembl_transcript_id = [
                ...new Set(tempHighGeneList.map((gene) => gene.transcript)),
              ];
              this[key] = variant[key].map((gene) => {
                gene.clingen_hi_display = gene.clingen_hi
                  ? CLINGEN_HI.get(gene.clingen_hi)
                  : null;
                gene.clingen_ts_display = gene.clingen_ts
                  ? CLINGEN_TS.get(gene.clingen_ts)
                  : null;
                return gene;
              });
            }
            break;
          case 'afs':
            this[key] = variant[key];
            break;
          case 'highest_af_info':
            this[key] = variant[key];
            this[key].source = variant[key].display_source
              ? variant[key].display_source
              : variant[key].source;
            break;
          case '_id':
            this[key] = variant[key].toString();
            break;
          default:
            this[key] = variant[key];
        }
      }
    });

    if (exomiser_run && exomiser_run in variant) {
      this.exomiser_info = variant[exomiser_run];
      delete this[exomiser_run];
    }
  }
}
