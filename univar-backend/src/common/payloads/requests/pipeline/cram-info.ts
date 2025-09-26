import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CramFileInfo {
  @IsString()
  @ApiProperty({
    description: 'the path of the cram file',
    example: '/path/to/abcxxx.vcf.gz',
  })
  path: string;
  @IsString()
  @ApiProperty({
    description: 'the sample id of this cram file',
    example: 'sample01',
  })
  sample_id: string;
}
