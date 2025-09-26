import { Injectable } from '@nestjs/common';
import {
  COMMON_DATABASE,
  CustomException,
  DatabaseData,
  DatabaseFilter,
  DatabaseInfo,
  EXCEPTION_CODE,
  QueryRequest,
  getDatabaseFilter,
} from 'src/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoggingHelperService } from 'src/utils';
import {
  DATABASE_MODEL_NAME,
  Databases,
  ToolCompleteInfos,
} from 'src/applicationInfo/schemas';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel(DATABASE_MODEL_NAME, COMMON_DATABASE)
    private Databases: Model<Databases>,
    private readonly loggingHelperService: LoggingHelperService,
  ) {}

  async findDatabaseList(
    trackNumber: string,
    userInfo,
    filters: DatabaseFilter = {},
    show_pending: boolean = false,
  ): Promise<DatabaseData[] | DatabaseInfo[]> {
    getDatabaseFilter(userInfo, filters, show_pending);

    let result = null;
    const tempResult = await this.getRawDatabasesList(
      trackNumber,
      userInfo,
      'find_databases',
      filters,
      show_pending,
    );

    if (!show_pending) {
      result = tempResult.map(
        (eachResult: Databases) => new DatabaseData(eachResult),
      );
    } else {
      result = tempResult.map(
        (eachResult: Databases) => new DatabaseInfo(eachResult),
      );
    }

    return result;
  }

  async getCallersByDatabase(
    queryRequest: QueryRequest,
    userInfo,
  ): Promise<string[]> {
    const result: string[] = [];

    const tempResult = await this.getRawDatabasesList(
      queryRequest.track_number,
      userInfo,
      'get_callers_by_database',
      {
        database_name: queryRequest.selected_database,
      },
    );

    if (!tempResult || tempResult.length < 1) {
      throw new CustomException(
        EXCEPTION_CODE.SELECTED_DATABASE_DOES_NOT_EXIST,
      );
    }
    tempResult[0].tool_complete_infos.forEach(
      (toolCompleteInfo: ToolCompleteInfos) => {
        if (toolCompleteInfo.source) {
          result.push(toolCompleteInfo.source);
        }
      },
    );

    return result;
  }

  async getRawDatabasesList(
    trackNumber: string,
    userInfo,
    actionName: string,
    filters: DatabaseFilter = {},
    show_pending: boolean = false,
  ): Promise<Databases[]> {
    return await this.loggingHelperService.performanceLogAndFindMongo(
      this.Databases,
      filters,
      show_pending ? { create_time: -1 } : { display_name: 1 },
      null,
      null,
      {},
      userInfo.preferred_username,
      trackNumber,
      actionName,
      COMMON_DATABASE,
    );
  }
}
