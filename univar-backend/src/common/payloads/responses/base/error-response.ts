import { BadRequestException, HttpException } from '@nestjs/common';
import { CustomException, ExceptionResponse } from '../..';
import { BaseResponse } from '../../common';
import { DEFAULT_ERROR_MESSAGE } from 'src/common/constants';

export class ErrorResponse<T> extends BaseResponse<T> {
  error_code: number;
  error_message: string;

  constructor(error: Error, track_number: string = null) {
    super(null, track_number);
    this.error_code = 500;
    if (error instanceof CustomException) {
      this.error_code = error.errorCode;
    } else if (error instanceof HttpException) {
      this.error_code = error.getStatus();
    }
    if (error instanceof BadRequestException) {
      this.error_message = (<ExceptionResponse>error.getResponse())?.message;
    } else if (this.error_code === 500) {
      this.error_message = DEFAULT_ERROR_MESSAGE;
    } else {
      this.error_message = error.message;
    }
  }
}
