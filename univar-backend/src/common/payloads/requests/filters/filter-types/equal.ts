import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class Equal {
  @ApiProperty({
    description: 'equal to ',
    example: '1',
  })
  @IsNumber()
  $eq: number;
}
