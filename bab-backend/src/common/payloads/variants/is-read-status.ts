import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class IsReadStatus {
  @ApiProperty({
    description: 'the object id of that variant',
    example: '6487bbda445da0a50802c1ef',
  })
  @IsString()
  obj_id: string;

  @IsBoolean()
  @ApiProperty({
    description: 'read or unread that variant',
    example: 'true',
  })
  is_read: boolean;

  @IsBoolean()
  @ApiProperty({
    description: 'is this read shared to group',
    example: 'false',
  })
  is_share: boolean;
}
