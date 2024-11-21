import { Body, Controller, HttpCode, Post, Response } from '@nestjs/common';
import {
  BaseResponse,
  DeleteExomiserRunRequest,
  ExomiserRunResponse,
  ExportRequest,
  ExportResultRequest,
  ExportType,
  FindVariantExonsRequest,
  MarkReadRequest,
  MarkReadResponse,
  PagingRequest,
  QueryRequest,
  UpdateNoteRequest,
  Variant,
  VariantData,
} from 'src/common';
import { VariantService } from '../services';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { AuthenticatedUser } from 'src/auth';

@ApiTags('variant')
@Controller('variant')
export class VariantController {
  constructor(private readonly variantService: VariantService) {}

  @ApiResponse({
    status: 200,
    description: 'Retrieved variant list with filters by user success',
    type: BaseResponse<VariantData>,
  })
  @Post('/find')
  @HttpCode(200)
  async findVariants(
    @Body() pagingRequest: PagingRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<VariantData>> {
    const variants = await this.variantService.findVariants(
      pagingRequest,
      userInfo,
    );
    return new BaseResponse(variants, pagingRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'Find Exons list with variant_id',
    type: BaseResponse<any>,
  })
  @Post('/find-exons')
  @HttpCode(200)
  async findVariantExons(
    @Body() findVariantExonsRequest: FindVariantExonsRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<any>> {
    const exons = await this.variantService.findVariantExons(
      findVariantExonsRequest,
      userInfo,
    );
    return new BaseResponse(exons, findVariantExonsRequest.track_number);
  }

  @ApiResponse({
    status: 202,
    description: 'mark Variant as read for user',
    type: BaseResponse<MarkReadResponse>,
  })
  @HttpCode(202)
  @Post('/mark-read')
  async markAsRead(
    @Body() markReadRequest: MarkReadRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<MarkReadResponse>> {
    const result = await this.variantService.saveRead(
      markReadRequest,
      userInfo,
    );
    return new BaseResponse(result, markReadRequest.track_number);
  }

  @ApiResponse({
    status: 202,
    description: 'save note for user',
    type: BaseResponse<Variant>,
  })
  @HttpCode(202)
  @Post('/save-note')
  async saveNote(
    @Body() updateNoteRequest: UpdateNoteRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<Variant>> {
    const result = await this.variantService.saveNote(
      updateNoteRequest,
      userInfo,
    );
    return new BaseResponse(result, updateNoteRequest.track_number);
  }

  @ApiResponse({
    status: 204,
    description:
      'Export variant list in TSV format with filters by user success',
  })
  @Post('/export-tsv')
  @HttpCode(204)
  async exportTsv(
    @Body() exportRequest: ExportRequest,
    @AuthenticatedUser() userInfo,
  ) {
    await this.variantService.exportTsv(exportRequest, userInfo);
  }

  @ApiResponse({
    status: 200,
    description:
      'Get export variant list in TSV format with filters by user success',
  })
  @Post('/get-export-tsv')
  @HttpCode(200)
  async getExportTsvResult(
    @Body() exportResultRequest: ExportResultRequest,
    @AuthenticatedUser() userInfo,
    @Response() res: ExpressResponse,
  ) {
    const result = await this.variantService.getExportResult(
      exportResultRequest,
      userInfo,
      ExportType.tsv,
    );
    if (result) {
      res.set('Content-Disposition', 'attachment; filename="variants.tsv"');
      res.set('Content-Type', 'text/plain');
      return res.send(result);
    } else {
      res.status(204);
      return res.send(null);
    }
  }

  @ApiResponse({
    status: 204,
    description:
      'Export variant list in VCF format with filters by user success',
  })
  @Post('/export-vcf')
  @HttpCode(204)
  async exportVcf(
    @Body() exportRequest: ExportRequest,
    @AuthenticatedUser() userInfo,
  ) {
    await this.variantService.exportVcf(exportRequest, userInfo);
  }

  @ApiResponse({
    status: 200,
    description:
      'Get export variant list in VCF format with filters by user success',
  })
  @Post('/get-export-vcf')
  @HttpCode(200)
  async getExportVcfResult(
    @Body() exportResultRequest: ExportResultRequest,
    @AuthenticatedUser() userInfo,
    @Response() res: ExpressResponse,
  ) {
    const result = await this.variantService.getExportResult(
      exportResultRequest,
      userInfo,
      ExportType.vcf,
    );
    if (result) {
      res.set('Content-Disposition', 'attachment; filename="variants.vcf"');
      res.set('Content-Type', 'text/plain');
      return res.send(result);
    } else {
      res.status(204);
      return res.send(null);
    }
  }

  @ApiResponse({
    status: 200,
    description: 'Get exomiser run list by user success',
    type: BaseResponse<ExomiserRunResponse[]>,
  })
  @Post('/get-exomiser-runs')
  @HttpCode(200)
  async getExomiserRunList(
    @Body() queryRequest: QueryRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<ExomiserRunResponse[]>> {
    const exomiserRunResponses = await this.variantService.getExomiserRunList(
      queryRequest,
      userInfo,
    );
    return new BaseResponse(exomiserRunResponses, queryRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'delete exomiser run by user success',
    type: BaseResponse<ExomiserRunResponse[]>,
  })
  @Post('/delete-exomiser-run')
  @HttpCode(200)
  async deleteExomiserRun(
    @Body() deleteExomiserRunRequest: DeleteExomiserRunRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<ExomiserRunResponse>> {
    const exomiserRunResponse = await this.variantService.deleteExomiserRun(
      deleteExomiserRunRequest,
      userInfo,
    );
    return new BaseResponse(
      exomiserRunResponse,
      deleteExomiserRunRequest.track_number,
    );
  }
}
