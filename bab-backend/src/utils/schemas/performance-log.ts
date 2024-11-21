/* eslint-disable @typescript-eslint/ban-types */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { PerformanceLog } from 'src/common';
import { BaseLogs } from './base';

export type PerformanceLogsDocument = HydratedDocument<PerformanceLogs>;
export const PERFORMACE_LOG_MODEL_NAME = 'PerformanceLogs';

@Schema({ collection: 'performancelogs' })
export class PerformanceLogs extends BaseLogs {
  @Prop()
  start?: Date;

  @Prop()
  end?: Date;

  @Prop()
  duration?: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  filters?: any;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  sort?: any;

  @Prop()
  skip?: number;

  @Prop()
  limit?: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  project?: any;

  @Prop()
  database?: string;

  constructor(
    user: string,
    trackNumber: string,
    actionType: string,
    actionName: string,
    performanceLog: PerformanceLog,
  ) {
    super(
      null,
      null,
      null,
      user,
      trackNumber,
      actionType,
      actionName,
      performanceLog,
      null,
    );
    // API Request, API Response, Error Log
    this.start = performanceLog.start;
    this.end = performanceLog.end;
    this.duration =
      performanceLog.start && performanceLog.end
        ? Math.abs(
            performanceLog.end.getTime() - performanceLog.start.getTime(),
          )
        : -1;
    this.filters = performanceLog.filters;
    this.sort = performanceLog.sort;
    this.skip = performanceLog.skip;
    this.limit = performanceLog.limit;
    this.project = performanceLog.project;
    this.database = performanceLog.database;
  }

  toString(): string {
    let result = super.toString();

    if (this.start) {
      result += ' Start: ' + this.start;
    }

    if (this.end) {
      result += ' End: ' + this.end;
    }

    if (this.duration) {
      result += ' Duration: ' + this.duration;
    }

    if (this.filters) {
      result += ' Filters: ' + JSON.stringify(this.filters);
    }

    if (this.sort) {
      result += ' Sort: ' + JSON.stringify(this.sort);
    }

    if (this.skip) {
      result += ' Skip: ' + this.skip;
    }

    if (this.limit) {
      result += ' Limit: ' + this.limit;
    }

    if (this.project) {
      result += ' Project: ' + JSON.stringify(this.project);
    }

    if (this.database) {
      result += ' Database: ' + this.database;
    }

    return result;
  }
}

export const PerformanceLogsSchema =
  SchemaFactory.createForClass(PerformanceLogs);
