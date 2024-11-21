import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { QueryRequest } from '../common';

export class FindVariantExonsRequest extends QueryRequest {
  @IsString()
  @ApiProperty({
    description: 'variant_id',
    example: 'S:manta:213',
  })
  variant_id: string;
}
