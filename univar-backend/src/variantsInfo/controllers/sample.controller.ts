import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { BaseResponse, QueryRequest, Sample, SampleData } from 'src/common';
import { VariantService } from '../services';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from 'src/auth';

@ApiTags('sample')
@Controller('sample')
export class SampleController {
  constructor(private readonly variantService: VariantService) {}

  @ApiResponse({
    status: 200,
    description: 'Retrieved sample list by user success',
    type: BaseResponse<SampleData>,
  })
  @Post('/list')
  @HttpCode(200)
  async findSamples(
    @Body() queryRequest: QueryRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<Sample[]>> {
    const samples = await this.variantService.findSamples(
      queryRequest,
      userInfo,
    );
    return new BaseResponse(samples, queryRequest.track_number);
  }
}
