import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { QueryRequest } from '../common';

export class UploadHPORequest extends QueryRequest {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'list of hpo terms',
    example: 'HP:0001999,HP:0000164',
  })
  hpos?: string;

  @IsString()
  @ApiProperty({
    description: 'display name for user to see',
    example: 'Exomiser run 1234',
  })
  display_name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'list of gene panel ObjectId',
    example: '65b19dc1ebb1eb002e510e89,65b19dc1ebb1eb002e510e90',
  })
  panels?: string;
}
