import { Model } from 'mongoose';
import { ACTION_TYPE, DataUpdateLog, PerformanceLog } from 'src/common';
import * as Functions from 'src/common/functions/common';
import { LoggingService } from 'src/utils';
import { Logs, ErrorLogs, PerformanceLogs } from 'src/utils/schemas';
import { mockConnection } from '../../mock';

jest.mock('src/utils/schemas');

describe('LoggingService', () => {
  let loggingService: LoggingService;
  let logsModel: Model<Logs>;
  let errorLogsModel: Model<ErrorLogs>;
  const mockSave = jest.fn().mockResolvedValueOnce('test_result');

  beforeEach(() => {
    logsModel = <any>jest.fn().mockImplementation(() => {
      return {
        save: mockSave,
      };
    });
    errorLogsModel = <any>jest.fn().mockImplementation(() => {
      return {
        save: mockSave,
      };
    });
    loggingService = new LoggingService(logsModel, errorLogsModel);
  });

  describe('logging', () => {
    it('should save request logs and return true', async () => {
      // Mock the save method of the logs model
      const dataUpdateLog = new DataUpdateLog('univar-test01', '123');
      dataUpdateLog.actionType = ACTION_TYPE.UPDATE_DB;
      dataUpdateLog.modified_data = {
        filters: {
          chrom: 'chr1',
          start: {
            $gte: 1234,
          },
          end: {
            $lte: 5678,
          },
          pass_filter: ['PASS'],
          quality: {
            $gte: 1000,
          },
        },
        columns: null,
        sort: null,
        panels: [],
        type: 'filter',
        create_user: 'kwhip',
        access_group: ['kwhip'],
        is_default: false,
        name: 'test-preset-e2e',
        creation_date: new Date(1689177600),
      };
      dataUpdateLog.original_data = {
        _id: {
          $oid: '64ddcff2cccd2ad2fe500f16',
        },
        name: 'test-preset-e2e',
        filters: {
          chrom: 'chr1',
          start: {
            $gte: 1234,
          },
          end: {
            $lte: 5678,
          },
          pass_filter: ['PASS'],
          quality: {
            $gte: 1000,
          },
        },
        panels: [],
        type: 'filter',
        create_user: 'kwhip',
        access_group: ['kwhip'],
        is_default: false,
        creation_date: new Date(1689177600),
      };
      dataUpdateLog.actionName = 'update_bookmark';
      dataUpdateLog.database = 'common';
      dataUpdateLog.collection = 'Bookmarks';
      const logs = new Logs(
        null,
        null,
        null,
        'univar-test01',
        '123',
        ACTION_TYPE.UPDATE_DB,
        'update_bookmark',
        dataUpdateLog,
      );

      const result = await loggingService.logging(logs);

      expect(result).toBe(true);
      expect(logsModel).toHaveBeenCalledTimes(1);
      expect(logsModel).toBeCalledWith(logs);
    });

    it('should save error logs and return true', async () => {
      const req: Request = (<any>{
        headers: {
          authorization: 'Bearer token',
        },
        originalUrl: '/bookmark/list',
        body: {
          track_number: '123',
        },
        ip: '127.0.0.1',
      }) as Request;
      const error = new Error('test error');
      const errorLogs = new ErrorLogs(
        <any>req,
        error,
        'error type',
        'error level',
      );

      const result = await loggingService.logging(errorLogs);

      expect(result).toBe(true);
      expect(errorLogsModel).toHaveBeenCalledTimes(1);
      expect(errorLogsModel).toBeCalledWith(errorLogs);
    });

    it('should save performance logs and return true', async () => {
      const performanceModel = jest.fn().mockImplementation(() => {
        return {
          save: mockSave,
        };
      });
      const mockGetDatabaseNModel = jest
        .spyOn(Functions, 'getDatabaseNModel')
        .mockResolvedValueOnce([mockConnection, performanceModel]);

      const performanceLog: PerformanceLog = new PerformanceLog(
        'univar-test02',
        '123214324',
      );
      performanceLog.endLog();
      performanceLog.filters = { name: 'test' };
      performanceLog.sort = { createdAt: -1 };
      performanceLog.skip = 10;
      performanceLog.limit = 20;
      performanceLog.project = { name: 1 };
      performanceLog.database = 'test_db';
      performanceLog.actionType = ACTION_TYPE.FIND_DB;
      performanceLog.actionName = 'testing_find_db';
      performanceLog.collection = 'family_duopat_20230105-152056';

      const performanceLogs = new PerformanceLogs(
        'test_user',
        'test_track_number',
        'test_action_type',
        'test_action_name',
        performanceLog,
      );

      const result = await loggingService.logging(performanceLogs);

      expect(result).toBe(true);
      expect(mockGetDatabaseNModel).toHaveBeenCalledTimes(1);
      expect(performanceModel).toHaveBeenCalledTimes(1);
      expect(performanceModel).toHaveBeenCalledWith(performanceLogs);
    });

    it('should handle errors and return false', async () => {
      logsModel = <any>jest.fn().mockImplementation(() => {
        return {
          save: jest.fn().mockRejectedValueOnce(new Error('Save error')),
        };
      });
      loggingService = new LoggingService(logsModel, errorLogsModel);

      const logs: Logs = <any>{
        log_type: 'user-action',
        application_name: 'univar-backend',
        log_time: new Date(1689177600),
        user: 'univar-test01',
        action_type: 'get_file',
        action_name: 'get_s3_pre_sign_url',
        track_number: 'univar-test01:1611932409614',
      };

      const result = await loggingService.logging(logs);

      expect(result).toBe(false);
    });
  });
});
