import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { QueryRequest } from '../common';
import { IsReadStatus } from '../../variants';

export class MarkReadRequest extends QueryRequest {
  @IsArray()
  @ApiProperty({
    description: 'read or unread more than one variant',
    example:
      '[{obj_id: XXXXXXX, is_read: true, is_share: false}, {obj_id: XXXXXXX, is_read: false, is_share: true}]',
  })
  is_read: IsReadStatus[];
}
