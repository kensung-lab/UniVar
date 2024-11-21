import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseRequest } from '../../common';

export class UploadFilesRequest extends BaseRequest {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'list of ped',
    example:
      '[{sample_id: "sample1", sex: 1, affected: 1},{sample_id: "sample2", sex: 2, affected: 2}]',
  })
  peds?: string;

  @IsString()
  @ApiProperty({
    description: 'proband ID',
    example: 'sample',
  })
  probandId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'list of SV VCF files with caller',
    example:
      '[{"filename": "abcxxx.vcf.gz", "caller": "manta"}, {"filename": "abcxxx.vcf.gz", "caller": "cnvkit"}]',
  })
  svCallers?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'list of gene panel ObjectId',
    example: '65b19dc1ebb1eb002e510e89,65b19dc1ebb1eb002e510e90',
  })
  panels?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'list of hpo terms',
    example: 'HP:0001999,HP:0000164',
  })
  hpos?: string;
}
