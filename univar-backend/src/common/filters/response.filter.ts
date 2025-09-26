import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseRequest, CustomException, ErrorResponse } from '../payloads';
import { AppLogger } from 'src/utils';
import { EXCEPTION_LEVEL, EXCEPTION_TYPE } from '..';

@Catch()
export class ResponseFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let errorLevel = EXCEPTION_LEVEL.CRITICAL;
    let errorType = EXCEPTION_TYPE.UNEXPECTED;

    if (exception instanceof NotFoundException) {
      return; // skip logging for 404
    } else if (exception instanceof UnauthorizedException) {
      status = exception.getStatus();
      errorLevel = EXCEPTION_LEVEL.NORMAL;
      errorType = EXCEPTION_TYPE.AUTH;
    } else if (exception instanceof CustomException) {
      errorLevel = exception.errorLevel;
      errorType = exception.errorType;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
    }

    let track_number = null;
    if (request && request.body && (request.body as BaseRequest).track_number) {
      track_number = (<BaseRequest>request.body).track_number;
    }
    this.logger.errorLog(request, exception, errorType, errorLevel);

    response
      .status(status)
      .json(new ErrorResponse<null>(exception, track_number));
  }
}
