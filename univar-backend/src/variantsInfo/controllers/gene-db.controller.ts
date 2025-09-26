import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { BaseResponse, QueryRequest } from 'src/common';
import { VariantService } from '../services';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Versions } from 'src/applicationInfo';
import { AuthenticatedUser } from 'src/auth';

@ApiTags('gene-db')
@Controller('gene-db')
export class GeneDBController {
  constructor(private readonly variantService: VariantService) {}

  @ApiResponse({
    status: 200,
    description: 'Retrieved variant list with filters by user success',
    type: BaseResponse<Versions>,
  })
  @Post('/detail')
  @HttpCode(200)
  async findVariants(
    @Body() queryRequest: QueryRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<Versions>> {
    const version = await this.variantService.findGeneDBVersion(
      queryRequest,
      userInfo,
    );
    return new BaseResponse(version, queryRequest.track_number);
  }
}
