import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class Less {
  @ApiProperty({
    description: 'less than ',
    example: '0.01',
  })
  @IsNumber()
  $lte: number;
}
