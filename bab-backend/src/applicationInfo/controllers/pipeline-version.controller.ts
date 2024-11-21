import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { PipelineVersionService } from '../services';
import {
  BRAND_UNIVAR,
  BaseRequest,
  BaseResponse,
  QueryRequest,
} from 'src/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from 'src/auth';
import { PipelineVersion } from '../schemas';

@ApiTags('pipeline-version')
@Controller('pipeline')
@ApiBearerAuth()
export class PipelineVersionController {
  constructor(
    private readonly pipelineVersionService: PipelineVersionService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'Retrieved the pipeline version by user success',
    type: BaseResponse<PipelineVersion>,
  })
  @Post('/info')
  @HttpCode(200)
  async findPipelineInfo(
    @Body() queryRequest: QueryRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<PipelineVersion>> {
    const pipelineInfo = await this.pipelineVersionService.findPipelineInfo(
      queryRequest.track_number,
      queryRequest.selected_database,
      userInfo,
    );
    return new BaseResponse(pipelineInfo, queryRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'Retrieved the standalone pipeline version by user success',
    type: BaseResponse<PipelineVersion>,
  })
  @Post('/info/standalone')
  @HttpCode(200)
  async findStandalonePipelineInfo(
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<PipelineVersion>> {
    const pipelineInfo = await this.pipelineVersionService.findPipelineInfo(
      baseRequest.track_number,
      null,
      userInfo,
      BRAND_UNIVAR,
    );
    return new BaseResponse(pipelineInfo, baseRequest.track_number);
  }
}
