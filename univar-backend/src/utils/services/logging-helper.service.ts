import { Injectable } from '@nestjs/common';
import {
  ACTION_TYPE,
  ActionLog,
  DataUpdateLog,
  PerformanceLog,
} from 'src/common';
import { AppLogger } from '../logger';
import { Connection, Document, Model } from 'mongoose';

@Injectable()
export class LoggingHelperService {
  constructor(private readonly logger: AppLogger) {}

  async performanceLogAndCountMongo(
    collection: Model<any>,
    filters: any,
    username: string,
    trackNumber: string,
    actionName: string,
    database: string,
  ): Promise<number> {
    // Performance Log Start
    let log = null;
    if (process.env.PERFORMANCE_LOG === 'true') {
      log = new PerformanceLog(username, trackNumber);
      log.actionType = ACTION_TYPE.COUNT_DB;
      log.actionName = actionName;
      log.filters = filters;
      log.database = database;
    }
    // Performance Log End

    let result = null;
    if (Object.keys(filters).length === 0) {
      result = await collection.estimatedDocumentCount().exec();
    } else {
      result = await collection.countDocuments(filters).exec();
    }

    if (process.env.PERFORMANCE_LOG === 'true') {
      log.endLog();
      this.logger.performanceLog(log);
    }

    return result;
  }

  async performanceLogAndFindMongo(
    collection: Model<any>,
    filters: any,
    sort: any,
    skip: number,
    limit: number,
    project: any,
    username: string,
    trackNumber: string,
    actionName: string,
    database: string,
  ): Promise<any[]> {
    // Performance Log Start
    let log = null;
    if (process.env.PERFORMANCE_LOG === 'true') {
      log = new PerformanceLog(username, trackNumber);
      log.actionType = ACTION_TYPE.FIND_DB;
      log.actionName = actionName;
      log.filters = filters;
      log.sort = sort;
      log.skip = skip;
      log.project = project;
      log.limit = limit;
      log.database = database;
    }
    // Performance Log End

    let result;
    if ((skip || skip == 0) && limit) {
      result = await collection
        .find(filters)
        .sort(sort)
        .skip(skip)
        .select(project)
        .collation({ locale: 'en_US', numericOrdering: true })
        .limit(limit)
        .exec();
    } else {
      result = await collection
        .find(filters)
        .sort(sort)
        .select(project)
        .collation({ locale: 'en_US', numericOrdering: true })
        .exec();
    }

    if (
      process.env.PERFORMANCE_LOG === 'true' &&
      actionName !== 'get_exomiser_run_list' &&
      actionName !== 'get_exomiser_run'
    ) {
      log.endLog();
      this.logger.performanceLog(log);
    }

    return result;
  }

  async performanceLogAndFindOneMongo(
    collection: Model<any>,
    filters: any,
    sort: any,
    username: string,
    trackNumber: string,
    actionName: string,
    database: string,
  ): Promise<any> {
    // Performance Log Start
    let log = null;
    if (process.env.PERFORMANCE_LOG === 'true') {
      log = new PerformanceLog(username, trackNumber);
      log.actionType = ACTION_TYPE.FIND_DB;
      log.actionName = actionName;
      log.filters = filters;
      log.sort = sort;
      log.database = database;
    }
    // Performance Log End

    const result = await collection.findOne(filters).sort(sort).exec();

    if (process.env.PERFORMANCE_LOG === 'true') {
      log.endLog();
      this.logger.performanceLog(log);
    }

    return result;
  }

  async performanceLogAndSaveMongo(
    document: Document<any>,
    username: string,
    trackNumber: string,
    actionName: string,
    database: string,
    collection: string,
    modifiedData: any,
    originalData: any = null,
  ): Promise<any> {
    // Performance Log Start
    let log = null;
    if (process.env.PERFORMANCE_LOG === 'true') {
      log = new PerformanceLog(username, trackNumber);
      log.actionName = actionName;
      log.database = database;
    }
    // Performance Log End

    const result = await document.save();

    // Data Update Log Start
    const dataUpdateLog = new DataUpdateLog(username, trackNumber);
    if (originalData) {
      dataUpdateLog.actionType = ACTION_TYPE.UPDATE_DB;
      dataUpdateLog.modified_data = modifiedData;
      dataUpdateLog.original_data = originalData;
    } else {
      dataUpdateLog.actionType = ACTION_TYPE.INSERT_DB;
      dataUpdateLog.modified_data = modifiedData;
    }
    dataUpdateLog.actionName = actionName;
    dataUpdateLog.database = database;
    dataUpdateLog.collection = collection;

    await this.logger.dataUpdateLog(dataUpdateLog);
    // Data Update Log End

    // Performance Log Start
    if (process.env.PERFORMANCE_LOG === 'true') {
      log.endLog();
      this.logger.performanceLog(log);
    }
    // Performance Log End

    return result;
  }

  async performanceLogAndDeleteOneMongo(
    collection: Model<any>,
    username: string,
    trackNumber: string,
    filter: any,
    database: string,
    table: string,
    actionName: string,
  ): Promise<any> {
    let log = null;
    if (process.env.PERFORMANCE_LOG === 'true') {
      log = new PerformanceLog(username, trackNumber);
      log.actionType = ACTION_TYPE.MODIFY;
      log.actionName = actionName;
      log.database = database;
    }
    const result = await collection.findOneAndDelete(filter).exec();

    // Data Update Log Start
    const dataUpdateLog = new DataUpdateLog(username, trackNumber);

    dataUpdateLog.actionType = ACTION_TYPE.UPDATE_DB;
    dataUpdateLog.actionName = actionName;
    dataUpdateLog.database = database;
    dataUpdateLog.collection = table;
    dataUpdateLog.original_data = result;

    await this.logger.dataUpdateLog(dataUpdateLog);
    // Data Update Log End

    // Performance Log Start
    if (process.env.PERFORMANCE_LOG === 'true') {
      log.endLog();
      this.logger.performanceLog(log);
    }
    // Performance Log End

    return result;
  }

  async performanceLogAndUpdateManyMongo(
    collection: Model<any>,
    filter: any,
    update: any,
    username: string,
    trackNumber: string,
    actionName: string,
    database: string,
    table: string,
  ): Promise<any> {
    // Performance Log Start
    let log = null;
    if (process.env.PERFORMANCE_LOG === 'true') {
      log = new PerformanceLog(username, trackNumber);
      log.actionName = actionName;
      log.database = database;
    }
    // Performance Log End

    const result = await collection.updateMany(filter, update);

    // Data Update Log Start
    const dataUpdateLog = new DataUpdateLog(username, trackNumber);
    dataUpdateLog.actionType = ACTION_TYPE.UPDATE_DB;
    dataUpdateLog.actionName = actionName;
    dataUpdateLog.database = database;
    dataUpdateLog.collection = table;
    dataUpdateLog.customObject = { filter: filter, update: update };

    await this.logger.dataUpdateLog(dataUpdateLog);
    // Data Update Log End

    // Performance Log Start
    if (process.env.PERFORMANCE_LOG === 'true') {
      log.endLog();
      this.logger.performanceLog(log);
    }
    // Performance Log End

    return result;
  }

  async performanceLogAndDropDatabaseMongo(
    connection: Connection,
    username: string,
    trackNumber: string,
    database: string,
    actionType: string,
    actionName: string,
  ): Promise<boolean> {
    let log = null;
    if (process.env.PERFORMANCE_LOG === 'true') {
      log = new PerformanceLog(username, trackNumber);
      log.actionType = ACTION_TYPE.MODIFY;
      log.actionName = actionName;
      log.database = database;
    }

    const result = await connection.db.dropDatabase();

    // Action Log Start
    this.logger.actionLog(
      new ActionLog(username, trackNumber, actionType, actionName),
    );
    // Action Log End

    // Performance Log Start
    if (process.env.PERFORMANCE_LOG === 'true') {
      log.endLog();
      this.logger.performanceLog(log);
    }
    // Performance Log End

    return result;
  }

  async actionLog(
    username: string,
    trackNumber: string,
    actionType: string,
    actionName: string,
    customObject: any = null,
  ) {
    this.logger.actionLog(
      new ActionLog(
        username,
        trackNumber,
        actionType,
        actionName,
        customObject,
      ),
    );
  }

  async errorLog(
    err: Error,
    errorType: string,
    errorLevel: string,
    user: string,
    trackNumber: string,
    actionType: string,
    actionName: string,
  ) {
    this.logger.errorLog(
      null,
      err,
      errorType,
      errorLevel,
      user,
      trackNumber,
      actionType,
      actionName,
    );
  }
}
