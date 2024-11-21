import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { BaseRequest } from '../../common';

export class HPORequest extends BaseRequest {
  @IsString()
  @ApiProperty({
    description: 'version of the hpo terms',
    example: '2023-10-09',
  })
  version: string;
}
