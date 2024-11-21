import {
  IsArray,
  IsInstance,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Filters } from '../filters';
import { Type } from 'class-transformer';
import { Samples } from '../samples';
import { QueryRequest } from './query-request';

export class PagingRequest extends QueryRequest {
  @IsNumber()
  @ApiProperty({
    description: 'request page number, 0-based',
    example: '0',
  })
  page: number;

  @IsNumber()
  @ApiProperty({
    description: 'record per page',
    example: '300',
  })
  per_page: number;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Filters)
  @IsInstance(Filters)
  @ApiProperty({
    description: 'mongodb filters',
    example:
      '{"$or": [{"highest_af": { "$lt": 0.001 }}, {"highest_af": null}], "gene_objs": { "$elemMatch": { "clingen_hi": "sufficient" } },"p_lof": "LOF"}',
  })
  filter?: Filters;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'search gene panel by _id ',
    example: '["clingen_1"]',
  })
  panels?: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Samples)
  @ApiProperty({
    description: 'selected samples information',
    example: '[{"i": 0, "name": "X0000000X01-001-LIB1", ...}]',
  })
  samples?: Samples[];

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'mongodb sorting ',
    example: '[{"chrom": "asc"}]',
  })
  sort?: any[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'exomiser run string',
    example: 'exomiser_1705017510_324',
  })
  exomiser_run?: string;
}
