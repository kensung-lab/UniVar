import { IsNotEmpty, IsString } from 'class-validator';
import { BaseRequest } from '../../common';

export class QueryRequest extends BaseRequest {
  @IsNotEmpty()
  @IsString()
  selected_database?: string;
}
