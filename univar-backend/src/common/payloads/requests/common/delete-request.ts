import { IsString } from 'class-validator';
import { BaseRequest } from '../../common';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteRequest extends BaseRequest {
  @IsString()
  @ApiProperty({
    description: 'the id of the obj that want to delete',
    example: '0',
  })
  id: string;
}
