import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BaseRequest {
  @IsString()
  @ApiProperty({
    description: 'track number to keep trace of this API call',
    example: 'univar-test01:166315282882',
  })
  track_number?: string;
}
