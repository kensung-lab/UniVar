import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '../logger';
import { NO_LOG_URL } from 'src/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Gets the request log
    if (req.originalUrl && !NO_LOG_URL.includes(req.originalUrl)) {
      this.logger.requestLog(req);
      this.getResponseLog(req, res);
    }

    // Ends middleware function execution, hence allowing to move on
    if (next) {
      next();
    }
  }

  getResponseLog = (req: Request, res: Response) => {
    const oldWrite = res.write;
    const oldEnd = res.end;

    const chunks = [];

    res.write = (...restArgs) => {
      chunks.push(Buffer.from(restArgs[0]));
      return oldWrite.apply(res, restArgs);
    };

    res.end = (...restArgs) => {
      if (restArgs[0]) {
        chunks.push(Buffer.from(restArgs[0]));
      }
      const body = Buffer.concat(chunks).toString('utf8');

      this.logger.responseLog(req, res, body);

      return oldEnd.apply(res, restArgs);
    };
  };
}
