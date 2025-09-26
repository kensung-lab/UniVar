import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class LessEqual {
  @ApiProperty({
    description: 'less than and equal to ',
    example: '3.09',
  })
  @IsNumber()
  $lte: number;
}
