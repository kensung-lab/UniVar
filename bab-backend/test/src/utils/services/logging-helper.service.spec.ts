import { Document, Model } from 'mongoose';
import {
  ACTION_TYPE,
  ActionLog,
  DataUpdateLog,
  PerformanceLog,
} from 'src/common';
import { AppLogger, LoggingHelperService } from 'src/utils';

jest.mock('src/common');

describe('LoggingHelperService', () => {
  const mockCollection = {} as Model<any>;
  const mockLogger = {
    performanceLog: jest.fn(),
    actionLog: jest.fn(),
  } as unknown as AppLogger;
  const loggingHelperService = new LoggingHelperService(mockLogger);

  const testFilters = { foo: 'bar' };
  const testSort = { baz: 1 };
  const testSkip = 0;
  const testLimit = 10;
  const testProject = { qux: 1 };
  const testUsername = 'test_user';
  const testTrackNumber = 'test_track_number';
  const testActionName = 'test_action';
  const testDatabase = 'test_database';
  const testTable = 'test_table';
  const testModifiedData = { quux: 'corge' };
  const testOriginalData = { grault: 'garply' };
  const testId = 'test_id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('performanceLogAndCountMongo', () => {
    it('should count documents in the collection and return the result', async () => {
      const mockCountDocuments = jest.fn().mockResolvedValue(42);
      mockCollection.estimatedDocumentCount = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(23),
      });
      mockCollection.countDocuments = mockCountDocuments;

      const result = await loggingHelperService.performanceLogAndCountMongo(
        mockCollection,
        {},
        testUsername,
        testTrackNumber,
        testActionName,
        testDatabase,
      );

      expect(result).toEqual(23);
      expect(mockCountDocuments).not.toHaveBeenCalled();
      expect(mockCollection.estimatedDocumentCount).toHaveBeenCalledTimes(1);
      expect(mockCollection.estimatedDocumentCount).toHaveBeenCalledWith();
      expect(mockLogger.performanceLog).toHaveBeenCalledTimes(1);
      expect(mockLogger.performanceLog).toHaveBeenCalledWith(
        expect.any(PerformanceLog),
      );
    });

    it('should count filtered documents in the collection and return the result', async () => {
      const mockCountDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(42),
      });
      mockCollection.estimatedDocumentCount = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(23),
      });
      mockCollection.countDocuments = mockCountDocuments;

      const result = await loggingHelperService.performanceLogAndCountMongo(
        mockCollection,
        testFilters,
        testUsername,
        testTrackNumber,
        testActionName,
        testDatabase,
      );

      expect(result).toEqual(42);
      expect(mockCountDocuments).toHaveBeenCalledTimes(1);
      expect(mockCountDocuments).toHaveBeenCalledWith(testFilters);
      expect(mockCollection.estimatedDocumentCount).not.toHaveBeenCalled();
      expect(mockLogger.performanceLog).toHaveBeenCalledTimes(1);
      expect(mockLogger.performanceLog).toHaveBeenCalledWith(
        expect.any(PerformanceLog),
      );
    });
  });

  describe('performanceLogAndFindMongo', () => {
    it('should find documents in the collection and return the result', async () => {
      const mockLimitFunction = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue('test_result'),
      });
      const mockCollationFunction = jest.fn().mockReturnValue({
        limit: mockLimitFunction,
      });
      const mockSelectFunction = jest.fn().mockReturnValue({
        collation: mockCollationFunction,
      });
      const mockSkipFunction = jest.fn().mockReturnValue({
        select: mockSelectFunction,
      });
      const mockSortFunction = jest.fn().mockReturnValue({
        skip: mockSkipFunction,
      });
      mockCollection.find = jest.fn().mockReturnValue({
        sort: mockSortFunction,
      });

      const result = await loggingHelperService.performanceLogAndFindMongo(
        mockCollection,
        testFilters,
        testSort,
        testSkip,
        testLimit,
        testProject,
        testUsername,
        testTrackNumber,
        testActionName,
        testDatabase,
      );

      expect(result).toEqual('test_result');
      expect(mockCollection.find).toHaveBeenCalledTimes(1);
      expect(mockCollection.find).toHaveBeenCalledWith(testFilters);
      expect(mockSortFunction).toHaveBeenCalledTimes(1);
      expect(mockSortFunction).toHaveBeenCalledWith(testSort);
      expect(mockSkipFunction).toHaveBeenCalledTimes(1);
      expect(mockSkipFunction).toHaveBeenCalledWith(testSkip);
      expect(mockSelectFunction).toHaveBeenCalledTimes(1);
      expect(mockSelectFunction).toHaveBeenCalledWith(testProject);
      expect(mockCollationFunction).toHaveBeenCalledTimes(1);
      expect(mockCollationFunction).toHaveBeenCalledWith({
        locale: 'en_US',
        numericOrdering: true,
      });
      expect(mockLogger.performanceLog).toHaveBeenCalledTimes(1);
      expect(mockLogger.performanceLog).toHaveBeenCalledWith(
        expect.any(PerformanceLog),
      );
    });

    it('should find all documents in the collection and return the result', async () => {
      const mockCollationFunction = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue('test_result'),
      });
      const mockSelectFunction = jest.fn().mockReturnValue({
        collation: mockCollationFunction,
      });
      const mockSkipFunction = jest.fn().mockReturnValue({
        select: mockSelectFunction,
      });
      const mockSortFunction = jest.fn().mockReturnValue({
        skip: mockSkipFunction,
        select: mockSelectFunction,
      });
      mockCollection.find = jest.fn().mockReturnValue({
        sort: mockSortFunction,
      });

      const result = await loggingHelperService.performanceLogAndFindMongo(
        mockCollection,
        testFilters,
        testSort,
        undefined,
        undefined,
        testProject,
        testUsername,
        testTrackNumber,
        testActionName,
        testDatabase,
      );

      expect(result).toEqual('test_result');
      expect(mockCollection.find).toHaveBeenCalledTimes(1);
      expect(mockCollection.find).toHaveBeenCalledWith(testFilters);
      expect(mockSortFunction).toHaveBeenCalledTimes(1);
      expect(mockSortFunction).toHaveBeenCalledWith(testSort);
      expect(mockSkipFunction).not.toHaveBeenCalled();
      expect(mockSelectFunction).toHaveBeenCalledTimes(1);
      expect(mockSelectFunction).toHaveBeenCalledWith(testProject);
      expect(mockCollationFunction).toHaveBeenCalledTimes(1);
      expect(mockCollationFunction).toHaveBeenCalledWith({
        locale: 'en_US',
        numericOrdering: true,
      });
      expect(mockLogger.performanceLog).toHaveBeenCalledTimes(1);
      expect(mockLogger.performanceLog).toHaveBeenCalledWith(
        expect.any(PerformanceLog),
      );
    });
  });

  describe('performanceLogAndFindOneMongo', () => {
    it('should find one document in the collection and return the result', async () => {
      const mockSortFunction = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue('test_result'),
      });
      mockCollection.findOne = jest.fn().mockReturnValue({
        sort: mockSortFunction,
      });

      const result = await loggingHelperService.performanceLogAndFindOneMongo(
        mockCollection,
        testFilters,
        testSort,
        testUsername,
        testTrackNumber,
        testActionName,
        testDatabase,
      );

      expect(result).toEqual('test_result');
      expect(mockCollection.findOne).toHaveBeenCalledTimes(1);
      expect(mockCollection.findOne).toHaveBeenCalledWith(testFilters);
      expect(mockSortFunction).toHaveBeenCalledTimes(1);
      expect(mockSortFunction).toHaveBeenCalledWith(testSort);
      expect(mockLogger.performanceLog).toHaveBeenCalledTimes(1);
      expect(mockLogger.performanceLog).toHaveBeenCalledWith(
        expect.any(PerformanceLog),
      );
    });
  });

  describe('performanceLogAndSaveMongo', () => {
    it('should save the document and log the data update and performance logs', async () => {
      const mockSave = jest.fn().mockResolvedValue('test_result');
      const mockDataUpdateLog = jest.fn();
      const mockPerformanceLog = jest.fn();
      const mockDocument = {} as Document<any>;
      mockDocument.save = mockSave;
      mockLogger.dataUpdateLog = mockDataUpdateLog;
      mockLogger.performanceLog = mockPerformanceLog;

      const result = await loggingHelperService.performanceLogAndSaveMongo(
        mockDocument,
        testUsername,
        testTrackNumber,
        testActionName,
        testDatabase,
        testTable,
        testModifiedData,
        testOriginalData,
      );

      expect(result).toEqual('test_result');
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(DataUpdateLog).toHaveBeenCalledTimes(1);
      expect(DataUpdateLog).toHaveBeenCalledWith(testUsername, testTrackNumber);
      expect(mockDataUpdateLog).toHaveBeenCalledTimes(1);
      expect(mockLogger.dataUpdateLog).toHaveBeenCalledTimes(1);
      expect(mockLogger.dataUpdateLog).toHaveBeenCalledWith({
        actionName: 'test_action',
        actionType: 'update_db',
        collection: 'test_table',
        database: 'test_database',
        modified_data: { quux: 'corge' },
        original_data: { grault: 'garply' },
      });
      expect(PerformanceLog).toHaveBeenCalledTimes(1);
      expect(PerformanceLog).toHaveBeenCalledWith(
        testUsername,
        testTrackNumber,
      );
      expect(mockPerformanceLog).toHaveBeenCalledTimes(1);
      expect(mockLogger.performanceLog).toHaveBeenCalledTimes(1);
      expect(mockLogger.performanceLog).toHaveBeenCalledWith(
        expect.any(PerformanceLog),
      );
    });

    it('should save the document and log the data update and performance logs without modified data', async () => {
      const mockSave = jest.fn().mockResolvedValue(testModifiedData);
      const mockDataUpdateLog = jest.fn();
      const mockPerformanceLog = jest.fn();
      const mockDocument = {} as Document<any>;
      mockDocument.save = mockSave;
      mockLogger.dataUpdateLog = mockDataUpdateLog;
      mockLogger.performanceLog = mockPerformanceLog;

      const result = await loggingHelperService.performanceLogAndSaveMongo(
        mockDocument,
        testUsername,
        testTrackNumber,
        testActionName,
        testDatabase,
        testTable,
        testModifiedData,
      );
      const expectedUpdateLog = new DataUpdateLog(
        testUsername,
        testTrackNumber,
      );
      expectedUpdateLog.actionType = ACTION_TYPE.INSERT_DB;
      expectedUpdateLog.actionName = testActionName;
      expectedUpdateLog.database = testDatabase;
      expectedUpdateLog.collection = testTable;
      expectedUpdateLog.modified_data = testModifiedData;

      expect(result).toEqual(testModifiedData);
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(DataUpdateLog).toHaveBeenCalledTimes(2);
      expect(DataUpdateLog).toHaveBeenCalledWith(testUsername, testTrackNumber);
      expect(mockDataUpdateLog).toHaveBeenCalledTimes(1);
      expect(mockDataUpdateLog).toHaveBeenCalledWith(expectedUpdateLog);
      expect(PerformanceLog).toHaveBeenCalledTimes(1);
      expect(PerformanceLog).toHaveBeenCalledWith(
        testUsername,
        testTrackNumber,
      );
      expect(mockPerformanceLog).toHaveBeenCalledTimes(1);
      expect(mockLogger.performanceLog).toHaveBeenCalledTimes(1);
      expect(mockLogger.performanceLog).toHaveBeenCalledWith(
        expect.any(PerformanceLog),
      );
    });
  });

  describe('performanceLogAndRemoveMongo', () => {
    it('should remove the document and log the data update and performance logs', async () => {
      const mockRemove = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(testOriginalData),
      });
      const mockDataUpdateLog = jest.fn();
      const mockPerformanceLog = jest.fn();
      mockCollection.findOneAndDelete = mockRemove;
      mockLogger.dataUpdateLog = mockDataUpdateLog;
      mockLogger.performanceLog = mockPerformanceLog;

      const result = await loggingHelperService.performanceLogAndDeleteOneMongo(
        mockCollection,
        testUsername,
        testTrackNumber,
        testId,
        testDatabase,
        testTable,
        testActionName,
      );

      expect(result).toEqual(testOriginalData);
      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(DataUpdateLog).toHaveBeenCalledTimes(1);
      expect(DataUpdateLog).toHaveBeenCalledWith(testUsername, testTrackNumber);
      expect(mockDataUpdateLog).toHaveBeenCalledTimes(1);
      expect(mockDataUpdateLog).toHaveBeenCalledWith({
        actionType: ACTION_TYPE.UPDATE_DB,
        actionName: testActionName,
        database: testDatabase,
        collection: testTable,
        original_data: testOriginalData,
      });
      expect(PerformanceLog).toHaveBeenCalledTimes(1);
      expect(PerformanceLog).toHaveBeenCalledWith(
        testUsername,
        testTrackNumber,
      );
      expect(mockPerformanceLog).toHaveBeenCalledTimes(1);
      expect(mockLogger.performanceLog).toHaveBeenCalledTimes(1);
      expect(mockLogger.performanceLog).toHaveBeenCalledWith(
        expect.any(PerformanceLog),
      );
    });
  });

  describe('actionLog', () => {
    it('should call logger.actionLog with the correct arguments and default customObject', async () => {
      const username = 'user';
      const trackNumber = '123';
      const actionType = 'action';
      const actionName = 'actionName';

      await loggingHelperService.actionLog(
        username,
        trackNumber,
        actionType,
        actionName,
      );

      expect(mockLogger.actionLog).toHaveBeenCalledWith(
        new ActionLog(username, trackNumber, actionType, actionName),
      );
    });

    it('should call logger.actionLog with the correct arguments and customObject', async () => {
      const username = 'user';
      const trackNumber = '123';
      const actionType = 'action';
      const actionName = 'actionName';
      const customObject = { key: 'value' };

      await loggingHelperService.actionLog(
        username,
        trackNumber,
        actionType,
        actionName,
        customObject,
      );

      expect(mockLogger.actionLog).toHaveBeenCalledWith(
        new ActionLog(
          username,
          trackNumber,
          actionType,
          actionName,
          customObject,
        ),
      );
    });
  });
});
