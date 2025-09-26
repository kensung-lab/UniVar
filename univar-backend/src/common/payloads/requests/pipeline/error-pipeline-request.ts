import { IsNotEmpty, IsString } from 'class-validator';
import { InternalRequest } from '../common';

export class ErrorPipelineRequest extends InternalRequest {
  @IsNotEmpty()
  @IsString()
  selected_database?: string;
}
