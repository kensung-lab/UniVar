import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { QueryRequest } from '../common';

export class UpdateNoteRequest extends QueryRequest {
  @IsString()
  @ApiProperty({
    description: 'The MongoDB variant collection ObjectId',
    example: 'bookmark1',
  })
  variant_object_id: string;

  @IsString()
  @ApiProperty({
    description: 'note for that variant',
    example: 'Here is an sample note',
  })
  note: string;

  @IsBoolean()
  @ApiProperty({
    description: 'is this read shared to group',
    example: 'false',
  })
  is_share: boolean;
}
