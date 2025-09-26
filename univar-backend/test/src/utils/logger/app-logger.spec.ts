import { ActionLog, DataUpdateLog, PerformanceLog } from 'src/common';
import { MailService } from 'src/email';
import { AppLogger, LoggingService, Logs } from 'src/utils';

describe('AppLogger', () => {
  let appLogger: AppLogger;
  let loggingService: LoggingService;
  let mailService: MailService;

  beforeEach(() => {
    loggingService = {
      logging: jest.fn(),
    } as any;
    mailService = {
      mailerService: undefined,
      sendErrorEmail: jest.fn(),
    } as any;
    appLogger = new AppLogger(loggingService, mailService);
  });

  describe('requestLog', () => {
    it('should call commonLog method with the correct parameters', () => {
      const req = {} as any;
      appLogger.requestLog(req);

      expect(loggingService.logging).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('responseLog', () => {
    it('should call commonLog method with the correct parameters', () => {
      const req = {} as any;
      const res = {} as any;
      const body = 'response body';
      appLogger.responseLog(req, res, body);

      expect(loggingService.logging).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('errorLog', () => {
    it('should call commonLog method with the correct parameters', () => {
      const req = {} as any;
      const err = new Error('Test error');
      const errorType = 'Error type';
      const errorLevel = 'Error level';
      appLogger.errorLog(req, err, errorType, errorLevel);

      expect(loggingService.logging).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('performanceLog', () => {
    it('should call commonLog method with the correct parameters', () => {
      const performance = {} as PerformanceLog;
      appLogger.performanceLog(performance);

      expect(loggingService.logging).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('dataUpdateLog', () => {
    it('should call commonLog method with the correct parameters', async () => {
      const dataUpdateLog = {} as DataUpdateLog;
      await appLogger.dataUpdateLog(dataUpdateLog);

      expect(loggingService.logging).toHaveBeenCalledWith(expect.any(Logs));
    });
  });

  describe('actionLog', () => {
    it('should call commonLog with a Logs instance', () => {
      const actionLog: ActionLog = {
        username: 'user',
        trackNumber: '123',
        actionType: 'action',
        actionName: 'actionName',
      };

      appLogger.actionLog(actionLog);

      expect(loggingService.logging).toHaveBeenCalledWith(expect.any(Logs));
    });
  });

  describe('commonLog', () => {
    it('should call logging service with the correct parameters', async () => {
      const logs = {} as any;
      await appLogger['commonLog'](logs);

      expect(loggingService.logging).toHaveBeenCalledWith(logs);
    });

    it('should call super.log if CONSOLE_LOG is true', async () => {
      process.env.CONSOLE_LOG = 'true';
      const actionLog: ActionLog = {
        username: 'user',
        trackNumber: '123',
        actionType: 'action',
        actionName: 'actionName',
      };

      const superLog = jest.spyOn(global.console, 'error');

      appLogger.actionLog(actionLog);

      expect(superLog).toHaveBeenCalledTimes(1);
    });
  });
});
