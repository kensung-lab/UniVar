import { Module } from '@nestjs/common';
import { JwtService, LoggingService, LoggingHelperService } from './services';
import { LoggerMiddleware } from './middleware';
import { AppLogger } from './logger';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ERROR_LOG_MODEL_NAME,
  ErrorLogsSchema,
  LOG_MODEL_NAME,
  LogsSchema,
} from './schemas';
import { LOGGING_DATABASE } from 'src/common';
import { EmailModule } from 'src/email';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: LOG_MODEL_NAME, schema: LogsSchema },
        { name: ERROR_LOG_MODEL_NAME, schema: ErrorLogsSchema },
      ],
      LOGGING_DATABASE,
    ),
    EmailModule,
  ],
  exports: [
    JwtService,
    LoggingService,
    LoggingHelperService,
    LoggerMiddleware,
    AppLogger,
  ],
  providers: [
    JwtService,
    LoggingService,
    LoggingHelperService,
    LoggerMiddleware,
    AppLogger,
  ],
})
export class UtilsModule {}
