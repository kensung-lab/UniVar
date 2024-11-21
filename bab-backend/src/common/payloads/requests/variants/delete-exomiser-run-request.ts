import { ApiProperty } from '@nestjs/swagger';
import { QueryRequest } from '../common';
import { IsString } from 'class-validator';

export class DeleteExomiserRunRequest extends QueryRequest {
  @IsString()
  @ApiProperty({
    description: 'exomiser_run',
    example: 'exomiser_1705017510_324',
  })
  exomiser_run: string;
}
