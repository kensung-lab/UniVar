import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class In {
  @ApiProperty({
    description: 'in this array ',
    example: '["abc","cfd"]',
  })
  @IsArray()
  $in: string[];
}
