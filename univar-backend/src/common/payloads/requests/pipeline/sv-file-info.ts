import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SVFileInfo {
  @IsString()
  @ApiProperty({
    description: 'the path of the SV VCF file',
    example: '/path/to/abcxxx.vcf.gz',
  })
  filename: string;
  @IsString()
  @ApiProperty({
    description: 'the caller name of the SV VCF file',
    example: 'manta',
  })
  caller: string;
}
