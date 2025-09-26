import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ACTION_TYPE,
  APPLICATION_NAME,
  AUDIT_LOG_TYPE,
  DataUpdateLog,
  NOT_LOGIN_USER,
  PerformanceLog,
  URL_BASED_ACTION_NAME,
} from 'src/common';
import { Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';
import { HydratedDocument } from 'mongoose';
import * as os from 'os';

export type BaseLogsDocument = HydratedDocument<BaseLogs>;

@Schema({ collection: 'baselogs' })
export class BaseLogs {
  @Prop({ index: true })
  log_type: string;

  @Prop({ index: true })
  application_name: string;

  @Prop({ index: true })
  log_time: Date;

  @Prop({ index: true })
  user: string;

  @Prop({ index: true })
  action_type: string;

  @Prop({ index: true })
  action_name: string;

  @Prop({ index: true })
  track_number?: string;

  @Prop()
  machine: string;

  @Prop()
  pid: string;

  constructor(
    req: Request,
    res: Response = null,
    error: Error = null,
    user: string = null,
    trackNumber: string = null,
    actionType: string = null,
    actionName: string = null,
    performanceLog: PerformanceLog = null,
    dataUpdateLog: DataUpdateLog = null,
  ) {
    try {
      this.application_name = APPLICATION_NAME;
      this.log_time = new Date();
      // API Request, API Response, Error Log
      if (req != null) {
        if (req?.headers?.authorization && this.getUserInfo(req)) {
          this.user = this.getUserInfo(req).preferred_username;
        } else {
          this.user = NOT_LOGIN_USER;
        }
        const actionObj = URL_BASED_ACTION_NAME.get(req.originalUrl)
          ? URL_BASED_ACTION_NAME.get(req.originalUrl)
          : {
              action_type: '',
              action_name: '',
            };
        // try to guess the action type of that url which is not in URL_BASED_ACTION_NAME
        if (!actionObj.action_type) {
          if (
            req.originalUrl &&
            (req.originalUrl.includes('find') ||
              req.originalUrl.includes('list'))
          ) {
            actionObj.action_type = ACTION_TYPE.QUERY;
            actionObj.action_name = req.originalUrl.split('/').join('_');
          } else if (req?.originalUrl?.includes('save')) {
            actionObj.action_type = ACTION_TYPE.MODIFY;
            actionObj.action_name = req.originalUrl
              .split('/')
              .reverse()
              .join('_');
          } else {
            actionObj.action_type = ACTION_TYPE.UNKNOWN;
            actionObj.action_name = 'unknown';
          }
        }

        this.action_type = actionObj.action_type;
        this.action_name = actionObj.action_name;
        if (req.body) {
          this.track_number = req.body.track_number;
        }
        if (res != null) {
          this.log_type = AUDIT_LOG_TYPE.RESPONSE;
        } else if (error != null) {
          this.log_type = AUDIT_LOG_TYPE.ERROR;
        } else {
          this.log_type = AUDIT_LOG_TYPE.REQUEST;
        }
      } else if (performanceLog != null) {
        this.log_type = AUDIT_LOG_TYPE.PERFORMANCE;
        this.user = user;
        this.track_number = trackNumber;
        this.action_type = actionType;
        this.action_name = actionName;
      } else if (dataUpdateLog != null) {
        this.log_type = AUDIT_LOG_TYPE.DATA_UPDATE;
        this.user = user;
        this.track_number = trackNumber;
        this.action_type = actionType;
        this.action_name = actionName;
      } else if (error != null) {
        this.log_type = AUDIT_LOG_TYPE.ERROR;
        this.user = user;
        this.track_number = trackNumber;
        this.action_type = actionType;
        this.action_name = actionName;
      } else {
        // currently default is action log
        this.log_type = AUDIT_LOG_TYPE.USER_ACTION;
        this.user = user;
        this.track_number = trackNumber;
        this.action_type = actionType;
        this.action_name = actionName;
      }
    } catch (error) {
      console.log('error: ', error);
    }
    this.machine = os.hostname();
    this.pid = process.pid + '';
  }

  private getUserInfo(req: Request): any {
    let result = '';
    try {
      result = jwtDecode(
        req?.headers?.authorization
          ? req.headers['authorization'].replace('Bearer ', '')
          : req.headers['authorization'],
      );
    } catch (e) {}

    return result;
  }

  toString(): string {
    let result = '';
    if (this.log_type) {
      result += ' Log Type: ' + this.log_type;
    }
    if (this.application_name) {
      result += ' Application Name: ' + this.application_name;
    }
    if (this.log_time) {
      result += ' Log Time: ' + this.log_time;
    }
    if (this.user) {
      result += ' User: ' + this.user;
    }
    if (this.action_type) {
      result += ' Action Type: ' + this.action_type;
    }
    if (this.action_name) {
      result += ' Action Name: ' + this.action_name;
    }

    return result;
  }
}

export const BaseLogsSchema = SchemaFactory.createForClass(BaseLogs);
