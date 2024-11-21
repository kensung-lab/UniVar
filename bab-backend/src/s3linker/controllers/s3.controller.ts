import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { BaseResponse, CramUrl, GetCramRequest } from 'src/common';
import { S3Service } from '../services';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from 'src/auth';

@ApiTags('s3')
@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  /**
   * @deprecated
   * @param getCramRequest get cram request
   * @param userInfo User Information
   * @returns cram urls
   */
  @ApiResponse({
    status: 200,
    description: 'Get Signed URL',
    type: BaseResponse<CramUrl[]>,
  })
  @Post('/getSignedUrl')
  @HttpCode(200)
  async getSignedUrl(
    @Body() getCramRequest: GetCramRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<CramUrl[]>> {
    const cramUrls = await this.s3Service.getS3preSignedUrl(
      getCramRequest,
      userInfo,
    );
    return new BaseResponse(cramUrls, getCramRequest.track_number);
  }
}
