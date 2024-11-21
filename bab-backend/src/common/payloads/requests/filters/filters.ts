import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInstance,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GreaterEqual, In, LessEqual } from './filter-types';

export class Filters {
  @ApiProperty({
    description: 'chromosome',
    example: 'chr1',
  })
  @IsString()
  @IsOptional()
  chrom?: string;

  @ApiProperty({
    description: 'clingen HI',
    example: 'sufficient',
  })
  @IsArray()
  @IsOptional()
  clingen_hi?: string[];

  @ApiProperty({
    description: 'clingen TS',
    example: 'emerging',
  })
  @IsArray()
  @IsOptional()
  clingen_ts?: string[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'constraint mis z',
    example: '{ $gte: 3.09 }',
  })
  constraint_mis_z?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'constraint oe lof upper',
    example: '{ $lte: 0.5 }',
  })
  constraint_oe_lof_upper?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'constraint oe mis upper',
    example: '{ $lte: 0 }',
  })
  constraint_oe_mis_upper?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'constraint syn z',
    example: '{ $gte: -2 }',
  })
  constraint_syn_z?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'end',
    example: '{ $lte: 456 }',
  })
  end?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'highest exomiser scombi',
    example: '{ $gte: 0.1 }',
  })
  highest_exomiser_scombi?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'exomiser ad exgenescombi',
    example: '{ $gte: 0.1 }',
  })
  exomiser_ad_exgenescombi?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'exomiser ar exgenescombi',
    example: '{ $gte: 0.5 }',
  })
  exomiser_ar_exgenescombi?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'exomiser mt exgenescombi',
    example: '{ $gte: 0.1 }',
  })
  exomiser_mt_exgenescombi?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'exomiser xd exgenescombi',
    example: '{ $gte: 0.1 }',
  })
  exomiser_xd_exgenescombi?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'exomiser xr exgenescombi',
    example: '{ $gte: 0.1 }',
  })
  exomiser_xr_exgenescombi?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'highest exomiser spheno',
    example: '{ $gte: 0.1 }',
  })
  highest_exomiser_spheno?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'exomiser ad exgenespheno',
    example: '{ $gte: 0.1 }',
  })
  exomiser_ad_exgenespheno?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'exomiser ar exgenespheno',
    example: '{ $gte: 0.5 }',
  })
  exomiser_ar_exgenespheno?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'exomiser mt exgenespheno',
    example: '{ $gte: 0.1 }',
  })
  exomiser_mt_exgenespheno?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'exomiser xd exgenespheno',
    example: '{ $gte: 0.1 }',
  })
  exomiser_xd_exgenespheno?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'exomiser xr exgenespheno',
    example: '{ $gte: 0.1 }',
  })
  exomiser_xr_exgenespheno?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => In)
  @IsInstance(In)
  @ApiProperty({
    description: 'gene',
    example: '{ "$in" : ["OR4F5","SAM11"] }',
  })
  'gene_objs.gene_filter'?: In;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'gnomad_af',
    example: '{ "$lte" : 0.01 }',
  })
  gnomad_af?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'gnomad_eas_af',
    example: '{ "$lte" : 0.01 }',
  })
  gnomad_eas_af?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'gnomadv3_af',
    example: '{ "$lte" : 0.01 }',
  })
  gnomadv3_af?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'gnomadv3_af_eas',
    example: '{ "$lte" : 0.01 }',
  })
  gnomadv3_af_eas?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'dgv_gold_outer',
    example: '{ "$lte" : 0.01 }',
  })
  dgv_gold_outer?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'dgv_gold_inner',
    example: '{ "$lte" : 0.01 }',
  })
  dgv_gold_inner?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'hkbc',
    example: '{ "$lte" : 0.01 }',
  })
  hkbc?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'one_kg_eas',
    example: '{ "$lte" : 0.01 }',
  })
  one_kg_eas?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'one_kg_sur_eas',
    example: '{ "$lte" : 0.01 }',
  })
  one_kg_sur_eas?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'one_kg',
    example: '{ "$lte" : 0.01 }',
  })
  one_kg?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'one_kg_sur',
    example: '{ "$lte" : 0.01 }',
  })
  one_kg_sur?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'highest_af',
    example: '{ "$lte" : 0.05 }',
  })
  highest_af?: LessEqual;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'impact',
    example: '{ "$in": [ "frameshift_variant", "splice_acceptor_variant" ]}',
  })
  impact?: string[];

  @ApiProperty({
    description: 'is_coding',
    example: 'INS',
  })
  @IsOptional()
  @IsNumber()
  is_coding?: number;

  @ApiProperty({
    description: 'is_exonic',
    example: 'INS',
  })
  @IsOptional()
  @IsNumber()
  is_exonic?: number;

  @ApiProperty({
    description: 'is_pathogenic',
    example: 'true',
  })
  @IsOptional()
  is_pathogenic?: boolean;

  @ApiProperty({
    description: 'is_read',
    example: 'true',
  })
  @IsOptional()
  is_read?: boolean;

  @ApiProperty({
    description: 'note',
    example: 'true',
  })
  @IsOptional()
  note?: boolean;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'len',
    example: '{ "$lt": 1000000 }',
  })
  len?: LessEqual;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'p_lof',
    example: '{ "$in": [ "LOF" ] }',
  })
  p_lof?: string[];

  @ApiProperty({
    description: 'pass_filter',
    example: '{ "$in" : "PASS" }',
  })
  @IsOptional()
  @IsArray()
  pass_filter?: string[];

  @ApiProperty({
    description: 'polyphen_pred',
    example: '{ "$in": [ "probably_damaging", "possibly_damaging" ] }',
  })
  @IsOptional()
  @IsArray()
  polyphen_pred?: string[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'polyphen_score',
    example: '{ "$lt": 0.05 }',
  })
  polyphen_score?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'quality',
    example: '{ "$gte": 2055.7 }',
  })
  quality?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'revel',
    example: '{ "$lte": 0.348 }',
  })
  revel?: LessEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'cadd_phred',
    example: '{ "$gte": 0.348 }',
  })
  cadd_phred?: GreaterEqual;

  @ApiProperty({
    description: 'scenario',
    example: 'dominant',
  })
  @IsString()
  @IsOptional()
  scenario?: string;

  @ApiProperty({
    description: 'sift_pred',
    example: '[ "deleterious", "tolerated_low_confidence" ]',
  })
  @IsArray()
  @IsOptional()
  sift_pred?: string[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LessEqual)
  @IsInstance(LessEqual)
  @ApiProperty({
    description: 'sift_score',
    example: '{ "$lt": 0.01 }',
  })
  sift_score?: LessEqual;

  @ApiProperty({
    description: 'snv_type',
    example: 'INS',
  })
  @IsOptional()
  @IsString()
  snv_type?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'highest_splice_ai',
    example: '{ "$gte": 0.01 }',
  })
  highest_splice_ai?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'spliceai_pred_ds_ag',
    example: '{ "$gte": 0.01 }',
  })
  spliceai_pred_ds_ag?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'spliceai_pred_ds_al',
    example: '{ "$gte": 0.01 }',
  })
  spliceai_pred_ds_al?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'spliceai_pred_ds_dg',
    example: '{ "$gte": 0.01 }',
  })
  spliceai_pred_ds_dg?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'spliceai_pred_ds_dl',
    example: '{ "$gte": 0.01 }',
  })
  spliceai_pred_ds_dl?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'start',
    example: '{ $gte: 456 }',
  })
  start?: GreaterEqual;

  @ApiProperty({
    description: 'sv_type',
    example: 'BND',
  })
  @IsOptional()
  @IsString()
  sv_type?: string;

  @ApiProperty({
    description: 'variant_type',
    example: 'structural',
  })
  @IsOptional()
  @IsString()
  variant_type?: string;

  @ApiProperty({
    description: 'caller',
    example: 'cnvkit',
  })
  @IsOptional()
  @IsString()
  caller?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'gnomAD pLI',
    example: '{$gte: 0.9}',
  })
  p_li?: GreaterEqual;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'clnsig',
    example: '[ "Pathogenic", "Pathogenic,_risk_factor" ]',
  })
  clnsig?: string[];

  // @ApiProperty({
  //   description: 'is_repeat',
  //   example: 'true',
  // })
  // @IsOptional()
  // is_repeat?: boolean;

  @ApiProperty({
    description: 'sv_id',
    example: 'S:manta:123',
  })
  @IsOptional()
  @IsString()
  sv_id?: string;

  @ApiProperty({
    description: 'HKGI specific high impact',
    example: 'boolean',
  })
  @IsOptional()
  @IsInt()
  hkgi_high_impact?: number;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'highest Exomiser 13 Gene combined score',
    example: '{$gte: 0.9}',
  })
  highest_exomiser_gene_combined_score?: GreaterEqual;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GreaterEqual)
  @IsInstance(GreaterEqual)
  @ApiProperty({
    description: 'highest Exomiser 13 Gene pheno score',
    example: '{$gte: 0.9}',
  })
  highest_exomiser_gene_pheno_score?: GreaterEqual;
}
