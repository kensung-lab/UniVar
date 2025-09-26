import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseRequest } from '../../common';

export class ExportResultRequest extends BaseRequest {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The track number of the original export request',
    example: 'univar-test01:166315282882',
  })
  orig_track_number?: string;
}
