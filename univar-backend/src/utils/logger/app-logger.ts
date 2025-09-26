import { ConsoleLogger, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from '../services';
import { ErrorLogs, Logs, PerformanceLogs } from '..';
import {
  ActionLog,
  DataUpdateLog,
  EXCEPTION_TYPE,
  PerformanceLog,
} from 'src/common';
import { MailService } from 'src/email';

@Injectable()
export class AppLogger extends ConsoleLogger {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  requestLog(req: Request) {
    this.commonLog(new Logs(req));
  }

  responseLog(req: Request, res: Response, body: string) {
    this.commonLog(new Logs(req, res, body));
  }

  errorLog(
    req: Request,
    err: Error,
    errorType: string,
    errorLevel: string,
    user: string = null,
    trackNumber: string = null,
    actionType: string = null,
    actionName: string = null,
  ) {
    const errorLog = new ErrorLogs(
      req,
      err,
      errorType,
      errorLevel,
      user,
      trackNumber,
      actionType,
      actionName,
    );
    if (errorType == EXCEPTION_TYPE.UNEXPECTED) {
      const errorMessage = `Track Number: ${errorLog.track_number} <br> \
                            user: ${errorLog.user} <br> \
                            actionName: ${errorLog.action_name} <br>
                            err: ${errorLog.error_stack}`;
      this.mailService.sendErrorEmail(errorMessage);
    }
    this.commonLog(errorLog);
  }

  performanceLog(performance: PerformanceLog) {
    this.commonLog(
      new PerformanceLogs(
        performance.username,
        performance.trackNumber,
        performance.actionType,
        performance.actionName,
        performance,
      ),
    );
  }

  async dataUpdateLog(dataUpdateLog: DataUpdateLog) {
    await this.commonLog(
      new Logs(
        null,
        null,
        null,
        dataUpdateLog.username,
        dataUpdateLog.trackNumber,
        dataUpdateLog.actionType,
        dataUpdateLog.actionName,
        dataUpdateLog,
      ),
    );
  }

  actionLog(actionLog: ActionLog) {
    this.commonLog(
      new Logs(
        null,
        null,
        null,
        actionLog.username,
        actionLog.trackNumber,
        actionLog.actionType,
        actionLog.actionName,
        null,
        actionLog,
      ),
    );
  }

  private commonLog(logs: any): Promise<any> {
    if (process.env.CONSOLE_LOG === 'true') {
      console.error('Logs: ', logs);
    }

    return this.loggingService.logging(logs);
  }
}
