import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ActionLog, DataUpdateLog } from 'src/common';
import { Request, Response } from 'express';
import { BaseLogs } from './base';

export type LogsDocument = HydratedDocument<Logs>;
export const LOG_MODEL_NAME = 'Logs';

@Schema({ collection: 'logs' })
export class Logs extends BaseLogs {
  @Prop({ type: mongoose.Schema.Types.Mixed })
  headers?: any;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  body?: any;

  @Prop()
  original_url?: string;

  @Prop()
  request_ip?: string;

  @Prop()
  status_code?: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  original_data?: any;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  modified_data?: any;

  @Prop()
  database?: string;

  @Prop()
  table?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  extra_information?: any;

  constructor(
    req: Request,
    res: Response = null,
    body: any = null,
    user: string = null,
    trackNumber: string = null,
    actionType: string = null,
    actionName: string = null,
    dataUpdateLog: DataUpdateLog = null,
    actionLog: ActionLog = null,
  ) {
    super(
      req,
      res,
      null,
      user,
      trackNumber,
      actionType,
      actionName,
      null,
      dataUpdateLog,
    );
    // API Request, API Response, Error Log
    if (req != null) {
      if (res != null) {
        this.headers = res.getHeaders ? res.getHeaders() : null;
        if (body && typeof body === 'string') {
          try {
            this.body = JSON.parse(body.toString());
            if (this.body.data?.result?.length >= 300) {
              this.body.data.result = this.body.data.result.slice(0, 100);
            }
          } catch (error) {
            this.body = body.toString();
          }
        } else if (body) {
          this.body = body;
        }

        this.status_code = res.statusCode;
      } else {
        this.headers = req.headers;
        if (req.body) {
          this.body = JSON.parse(JSON.stringify(req.body));
        } else {
          this.body = req.body;
        }
        if (this.body?.secret) {
          delete this.body.secret;
        }
        if (this.body?.track_number) {
          this.track_number = this.body.track_number;
        }
      }
      this.original_url = req.originalUrl;
      this.request_ip = req.ip;
      if (req.body?.selected_database) {
        this.database = req.body.selected_database;
      }
    } else if (dataUpdateLog != null) {
      this.original_data = dataUpdateLog.original_data;
      this.modified_data = dataUpdateLog.modified_data;
      this.database = dataUpdateLog.database;
      this.table = dataUpdateLog.collection;
      this.extra_information = dataUpdateLog.customObject;
    } else if (actionLog != null) {
      this.extra_information = actionLog.customObject;
      if (this.extra_information?.selected_database) {
        this.database = this.extra_information.selected_database;
      }
    }
  }

  toString(): string {
    let result = super.toString();
    if (this.headers) {
      result += ' Headers: ' + JSON.stringify(this.headers);
    }
    if (this.body) {
      result += ' Body: ' + JSON.stringify(this.body);
    }
    if (this.original_url) {
      result += ' Original Url: ' + this.original_url;
    }
    if (this.request_ip) {
      result += ' Request IP: ' + this.request_ip;
    }
    if (this.status_code) {
      result += ' Status Code: ' + this.status_code;
    }
    if (this.original_data) {
      result += ' Original Data: ' + JSON.stringify(this.original_data);
    }
    if (this.modified_data) {
      result += ' Modified Data: ' + JSON.stringify(this.modified_data);
    }
    if (this.database) {
      result += ' Database: ' + JSON.stringify(this.database);
    }
    if (this.table) {
      result += ' Collection: ' + JSON.stringify(this.table);
    }

    if (this.extra_information) {
      result += ' Extra Information: ' + JSON.stringify(this.extra_information);
    }

    return result;
  }
}

export const LogsSchema = SchemaFactory.createForClass(Logs);
