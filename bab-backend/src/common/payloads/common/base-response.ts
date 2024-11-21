import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse<T> {
  @ApiProperty()
  track_number?: string;
  @ApiProperty()
  data?: T;

  constructor(data: T = null, track_number: string = null) {
    this.track_number = track_number;
    this.data = data;
  }
}
