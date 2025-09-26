import { BaseRequest } from '../../common';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

export class GetOneProjectRequest extends BaseRequest {
  @IsString()
  @ApiProperty({
    description: 'the project id',
    example: '78968d7f5gs789680s97ad56fa89',
  })
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
  project_id: string;
}

export class OneProjectRequest extends GetOneProjectRequest {
  @IsNumber()
  @ApiProperty({
    description: 'version number of the request document',
    example: 8,
  })
  __v: number;
}

export class EditSmapleStatusRequest extends OneProjectRequest {
  @IsArray()
  @ApiProperty({
    description: 'todo sample ordering list',
    example: '["HG002", "HG00512"]',
  })
  todos: string[];

  @IsArray()
  @ApiProperty({
    description: 'wip sample ordering list',
    example: '["HG002", "HG00512"]',
  })
  wips: string[];

  @IsArray()
  @ApiProperty({
    description: 'evaluating sample ordering list',
    example: '["HG002", "HG00512"]',
  })
  verifying: string[];

  @IsArray()
  @ApiProperty({
    description: 'done sample ordering list',
    example: '["HG002", "HG00512"]',
  })
  done: string[];
}

export class EditNoteRequest extends OneProjectRequest {
  @IsString()
  @ApiProperty({
    description: 'name of the database',
    example: 'HG002',
  })
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
  database_name: string;

  @IsString()
  @Length(0, 255)
  @ApiProperty({
    description: 'updated note for the database',
    example: 'This smaple is proband',
  })
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
  note: string;
}

export class DelDbRequest extends OneProjectRequest {
  @IsArray()
  @ApiProperty({
    description: 'name list of the databases',
    example: ['HG002', 'HG003'],
  })
  databases: string[];
}

export class GetDbStatusRequest extends GetOneProjectRequest {
  @IsString()
  @ApiProperty({
    description: 'name of the database',
    example: 'HG002',
  })
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
  database: string;
}

export class ChangeOneDbStatusRequest extends OneProjectRequest {
  @IsString()
  @ApiProperty({
    description: 'name of the database',
    example: 'HG002',
  })
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
  database: string;

  @IsString()
  @ApiProperty({
    description:
      'status of the database ["todos", "wips", "verifying", "done"], or "", if empty string is provided, db will remove from database',
    example: 'todos',
  })
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
  status: string;
}
