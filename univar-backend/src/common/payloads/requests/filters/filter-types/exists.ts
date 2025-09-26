import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class Exists {
  @ApiProperty({
    description: 'exist in element',
    example: 'true',
  })
  @IsBoolean()
  $exists: boolean;
}
