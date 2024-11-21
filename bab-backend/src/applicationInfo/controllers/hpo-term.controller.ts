import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { BaseRequest, BaseResponse, HPORequest } from 'src/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from 'src/auth';
import { HPOTerms, PipelineVersion } from '../schemas';
import { HPOTermService } from '../services';

@ApiTags('hpo-term')
@Controller('hpo-term')
@ApiBearerAuth()
export class HPOTermController {
  constructor(private readonly hpoTermService: HPOTermService) {}

  @ApiResponse({
    status: 200,
    description: 'Retrieved the hpo versions by user success',
    type: BaseResponse<PipelineVersion>,
  })
  @Post('/version')
  @HttpCode(200)
  async findHPOTermVersion(
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<string[]>> {
    const hpoTermVersions = await this.hpoTermService.findHPOTermVersions(
      baseRequest.track_number,
      userInfo,
    );
    return new BaseResponse(hpoTermVersions, baseRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'Retrieved the hpo terms by user success',
    type: BaseResponse<HPOTerms>,
  })
  @Post('/')
  @HttpCode(200)
  async findStandalonePipelineInfo(
    @Body() hpoRequest: HPORequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<HPOTerms>> {
    const hpoTerms = await this.hpoTermService.findHPOTerms(
      hpoRequest,
      userInfo,
    );
    return new BaseResponse(hpoTerms, hpoRequest.track_number);
  }
}
