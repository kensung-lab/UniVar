import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class VariantInfo {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'the mongodb _id of that variant for logging purpose',
    example: '64d1fe63e4534ed18a6d6f67',
  })
  variant_object_id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'chrom of that variant for logging purpose',
    example: 'chr1',
  })
  chrom?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'start of that variant for logging purpose',
    example: '924024',
  })
  start?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'alt of that variant for logging purpose',
    example: 'G',
  })
  alt?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'variant_type of that variant for logging purpose',
    example: 'small',
  })
  variant_type?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'caller of that variant for logging purpose',
    example: 'manta',
  })
  caller?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'sv_id of that variant for logging purpose',
    example: 'S:cnvkit:1',
  })
  sv_id?: string;
}
