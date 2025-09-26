import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { GenePanelService } from '../services';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseResponse, BaseRequest, GenePanel } from 'src/common';
import { AuthenticatedUser } from 'src/auth';

@ApiTags('gene-panel')
@Controller('gene-panel')
export class GenePanelController {
  constructor(private readonly genePanelService: GenePanelService) {}

  @ApiResponse({
    status: 200,
    description: 'Retrieved gene panel list by user success',
    type: BaseResponse<GenePanel[]>,
  })
  @Post('/list')
  @HttpCode(200)
  async getGenePanelList(
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<GenePanel[]>> {
    const results = await this.genePanelService.getLatestPanelList(
      baseRequest.track_number,
      userInfo,
    );
    return new BaseResponse(results.genePanels, baseRequest.track_number);
  }
}
