import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { DatabaseService } from '../services';
import {
  BaseRequest,
  BaseResponse,
  DatabaseData,
  DatabaseInfo,
  QueryRequest,
} from 'src/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from 'src/auth';

@ApiTags('database')
@Controller('database')
@ApiBearerAuth()
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @ApiResponse({
    status: 200,
    description: 'Retrieved database list by user success',
    type: BaseResponse<DatabaseData[]>,
  })
  @Post('/list')
  @HttpCode(200)
  async findDatabaseList(
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<DatabaseData[] | DatabaseInfo[]>> {
    const databases = await this.databaseService.findDatabaseList(
      baseRequest.track_number,
      userInfo,
    );
    return new BaseResponse(databases, baseRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'Retrieved all database list by user success',
    type: BaseResponse<DatabaseData[]>,
  })
  @Post('/list/all')
  @HttpCode(200)
  async findAllDatabaseList(
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<DatabaseData[] | DatabaseInfo[]>> {
    const databases = await this.databaseService.findDatabaseList(
      baseRequest.track_number,
      userInfo,
      {},
      true,
    );
    return new BaseResponse(databases, baseRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'Retrieved caller by database',
    type: BaseResponse<DatabaseData[]>,
  })
  @Post('/caller-info')
  @HttpCode(200)
  async getCallersByDatabase(
    @Body() queryRequest: QueryRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<string[]>> {
    const callers = await this.databaseService.getCallersByDatabase(
      queryRequest,
      userInfo,
    );
    return new BaseResponse(callers, queryRequest.track_number);
  }
}
