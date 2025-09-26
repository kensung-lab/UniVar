import {
  Body,
  Controller,
  Header,
  HttpCode,
  Post,
  Res,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthenticatedUser } from 'src/auth';
import {
  AnnotateServerRequest,
  BaseRequest,
  BaseResponse,
  ErrorPipelineRequest,
  HPO_SAMPLE_KEY,
  InternalDataBaseRequest,
  JobInformation,
  PED_SAMPLE_KEY,
  QueryRequest,
  SAMPLE_FILE_BASE_KEY,
  SNP_VCF_SAMPLE_KEY,
  SV_VCF_SAMPLE_KEY,
  SampleType,
  TUTORIAL_KEY,
  USER_MENU_KEY,
  UploadFilesRequest,
  UploadHPORequest,
} from 'src/common';
import { PipelineService } from '../services';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('pipeline')
@Controller('pipeline')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @ApiResponse({
    status: 200,
    description: 'Upload pipeline files and trigger annotation pipeline',
    type: BaseResponse<JobInformation>,
  })
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'ped', maxCount: 1 },
      { name: 'hpo', maxCount: 1 },
      { name: 'snp', maxCount: 1 },
      { name: 'sv' },
    ]),
  )
  async uploadFile(
    @UploadedFiles()
    files: {
      ped: Express.Multer.File[];
      hpo: Express.Multer.File[];
      snp: Express.Multer.File[];
      sv: Express.Multer.File[];
    },
    @Body() uploadFilesRequest: UploadFilesRequest,
    @AuthenticatedUser() userInfo,
  ) {
    const jobInformation: JobInformation =
      await this.pipelineService.uploadFiles(
        uploadFilesRequest,
        files,
        userInfo,
      );

    return new BaseResponse(jobInformation, uploadFilesRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'Run annotation pipeline with server files',
    type: BaseResponse<JobInformation>,
  })
  @Post('annotate-server')
  async annotateServer(
    @Body() annotateServerRequest: AnnotateServerRequest,
    @AuthenticatedUser() userInfo,
  ) {
    const jobInformation: JobInformation =
      await this.pipelineService.annotateServer(annotateServerRequest, userInfo);

    return new BaseResponse(jobInformation, annotateServerRequest.track_number);
  }

  @ApiResponse({
    status: 201,
    description: 'Upload HPO and trigger Argo Workflow to run Exomiser',
    type: BaseResponse<JobInformation>,
  })
  @Post('run-exomiser')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'hpo', maxCount: 1 }]))
  async runExomiser(
    @UploadedFiles()
    files: {
      hpo: Express.Multer.File[];
    },
    @Body() uploadHPORequest: UploadHPORequest,
    @AuthenticatedUser() userInfo,
  ) {
    const jobInformation: JobInformation = await this.pipelineService.uploadHPO(
      uploadHPORequest,
      files,
      userInfo,
    );

    return new BaseResponse(jobInformation, uploadHPORequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'Upload VCF for extract PED info',
    type: BaseResponse<JobInformation>,
  })
  @Post('/upload/vcfs')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'snp', maxCount: 1 }, { name: 'sv' }]),
  )
  async uploadVcfs(
    @UploadedFiles()
    files: {
      snp: Express.Multer.File[];
      sv: Express.Multer.File[];
    },
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
  ) {
    const result: any[] = await this.pipelineService.uploadVCFForPed(
      files,
      baseRequest,
      userInfo,
    );

    return new BaseResponse(result, baseRequest.track_number);
  }

  /**
   * @param initExomiserRequest selected_database to delete and provide access_group
   * @param userInfo User Information
   */
  @ApiResponse({
    status: 201,
    description: 'trigger exomiser run as init run',
    type: BaseResponse<JobInformation>,
  })
  @Post('init-exomiser')
  async initExomiser(
    @Body() initExomiserRequest: InternalDataBaseRequest,
    @AuthenticatedUser() userInfo,
  ) {
    const jobInformation: JobInformation =
      await this.pipelineService.initExomiser(initExomiserRequest, userInfo);

    return new BaseResponse(jobInformation, initExomiserRequest.track_number);
  }

  /**
   * @description to notify user that pipeline has error
   * @param queryRequest selected_database to delete
   * @param userInfo User Information
   */
  @ApiResponse({
    status: 200,
    description: 'Notify user that pipeline run has error',
  })
  @Post('pipeline-error')
  @HttpCode(200)
  async pipelineError(
    @Body() errorPipelineRequest: ErrorPipelineRequest,
    @AuthenticatedUser() userInfo,
  ) {
    await this.pipelineService.pipelineError(errorPipelineRequest, userInfo);
  }

  /**
   * @param queryRequest selected_database to delete
   * @param userInfo User Information
   */
  @ApiResponse({
    status: 200,
    description: 'Delete database',
  })
  @Post('/delete')
  @HttpCode(200)
  async deleteDatabase(
    @Body() queryRequest: QueryRequest,
    @AuthenticatedUser() userInfo,
  ) {
    await this.pipelineService.deleteSample(queryRequest, userInfo);
  }

  // @ApiResponse({
  //   status: 200,
  //   description: 'provide HPO sample file',
  //   type: StreamableFile,
  // })
  // @Post('/sample/hpo')
  // @HttpCode(200)
  // @Header('Content-Type', 'text/plain')
  // async getSampleFileHpo(
  //   @Body() baseRequest: BaseRequest,
  //   @AuthenticatedUser() userInfo,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<StreamableFile> {
  //   const sampleFile = await this.pipelineService.getSampleFile(
  //     baseRequest,
  //     SampleType.hpo,
  //     userInfo,
  //   );
  //   res.setHeader('ETag', sampleFile.ETag);
  //   res.setHeader('Last-Modified', sampleFile.LastModified.getTime());
  //   res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  //   res.setHeader(
  //     'Content-Disposition',
  //     'attachment; filename="' +
  //       HPO_SAMPLE_KEY.replace(SAMPLE_FILE_BASE_KEY, '') +
  //       '"',
  //   );
  //   const byteArray = await sampleFile.Body.transformToByteArray();

  //   return new StreamableFile(byteArray);
  // }
  @ApiResponse({
    status: 200,
    description: 'provide HPO sample file',
    type: StreamableFile,
  })
  @Post('/sample/hpo')
  @HttpCode(200)
  @Header('Content-Type', 'text/plain')
  async getSampleFileHpo(
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fileBuffer = await this.pipelineService.getSampleFileLocal(
      baseRequest,
      SampleType.hpo,
      userInfo,
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' +
        HPO_SAMPLE_KEY.replace(SAMPLE_FILE_BASE_KEY, '') +
        '"',
    );

    res.status(200).send(fileBuffer);
    return;
  }

  // @ApiResponse({
  //   status: 200,
  //   description: 'provide PED sample file',
  //   type: StreamableFile,
  // })
  // @Post('/sample/ped')
  // @HttpCode(200)
  // @Header('Content-Type', 'text/plain')
  // async getSampleFilePed(
  //   @Body() baseRequest: BaseRequest,
  //   @AuthenticatedUser() userInfo,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<StreamableFile> {
  //   const sampleFile = await this.pipelineService.getSampleFile(
  //     baseRequest,
  //     SampleType.ped,
  //     userInfo,
  //   );
  //   res.setHeader('ETag', sampleFile.ETag);
  //   res.setHeader('Last-Modified', sampleFile.LastModified.getTime());
  //   res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  //   res.setHeader(
  //     'Content-Disposition',
  //     'attachment; filename="' +
  //       PED_SAMPLE_KEY.replace(SAMPLE_FILE_BASE_KEY, '') +
  //       '"',
  //   );
  //   const byteArray = await sampleFile.Body.transformToByteArray();

  //   return new StreamableFile(byteArray);
  // }
  @ApiResponse({
    status: 200,
    description: 'provide PED sample file',
    type: StreamableFile,
  })
  @Post('/sample/ped')
  @HttpCode(200)
  @Header('Content-Type', 'text/plain')
  async getSampleFilePed(
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fileBuffer = await this.pipelineService.getSampleFileLocal(
      baseRequest,
      SampleType.ped,
      userInfo,
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' +
        PED_SAMPLE_KEY.replace(SAMPLE_FILE_BASE_KEY, '') +
        '"',
    );

    res.status(200).send(fileBuffer);
    return;
  }

  // @ApiResponse({
  //   status: 200,
  //   description: 'provide SNP VCF sample file',
  //   type: StreamableFile,
  // })
  // @Post('/sample/snp')
  // @HttpCode(200)
  // @Header('Content-Type', 'application/gzip')
  // async getSampleFileSnp(
  //   @Body() baseRequest: BaseRequest,
  //   @AuthenticatedUser() userInfo,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<StreamableFile> {
  //   const sampleFile = await this.pipelineService.getSampleFile(
  //     baseRequest,
  //     SampleType.snp,
  //     userInfo,
  //   );
  //   res.setHeader('ETag', sampleFile.ETag);
  //   res.setHeader('Last-Modified', sampleFile.LastModified.getTime());
  //   res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  //   res.setHeader(
  //     'Content-Disposition',
  //     'attachment; filename="' +
  //       SNP_VCF_SAMPLE_KEY.replace(SAMPLE_FILE_BASE_KEY, '') +
  //       '"',
  //   );
  //   const byteArray = await sampleFile.Body.transformToByteArray();

  //   return new StreamableFile(byteArray);
  // }
  @ApiResponse({
    status: 200,
    description: 'provide SNP VCF sample file',
    type: StreamableFile,
  })
  @Post('/sample/snp')
  @HttpCode(200)
  @Header('Content-Type', 'application/gzip')
  async getSampleFileSnp(
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fileBuffer = await this.pipelineService.getSampleFileLocal(
      baseRequest,
      SampleType.snp,
      userInfo,
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' +
        SNP_VCF_SAMPLE_KEY.replace(SAMPLE_FILE_BASE_KEY, '') +
        '"',
    );

    res.status(200).send(fileBuffer);
    return;
  }

  // @ApiResponse({
  //   status: 200,
  //   description: 'provide SV VCF sample file',
  //   type: StreamableFile,
  // })
  // @Post('/sample/sv')
  // @HttpCode(200)
  // @Header('Content-Type', 'application/gzip')
  // async getSampleFileSv(
  //   @Body() baseRequest: BaseRequest,
  //   @AuthenticatedUser() userInfo,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<StreamableFile> {
  //   const sampleFile = await this.pipelineService.getSampleFile(
  //     baseRequest,
  //     SampleType.sv,
  //     userInfo,
  //   );
  //   res.setHeader('ETag', sampleFile.ETag);
  //   res.setHeader('Last-Modified', sampleFile.LastModified.getTime());
  //   res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  //   res.setHeader(
  //     'Content-Disposition',
  //     'attachment; filename="' +
  //       SV_VCF_SAMPLE_KEY.replace(SAMPLE_FILE_BASE_KEY, '') +
  //       '"',
  //   );
  //   const byteArray = await sampleFile.Body.transformToByteArray();

  //   return new StreamableFile(byteArray);
  // }
  @ApiResponse({
    status: 200,
    description: 'provide SV VCF sample file',
    type: StreamableFile,
  })
  @Post('/sample/sv')
  @HttpCode(200)
  @Header('Content-Type', 'application/gzip')
  async getSampleFileSv(
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fileBuffer = await this.pipelineService.getSampleFileLocal(
      baseRequest,
      SampleType.sv,
      userInfo,
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' +
        SV_VCF_SAMPLE_KEY.replace(SAMPLE_FILE_BASE_KEY, '') +
        '"',
    );

    res.status(200).send(fileBuffer);
    return;
  }

  // @ApiResponse({
  //   status: 200,
  //   description: 'provide User Manual',
  //   type: StreamableFile,
  // })
  // @Post('/sample/menu')
  // @HttpCode(200)
  // @Header('Content-Type', 'application/pdf')
  // async getSampleUserMenu(
  //   @Body() baseRequest: BaseRequest,
  //   @AuthenticatedUser() userInfo,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<StreamableFile> {
  //   const sampleFile = await this.pipelineService.getSampleFile(
  //     baseRequest,
  //     SampleType.menu,
  //     userInfo,
  //   );
  //   res.setHeader('ETag', sampleFile.ETag);
  //   res.setHeader('Last-Modified', sampleFile.LastModified.getTime());
  //   res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  //   res.setHeader(
  //     'Content-Disposition',
  //     'attachment; filename="' +
  //       USER_MENU_KEY.replace(SAMPLE_FILE_BASE_KEY, '') +
  //       '"',
  //   );
  //   const byteArray = await sampleFile.Body.transformToByteArray();

  //   return new StreamableFile(byteArray);
  // }
  @ApiResponse({
    status: 200,
    description: 'provide Tutorial',
    type: StreamableFile,
  })
  @Post('/sample/menu')
  @HttpCode(200)
  @Header('Content-Type', 'application/pdf')
  async getSampleUserMenu(
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fileBuffer = await this.pipelineService.getSampleFileLocal(
      baseRequest,
      SampleType.tutorial,
      userInfo,
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' +
        USER_MENU_KEY.replace(SAMPLE_FILE_BASE_KEY, '') +
        '"',
    );

    res.status(200).send(fileBuffer);
    return;
  }

  // @ApiResponse({
  //   status: 200,
  //   description: 'provide Tutorial',
  //   type: StreamableFile,
  // })
  // @Post('/sample/tutorial')
  // @HttpCode(200)
  // @Header('Content-Type', 'application/pdf')
  // async getSampleTutorial(
  //   @Body() baseRequest: BaseRequest,
  //   @AuthenticatedUser() userInfo,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<StreamableFile> {
  //   const sampleFile = await this.pipelineService.getSampleFile(
  //     baseRequest,
  //     SampleType.tutorial,
  //     userInfo,
  //   );
  //   res.setHeader('ETag', sampleFile.ETag);
  //   res.setHeader('Last-Modified', sampleFile.LastModified.getTime());
  //   res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  //   res.setHeader(
  //     'Content-Disposition',
  //     'attachment; filename="' +
  //       TUTORIAL_KEY.replace(SAMPLE_FILE_BASE_KEY, '') +
  //       '"',
  //   );
  //   const byteArray = await sampleFile.Body.transformToByteArray();

  //   return new StreamableFile(byteArray);
  // }
  @ApiResponse({
    status: 200,
    description: 'provide Tutorial',
    type: StreamableFile,
  })
  @Post('/sample/tutorial')
  @HttpCode(200)
  @Header('Content-Type', 'application/pdf')
  async getSampleTutorial(
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fileBuffer = await this.pipelineService.getSampleFileLocal(
      baseRequest,
      SampleType.tutorial,
      userInfo,
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' +
        TUTORIAL_KEY.replace(SAMPLE_FILE_BASE_KEY, '') +
        '"',
    );
    res.status(200).send(fileBuffer);
    return;
  }
}
