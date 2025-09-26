import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { SVFileInfo } from './sv-file-info';
import { CramFileInfo } from './cram-info';
import { InternalRequest } from '../common';

export class AnnotateServerRequest extends InternalRequest {
  @IsString()
  @ApiProperty({
    description: 'ped server path',
    example: '/path/to/proband_id.ped',
  })
  ped_path?: string;

  @IsString()
  @ApiProperty({
    description: 'proband ID',
    example: 'sample',
  })
  proband_id: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'list of SV VCF files with caller',
    example:
      '[{"filename": "/path/to/abcxxx.vcf.gz", "caller": "manta"}, {"filename": "/path/to/abcxxx.vcf.gz", "caller": "cnvkit"}]',
  })
  sv_callers?: SVFileInfo[];

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'snp file server path',
    example: '/path/to/proband_id.vcf.gz',
  })
  snp_path?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'hpo file server path',
    example: '/path/to/proband_id.hpo',
  })
  hpo_path?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'access group for this sample (csv)',
    example: 'abc,afds',
  })
  access_group?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'cram files server path',
    example: '[{"path": "/path/to/proband_id.cram", "sample_id": "sample01"}]',
  })
  cram_path?: CramFileInfo[];
}
