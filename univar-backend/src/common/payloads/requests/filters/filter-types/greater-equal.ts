import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GreaterEqual {
  @ApiProperty({
    description: 'greater than and equal to ',
    example: '3.09',
  })
  @IsNumber()
  $gte: number;
}
