import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { BaseRequest } from '../../common';

export class InternalRequest extends BaseRequest {
  @IsString()
  @ApiProperty({
    description: 'secret from variant_import_tool',
  })
  secret: string;
}
