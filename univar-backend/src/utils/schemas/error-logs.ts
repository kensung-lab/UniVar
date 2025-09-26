import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Request } from 'express';
import { BaseLogs } from './base';
import { CustomException, EXCEPTION_LEVEL, EXCEPTION_TYPE } from 'src/common';

export type ErrorLogsDocument = HydratedDocument<ErrorLogs>;
export const ERROR_LOG_MODEL_NAME = 'ErrorLogs';

@Schema({ collection: 'errorlogs' })
export class ErrorLogs extends BaseLogs {
  @Prop()
  level?: string;

  @Prop()
  error_type?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  error_stack?: any;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  additional_info?: any;

  constructor(
    req: Request,
    error: Error,
    errorType: string = null,
    errorLevel: string = null,
    user: string = null,
    trackNumber: string = null,
    actionType: string = null,
    actionName: string = null,
  ) {
    super(req, null, error, user, trackNumber, actionType, actionName);
    this.level = errorLevel ?? EXCEPTION_LEVEL.CRITICAL;
    this.error_type = errorType ?? EXCEPTION_TYPE.UNEXPECTED;
    this.error_stack = error;
    if (error instanceof CustomException && error.additionalInformation) {
      this.additional_info = error.additionalInformation;
    }
  }

  toString(): string {
    return JSON.stringify(this);
  }
}

export const ErrorLogsSchema = SchemaFactory.createForClass(ErrorLogs);
