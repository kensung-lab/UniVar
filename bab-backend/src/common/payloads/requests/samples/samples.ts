import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class Samples {
  @ApiProperty({
    description: 'is the sample active',
    example: 'true',
  })
  @IsBoolean()
  active: boolean;

  @ApiProperty({
    description: 'name',
    example: 'B0000851B01-001-LIB1',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'family Id',
    example: 'P0000851_P0000852_P0000853',
  })
  @IsString()
  family_id: string;

  @ApiProperty({
    description: 'father Id',
    example: 'X0000XXXBXX-XXX-LIB1',
  })
  @IsString()
  father_id?: string;

  @ApiProperty({
    description: 'group',
    example: 'affected',
  })
  @IsString()
  group?: string;

  @ApiProperty({
    description: 'index of the sample',
    example: '0',
  })
  @IsNumber()
  i?: number;

  @ApiProperty({
    description: 'mother Id',
    example: 'X0000XXXBXX-XXX-LIB1',
  })
  @IsString()
  mother_id?: string;

  @ApiProperty({
    description: 'phenotype',
    example: '2',
  })
  @IsString()
  phenotype?: string;

  @ApiProperty({
    description: 'sample id',
    example: '2',
  })
  @IsNumber()
  sample_id?: number;

  @ApiProperty({
    description: 'sex',
    example: 'F',
  })
  @IsString()
  sex?: string;
}
