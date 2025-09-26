import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { QueryRequest } from '.';

export class InternalDataBaseRequest extends QueryRequest {
  @IsString()
  @ApiProperty({
    description: 'secret from variant_import_tool',
  })
  secret: string;
}
