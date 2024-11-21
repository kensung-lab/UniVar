import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInstance,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { Filters } from '../filters';
import { BaseRequest } from '../../common';
import { BookmarkType } from '../../enums';
import sanitizeHtml from 'sanitize-html';

export class BookmarkRequest extends BaseRequest {
  @IsString()
  @ApiProperty({
    description: 'name of this bookmark/ filter',
    example: 'bookmark1',
  })
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
  name: string;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => Filters)
  @IsInstance(Filters)
  @ApiProperty({
    description: 'filter object',
    example: '{}',
  })
  filters?: Filters;

  @IsDefined()
  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'column object',
    example: '{all: {display: ["note","chrom"]}}',
  })
  columns?: any;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'search gene panel by _id ',
    example: '["clingen_1"]',
  })
  panels?: string[];

  @IsDefined()
  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'sort object',
    example: '{ start: 1 }',
  })
  sort?: any;

  @IsEnum(BookmarkType)
  @ApiProperty({
    description: 'type of bookmark, either bookmark/ filters',
    example: 'bookmark',
  })
  type: BookmarkType;

  @IsBoolean()
  @ApiProperty({
    description: 'is this bookmark/ filter shared to group',
    example: 'false',
  })
  is_share: boolean;
}
