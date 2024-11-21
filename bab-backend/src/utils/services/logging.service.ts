import { Injectable } from '@nestjs/common';
import { LOGGING_DATABASE, getDatabaseNModel } from 'src/common';
import { Model } from 'mongoose';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose';
import {
  BaseLogs,
  ERROR_LOG_MODEL_NAME,
  ErrorLogs,
  LOG_MODEL_NAME,
  Logs,
  PERFORMACE_LOG_MODEL_NAME,
  PerformanceLogs,
} from '../schemas';

@Injectable()
export class LoggingService {
  constructor(
    @InjectModel(LOG_MODEL_NAME, LOGGING_DATABASE) private Logs: Model<Logs>,
    @InjectModel(ERROR_LOG_MODEL_NAME, LOGGING_DATABASE)
    private ErrorLogs: Model<ErrorLogs>,
  ) {}

  async logging(logs: BaseLogs): Promise<boolean> {
    let isSuccess = true;
    let persisObject = null;
    let connection = null;

    try {
      if (logs instanceof ErrorLogs) {
        persisObject = new this.ErrorLogs(logs);
      } else if (logs instanceof PerformanceLogs) {
        const currentDate = new Date();
        const performanceLogsSchema =
          SchemaFactory.createForClass(PerformanceLogs);
        performanceLogsSchema.set(
          'collection',
          'performance-logs-' +
            currentDate.getFullYear() +
            '-' +
            (currentDate.getMonth() + 1),
        );
        const tempDatabase = await getDatabaseNModel(
          PERFORMACE_LOG_MODEL_NAME,
          performanceLogsSchema,
          LOGGING_DATABASE,
        );
        connection = tempDatabase[0];
        const PerformaceLogs = tempDatabase[1];

        persisObject = new PerformaceLogs(logs);
      } else {
        persisObject = new this.Logs(logs);
      }
      await persisObject.save();
    } catch (err) {
      console.log('error:', err);
      isSuccess = false;
    }
    if (connection) {
      connection.destroy();
    }

    return isSuccess;
  }
}
