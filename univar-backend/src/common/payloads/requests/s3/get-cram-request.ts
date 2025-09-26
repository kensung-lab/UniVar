import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInstance,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { QueryRequest } from '../common';
import { VariantInfo } from './variant-info';
import { Type } from 'class-transformer';

export class GetCramRequest extends QueryRequest {
  @IsArray()
  @ApiProperty({
    description: 'get list of sample CRAM files for IGV',
    example: '["XXX-XXXX-LIBX", "XXX-XXXX-LIBX", "XXX-XXXX-LIBX"]',
  })
  samples: string[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => VariantInfo)
  @IsInstance(VariantInfo)
  @ApiProperty({
    description: 'variant information',
    example:
      '{ chrom: chr1, start: 123, alt: G, variant_object_id: fdshjkdas312v }',
  })
  variant_info?: VariantInfo;
}
