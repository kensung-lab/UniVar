import {
  GENE_OBJS_COLUMN_NAME,
  EXPORT_TSV_VARIANT_SPECIAL_HANDLE_KEY,
  EXPORT_GENOTYPES_COLUMN_NAME,
  EXOMISER_COLUMN_LIST,
} from 'src/common/constants';
import { Variants } from 'src/variantsInfo';
import { BaseVariant } from '../common';

export class ExportTsvVariant extends BaseVariant {
  allelic_depths: string;

  ensembl_gene_id: string;

  ensembl_transcript_id: string;

  entrez_gene_id: string;

  gene_symbol: string;

  genotype_qualities: string;

  samples_genotypes: string;

  highest_gene_symbol: string;

  highest_moi: string;

  highest_exomiser_acmg_classification: string;

  highest_exomiser_acmg_evidence: string;

  highest_exomiser_acmg_disease_id: string;

  highest_exomiser_acmg_disease_name: string;

  highest_exomiser_gene_combined_score: number;

  highest_exomiser_gene_pheno_score: number;

  highest_exomiser_gene_variant_score: string;

  constructor(
    variant: Variants,
    userInfo,
    samples: any[],
    exomiser_run: string = undefined,
  ) {
    super(variant, userInfo);
    EXPORT_TSV_VARIANT_SPECIAL_HANDLE_KEY.forEach((key) => {
      if ((key in variant && variant[key]) || key === 'gene_symbol') {
        switch (key) {
          case 'genotypes_index':
            if (
              variant['genotypes_index'] &&
              variant['genotypes_index'].length > 0
            ) {
              let tempGenoType = '';
              samples.forEach((sample) => {
                tempGenoType +=
                  sample.name +
                  ':' +
                  (variant['genotypes_index'][sample.i][0] ?? '.') +
                  '/' +
                  (variant['genotypes_index'][sample.i][1] ?? '.') +
                  ',';
              });
              tempGenoType = tempGenoType.replace(/.$/, '');
              this[EXPORT_GENOTYPES_COLUMN_NAME] = tempGenoType;
            }
            delete this['genotypes_index'];
            break;
          case 'allelic_depths':
            let tempAllelicDepths = '';
            variant[key].forEach((allelic_depth) => {
              tempAllelicDepths +=
                allelic_depth[0] + '+' + allelic_depth[1] + ',';
            });
            tempAllelicDepths = tempAllelicDepths.replace(/.$/, '');
            this[key] = tempAllelicDepths;
            break;
          // shouldn't have this case
          case GENE_OBJS_COLUMN_NAME:
            delete this[GENE_OBJS_COLUMN_NAME];
            break;
          case 'gene_symbol':
            if (variant[GENE_OBJS_COLUMN_NAME]) {
              const tempHighGeneList = variant[GENE_OBJS_COLUMN_NAME].filter(
                (gene) => gene.is_related,
              );
              const temp_genes: Set<string> = new Set<string>();

              tempHighGeneList.forEach((gene) => {
                temp_genes.add(gene.gene);
              });

              this.gene_symbol = Array.from(temp_genes).join(',');
            }
            break;
          case 'ensembl_gene_id':
            if (variant[GENE_OBJS_COLUMN_NAME]) {
              const tempHighGeneList = variant[GENE_OBJS_COLUMN_NAME].filter(
                (gene) => gene.is_related,
              );
              const temp_ensembl_gene_ids: Set<string> = new Set<string>();

              tempHighGeneList.forEach((gene) => {
                temp_ensembl_gene_ids.add(gene.ensembl_gene_id);
              });

              this.ensembl_gene_id = Array.from(temp_ensembl_gene_ids).join(
                ',',
              );
            }
          case 'entrez_gene_id':
            if (variant[GENE_OBJS_COLUMN_NAME]) {
              const tempHighGeneList = variant[GENE_OBJS_COLUMN_NAME].filter(
                (gene) => gene.is_related,
              );
              const temp_entrez_gene_ids: Set<string> = new Set<string>();

              tempHighGeneList.forEach((gene) => {
                temp_entrez_gene_ids.add(gene.entrez);
              });
              this.entrez_gene_id = Array.from(temp_entrez_gene_ids).join(',');
            }
            break;
          case 'ensembl_transcript_id':
            if (variant[GENE_OBJS_COLUMN_NAME]) {
              const tempHighGeneList = variant[GENE_OBJS_COLUMN_NAME].filter(
                (gene) => gene.is_related,
              );
              const temp_ensembl_transcript_id: Set<string> = new Set<string>();

              tempHighGeneList.forEach((gene) => {
                temp_ensembl_transcript_id.add(gene.transcript);
              });

              this.ensembl_transcript_id = Array.from(
                temp_ensembl_transcript_id,
              ).join(',');
            }
            break;
          default:
            if (Array.isArray(variant[key])) {
              if (variant[key].length > 0) {
                this[key] = variant[key][0];
              } else {
                this[key] = '';
              }
            } else {
              this[key] = variant[key];
            }
        }
      }
    });
    EXOMISER_COLUMN_LIST.forEach((key) => {
      if (
        exomiser_run &&
        exomiser_run in variant &&
        variant[exomiser_run] &&
        key in variant[exomiser_run] &&
        variant[exomiser_run][key]
      ) {
        this[key] = variant[exomiser_run][key];
      }
    });
  }
}
